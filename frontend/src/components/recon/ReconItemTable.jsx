import { formatINR } from '../../utils/formatters';

const MATCH_BADGE = {
  MATCHED:    { bg: 'bg-success',              label: 'Matched' },
  MISMATCHED: { bg: 'bg-warning text-dark',    label: 'Mismatched' },
  UNMATCHED:  { bg: 'bg-danger',               label: 'Unmatched' },
};

function ReconItemTable({ items, loading, showFileColumn = false }) {
  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <p className="text-muted small px-3 py-3 mb-0">No items found.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Item ID</th>
            <th>Reference</th>
            <th className="text-end">Amount</th>
            <th>Match Status</th>
            {showFileColumn && <th>File</th>}
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const badge = MATCH_BADGE[item.matchStatus] ?? { bg: 'bg-secondary', label: item.matchStatus ?? '—' };
            return (
              <tr key={item.reconItemId}>
                <td className="small font-monospace text-muted">#{item.reconItemId}</td>
                <td className="small font-monospace">{item.reference}</td>
                <td className="text-end small fw-semibold">{formatINR(item.amount)}</td>
                <td><span className={`badge ${badge.bg}`}>{badge.label}</span></td>
                {showFileColumn && (
                  <td className="small font-monospace text-muted">#{item.reconFileId}</td>
                )}
                <td className="small text-muted">{item.notes || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ReconItemTable;
