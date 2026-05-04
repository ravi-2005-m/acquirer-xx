import { formatDateTime, maskPan } from '../../utils/formatters';

function BlacklistTable({ entries, loading, canManage, onRemove }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <div className="text-muted small mt-2">Loading blacklist...</div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-shield-check fs-2 d-block mb-2 opacity-25"></i>
        No blacklist entries.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Entry ID</th>
            <th>Type</th>
            <th>Value</th>
            <th>Reason</th>
            <th>Added By</th>
            <th>Added At</th>
            {canManage && <th style={{ width: '80px' }}></th>}
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.blacklistId ?? e.id}>
              <td className="small font-monospace text-muted">#{e.blacklistId ?? e.id}</td>
              <td>
                <span className="badge bg-dark small">{e.entryType || e.type || '—'}</span>
              </td>
              <td className="small font-monospace">
                {e.entryType === 'PAN' || e.type === 'PAN'
                  ? maskPan(e.value)
                  : (e.value || '—')
                }
              </td>
              <td className="small text-muted" style={{ maxWidth: '260px' }}>
                <div className="text-truncate" title={e.reason}>{e.reason || '—'}</div>
              </td>
              <td className="small">{e.addedBy || '—'}</td>
              <td className="small text-muted text-nowrap">{formatDateTime(e.createdAt ?? e.addedAt)}</td>
              {canManage && (
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger py-0 px-2"
                    onClick={() => onRemove(e)}
                  >
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BlacklistTable;
