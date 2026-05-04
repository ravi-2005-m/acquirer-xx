import { useNavigate } from 'react-router-dom';
import PayoutStatusBadge from './PayoutStatusBadge';
import { formatCurrency, maskPAN } from '../../utils/formatters';

function SettlementTable({ settlements, loading, onRetry }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
      </div>
    );
  }

  if (!settlements || settlements.length === 0) {
    return <p className="text-muted small px-3 py-3 mb-0">No individual settlements in this batch.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover mb-0">
        <thead className="table-light">
          <tr>
            <th>Settlement ID</th>
            <th>Txn Ref</th>
            <th>Card</th>
            <th className="text-end">Gross</th>
            <th className="text-end">MDR</th>
            <th className="text-end">Net</th>
            <th>Payout</th>
            <th style={{ width: '60px' }}></th>
          </tr>
        </thead>
        <tbody>
          {settlements.map(s => (
            <tr key={s.settlementId ?? s.id}>
              <td className="small font-monospace text-muted">{s.settlementId || s.id}</td>
              <td className="small">
                {s.transactionId || s.txnId ? (
                  <button
                    className="btn btn-link btn-sm p-0 font-monospace"
                    onClick={e => { e.stopPropagation(); navigate(`/transactions/${s.transactionId || s.txnId}`); }}
                  >
                    {s.txnRef || s.txnId || s.transactionId}
                  </button>
                ) : '—'}
              </td>
              <td className="small font-monospace">{s.cardNumber ? maskPAN(s.cardNumber) : (s.maskedPan || '—')}</td>
              <td className="text-end small">{formatCurrency(s.grossAmount)}</td>
              <td className="text-end small text-muted">{formatCurrency(s.mdr ?? s.mdrAmount)}</td>
              <td className="text-end small fw-semibold">{formatCurrency(s.netAmount)}</td>
              <td><PayoutStatusBadge status={s.payoutStatus} /></td>
              <td>
                {s.payoutStatus === 'FAILED' && onRetry && (
                  <button
                    className="btn btn-sm btn-outline-warning py-0 px-2"
                    onClick={e => { e.stopPropagation(); onRetry(s.settlementId ?? s.id); }}
                  >
                    Retry
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SettlementTable;
