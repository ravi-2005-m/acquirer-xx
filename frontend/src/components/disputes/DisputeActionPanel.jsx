import { useState } from 'react';
import { disputeApi } from '../../api/disputeApi';

const ACTIONS = {
  OPEN: [
    { id: 'accept',  label: 'Accept Dispute',  variant: 'success',   icon: 'bi-check-circle',  requiresJustification: true,  minLength: 20 },
    { id: 'reject',  label: 'Reject Dispute',  variant: 'danger',    icon: 'bi-x-circle',      requiresJustification: true,  minLength: 20 },
  ],
  EVIDENCE_REVIEW: [
    { id: 'pre_arb', label: 'Send to Pre-Arbitration', variant: 'warning', icon: 'bi-arrow-right-circle', requiresJustification: true, minLength: 30 },
    { id: 'accept',  label: 'Accept Dispute',           variant: 'success', icon: 'bi-check-circle',       requiresJustification: true, minLength: 20 },
    { id: 'reject',  label: 'Reject Dispute',           variant: 'danger',  icon: 'bi-x-circle',           requiresJustification: true, minLength: 20 },
  ],
  PRE_ARBITRATION: [
    { id: 'arbitration', label: 'Escalate to Arbitration', variant: 'danger',   icon: 'bi-exclamation-circle', requiresJustification: true, minLength: 30 },
    { id: 'resolve',     label: 'Mark Resolved',           variant: 'success',  icon: 'bi-check-all',          requiresJustification: true, minLength: 20 },
  ],
  ARBITRATION: [
    { id: 'resolve', label: 'Mark Resolved', variant: 'success', icon: 'bi-check-all', requiresJustification: true, minLength: 20 },
  ],
};

const ACTION_FN = {
  accept:      (id, payload) => disputeApi.accept(id, payload),
  reject:      (id, payload) => disputeApi.reject(id, payload),
  pre_arb:     (id, payload) => disputeApi.sendToPreArbitration(id, payload),
  arbitration: (id, payload) => disputeApi.sendToArbitration(id, payload),
  resolve:     (id, payload) => disputeApi.resolve(id, payload),
};

function DisputeActionPanel({ dispute, onActionComplete }) {
  const [selected, setSelected] = useState(null);
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const actions = ACTIONS[dispute?.status] ?? [];

  if (!dispute || actions.length === 0) {
    return (
      <div className="text-muted small">
        <i className="bi bi-lock me-1"></i>No actions available for this status.
      </div>
    );
  }

  const selectedAction = actions.find(a => a.id === selected);
  const charsLeft = selectedAction
    ? Math.max(0, selectedAction.minLength - justification.length)
    : 0;

  const handleAction = (actionId) => {
    setSelected(actionId);
    setJustification('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const fn = ACTION_FN[selected];
      await fn(dispute.disputeId ?? dispute.id, {
        justification: justification.trim(),
        disputeId: dispute.disputeId ?? dispute.id,
      });
      setSelected(null);
      setJustification('');
      onActionComplete?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Action failed — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelected(null);
    setJustification('');
    setError(null);
  };

  if (selected && selectedAction?.requiresJustification) {
    return (
      <div>
        <div className="mb-2 fw-semibold small">
          <i className={`bi ${selectedAction.icon} me-1 text-${selectedAction.variant}`}></i>
          {selectedAction.label}
        </div>

        {error && (
          <div className="alert alert-danger small py-2 mb-2">
            <i className="bi bi-exclamation-triangle me-1"></i>{error}
          </div>
        )}

        <textarea
          className="form-control form-control-sm mb-1"
          rows={4}
          placeholder="Justification / notes..."
          value={justification}
          onChange={e => setJustification(e.target.value)}
          disabled={submitting}
        />
        <div className="d-flex justify-content-between mb-3">
          <small className={charsLeft > 0 ? 'text-danger' : 'text-success'}>
            {charsLeft > 0 ? `${charsLeft} more characters needed` : '✓ Minimum met'}
          </small>
          <small className="text-muted">{justification.length} chars</small>
        </div>

        <div className="d-flex gap-2">
          <button
            className={`btn btn-${selectedAction.variant} btn-sm flex-grow-1`}
            onClick={handleSubmit}
            disabled={submitting || charsLeft > 0}
          >
            {submitting
              ? <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Processing...</>
              : <><i className={`bi ${selectedAction.icon} me-1`}></i>Confirm</>
            }
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleCancel} disabled={submitting}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-2">
      {actions.map(a => (
        <button
          key={a.id}
          className={`btn btn-outline-${a.variant} btn-sm text-start`}
          onClick={() => handleAction(a.id)}
        >
          <i className={`bi ${a.icon} me-2`}></i>{a.label}
        </button>
      ))}
    </div>
  );
}

export default DisputeActionPanel;
