import { useState } from 'react';
import { riskApi } from '../../api/riskApi';

const CONDITION_TYPES = [
  'AMOUNT_GT',
  'AMOUNT_LT',
  'VELOCITY_COUNT',
  'BLACKLISTED_PAN',
  'COUNTRY_BLOCK',
  'MCC_BLOCK',
];
const ACTIONS = ['ALLOW', 'REVIEW', 'BLOCK'];

const INITIAL = {
  name: '',
  conditionType: 'AMOUNT_GT',
  threshold: '',
  action: 'REVIEW',
  priority: '10',
  description: '',
};

function CreateRuleModal({ show, onClose, onCreated }) {
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
      const payload = {
        ...form,
        threshold: form.threshold !== '' ? parseFloat(form.threshold) : undefined,
        priority:  parseInt(form.priority) || 10,
      };
      await riskApi.createRule(payload);
      setForm(INITIAL);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create rule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="modal d-block" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-plus-circle me-2"></i>Create Risk Rule
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger py-2 small">{error}</div>
                )}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Rule Name <span className="text-danger">*</span></label>
                  <input
                    className="form-control form-control-sm"
                    placeholder="e.g. Block High-Value Txns"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    required
                  />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Condition Type <span className="text-danger">*</span></label>
                    <select
                      className="form-select form-select-sm"
                      value={form.conditionType}
                      onChange={e => set('conditionType', e.target.value)}
                    >
                      {CONDITION_TYPES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Threshold</label>
                    <input
                      type="number"
                      step="any"
                      className="form-control form-control-sm"
                      placeholder="e.g. 50000"
                      value={form.threshold}
                      onChange={e => set('threshold', e.target.value)}
                    />
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Action <span className="text-danger">*</span></label>
                    <select
                      className="form-select form-select-sm"
                      value={form.action}
                      onChange={e => set('action', e.target.value)}
                    >
                      {ACTIONS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Priority</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="form-control form-control-sm"
                      value={form.priority}
                      onChange={e => set('priority', e.target.value)}
                    />
                    <div className="form-text small">Lower number = higher priority</div>
                  </div>
                </div>
                <div className="mb-0">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    placeholder="Optional description"
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : 'Create Rule'}
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

export default CreateRuleModal;
