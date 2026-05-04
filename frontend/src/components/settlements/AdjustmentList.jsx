import StatusBadge from '../StatusBadge';
import { formatINR, formatDateTime } from '../../utils/formatters';

function AdjustmentList({ adjustments, loading }) {
  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
      </div>
    );
  }

  if (!adjustments || adjustments.length === 0) {
    return <p className="text-muted small mb-0">No adjustments.</p>;
  }

  return (
    <ul className="list-group list-group-flush">
      {adjustments.map(a => (
        <li key={a.adjustmentId ?? a.id} className="list-group-item px-0 py-2">
          <div className="d-flex justify-content-between gap-2 align-items-start">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <span className="badge bg-secondary small">{a.type}</span>
                <StatusBadge status={a.status} />
                <span className={`fw-semibold small ${(a.amount ?? 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                  {(a.amount ?? 0) >= 0 ? '+' : ''}{formatINR(a.amount)}
                </span>
                {a.txnId && (
                  <span className="text-muted small">on Txn #{a.txnId}</span>
                )}
              </div>
              <div className="small mb-1">{a.reason}</div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                Adj #{a.adjustmentId ?? a.id}
                {a.postedDate && ` · posted ${formatDateTime(a.postedDate)}`}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default AdjustmentList;
