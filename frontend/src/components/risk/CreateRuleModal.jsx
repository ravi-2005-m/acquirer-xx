import { useState } from 'react';
import { riskApi } from '../../api/riskApi';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const ACTIONS = ['ALLOW', 'REVIEW', 'BLOCK'];

const INITIAL = {
  name: '',
  expression: '',
  maxAmount: '',
  severity: 'MEDIUM',
  action: 'REVIEW',
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
        name:       form.name,
        expression: form.expression || null,
        maxAmount:  form.maxAmount !== '' ? form.maxAmount : null,
        severity:   form.severity,
        action:     form.action,
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
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Expression</label>
                  <input
                    className="form-control form-control-sm font-monospace"
                    placeholder="e.g. amount > 50000"
                    value={form.expression}
                    onChange={e => set('expression', e.target.value)}
                  />
                  <div className="form-text small">Optional rule condition expression</div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Max Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control form-control-sm"
                      placeholder="e.g. 50000"
                      value={form.maxAmount}
                      onChange={e => set('maxAmount', e.target.value)}
                    />
                    <div className="form-text small">Trigger threshold (optional)</div>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Severity <span className="text-danger">*</span></label>
                    <select
                      className="form-select form-select-sm"
                      value={form.severity}
                      onChange={e => set('severity', e.target.value)}
                      required
                    >
                      {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-0">
                  <label className="form-label small fw-semibold">Action <span className="text-danger">*</span></label>
                  <select
                    className="form-select form-select-sm"
                    value={form.action}
                    onChange={e => set('action', e.target.value)}
                    required
                  >
                    {ACTIONS.map(a => <option key={a}>{a}</option>)}
                  </select>
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
