import { useState, useEffect } from 'react';
import { reconApi } from '../../api/reconApi';

const OPTIONS = [
  {
    status:    'RESOLVED',
    label:     'Mark Resolved',
    desc:      'Item is reconciled — any required follow-up has been completed.',
    variant:   'success',
    minNotes:  15,
  },
  {
    status:    'WRITTEN_OFF',
    label:     'Write Off',
    desc:      'Discrepancy cannot be reconciled and is being absorbed.',
    variant:   'warning',
    minNotes:  30,
  },
];

function ResolveExceptionModal({ show, exception, onClose, onResolved }) {
  const [chosen, setChosen]       = useState(null);
  const [notes, setNotes]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (show) { setChosen(null); setNotes(''); setError(null); }
  }, [show]);

  if (!show || !exception) return null;

  const config   = OPTIONS.find(o => o.status === chosen) ?? null;
  const charsLeft = config ? Math.max(0, config.minNotes - notes.trim().length) : 0;

  const handleConfirm = async () => {
    if (charsLeft > 0) { setError(`Notes must be at least ${config.minNotes} characters`); return; }
    setSubmitting(true);
    setError(null);
    try {
      await reconApi.resolveException(exception.exceptionId, {
        status: config.status,
        notes:  notes.trim(),
      });
      onResolved?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to resolve exception');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-check-circle me-2"></i>
                {chosen ? config.label : 'Resolve Exception'}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={submitting}></button>
            </div>

            <div className="modal-body">
              {/* Exception summary card */}
              <div className="card bg-light mb-3">
                <div className="card-body py-2">
                  <div className="row g-2 small">
                    <div className="col-6">
                      <div className="text-muted">Exception ID</div>
                      <div className="font-monospace">#{exception.exceptionId}</div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted">Reference</div>
                      <div className="font-monospace">{exception.referenceId || '—'}</div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted">Category</div>
                      <div>{exception.category || '—'}</div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted">Current Status</div>
                      <div>{exception.status}</div>
                    </div>
                  </div>
                  {exception.notes && (
                    <div className="mt-2 small">
                      <div className="text-muted">Notes</div>
                      <div>{exception.notes}</div>
                    </div>
                  )}
                </div>
              </div>

              {!chosen ? (
                <>
                  <p className="small text-muted mb-2">Choose how to resolve this exception:</p>
                  <div className="d-grid gap-2">
                    {OPTIONS.map(opt => (
                      <button
                        key={opt.status}
                        className={`btn btn-outline-${opt.variant} text-start`}
                        onClick={() => setChosen(opt.status)}
                      >
                        <div className="fw-semibold">{opt.label}</div>
                        <small className="text-muted">{opt.desc}</small>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {error && (
                    <div className="alert alert-danger small">
                      <i className="bi bi-exclamation-triangle me-1"></i>{error}
                    </div>
                  )}
                  <p className="small text-muted mb-2">{config.desc}</p>
                  <label className="form-label small">Notes <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Detailed reasoning..."
                    disabled={submitting}
                    autoFocus
                  />
                  <div className="d-flex justify-content-between mt-1">
                    <small className={charsLeft > 0 ? 'text-danger' : 'text-success'}>
                      {charsLeft > 0 ? `${charsLeft} more characters needed` : '✓ Minimum met'}
                    </small>
                    <small className="text-muted">{notes.length} chars</small>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              {!chosen ? (
                <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
              ) : (
                <>
                  <button className="btn btn-link text-muted text-decoration-none" onClick={() => setChosen(null)} disabled={submitting}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                  </button>
                  <button
                    className={`btn btn-${config.variant}`}
                    onClick={handleConfirm}
                    disabled={submitting || charsLeft > 0}
                  >
                    {submitting
                      ? <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Submitting...</>
                      : <><i className="bi bi-check-circle me-1"></i>Confirm {config.label}</>
                    }
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResolveExceptionModal;
