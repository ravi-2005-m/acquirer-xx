import RiskResultBadge from './RiskResultBadge';
import RiskBadge from '../RiskBadge';
import { formatDateTime, formatCurrency, maskPan } from '../../utils/formatters';

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
            <th>PAN</th>
            <th>Merchant</th>
            <th>Amount</th>
            <th>Txn Type</th>
            <th>Decision</th>
            <th>Risk Level</th>
            <th>Score</th>
            <th>Rules Triggered</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {events.map(e => (
            <tr key={e.eventId ?? e.id}>
              <td className="small font-monospace text-muted">#{e.eventId ?? e.id}</td>
              <td className="small font-monospace">{maskPan(e.pan) || '—'}</td>
              <td className="small">{e.merchantId || '—'}</td>
              <td className="small font-monospace">
                {e.amount != null ? formatCurrency(e.amount, e.currency) : '—'}
              </td>
              <td className="small">{e.txnType || '—'}</td>
              <td><RiskResultBadge result={e.decision ?? e.result} /></td>
              <td><RiskBadge level={e.riskLevel} /></td>
              <td className="small text-center">
                {e.riskScore != null ? (
                  <span className={`fw-semibold ${
                    e.riskScore >= 80 ? 'text-danger' :
                    e.riskScore >= 50 ? 'text-warning' : 'text-success'
                  }`}>{e.riskScore}</span>
                ) : '—'}
              </td>
              <td className="small text-muted" style={{ maxWidth: '200px' }}>
                {e.triggeredRules?.length
                  ? <div className="text-truncate" title={e.triggeredRules.join(', ')}>{e.triggeredRules.join(', ')}</div>
                  : '—'
                }
              </td>
              <td className="small text-muted text-nowrap">{formatDateTime(e.createdAt ?? e.eventTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EventTable;
