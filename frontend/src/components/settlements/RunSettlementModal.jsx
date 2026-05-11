import { useState, useEffect } from 'react';
import { settlementApi } from '../../api/settlementApi';
import { merchantApi } from '../../api/merchantApi';
import { transactionApi } from '../../api/transactionApi';
import EntitySelect from '../common/EntitySelect';

const fetchMerchantOptions = ({ search }) =>
  merchantApi
    .search({ legalName: search || undefined }, { size: 30 })
    .then(res => {
      const body = res.data?.data ?? res.data ?? {};
      return body.content ?? (Array.isArray(body) ? body : []);
    });

function RunSettlementModal({ show, merchantId, merchantName, onClose, onCompleted }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [info, setInfo]             = useState(null);
  const [picked, setPicked]         = useState(null);
  const [openBatchWarning, setOpenBatchWarning] = useState(false);

  const resolvedId   = merchantId ?? picked?.merchantId ?? null;
  const resolvedName = merchantName ?? picked?.legalName ?? picked?.businessName ?? null;

  useEffect(() => {
    if (!show || !resolvedId) { setOpenBatchWarning(false); return; }
    transactionApi.hasOpenBatches(resolvedId)
      .then(res => {
        const data = res.data?.data ?? res.data ?? false;
        setOpenBatchWarning(!!data);
      })
      .catch(() => setOpenBatchWarning(false));
  }, [show, resolvedId]);

  if (!show) return null;

  const needsPicker = !merchantId;

  const handleClose = () => {
    setPicked(null);
    setError(null);
    setInfo(null);
    setOpenBatchWarning(false);
    onClose();
  };

  const handleRun = async () => {
    if (!resolvedId) return;
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const res   = await settlementApi.runMerchantSettlement(resolvedId);
      const batch = res.data?.data ?? res.data ?? null;
      setPicked(null);
      onCompleted?.(batch);
      onClose();
    } catch (err) {
      const data = err?.response?.data;
      const backendMsg = data?.message || data?.error || '';

      // "No unsettled transactions" is an expected condition — show info, not red error.
      if (/no unsettled transactions/i.test(backendMsg)) {
        const subject = resolvedName || `Merchant #${resolvedId}`;
        setInfo(
          `All transactions for ${subject} are already settled. ` +
          `Run a new transaction first to create another settlement batch.`
        );
      } else if (/open terminal batch/i.test(backendMsg)) {
        setError('Settlement blocked: close all open POS terminal batches first, then retry.');
      } else {
        setError(backendMsg || 'Failed to run settlement — please try again');
      }
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

              {info && (
                <div className="alert alert-info small d-flex align-items-start gap-2">
                  <i className="bi bi-info-circle mt-1 flex-shrink-0"></i>
                  <span>{info}</span>
                </div>
              )}

              {openBatchWarning && (
                <div className="alert alert-warning small">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Open terminal batch detected.</strong> This merchant has a POS batch still open.
                  Close all terminal batches before running settlement, otherwise the settlement will be blocked.
                </div>
              )}

              {needsPicker && (
                <div className="mb-3">
                  <label className="form-label fw-medium">
                    Select Merchant <span className="text-danger">*</span>
                  </label>
                  <EntitySelect
                    value={picked ? String(picked.merchantId) : ''}
                    onChange={(_id, option) => {
                      setPicked(option);
                      setInfo(null);
                      setError(null);
                    }}
                    fetchOptions={fetchMerchantOptions}
                    getOptionLabel={m => m.legalName ?? m.businessName ?? `Merchant #${m.merchantId}`}
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
