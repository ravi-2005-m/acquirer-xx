import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { terminalApi } from '../../api/terminalApi';
import { merchantApi } from '../../api/merchantApi';
import { storeApi } from '../../api/storeApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import EntitySelect from '../../components/common/EntitySelect';
import TerminalFormModal from '../../components/terminals/TerminalFormModal';
import { formatDate } from '../../utils/formatters';

const CAPABILITY_BADGES = {
  EMV:       { color: 'primary',           label: 'EMV' },
  CTLS:      { color: 'success',           label: 'Contactless' },
  MAGSTRIPE: { color: 'warning text-dark', label: 'Magstripe' },
};

function CapabilityBadge({ capability }) {
  const cfg = CAPABILITY_BADGES[capability] || { color: 'secondary', label: capability || '—' };
  return <span className={`badge bg-${cfg.color} small`}>{cfg.label}</span>;
}

const fetchMerchantsOptions = ({ search }) =>
  (search
    ? merchantApi.search({ legalName: search }, { size: 20 })
    : merchantApi.getAll({ size: 20 })
  ).then(res => {
    const body = res.data?.data ?? res.data ?? {};
    return { content: body.content ?? (Array.isArray(body) ? body : []) };
  });

const fetchStoresOptions = (merchantId) => ({ search }) =>
  storeApi.search(
    { storeName: search || undefined, merchantId: merchantId ? Number(merchantId) : undefined },
    { size: 20 }
  ).then(res => {
    const body = res.data?.data ?? res.data ?? {};
    return { content: body.content ?? (Array.isArray(body) ? body : []) };
  });

function TerminalList() {
  const navigate = useNavigate();

  const [terminals, setTerminals]       = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [page, setPage]                 = useState(0);
  const [pageSize, setPageSize]         = useState(10);

  const [searchInput, setSearchInput]   = useState('');
  const [searchTerm, setSearchTerm]     = useState('');
  const [capabilityFilter, setCapabilityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [merchantFilter, setMerchantFilter] = useState('');
  const [storeFilter, setStoreFilter]   = useState('');

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Debounce TID search
  useEffect(() => {
    const t = setTimeout(() => { setSearchTerm(searchInput.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(0); }, [capabilityFilter, statusFilter, merchantFilter, storeFilter]);

  const fetchTerminals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pagination = { page, size: pageSize, sortBy: 'createdAt', sortDir: 'DESC' };
      const hasFilters = searchTerm || capabilityFilter || statusFilter || merchantFilter || storeFilter;

      const response = hasFilters
        ? await terminalApi.search(
            {
              ...(searchTerm      && { tid: searchTerm }),
              ...(capabilityFilter && { capability: capabilityFilter }),
              ...(statusFilter    && { status: statusFilter }),
              ...(merchantFilter  && { merchantId: merchantFilter }),
              ...(storeFilter     && { storeId: storeFilter }),
            },
            pagination
          )
        : await terminalApi.getAll(pagination);

      const body = response.data?.data ?? response.data ?? {};
      setTerminals(body.content ?? []);
      setTotalElements(body.totalElements ?? 0);
      setTotalPages(body.totalPages ?? 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, capabilityFilter, statusFilter, merchantFilter, storeFilter]);

  useEffect(() => { fetchTerminals(); }, [fetchTerminals]);

  const handleMerchantChange = (id) => {
    setMerchantFilter(id);
    setStoreFilter('');
  };

  const clearFilters = () => {
    setSearchInput('');
    setCapabilityFilter('');
    setStatusFilter('');
    setMerchantFilter('');
    setStoreFilter('');
    setPage(0);
  };

  const handleCreated = (saved) => {
    setShowModal(false);
    const newId = saved?.terminalId;
    if (newId) navigate(`/terminals/${newId}`);
    else fetchTerminals();
  };

  const hasActiveFilters = searchInput || capabilityFilter || statusFilter || merchantFilter || storeFilter;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
        <div>
          <h3 className="mb-1">
            <i className="bi bi-printer me-2"></i>Terminals
          </h3>
          <p className="text-muted small mb-0">POS terminals across all merchants and stores</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-1"></i>New Terminal
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-end">
            {/* TID search */}
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text border-0 bg-transparent">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Search by TID..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button className="btn btn-outline-secondary border-0" onClick={() => setSearchInput('')}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Capability */}
            <div className="col-md-2">
              <select
                className="form-select form-select-sm"
                value={capabilityFilter}
                onChange={e => setCapabilityFilter(e.target.value)}
              >
                <option value="">All capabilities</option>
                <option value="EMV">EMV</option>
                <option value="CTLS">Contactless</option>
                <option value="MAGSTRIPE">Magstripe</option>
              </select>
            </div>

            {/* Status */}
            <div className="col-md-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Merchant */}
            <div className="col-md-2">
              <EntitySelect
                value={merchantFilter}
                onChange={handleMerchantChange}
                fetchOptions={fetchMerchantsOptions}
                getOptionLabel={m => m.legalName}
                getOptionId={m => m.merchantId}
                placeholder="All merchants"
              />
            </div>

            {/* Store — chained to merchant */}
            <div className="col-md-2">
              <EntitySelect
                value={storeFilter}
                onChange={id => setStoreFilter(id)}
                fetchOptions={fetchStoresOptions(merchantFilter)}
                getOptionLabel={s => s.storeName}
                getOptionId={s => s.storeId}
                placeholder={merchantFilter ? 'All stores' : 'Select merchant first'}
                disabled={!merchantFilter}
              />
            </div>

            {/* Clear */}
            <div className="col-md-1">
              {hasActiveFilters && (
                <button className="btn btn-outline-secondary btn-sm w-100" onClick={clearFilters}>
                  <i className="bi bi-x-circle"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner text="Loading terminals..." />}
      {error && <ErrorAlert error={error} title="Failed to load terminals" onRetry={fetchTerminals} />}

      {!loading && !error && terminals.length === 0 && (
        <EmptyState
          icon="bi-printer"
          title={hasActiveFilters ? 'No terminals match your filters' : 'No terminals yet'}
          message={hasActiveFilters ? 'Try clearing your filters.' : 'Create a terminal to get started.'}
          actionLabel={!hasActiveFilters ? 'New Terminal' : null}
          onAction={!hasActiveFilters ? () => setShowModal(true) : null}
        />
      )}

      {!loading && !error && terminals.length > 0 && (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>TID</th>
                    <th>Brand / Model</th>
                    <th style={{ width: '120px' }}>Capability</th>
                    <th>Store</th>
                    <th>Merchant</th>
                    <th style={{ width: '110px' }}>Status</th>
                    <th style={{ width: '120px' }}>Created</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {terminals.map(t => (
                    <tr
                      key={t.terminalId}
                      onClick={() => navigate(`/terminals/${t.terminalId}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="fw-semibold small"><code>{t.tid}</code></td>
                      <td className="small">{t.brandModel || '—'}</td>
                      <td><CapabilityBadge capability={t.capability} /></td>
                      <td className="text-muted small">{t.storeName || '—'}</td>
                      <td className="text-muted small">{t.merchantName || '—'}</td>
                      <td><StatusBadge status={t.status} size="sm" /></td>
                      <td className="text-muted small">{formatDate(t.createdAt)}</td>
                      <td className="text-end">
                        <i className="bi bi-chevron-right text-muted"></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-footer bg-white">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={s => { setPageSize(s); setPage(0); }}
            />
          </div>
        </div>
      )}

      <TerminalFormModal
        show={showModal}
        existing={null}
        defaultStoreId={storeFilter}
        onClose={() => setShowModal(false)}
        onSaved={handleCreated}
      />
    </div>
  );
}

export default TerminalList;
