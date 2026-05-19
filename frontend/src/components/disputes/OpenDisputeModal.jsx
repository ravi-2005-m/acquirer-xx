import { useState } from 'react';
import { disputeApi } from '../../api/disputeApi';
import { maskPan } from '../../utils/formatters';

const REASON_OPTIONS = [
  { value: 'FRAUD',             label: 'Fraud' },
  { value: 'UNAUTHORIZED',      label: 'Unauthorized Transaction' },
  { value: 'NOT_RECEIVED',      label: 'Goods / Services Not Received' },
  { value: 'DUPLICATE',         label: 'Duplicate Transaction' },
  { value: 'WRONG_AMOUNT',      label: 'Wrong Amount Charged' },
  { value: 'CREDIT_NOT_ISSUED', label: 'Credit Not Issued' },
  { value: 'SUBSCRIPTION',      label: 'Subscription Dispute' },
  { value: 'OTHER',             label: 'Other' },
];

const INIT = { txnId: '', panMasked: '', reasonCode: '' };

function OpenDisputeModal({ onClose, onCreated }) {
  const [form, setForm]         = useState(INIT);
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.txnId || isNaN(Number(form.txnId)) || Number(form.txnId) <= 0)
      e.txnId = 'Enter a valid Transaction ID';
    if (!form.panMasked.trim())
      e.panMasked = 'PAN is required';
    else if (form.panMasked.length < 13 || form.panMasked.length > 19)
      e.panMasked = 'Enter 13–19 digit card number';
    if (!form.reasonCode)
      e.reasonCode = 'Select a reason';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError(null);
    try {
      const res = await disputeApi.openDispute({
        txnId:      Number(form.txnId),
        panMasked:  maskPan(form.panMasked.trim()),
        reasonCode: form.reasonCode,
      });
      const created = res.data?.data ?? res.data;
      onCreated?.(created);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.error
        || 'Failed to open dispute';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-chat-left-text me-2"></i>Open New Dispute
            </h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {serverError && (
                <div className="alert alert-danger small py-2">
                  <i className="bi bi-exclamation-triangle me-1"></i>{serverError}
                </div>
              )}

              {/* Transaction ID */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Transaction ID <span className="text-danger">*</span></label>
                <input
                  type="number"
                  className={`form-control form-control-sm ${errors.txnId ? 'is-invalid' : ''}`}
                  placeholder="e.g. 1042"
                  value={form.txnId}
                  onChange={e => set('txnId', e.target.value)}
                  disabled={submitting}
                />
                {errors.txnId && <div className="invalid-feedback">{errors.txnId}</div>}
              </div>

              {/* PAN */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">PAN <span className="text-danger">*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`form-control form-control-sm font-monospace ${errors.panMasked ? 'is-invalid' : ''}`}
                  placeholder="4111111111111111"
                  maxLength={19}
                  value={form.panMasked}
                  onChange={e => set('panMasked', e.target.value.replace(/\D/g, ''))}
                  disabled={submitting}
                />
                {errors.panMasked
                  ? <div className="invalid-feedback">{errors.panMasked}</div>
                  : <div className="form-text">Enter the 13–19 digit card number — it will be masked automatically</div>
                }
              </div>

              {/* Reason Code */}
              <div className="mb-1">
                <label className="form-label small fw-semibold">Reason Code <span className="text-danger">*</span></label>
                <select
                  className={`form-select form-select-sm ${errors.reasonCode ? 'is-invalid' : ''}`}
                  value={form.reasonCode}
                  onChange={e => set('reasonCode', e.target.value)}
                  disabled={submitting}
                >
                  <option value="">— Select reason —</option>
                  {REASON_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.reasonCode && <div className="invalid-feedback">{errors.reasonCode}</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Opening…</>
                  : <><i className="bi bi-plus-circle me-1"></i>Open Dispute</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OpenDisputeModal;
