import { useState, useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';
import { merchantApi } from '../../api/merchantApi';

const EMPTY_FORM = {
  legalName: '',
  doingBusinessAs: '',
  mcc: '',
  contactInfo: '',
  riskLevel: 'LOW',
};

function MerchantFormModal({ show, existing, onClose, onSaved }) {
  const modalRef = useRef(null);
  const bsModalRef = useRef(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const isEdit = Boolean(existing);

  useEffect(() => {
    if (!modalRef.current) return;
    bsModalRef.current = new Modal(modalRef.current, { backdrop: 'static', keyboard: false });
    const node = modalRef.current;
    const onHidden = () => { if (show) onClose(); };
    node.addEventListener('hidden.bs.modal', onHidden);
    return () => {
      node.removeEventListener('hidden.bs.modal', onHidden);
      bsModalRef.current?.hide();
      bsModalRef.current?.dispose();
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    };
  }, []);

  useEffect(() => {
    if (!bsModalRef.current) return;
    show ? bsModalRef.current.show() : bsModalRef.current.hide();
  }, [show]);

  useEffect(() => {
    if (!show) return;
    setForm(existing
      ? { legalName: existing.legalName || '', doingBusinessAs: existing.doingBusinessAs || '', mcc: existing.mcc || '', contactInfo: existing.contactInfo || '', riskLevel: existing.riskLevel || 'LOW' }
      : EMPTY_FORM
    );
    setErrors({});
    setServerError(null);
  }, [show, existing]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.legalName.trim()) errs.legalName = 'Legal name is required';
    else if (form.legalName.length > 150) errs.legalName = 'Cannot exceed 150 characters';
    if (!form.contactInfo.trim()) errs.contactInfo = 'Contact info is required';
    if (form.mcc && !/^\d{4}$/.test(form.mcc)) errs.mcc = 'MCC must be exactly 4 digits';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        legalName: form.legalName.trim(),
        contactInfo: form.contactInfo.trim(),
        riskLevel: form.riskLevel,
        ...(form.doingBusinessAs.trim() && { doingBusinessAs: form.doingBusinessAs.trim() }),
        ...(form.mcc.trim() && { mcc: form.mcc.trim() }),
      };
      const resp = isEdit
        ? await merchantApi.update(existing.merchantId, payload)
        : await merchantApi.create(payload);
      onSaved(resp.data?.data ?? resp.data);
    } catch (err) {
      const fieldErrs = err.response?.data?.fieldErrors;
      if (fieldErrs) setErrors(fieldErrs);
      setServerError(err.response?.data?.message || 'Failed to save merchant');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className={`bi bi-${isEdit ? 'pencil' : 'plus-circle'} me-2`}></i>
              {isEdit ? 'Edit Merchant' : 'New Merchant'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>

          <div className="modal-body">
            {serverError && (
              <div className="alert alert-danger small mb-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {serverError}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">
                Legal Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.legalName ? 'is-invalid' : ''}`}
                value={form.legalName}
                onChange={e => handleChange('legalName', e.target.value)}
                placeholder="Acme Corporation Pvt Ltd"
                maxLength={150}
                disabled={submitting}
              />
              {errors.legalName && <div className="invalid-feedback">{errors.legalName}</div>}
            </div>

            <div className="row mb-3">
              <div className="col-md-7">
                <label className="form-label">Doing Business As (DBA)</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.doingBusinessAs}
                  onChange={e => handleChange('doingBusinessAs', e.target.value)}
                  placeholder="Acme Corp"
                  disabled={submitting}
                />
              </div>
              <div className="col-md-5">
                <label className="form-label">MCC Code</label>
                <input
                  type="text"
                  className={`form-control ${errors.mcc ? 'is-invalid' : ''}`}
                  value={form.mcc}
                  onChange={e => handleChange('mcc', e.target.value)}
                  placeholder="5411"
                  maxLength={4}
                  disabled={submitting}
                />
                {errors.mcc && <div className="invalid-feedback">{errors.mcc}</div>}
                <div className="form-text small">4-digit Merchant Category Code</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Contact Info <span className="text-danger">*</span>
              </label>
              <textarea
                className={`form-control ${errors.contactInfo ? 'is-invalid' : ''}`}
                value={form.contactInfo}
                onChange={e => handleChange('contactInfo', e.target.value)}
                rows={3}
                placeholder={'Email: contact@acme.com\nPhone: +91 9876543210\nAddress: Bangalore, India'}
                disabled={submitting}
              />
              {errors.contactInfo && <div className="invalid-feedback">{errors.contactInfo}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Risk Level</label>
              <select
                className="form-select"
                value={form.riskLevel}
                onChange={e => handleChange('riskLevel', e.target.value)}
                disabled={submitting}
                style={{ maxWidth: '200px' }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {!isEdit && (
              <div className="alert alert-info small mb-0">
                <i className="bi bi-info-circle me-2"></i>
                New merchants start in <strong>PENDING</strong> status. Activate them after KYC is verified.
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>{isEdit ? 'Saving...' : 'Creating...'}</>
              ) : (
                <><i className={`bi bi-${isEdit ? 'check-circle' : 'plus-circle'} me-1`}></i>{isEdit ? 'Save Changes' : 'Create Merchant'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantFormModal;
