import { useNavigate } from 'react-router-dom';
import StatusBadge from '../StatusBadge';
import ReasonBadge from './ReasonBadge';
import DeadlineCountdown from '../common/DeadlineCountdown';
import { formatCurrency, formatDate } from '../../utils/formatters';

function DisputeTable({ disputes, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <div className="text-muted small mt-2">Loading disputes...</div>
      </div>
    );
  }

  if (!disputes || disputes.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-chat-left-dots fs-2 d-block mb-2 opacity-25"></i>
        No disputes found.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Dispute ID</th>
            <th>Merchant</th>
            <th>Txn Ref</th>
            <th>Reason</th>
            <th className="text-end">Amount</th>
            <th>Network</th>
            <th>Status</th>
            <th>Deadline</th>
            <th>Raised</th>
          </tr>
        </thead>
        <tbody>
          {disputes.map(d => (
            <tr
              key={d.disputeId ?? d.id}
              onClick={() => navigate(`/disputes/${d.disputeId ?? d.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <td className="small font-monospace text-muted">{d.disputeId ?? d.id}</td>
              <td className="small">{d.merchantName || d.merchantBusinessName || `#${d.merchantId}`}</td>
              <td className="small font-monospace">{d.txnRef || d.transactionRef || '—'}</td>
              <td><ReasonBadge reason={d.reason} /></td>
              <td className="text-end small fw-semibold">{formatCurrency(d.disputeAmount ?? d.amount)}</td>
              <td>
                {d.network && (
                  <span className="badge bg-light text-dark border small">{d.network}</span>
                )}
              </td>
              <td><StatusBadge status={d.status} /></td>
              <td>
                <DeadlineCountdown deadline={d.responseDeadline ?? d.deadline} />
              </td>
              <td className="small text-muted">{formatDate(d.raisedAt ?? d.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DisputeTable;
