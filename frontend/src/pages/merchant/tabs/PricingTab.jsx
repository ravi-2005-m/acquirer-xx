import { useState, useEffect, useCallback } from 'react';
import { merchantApi } from '../../../api/merchantApi';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorAlert from '../../../components/ErrorAlert';
import EmptyState from '../../../components/EmptyState';
import StatusBadge from '../../../components/StatusBadge';
import { formatDate, formatCurrency } from '../../../utils/formatters';

const MODEL_TYPES = ['MDR', 'IC_PLUS_PLUS', 'BLENDED'];

function PricingTab({ merchantId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    modelType: 'MDR',
    mdrPct: '',
    perTxnFee: '',
    schemeFeePassThrough: 'YES',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [actionId, setActionId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await merchantApi.getPricingByMerchant(merchantId);
      setItems(response.data?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        merchantId,
        modelType: formData.modelType,
        mdrPct: parseFloat(formData.mdrPct) || 0,
        ...(formData.perTxnFee && { perTxnFee: parseFloat(formData.perTxnFee) }),
        ...(formData.schemeFeePassThrough && {
          schemeFeePassThrough: formData.schemeFeePassThrough,
        }),
        effectiveFrom: formData.effectiveFrom,
        ...(formData.effectiveTo && { effectiveTo: formData.effectiveTo }),
      };
      await merchantApi.createPricing(payload);
      setShowForm(false);
      setFormData({
        modelType: 'MDR',
        mdrPct: '',
        perTxnFee: '',
        schemeFeePassThrough: 'YES',
        effectiveFrom: new Date().toISOString().slice(0, 10),
        effectiveTo: '',
      });
      fetchItems();
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (pricingId) => {
    if (!window.confirm('Deactivate this pricing model?')) return;
    setActionId(pricingId);
    setActionError(null);
    try {
      await merchantApi.deactivatePricing(pricingId);
      fetchItems();
    } catch (err) {
      setActionError(err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Pricing Models</h6>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          <i className={`bi ${showForm ? 'bi-x-circle' : 'bi-plus-circle'} me-1`}></i>
          {showForm ? 'Cancel' : 'Add Pricing Model'}
        </button>
      </div>

      <div className="alert alert-info py-2 px-3 small mb-3 d-flex align-items-start gap-2">
        <i className="bi bi-info-circle mt-1 flex-shrink-0"></i>
        <div>
          Pricing models are kept as historical records. Once deactivated they
          cannot be reactivated &mdash; that&apos;s by design so the rate charged
          on every past transaction stays auditable. To change pricing,{' '}
          <strong>deactivate the current ACTIVE row</strong> and{' '}
          <strong>add a new pricing model</strong> with the new terms.
        </div>
      </div>

      {showForm && (
        <div className="card mb-3 border-primary">
          <div className="card-body">
            <h6 className="card-title small text-muted text-uppercase mb-3">New Pricing Model</h6>

            {submitError && (
              <ErrorAlert
                error={submitError}
                title="Failed to create pricing model"
                dismissible
                onDismiss={() => setSubmitError(null)}
              />
            )}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="modelType" className="form-label">Model Type</label>
                  <select
                    id="modelType"
                    name="modelType"
                    className="form-select"
                    value={formData.modelType}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    {MODEL_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3 mb-3">
                  <label htmlFor="mdrPct" className="form-label">
                    MDR % <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    id="mdrPct"
                    name="mdrPct"
                    className="form-control"
                    value={formData.mdrPct}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="2.5"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label htmlFor="perTxnFee" className="form-label">Per-Txn Fee</label>
                  <input
                    type="number"
                    id="perTxnFee"
                    name="perTxnFee"
                    className="form-control"
                    value={formData.perTxnFee}
                    onChange={handleChange}
                    disabled={submitting}
                    step="0.01"
                    min="0"
                    placeholder="2.00"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="schemeFeePassThrough" className="form-label">
                    Scheme Fee Pass-Through
                  </label>
                  <select
                    id="schemeFeePassThrough"
                    name="schemeFeePassThrough"
                    className="form-select"
                    value={formData.schemeFeePassThrough}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="effectiveFrom" className="form-label">
                    Effective From <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    id="effectiveFrom"
                    name="effectiveFrom"
                    className="form-control"
                    value={formData.effectiveFrom}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="effectiveTo" className="form-label">Effective To</label>
                  <input
                    type="date"
                    id="effectiveTo"
                    name="effectiveTo"
                    className="form-control"
                    value={formData.effectiveTo}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create'}
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

      {actionError && (
        <ErrorAlert
          error={actionError}
          title="Action failed"
          dismissible
          onDismiss={() => setActionError(null)}
        />
      )}

      {loading && <LoadingSpinner text="Loading pricing models..." />}
      {!loading && error && (
        <ErrorAlert error={error} title="Failed to load pricing" onRetry={fetchItems} />
      )}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon="bi-currency-dollar"
          title="No pricing models"
          message="Configure the merchant's pricing structure."
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>MDR %</th>
                <th>Per-Txn Fee</th>
                <th>Pass-Through</th>
                <th>Effective</th>
                <th>Status</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.pricingId}>
                  <td className="text-muted small">{p.pricingId}</td>
                  <td className="small">{(p.modelType || '').replaceAll('_', ' ')}</td>
                  <td className="small">{p.mdrPct?.toFixed(2)}%</td>
                  <td className="small">{p.perTxnFee ? formatCurrency(p.perTxnFee) : '—'}</td>
                  <td className="small">{p.schemeFeePassThrough || '—'}</td>
                  <td className="small">
                    {formatDate(p.effectiveFrom)}
                    {p.effectiveTo ? ` → ${formatDate(p.effectiveTo)}` : ' →'}
                  </td>
                  <td><StatusBadge status={p.status} size="sm" /></td>
                  <td>
                    {p.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleDeactivate(p.pricingId)}
                        disabled={actionId === p.pricingId}
                        className="btn btn-outline-danger btn-sm"
                        title="Deactivate"
                      >
                        <i className="bi bi-pause-circle"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PricingTab;
