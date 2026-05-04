import StatusBadge from '../StatusBadge';
import { formatDateTime } from '../../utils/formatters';

function ReconExceptionTable({ exceptions, loading, canResolve, onResolve }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <div className="text-muted small mt-2">Loading exceptions...</div>
      </div>
    );
  }

  if (!exceptions || exceptions.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-check-circle fs-2 d-block mb-2 opacity-25"></i>
        No exceptions found.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Exception ID</th>
            <th>Reference</th>
            <th>Category</th>
            <th>Status</th>
            <th>Created</th>
            <th>Notes</th>
            {canResolve && <th style={{ width: '80px' }}></th>}
          </tr>
        </thead>
        <tbody>
          {exceptions.map(e => (
            <tr key={e.exceptionId}>
              <td className="small font-monospace text-muted">#{e.exceptionId}</td>
              <td className="small font-monospace">{e.referenceId || '—'}</td>
              <td className="small">{e.category || '—'}</td>
              <td><StatusBadge status={e.status} /></td>
              <td className="small text-muted">{formatDateTime(e.createdAt)}</td>
              <td className="small text-muted" style={{ maxWidth: '280px' }}>
                <div className="text-truncate" title={e.notes}>{e.notes || '—'}</div>
              </td>
              {canResolve && (
                <td>
                  {e.status === 'OPEN' && (
                    <button
                      className="btn btn-sm btn-outline-primary py-0 px-2"
                      onClick={() => onResolve(e)}
                    >
                      Resolve
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReconExceptionTable;
