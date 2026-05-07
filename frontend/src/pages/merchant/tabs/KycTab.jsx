import { useState, useEffect, useCallback } from 'react';
import { merchantApi } from '../../../api/merchantApi';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorAlert from '../../../components/ErrorAlert';
import EmptyState from '../../../components/EmptyState';
import StatusBadge from '../../../components/StatusBadge';
import { formatDateTime, formatDate } from '../../../utils/formatters';

const DOC_TYPES = [
  'INCORPORATION_CERT',
  'PAN_CARD',
  'GST_CERT',
  'BANK_PROOF',
  'ADDRESS_PROOF',
  'IDENTITY_PROOF',
];

function KycTab({ merchantId, onMerchantChanged }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    documentType: 'INCORPORATION_CERT',
    documentRef: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [actionId, setActionId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await merchantApi.getKycByMerchant(merchantId);
      setDocs(response.data?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.documentRef.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        merchantId,
        documentType: formData.documentType,
        documentRef: formData.documentRef.trim(),
        ...(formData.notes.trim() && { notes: formData.notes.trim() }),
      };
      await merchantApi.submitKyc(payload);
      setShowForm(false);
      setFormData({ documentType: 'INCORPORATION_CERT', documentRef: '', notes: '' });
      fetchDocs();
      // Backend auto-activates the merchant on first KYC submission — refresh
      // the parent so the status badge flips PENDING → ACTIVE without reload.
      if (onMerchantChanged) onMerchantChanged();
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (kycId) => {
    setActionId(kycId);
    setActionError(null);
    try {
      await merchantApi.verifyKyc(kycId);
      fetchDocs();
    } catch (err) {
      setActionError(err);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (kycId) => {
    const reason = window.prompt('Rejection reason:');
    if (!reason?.trim()) return;

    setActionId(kycId);
    setActionError(null);
    try {
      await merchantApi.rejectKyc(kycId, reason.trim());
      fetchDocs();
    } catch (err) {
      setActionError(err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">KYC Documents</h6>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          <i className={`bi ${showForm ? 'bi-x-circle' : 'bi-plus-circle'} me-1`}></i>
          {showForm ? 'Cancel' : 'Submit Document'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-3 border-primary">
          <div className="card-body">
            <h6 className="card-title small text-muted text-uppercase mb-3">New KYC Document</h6>

            {submitError && (
              <ErrorAlert
                error={submitError}
                title="Submission failed"
                dismissible
                onDismiss={() => setSubmitError(null)}
              />
            )}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="documentType" className="form-label">Document Type</label>
                  <select
                    id="documentType"
                    name="documentType"
                    className="form-select"
                    value={formData.documentType}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="documentRef" className="form-label">
                    Document Reference <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="documentRef"
                    name="documentRef"
                    className="form-control"
                    value={formData.documentRef}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    placeholder="Document ID or filename"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={submitting}
                  rows={2}
                  placeholder="Optional remarks"
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Submitting...
                    </>
                  ) : 'Submit'}
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

      {loading && <LoadingSpinner text="Loading KYC documents..." />}
      {!loading && error && (
        <ErrorAlert error={error} title="Failed to load KYC documents" onRetry={fetchDocs} />
      )}
      {!loading && !error && docs.length === 0 && (
        <EmptyState
          icon="bi-file-earmark-check"
          title="No KYC documents submitted"
          message="Submit the first document for verification."
        />
      )}

      {!loading && !error && docs.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Verified</th>
                <th style={{ width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.kycId}>
                  <td className="text-muted small">{d.kycId}</td>
                  <td className="small">{(d.documentType || '').replaceAll('_', ' ')}</td>
                  <td className="small"><code>{d.documentRef}</code></td>
                  <td><StatusBadge status={d.status} size="sm" /></td>
                  <td className="text-muted small">{formatDateTime(d.submittedAt)}</td>
                  <td className="text-muted small">
                    {d.verifiedDate ? formatDate(d.verifiedDate) : '—'}
                  </td>
                  <td>
                    {d.status === 'PENDING' && (
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => handleVerify(d.kycId)}
                          disabled={actionId === d.kycId}
                          className="btn btn-success btn-sm"
                          title="Verify"
                        >
                          <i className="bi bi-check"></i>
                        </button>
                        <button
                          onClick={() => handleReject(d.kycId)}
                          disabled={actionId === d.kycId}
                          className="btn btn-danger btn-sm"
                          title="Reject"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
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

export default KycTab;
