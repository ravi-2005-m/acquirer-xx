import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeApi } from '../../api/storeApi';
import { merchantApi } from '../../api/merchantApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import EntitySelect from '../../components/common/EntitySelect';
import StoreFormModal from '../../components/stores/StoreFormModal';
import { formatDate } from '../../utils/formatters';

const fetchMerchantsOptions = ({ search }) =>
  (search
    ? merchantApi.search({ legalName: search }, { size: 20 })
    : merchantApi.getAll({ size: 20 })
  ).then(res => {
    const body = res.data?.data ?? res.data ?? {};
    return { content: body.content ?? (Array.isArray(body) ? body : []) };
  });

function StoresList() {
  const navigate = useNavigate();

  const [stores, setStores]         = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage]             = useState(0);
  const [pageSize, setPageSize]     = useState(10);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [merchantFilter, setMerchantFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearchTerm(searchInput.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(0); }, [statusFilter, merchantFilter]);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const hasFilters = searchTerm || statusFilter || merchantFilter;
      const pagination = { page, size: pageSize };
      let response;
      if (hasFilters) {
        response = await storeApi.search(
          { storeName: searchTerm || undefined, status: statusFilter || undefined, merchantId: merchantFilter || undefined },
          pagination
        );
      } else {
        response = await storeApi.getAll(pagination);
      }
      const body = response.data?.data ?? response.data ?? {};
      setStores(body.content ?? []);
      setTotalPages(body.totalPages ?? 0);
      setTotalElements(body.totalElements ?? 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, statusFilter, merchantFilter]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleCreated = (saved) => {
    setShowModal(false);
    const newId = saved?.storeId;
    if (newId) navigate(`/stores/${newId}`);
    else fetchStores();
  };

  const clearFilters = () => { setSearchInput(''); setStatusFilter(''); setMerchantFilter(''); };
  const hasFilters   = searchInput || statusFilter || merchantFilter;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">
            <i className="bi bi-shop me-2"></i>Stores
          </h3>
          <p className="text-muted small mb-0">Merchant locations and branches</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-1"></i>Add Store
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text border-0 bg-transparent">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Search store name..."
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
            <div className="col-md-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="col-md-4">
              <EntitySelect
                value={merchantFilter}
                onChange={(id) => setMerchantFilter(id)}
                fetchOptions={fetchMerchantsOptions}
                getOptionLabel={(m) => `${m.legalName} (${m.merchantId})`}
                getOptionId={(m) => m.merchantId}
                placeholder="All merchants"
              />
            </div>
            <div className="col-md-2">
              {hasFilters && (
                <button className="btn btn-outline-secondary btn-sm w-100" onClick={clearFilters}>
                  <i className="bi bi-x-circle me-1"></i>Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner text="Loading stores..." />}
      {error && <ErrorAlert error={error} onRetry={fetchStores} />}

      {!loading && !error && stores.length === 0 && (
        <EmptyState
          icon="bi-shop"
          title="No stores found"
          message={hasFilters ? 'No stores match your filters.' : 'Add your first store to get started.'}
          actionLabel={!hasFilters ? 'Add Store' : null}
          onAction={!hasFilters ? () => setShowModal(true) : null}
        />
      )}

      {!loading && !error && stores.length > 0 && (
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Store Name</th>
                  <th>Region</th>
                  <th>Address</th>
                  <th style={{ width: '120px' }}>Status</th>
                  <th style={{ width: '130px' }}>Created</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr
                    key={s.storeId}
                    onClick={() => navigate(`/stores/${s.storeId}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="text-muted small">{s.storeId}</td>
                    <td className="fw-semibold">{s.storeName}</td>
                    <td className="text-muted small">{s.region || '—'}</td>
                    <td className="text-muted small" style={{ maxWidth: '220px' }}>
                      <span className="text-truncate d-block">{s.address || '—'}</span>
                    </td>
                    <td><StatusBadge status={s.status} size="sm" /></td>
                    <td className="text-muted small">{formatDate(s.createdAt)}</td>
                    <td className="text-end">
                      <i className="bi bi-chevron-right text-muted"></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer bg-white">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
            />
          </div>
        </div>
      )}

      <StoreFormModal
        show={showModal}
        existing={null}
        defaultMerchantId={merchantFilter}
        onClose={() => setShowModal(false)}
        onSaved={handleCreated}
      />
    </div>
  );
}

export default StoresList;
