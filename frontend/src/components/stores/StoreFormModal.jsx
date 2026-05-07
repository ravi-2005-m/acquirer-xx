import { useState, useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';
import { storeApi } from '../../api/storeApi';
import { merchantApi } from '../../api/merchantApi';
import EntitySelect from '../common/EntitySelect';

const EMPTY = {
  storeName: '',
  address: '',
  region: '',
  city: '',
  state: '',
  pincode: '',
  contactPerson: '',
  contactPhone: '',
};

// Wrap merchantApi for EntitySelect
const fetchMerchantsOptions = ({ search }) =>
  (search
    ? merchantApi.search({ legalName: search }, { size: 20 })
    : merchantApi.getAll({ size: 20 })
  ).then(res => {
    const body = res.data?.data ?? res.data ?? {};
    return { content: body.content ?? (Array.isArray(body) ? body : []) };
  });

function StoreFormModal({ show, existing, defaultMerchantId, onClose, onSaved }) {
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
      // Defensive: Bootstrap dispose() can leave a backdrop / body lock under
      // StrictMode or HMR. Clear them so the screen never freezes after refresh.
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
        storeName:     existing.storeName    || '',
        address:       existing.address      || '',
        region:        existing.region       || '',
        city:          existing.city         || '',
        state:         existing.state        || '',
        pincode:       existing.pincode      || '',
        contactPerson: existing.contactPerson|| '',
        contactPhone:  existing.contactPhone || '',
      });
      setMerchantId(existing.merchantId || '');
    } else {
      setForm(EMPTY);
      setMerchantId(defaultMerchantId || '');
    }
    setErrors({});
    setServerError(null);
  }, [show, existing, defaultMerchantId]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.storeName.trim()) errs.storeName = 'Store name is required';
    if (!merchantId && !isEdit) errs.merchantId = 'Parent merchant is required';
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) errs.pincode = 'Pincode must be 6 digits';
    if (form.contactPhone && !/^\d{10}$/.test(form.contactPhone)) errs.contactPhone = 'Phone must be 10 digits';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        storeName: form.storeName.trim(),
        ...(form.address.trim()       && { address: form.address.trim() }),
        ...(form.region.trim()        && { region: form.region.trim() }),
        ...(form.city.trim()          && { city: form.city.trim() }),
        ...(form.state.trim()         && { state: form.state.trim() }),
        ...(form.pincode.trim()       && { pincode: form.pincode.trim() }),
        ...(form.contactPerson.trim() && { contactPerson: form.contactPerson.trim() }),
        ...(form.contactPhone.trim()  && { contactPhone: form.contactPhone.trim() }),
      };
      const resp = isEdit
        ? await storeApi.update(existing.storeId, payload)
        : await storeApi.create(merchantId, payload);
      onSaved(resp.data?.data ?? resp.data);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to save store');
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
              {isEdit ? 'Edit Store' : 'New Store'}
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
                label="Parent Merchant"
                required
                value={merchantId}
                onChange={(id) => { setMerchantId(id); if (errors.merchantId) setErrors(e => ({ ...e, merchantId: undefined })); }}
                fetchOptions={fetchMerchantsOptions}
                getOptionLabel={(m) => `${m.legalName} (${m.merchantId})`}
                getOptionId={(m) => m.merchantId}
                placeholder="Select merchant..."
                disabled={isEdit}
                error={errors.merchantId}
              />
              {isEdit && <div className="form-text small">Parent merchant cannot be changed after creation.</div>}
            </div>

            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label small">Store Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.storeName ? 'is-invalid' : ''}`}
                  value={form.storeName}
                  onChange={e => handleChange('storeName', e.target.value)}
                  placeholder="Downtown Branch"
                  disabled={submitting}
                />
                {errors.storeName && <div className="invalid-feedback">{errors.storeName}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label small">Region</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.region}
                  onChange={e => handleChange('region', e.target.value)}
                  placeholder="South Zone"
                  disabled={submitting}
                />
              </div>

              <div className="col-12">
                <label className="form-label small">Address</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="123 Main St, Bangalore"
                  disabled={submitting}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small">City</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.city}
                  onChange={e => handleChange('city', e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.state}
                  onChange={e => handleChange('state', e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small">Pincode</label>
                <input
                  type="text"
                  className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                  value={form.pincode}
                  onChange={e => handleChange('pincode', e.target.value)}
                  maxLength={6}
                  disabled={submitting}
                />
                {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label small">Contact Person</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.contactPerson}
                  onChange={e => handleChange('contactPerson', e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small">Contact Phone</label>
                <input
                  type="text"
                  className={`form-control ${errors.contactPhone ? 'is-invalid' : ''}`}
                  value={form.contactPhone}
                  onChange={e => handleChange('contactPhone', e.target.value)}
                  maxLength={10}
                  disabled={submitting}
                />
                {errors.contactPhone && <div className="invalid-feedback">{errors.contactPhone}</div>}
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
                : <><i className={`bi bi-${isEdit ? 'check-circle' : 'plus-circle'} me-1`}></i>{isEdit ? 'Save Changes' : 'Create Store'}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreFormModal;
