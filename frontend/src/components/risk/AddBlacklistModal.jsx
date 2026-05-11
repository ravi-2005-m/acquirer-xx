import { useState } from 'react';
import { riskApi } from '../../api/riskApi';

const ENTRY_TYPES = ['PAN', 'TERMINAL', 'MERCHANT'];

const INITIAL = { type: 'PAN', value: '', reason: '' };

function AddBlacklistModal({ show, onClose, onAdded }) {
  const [form, setForm]     = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  if (!show) return null;

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await riskApi.addBlacklist(form);
      setForm(INITIAL);
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add blacklist entry');
    } finally {
      setSaving(false);
    }
  };

  const placeholder = {
    PAN:      '453201******0366',
    TERMINAL: '10000001',
    MERCHANT: '12345',
  }[form.type] || 'Value';

  return (
    <>
      <div className="modal d-block" style={{ zIndex: 1055 }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-ban me-2 text-danger"></i>Add Blacklist Entry
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger py-2 small">{error}</div>
                )}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Entry Type <span className="text-danger">*</span></label>
                  <select
                    className="form-select form-select-sm"
                    value={form.type}
                    onChange={e => set('type', e.target.value)}
                  >
                    {ENTRY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Value <span className="text-danger">*</span></label>
                  <input
                    className="form-control form-control-sm font-monospace"
                    placeholder={placeholder}
                    value={form.value}
                    onChange={e => set('value', e.target.value)}
                    required
                  />
                </div>
                <div className="mb-0">
                  <label className="form-label small fw-semibold">Reason <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    placeholder="Why is this being blacklisted?"
                    value={form.reason}
                    onChange={e => set('reason', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-danger btn-sm" disabled={saving}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-1" />Adding...</>
                    : <><i className="bi bi-ban me-1" />Add to Blacklist</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1054 }} />
    </>
  );
}

export default AddBlacklistModal;
