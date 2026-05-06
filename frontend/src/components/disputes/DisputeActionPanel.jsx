import { useState } from 'react';
import { disputeApi } from '../../api/disputeApi';
import { useAuth } from '../../context/AuthContext';

const ACTION_TYPES = [
  { value: 'REQUEST_DOCS',    label: 'Request Documents',  variant: 'secondary', icon: 'bi-file-earmark-arrow-up' },
  { value: 'SUBMIT_EVIDENCE', label: 'Submit Evidence',    variant: 'info',      icon: 'bi-paperclip' },
  { value: 'ACCEPT',          label: 'Accept Dispute',     variant: 'success',   icon: 'bi-check-circle' },
  { value: 'REJECT',          label: 'Reject Dispute',     variant: 'danger',    icon: 'bi-x-circle' },
  { value: 'WRITE_OFF',       label: 'Write Off',          variant: 'warning',   icon: 'bi-eraser' },
  { value: 'ESCALATE',        label: 'Escalate',           variant: 'dark',      icon: 'bi-arrow-up-right-circle' },
];

const STAGE_ORDER = ['RETRIEVAL', 'CHARGEBACK', 'REPRESENTMENT', 'ARBITRATION'];

function DisputeActionPanel({ dispute, onActionComplete }) {
  const { user } = useAuth();
  const caseId = dispute?.caseId ?? dispute?.disputeId ?? dispute?.id;
  const isClosed = (dispute?.status || '').toUpperCase() === 'CLOSED';
  const stage = (dispute?.stage || '').toUpperCase();
  const canAdvance = !isClosed && STAGE_ORDER.indexOf(stage) >= 0 && STAGE_ORDER.indexOf(stage) < STAGE_ORDER.length - 1;

  const [actionType, setActionType] = useState('');
  const [notes, setNotes]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  if (!dispute || isClosed) {
    return (
      <div className="text-muted small">
        <i className="bi bi-lock me-1"></i>No actions available — dispute is closed.
      </div>
    );
  }

  const submitAction = async () => {
    if (!actionType) return;
    setSubmitting(true);
    setError(null);
    try {
      await disputeApi.addAction({
        caseId,
        actionType,
        actorId: user?.id ?? 1,
        notes: notes.trim() || null,
      });
      setActionType('');
      setNotes('');
      onActionComplete?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Action failed — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const advanceStage = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await disputeApi.advanceStage(caseId);
      onActionComplete?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to advance stage');
    } finally {
      setSubmitting(false);
    }
  };

  const closeDispute = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await disputeApi.closeDispute(caseId);
      onActionComplete?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to close dispute');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {error && (
        <div className="alert alert-danger small py-2 mb-0">
          <i className="bi bi-exclamation-triangle me-1"></i>{error}
        </div>
      )}

      <div>
        <label className="form-label small fw-semibold mb-1">Log an action</label>
        <select
          className="form-select form-select-sm mb-2"
          value={actionType}
          onChange={e => setActionType(e.target.value)}
          disabled={submitting}
        >
          <option value="">— Select an action —</option>
          {ACTION_TYPES.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
        <textarea
          className="form-control form-control-sm mb-2"
          rows={3}
          placeholder="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          disabled={submitting}
        />
        <button
          className="btn btn-primary btn-sm w-100"
          onClick={submitAction}
          disabled={submitting || !actionType}
        >
          {submitting
            ? <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Saving…</>
            : <><i className="bi bi-journal-plus me-1"></i>Log Action</>
          }
        </button>
      </div>

      <div className="border-top pt-3 d-flex flex-column gap-2">
        <button
          className="btn btn-outline-warning btn-sm"
          onClick={advanceStage}
          disabled={submitting || !canAdvance}
          title={canAdvance ? 'Move dispute to the next stage' : 'No further stage to advance to'}
        >
          <i className="bi bi-arrow-right-circle me-1"></i>Advance Stage
        </button>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={closeDispute}
          disabled={submitting}
        >
          <i className="bi bi-x-octagon me-1"></i>Close Dispute
        </button>
      </div>
    </div>
  );
}

export default DisputeActionPanel;
