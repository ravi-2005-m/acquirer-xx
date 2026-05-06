import { useNavigate } from 'react-router-dom';
import StatusBadge from '../StatusBadge';
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
            <th>Case ID</th>
            <th>Merchant</th>
            <th>Txn ID</th>
            <th>Reason Code</th>
            <th>Stage</th>
            <th className="text-end">Amount</th>
            <th>Status</th>
            <th>Deadline</th>
            <th>Opened</th>
          </tr>
        </thead>
        <tbody>
          {disputes.map(d => (
            <tr
              key={d.caseId}
              onClick={() => navigate(`/disputes/${d.caseId}`)}
              style={{ cursor: 'pointer' }}
            >
              <td className="small font-monospace text-muted">{d.caseId}</td>
              <td className="small">{d.merchantName || '—'}</td>
              <td className="small font-monospace">{d.txnId ?? '—'}</td>
              <td className="small font-monospace">{d.reasonCode || '—'}</td>
              <td>
                <span className="badge bg-light text-dark border small">{d.stage}</span>
              </td>
              <td className="text-end small fw-semibold">{formatCurrency(d.txnAmount)}</td>
              <td><StatusBadge status={d.status} /></td>
              <td className="small">{d.deadline ? formatDate(d.deadline) : '—'}</td>
              <td className="small text-muted">{formatDate(d.openedDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DisputeTable;
