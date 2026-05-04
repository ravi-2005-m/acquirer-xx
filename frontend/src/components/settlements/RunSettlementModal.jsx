import { useState } from 'react';
import { settlementApi } from '../../api/settlementApi';

function RunSettlementModal({ show, merchantId, merchantName, onClose, onCompleted }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  if (!show) return null;

  const handleRun = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res   = await settlementApi.runMerchantSettlement(merchantId);
      const batch = res.data?.data ?? res.data ?? null;
      onCompleted?.(batch);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to run settlement — please try again');
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
              <button type="button" className="btn-close" onClick={onClose} disabled={submitting}></button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger small">
                  <i className="bi bi-exclamation-triangle me-2"></i>{error}
                </div>
              )}

              <p>
                Run a fresh settlement batch for{' '}
                <strong>{merchantName || `merchant #${merchantId}`}</strong>?
              </p>
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
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
              <button className="btn btn-warning" onClick={handleRun} disabled={submitting}>
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Running...</>
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
