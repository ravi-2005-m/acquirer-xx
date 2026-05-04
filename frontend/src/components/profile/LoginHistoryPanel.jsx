import { formatDateTime } from '../../utils/formatters';

function LoginHistoryPanel({ history, loading }) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-body py-5 text-center">
          <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
          <div className="text-muted small mt-2">Loading login history...</div>
        </div>
      </div>
    );
  }

  const entries = history?.content ?? (Array.isArray(history) ? history : []);

  if (entries.length === 0) {
    return (
      <div className="card">
        <div className="card-body py-5 text-center text-muted">
          <i className="bi bi-clock-history fs-2 d-block mb-2 opacity-25"></i>
          No login history available.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Date &amp; Time</th>
                <th>IP Address</th>
                <th>Device / Agent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, idx) => (
                <tr key={e.id ?? idx}>
                  <td className="small text-nowrap">{formatDateTime(e.loginAt ?? e.createdAt)}</td>
                  <td className="small font-monospace">{e.ipAddress || '—'}</td>
                  <td className="small text-muted" style={{ maxWidth: '260px' }}>
                    <div className="text-truncate" title={e.userAgent}>{e.userAgent || '—'}</div>
                  </td>
                  <td>
                    <span className={`badge ${e.success === false ? 'bg-danger' : 'bg-success'}`}>
                      {e.success === false ? 'Failed' : 'Success'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LoginHistoryPanel;
