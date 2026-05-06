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
  const [formData, setFormData] = useState({
    storeName: '',
    region: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactPerson: '',
    contactPhone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const RESET_FORM = {
    storeName: '',
    region: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactPerson: '',
    contactPhone: '',
  };

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
      const t = (s) => (s ?? '').trim();
      const payload = {
        storeName: t(formData.storeName),
        ...(t(formData.region)        && { region:        t(formData.region) }),
        ...(t(formData.address)       && { address:       t(formData.address) }),
        ...(t(formData.city)          && { city:          t(formData.city) }),
        ...(t(formData.state)         && { state:         t(formData.state) }),
        ...(t(formData.pincode)       && { pincode:       t(formData.pincode) }),
        ...(t(formData.contactPerson) && { contactPerson: t(formData.contactPerson) }),
        ...(t(formData.contactPhone)  && { contactPhone:  t(formData.contactPhone) }),
      };
      await storeApi.create(merchantId, payload);
      setShowForm(false);
      setFormData(RESET_FORM);
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

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="city" className="form-label">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className="form-control"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="Bengaluru"
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="state" className="form-label">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    className="form-control"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="KA"
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="pincode" className="form-label">Pincode</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    className="form-control"
                    value={formData.pincode}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="560001"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="contactPerson" className="form-label">Contact Person</label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    className="form-control"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="Ravi Kumar"
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="contactPhone" className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    className="form-control"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="+91 9876543210"
                  />
                </div>
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
                  <th>City</th>
                  <th>Contact</th>
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
                    <td className="text-muted small">
                      {s.city || s.state
                        ? `${s.city || ''}${s.city && s.state ? ', ' : ''}${s.state || ''}`
                        : '—'}
                    </td>
                    <td className="text-muted small">
                      {s.contactPerson || s.contactPhone
                        ? `${s.contactPerson || ''}${s.contactPerson && s.contactPhone ? ' · ' : ''}${s.contactPhone || ''}`
                        : '—'}
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
