import { useState, useEffect } from 'react';
import { settlementApi } from '../../api/settlementApi';
import { merchantApi } from '../../api/merchantApi';
import EntitySelect from '../common/EntitySelect';

const ADJUSTMENT_TYPES = [
  { value: 'REVERSAL',       label: 'Reversal — undo a settlement' },
  { value: 'FEE_CORRECTION', label: 'Fee Correction — fix wrong MDR/charge' },
  { value: 'MISSING_PAYOUT', label: 'Missing Payout — add a missed transaction' },
  { value: 'BANK_RETURN',    label: 'Bank Return — failed transfer reverted' },
  { value: 'MANUAL_CREDIT',  label: 'Manual Credit — discretionary credit' },
  { value: 'MANUAL_DEBIT',   label: 'Manual Debit — discretionary debit' },
];

const EMPTY = { merchantId: '', txnId: '', amount: '', isCredit: true, reason: '', type: '' };

const fetchMerchantsOptions = ({ search }) =>
  (search
    ? merchantApi.search({ legalName: search }, { size: 20 })
    : merchantApi.getAll({ size: 20 })
  ).then(res => {
    const body = res.data?.data ?? res.data ?? {};
    return { content: body.content ?? (Array.isArray(body) ? body : []) };
  });

function AdjustmentModal({ show, defaultMerchantId = '', onClose, onSaved }) {
  const [form, setForm]               = useState({ ...EMPTY, merchantId: defaultMerchantId });
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (show) {
      setForm({ ...EMPTY, merchantId: defaultMerchantId });
      setErrors({});
      setServerError(null);
    }
  }, [show, defaultMerchantId]);

  if (!show) return null;

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.merchantId)                         errs.merchantId = 'Merchant is required';
    if (!form.type)                               errs.type       = 'Adjustment type is required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Amount must be positive';
    if (form.reason.trim().length < 20)           errs.reason     = 'Reason must be at least 20 characters';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        merchantId: parseInt(form.merchantId, 10),
        amount:     parseFloat(form.amount) * (form.isCredit ? 1 : -1),
        reason:     form.reason.trim(),
        type:       form.type,
      };
      if (form.txnId) payload.txnId = parseInt(form.txnId, 10);

      const res = await settlementApi.createAdjustment(payload);
      onSaved?.(res.data?.data ?? res.data);
      onClose();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Failed to create adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  const charsLeft = Math.max(0, 20 - form.reason.length);

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-plus-circle me-2"></i>New Adjustment
              </h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={submitting}></button>
            </div>

            <div className="modal-body">
              {serverError && (
                <div className="alert alert-danger small">
                  <i className="bi bi-exclamation-triangle me-2"></i>{serverError}
                </div>
              )}

              <div className="mb-3">
                <EntitySelect
                  label="Merchant"
                  required
                  value={form.merchantId}
                  onChange={(id) => set('merchantId', id)}
                  fetchOptions={fetchMerchantsOptions}
                  getOptionLabel={m => m.businessName ?? m.legalName ?? `Merchant #${m.merchantId ?? m.id}`}
                  getOptionId={m => m.merchantId ?? m.id}
                  placeholder="Select merchant..."
                  disabled={!!defaultMerchantId}
                  error={errors.merchantId}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small">Adjustment Type <span className="text-danger">*</span></label>
                <select
                  className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                  value={form.type}
                  onChange={e => set('type', e.target.value)}
                  disabled={submitting}
                >
                  <option value="">Select type...</option>
                  {ADJUSTMENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.type && <div className="invalid-feedback">{errors.type}</div>}
              </div>

              <div className="row g-2 mb-3">
                <div className="col-7">
                  <label className="form-label small">Amount (₹) <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                    value={form.amount}
                    onChange={e => set('amount', e.target.value)}
                    disabled={submitting}
                    placeholder="0.00"
                  />
                  {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                </div>
                <div className="col-5">
                  <label className="form-label small">Direction <span className="text-danger">*</span></label>
                  <div className="btn-group w-100" role="group">
                    <input type="radio" className="btn-check" id="adj-credit" checked={form.isCredit}  onChange={() => set('isCredit', true)}  disabled={submitting} />
                    <label className="btn btn-outline-success btn-sm" htmlFor="adj-credit">+ Credit</label>
                    <input type="radio" className="btn-check" id="adj-debit"  checked={!form.isCredit} onChange={() => set('isCredit', false)} disabled={submitting} />
                    <label className="btn btn-outline-danger btn-sm"  htmlFor="adj-debit">− Debit</label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small">Transaction ID <span className="text-muted">(optional)</span></label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={form.txnId}
                  onChange={e => set('txnId', e.target.value)}
                  placeholder="Link to a specific transaction"
                  disabled={submitting}
                />
              </div>

              <div className="mb-2">
                <label className="form-label small">Reason / Justification <span className="text-danger">*</span></label>
                <textarea
                  className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
                  rows={3}
                  value={form.reason}
                  onChange={e => set('reason', e.target.value)}
                  placeholder="Detailed reason for this adjustment..."
                  disabled={submitting}
                />
                {errors.reason
                  ? <div className="invalid-feedback">{errors.reason}</div>
                  : (
                    <div className="d-flex justify-content-between mt-1">
                      <small className={charsLeft > 0 ? 'text-danger' : 'text-success'}>
                        {charsLeft > 0 ? `${charsLeft} more characters needed` : '✓ Minimum met'}
                      </small>
                      <small className="text-muted">{form.reason.length} chars</small>
                    </div>
                  )
                }
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting || charsLeft > 0}
              >
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Creating...</>
                  : <><i className="bi bi-check-circle me-1"></i>Create Adjustment</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdjustmentModal;
