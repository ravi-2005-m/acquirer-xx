import { useState } from 'react';
import { toast } from '../../utils/toast';

function BadRender({ shouldCrash }) {
  if (shouldCrash) throw new Error('Deliberate render-time crash for ErrorBoundary test');
  return null;
}

export default function CrashTest() {
  if (import.meta.env.PROD) {
    return <div className="container py-4 text-muted">Not available in production.</div>;
  }

  const [crash, setCrash] = useState(false);

  const testToasts = () => {
    toast.success('Success toast example');
    setTimeout(() => toast.error('Error toast example'), 500);
    setTimeout(() => toast.info('Info toast example'), 1000);
    setTimeout(() => toast.warning('Warning toast example'), 1500);
  };

  const testLoading = async () => {
    const id = toast.loading('Loading toast — simulating a long operation…');
    await new Promise(r => setTimeout(r, 2000));
    toast.update(id, 'success', 'Operation completed successfully');
  };

  return (
    <div className="container-fluid p-4">
      <h3 className="mb-4"><i className="bi bi-bug me-2 text-danger"></i>Crash Test (dev only)</h3>

      <div className="row g-3">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-white fw-semibold small">Toast System</div>
            <div className="card-body d-flex gap-2 flex-wrap">
              <button className="btn btn-success btn-sm" onClick={() => toast.success('Success!')}>
                Success toast
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => toast.error('Something failed')}>
                Error toast
              </button>
              <button className="btn btn-info btn-sm text-white" onClick={() => toast.info('FYI…')}>
                Info toast
              </button>
              <button className="btn btn-warning btn-sm" onClick={() => toast.warning('Heads up!')}>
                Warning toast
              </button>
              <button className="btn btn-secondary btn-sm" onClick={testToasts}>
                All 4 in sequence
              </button>
              <button className="btn btn-primary btn-sm" onClick={testLoading}>
                Loading → success
              </button>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-danger">
            <div className="card-header bg-white fw-semibold small text-danger">Error Boundary</div>
            <div className="card-body">
              <p className="text-muted small mb-3">
                The button below sets state that causes a child to throw during render.
                The <code>ErrorBoundary</code> should catch it and show the fallback page.
              </p>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setCrash(true)}
              >
                Trigger render-time crash
              </button>
              <BadRender shouldCrash={crash} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
