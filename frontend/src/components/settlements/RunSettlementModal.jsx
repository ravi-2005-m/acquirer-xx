import { useState } from 'react';
import { settlementApi } from '../../api/settlementApi';
import { merchantApi } from '../../api/merchantApi';
import EntitySelect from '../common/EntitySelect';

const fetchMerchantOptions = ({ search }) =>
  merchantApi
    .search({ businessName: search || undefined }, { size: 30 })
    .then(res => {
      const body = res.data?.data ?? res.data ?? {};
      return body.content ?? (Array.isArray(body) ? body : []);
    });

function RunSettlementModal({ show, merchantId, merchantName, onClose, onCompleted }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [picked, setPicked]         = useState(null);

  if (!show) return null;

  const needsPicker          = !merchantId;
  const resolvedId           = merchantId ?? picked?.merchantId;
  const resolvedName         = merchantName ?? picked?.businessName ?? picked?.legalName ?? null;

  const handleClose = () => {
    setPicked(null);
    setError(null);
    onClose();
  };

  const handleRun = async () => {
    if (!resolvedId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res   = await settlementApi.runMerchantSettlement(resolvedId);
      const batch = res.data?.data ?? res.data ?? null;
      setPicked(null);
      onCompleted?.(batch);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to run settlement — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-warning bg-opacity-10">
              <h5 className="modal-title">
                <i className="bi bi-play-circle me-2"></i>Run Settlement
              </h5>
              <button type="button" className="btn-close" onClick={handleClose} disabled={submitting} />
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger small">
                  <i className="bi bi-exclamation-triangle me-2"></i>{error}
                </div>
              )}

              {needsPicker && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Select Merchant <span className="text-danger">*</span>
                  </label>
                  <EntitySelect
                    value={picked}
                    onChange={setPicked}
                    fetchOptions={fetchMerchantOptions}
                    getOptionLabel={m => m.businessName ?? m.legalName ?? `Merchant #${m.merchantId}`}
                    getOptionId={m => m.merchantId}
                    placeholder="Search merchant…"
                    disabled={submitting}
                  />
                </div>
              )}

              {resolvedName && (
                <p>
                  Run a fresh settlement batch for <strong>{resolvedName}</strong>?
                </p>
              )}
              <p className="small text-muted mb-3">
                The system will aggregate all eligible transactions for this merchant, calculate fees,
                and create a new settlement batch ready for payout.
              </p>
              <div className="alert alert-info small mb-0">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Note:</strong> This runs automatically on schedule. Manual runs are intended
                for testing and recovery scenarios only.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={handleClose} disabled={submitting}>
                Cancel
              </button>
              <button
                className="btn btn-warning"
                onClick={handleRun}
                disabled={submitting || !resolvedId}
              >
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Running…</>
                  : <><i className="bi bi-play-circle me-1"></i>Run Settlement</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RunSettlementModal;
