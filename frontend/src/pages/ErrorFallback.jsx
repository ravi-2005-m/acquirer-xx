import { useState } from 'react';

export default function ErrorFallback({ error, errorInfo, onReset }) {
  const [showDetails, setShowDetails] = useState(false);
  const isDev = import.meta.env.DEV;

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-sm" style={{ maxWidth: 560, width: '100%' }}>
        <div className="card-body text-center p-5">
          <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '3rem' }}></i>
          <h4 className="mt-3 mb-2">Something went wrong</h4>
          <p className="text-muted mb-4">
            We hit an unexpected error. It has been logged. You can try resetting
            the page or return to the dashboard.
          </p>

          <div className="d-flex gap-2 justify-content-center mb-3">
            <button type="button" className="btn btn-primary" onClick={onReset}>
              <i className="bi bi-arrow-clockwise me-2"></i>Try again
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => { window.location.href = '/dashboard'; }}
            >
              <i className="bi bi-house me-2"></i>Go to Dashboard
            </button>
          </div>

          {isDev && error && (
            <div className="text-start mt-4">
              <button
                type="button"
                className="btn btn-link btn-sm p-0 small"
                onClick={() => setShowDetails(v => !v)}
              >
                {showDetails ? 'Hide' : 'Show'} technical details
              </button>
              {showDetails && (
                <pre
                  className="bg-light border rounded p-3 mt-2 text-danger small text-start"
                  style={{ maxHeight: 240, overflow: 'auto', fontSize: 12 }}
                >
                  <strong>{error.toString()}</strong>
                  {errorInfo?.componentStack && (
                    <>
                      {'\n\nComponent stack:'}
                      {errorInfo.componentStack}
                    </>
                  )}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
