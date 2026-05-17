import RiskResultBadge from './RiskResultBadge';
import RiskBadge from '../RiskBadge';
import { formatDateTime, formatCurrency, maskPan } from '../../utils/formatters';

function scoreToLevel(score) {
  if (score == null) return null;
  if (score >= 80) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
}

function EventTable({ events, loading }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <div className="text-muted small mt-2">Loading events...</div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-shield-check fs-2 d-block mb-2 opacity-25"></i>
        No risk events found.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Event ID</th>
            <th>Txn ID</th>
            <th>PAN</th>
            <th>Amount</th>
            <th>Result</th>
            <th>Risk Level</th>
            <th>Score</th>
            <th>Rule Triggered</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {events.map(e => (
            <tr key={e.riskEventId}>
              <td className="small font-monospace text-muted">#{e.riskEventId}</td>
              <td className="small font-monospace">{e.txnId ?? '—'}</td>
              <td className="small font-monospace">{maskPan(e.pan) || '—'}</td>
              <td className="small font-monospace">
                {e.txnAmount != null ? formatCurrency(e.txnAmount) : '—'}
              </td>
              <td><RiskResultBadge result={e.result} /></td>
              <td><RiskBadge level={scoreToLevel(e.score)} /></td>
              <td className="small text-center">
                {e.score != null ? (
                  <span className={`fw-semibold ${
                    e.score >= 80 ? 'text-danger' :
                    e.score >= 50 ? 'text-warning' : 'text-success'
                  }`}>{e.score}</span>
                ) : '—'}
              </td>
              <td className="small text-muted" style={{ maxWidth: '200px' }}>
                {e.ruleName
                  ? <div className="text-truncate" title={e.ruleName}>{e.ruleName}</div>
                  : '—'
                }
              </td>
              <td className="small text-muted text-nowrap">{formatDateTime(e.eventDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EventTable;
