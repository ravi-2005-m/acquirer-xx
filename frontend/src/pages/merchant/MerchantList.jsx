import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantApi } from '../../api/merchantApi';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import MerchantFormModal from '../../components/merchants/MerchantFormModal';
import { formatDate } from '../../utils/formatters';

function MerchantList() {
  const navigate = useNavigate();

  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Search — debounced
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filters — applied immediately on change
  const [statusFilter, setStatusFilter] = useState('');
  const [mccInput, setMccInput] = useState('');
  const [mccFilter, setMccFilter] = useState('');

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Debounce search input → searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Debounce MCC input → mccFilter
  useEffect(() => {
    const timer = setTimeout(() => {
      setMccFilter(mccInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [mccInput]);

  // Reset page when status filter changes
  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pagination = { page, size: pageSize };
      const hasFilters = searchTerm || statusFilter || mccFilter;
      let response;
      if (hasFilters) {
        response = await merchantApi.search(
          { legalName: searchTerm || undefined, status: statusFilter || undefined, mcc: mccFilter || undefined },
          pagination
        );
      } else {
        response = await merchantApi.getAll(pagination);
      }
      const body = response.data?.data ?? response.data ?? {};
      setMerchants(body.content || []);
      setTotalPages(body.totalPages ?? 0);
      setTotalElements(body.totalElements ?? 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, statusFilter, mccFilter]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const handleRowClick = (id) => {
    navigate(`/merchants/${id}`);
  };

  const handleCreated = (saved) => {
    setShowCreateModal(false);
    const newId = saved?.merchantId;
    if (newId) {
      navigate(`/merchants/${newId}`);
    } else {
      fetchMerchants();
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setStatusFilter('');
    setMccInput('');
  };

  const hasActiveFilters = searchInput || statusFilter || mccInput;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">
            <i className="bi bi-people me-2"></i>
            Merchants
          </h3>
          <p className="text-muted small mb-0">Manage merchant accounts</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-circle me-1"></i>
          Add Merchant
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-end">
            {/* Search */}
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text border-0 bg-transparent">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Search by legal name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button
                    className="btn btn-outline-secondary border-0"
                    onClick={() => setSearchInput('')}
                    title="Clear search"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Status filter */}
            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* MCC filter */}
            <div className="col-md-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="MCC (e.g. 5411)"
                value={mccInput}
                onChange={(e) => setMccInput(e.target.value)}
                maxLength={4}
              />
            </div>

            {/* Clear filters */}
            <div className="col-md-2">
              {hasActiveFilters && (
                <button
                  className="btn btn-outline-secondary btn-sm w-100"
                  onClick={clearFilters}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner text="Fetching merchants..." />}

      {error && <ErrorAlert error={error} onRetry={fetchMerchants} />}

      {!loading && !error && merchants.length === 0 && (
        <EmptyState
          icon="bi-people"
          title="No merchants found"
          message={hasActiveFilters ? 'No merchants match your filters.' : 'Add your first merchant to get started.'}
          actionLabel={!hasActiveFilters ? 'Add Merchant' : null}
          onAction={!hasActiveFilters ? () => setShowCreateModal(true) : null}
        />
      )}

      {!loading && !error && merchants.length > 0 && (
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Legal Name</th>
                  <th>DBA</th>
                  <th style={{ width: '80px' }}>MCC</th>
                  <th>Contact</th>
                  <th style={{ width: '110px' }}>Risk</th>
                  <th style={{ width: '120px' }}>Status</th>
                  <th style={{ width: '130px' }}>Created</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m) => (
                  <tr
                    key={m.merchantId}
                    onClick={() => handleRowClick(m.merchantId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="text-muted small">{m.merchantId}</td>
                    <td className="fw-semibold">{m.legalName || '—'}</td>
                    <td className="text-muted small">{m.doingBusinessAs || '—'}</td>
                    <td className="text-muted small">
                      <code>{m.mcc || '—'}</code>
                    </td>
                    <td className="text-muted small" style={{ maxWidth: '200px' }}>
                      <span className="text-truncate d-block">{m.contactInfo || '—'}</span>
                    </td>
                    <td>
                      <RiskBadge level={m.riskLevel} />
                    </td>
                    <td>
                      <StatusBadge status={m.status} size="sm" />
                    </td>
                    <td className="text-muted small">
                      {formatDate(m.createdAt)}
                    </td>
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
              onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
            />
          </div>
        </div>
      )}

      <MerchantFormModal
        show={showCreateModal}
        existing={null}
        onClose={() => setShowCreateModal(false)}
        onSaved={handleCreated}
      />
    </div>
  );
}

export default MerchantList;
