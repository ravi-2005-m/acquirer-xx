import { useState, useEffect, useCallback } from 'react';
import { storeApi } from '../../../api/storeApi';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorAlert from '../../../components/ErrorAlert';
import EmptyState from '../../../components/EmptyState';
import StatusBadge from '../../../components/StatusBadge';
import Pagination from '../../../components/Pagination';
import { formatDate } from '../../../utils/formatters';

function StoresTab({ merchantId }) {
  const [stores, setStores] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ storeName: '', address: '', region: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await storeApi.getByMerchant(merchantId, { page, size: pageSize });
      const body = response.data?.data ?? {};
      setStores(body.content ?? []);
      setTotalElements(body.totalElements ?? 0);
      setTotalPages(body.totalPages ?? 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [merchantId, page, pageSize]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.storeName.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        storeName: formData.storeName.trim(),
        ...(formData.address.trim() && { address: formData.address.trim() }),
        ...(formData.region.trim() && { region: formData.region.trim() }),
      };
      await storeApi.create(merchantId, payload);
      setShowForm(false);
      setFormData({ storeName: '', address: '', region: '' });
      setPage(0);
      fetchStores();
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Stores</h6>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          <i className={`bi ${showForm ? 'bi-x-circle' : 'bi-plus-circle'} me-1`}></i>
          {showForm ? 'Cancel' : 'Add Store'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-3 border-primary">
          <div className="card-body">
            <h6 className="card-title small text-muted text-uppercase mb-3">New Store</h6>

            {submitError && (
              <ErrorAlert
                error={submitError}
                title="Failed to create store"
                dismissible
                onDismiss={() => setSubmitError(null)}
              />
            )}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="storeName" className="form-label">
                    Store Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="storeName"
                    name="storeName"
                    className="form-control"
                    value={formData.storeName}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    placeholder="Downtown Branch"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="region" className="form-label">Region</label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    className="form-control"
                    value={formData.region}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="South Zone"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="address" className="form-label">Address</label>
                <textarea
                  id="address"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={submitting}
                  rows={2}
                  placeholder="123 Main St, Bangalore"
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating...
                    </>
                  ) : 'Create Store'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-outline-secondary btn-sm"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner text="Loading stores..." />}
      {!loading && error && (
        <ErrorAlert error={error} title="Failed to load stores" onRetry={fetchStores} />
      )}
      {!loading && !error && stores.length === 0 && (
        <EmptyState
          icon="bi-shop"
          title="No stores"
          message="Add the first store for this merchant."
        />
      )}

      {!loading && !error && stores.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Store Name</th>
                  <th>Region</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.storeId}>
                    <td className="text-muted small">{s.storeId}</td>
                    <td className="fw-semibold small">{s.storeName}</td>
                    <td className="text-muted small">{s.region || '—'}</td>
                    <td className="text-muted small" style={{ maxWidth: '200px' }}>
                      <span className="text-truncate d-block">{s.address || '—'}</span>
                    </td>
                    <td><StatusBadge status={s.status} size="sm" /></td>
                    <td className="text-muted small">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-2">
              <Pagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StoresTab;
