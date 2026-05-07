import { useState, useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';
import { terminalApi } from '../../api/terminalApi';
import { merchantApi } from '../../api/merchantApi';
import { storeApi } from '../../api/storeApi';
import EntitySelect from '../common/EntitySelect';

const EMPTY = {
  tid: '',
  brandModel: '',
  capability: 'EMV',
  storeId: '',
};

const fetchMerchantsOptions = ({ search }) =>
  (search
    ? merchantApi.search({ legalName: search }, { size: 20 })
    : merchantApi.getAll({ size: 20 })
  ).then(res => {
    const body = res.data?.data ?? res.data ?? {};
    return { content: body.content ?? (Array.isArray(body) ? body : []) };
  });

const fetchStoresOptions = (merchantId) => ({ search }) =>
  storeApi.search(
    { storeName: search || undefined, merchantId: merchantId || undefined },
    { size: 20 }
  ).then(res => {
    const body = res.data?.data ?? res.data ?? {};
    return { content: body.content ?? (Array.isArray(body) ? body : []) };
  });

function TerminalFormModal({ show, existing, defaultStoreId, onClose, onSaved }) {
  const modalRef   = useRef(null);
  const bsModalRef = useRef(null);

  const [form, setForm]             = useState(EMPTY);
  const [merchantId, setMerchantId] = useState('');
  const [errors, setErrors]         = useState({});
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
    if (existing) {
      setForm({
        tid:        existing.tid        || '',
        brandModel: existing.brandModel || '',
        capability: existing.capability || 'EMV',
        storeId:    existing.storeId    || '',
      });
      setMerchantId(existing.merchantId || '');
    } else {
      setForm({ ...EMPTY, storeId: defaultStoreId || '' });
      // If defaultStoreId provided, resolve its merchant
      if (defaultStoreId) {
        storeApi.getById(defaultStoreId)
          .then(res => {
            const s = res.data?.data ?? res.data;
            if (s?.merchantId) setMerchantId(String(s.merchantId));
          })
          .catch(() => {});
      } else {
        setMerchantId('');
      }
    }
    setErrors({});
    setServerError(null);
  }, [show, existing, defaultStoreId]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleMerchantChange = (id) => {
    setMerchantId(id);
    setForm(prev => ({ ...prev, storeId: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.tid.trim()) errs.tid = 'TID is required';
    else if (!/^\d{8}$/.test(form.tid)) errs.tid = 'TID must be exactly 8 digits';
    if (!form.storeId) errs.storeId = 'Store is required';
    if (!form.brandModel.trim()) errs.brandModel = 'Device model is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        tid:        form.tid.trim(),
        brandModel: form.brandModel.trim(),
        capability: form.capability,
        storeId:    form.storeId,
      };
      const resp = isEdit
        ? await terminalApi.update(existing.terminalId, payload)
        : await terminalApi.createInStore(form.storeId, payload);
      onSaved(resp.data?.data ?? resp.data);
    } catch (err) {
      const data = err.response?.data;
      const fieldErrs = data?.fieldErrors
        ? Object.values(data.fieldErrors).join('. ')
        : null;
      setServerError(fieldErrs || data?.message || data?.error || 'Failed to save terminal');
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
              {isEdit ? 'Edit Terminal' : 'New Terminal'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>

          <div className="modal-body">
            {serverError && (
              <div className="alert alert-danger small">
                <i className="bi bi-exclamation-triangle me-2"></i>{serverError}
              </div>
            )}

            <div className="row g-3">
              {/* Chained: Merchant first */}
              <div className="col-md-6">
                <EntitySelect
                  label="Merchant"
                  required
                  value={merchantId}
                  onChange={handleMerchantChange}
                  fetchOptions={fetchMerchantsOptions}
                  getOptionLabel={(m) => m.legalName}
                  getOptionId={(m) => m.merchantId}
                  placeholder="Select merchant first..."
                  disabled={isEdit}
                />
                {isEdit && <div className="form-text small">Cannot change merchant on edit.</div>}
              </div>

              {/* Store — filtered by selected merchant */}
              <div className="col-md-6">
                <EntitySelect
                  label="Store"
                  required
                  value={form.storeId}
                  onChange={(id) => handleChange('storeId', id)}
                  fetchOptions={fetchStoresOptions(merchantId)}
                  getOptionLabel={(s) => s.storeName}
                  getOptionId={(s) => s.storeId}
                  placeholder={merchantId ? 'Select store...' : 'Select merchant first'}
                  disabled={isEdit || !merchantId}
                  error={errors.storeId}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small">TID <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.tid ? 'is-invalid' : ''}`}
                  value={form.tid}
                  onChange={e => handleChange('tid', e.target.value)}
                  placeholder="12345678"
                  maxLength={8}
                  disabled={submitting || isEdit}
                />
                {errors.tid && <div className="invalid-feedback">{errors.tid}</div>}
                {isEdit && <div className="form-text small">TID cannot be changed.</div>}
              </div>

              <div className="col-md-5">
                <label className="form-label small">Brand / Model <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.brandModel ? 'is-invalid' : ''}`}
                  value={form.brandModel}
                  onChange={e => handleChange('brandModel', e.target.value)}
                  placeholder="Ingenico iWL250"
                  disabled={submitting}
                />
                {errors.brandModel && <div className="invalid-feedback">{errors.brandModel}</div>}
              </div>

              <div className="col-md-3">
                <label className="form-label small">Capability</label>
                <select
                  className="form-select"
                  value={form.capability}
                  onChange={e => handleChange('capability', e.target.value)}
                  disabled={submitting}
                >
                  <option value="EMV">EMV</option>
                  <option value="CTLS">Contactless</option>
                  <option value="MAGSTRIPE">Magstripe</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>{isEdit ? 'Saving...' : 'Creating...'}</>
                : <><i className={`bi bi-${isEdit ? 'check-circle' : 'plus-circle'} me-1`}></i>{isEdit ? 'Save Changes' : 'Create Terminal'}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TerminalFormModal;
