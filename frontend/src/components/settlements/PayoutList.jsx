import { useState } from 'react';
import { settlementApi } from '../../api/settlementApi';
import PayoutStatusBadge from './PayoutStatusBadge';
import { formatINR, formatDateTime } from '../../utils/formatters';

function PayoutList({ payouts, canManage, onChanged }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError]   = useState(null);

  const retry = async (payoutId, useAsync = false) => {
    setBusyId(payoutId);
    setError(null);
    try {
      const fn = useAsync ? settlementApi.triggerAsyncPayout : settlementApi.triggerSyncPayout;
      await fn(payoutId);
      onChanged?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Retry failed — please try again');
    } finally {
      setBusyId(null);
    }
  };

  if (!payouts || payouts.length === 0) {
    return <p className="text-muted small px-3 py-3 mb-0">No payouts for this batch yet.</p>;
  }

  return (
    <>
      {error && (
        <div className="alert alert-danger alert-dismissible small m-3">
          <i className="bi bi-exclamation-triangle me-1"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Payout ID</th>
              <th>Bank Account</th>
              <th className="text-end">Amount</th>
              <th>Status</th>
              <th>Payout Date</th>
              {canManage && <th style={{ width: '130px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.payoutId}>
                <td className="small font-monospace text-muted">#{p.payoutId}</td>
                <td className="small font-monospace">{p.bankAccountRef || '—'}</td>
                <td className="text-end fw-semibold">{formatINR(p.amount)}</td>
                <td><PayoutStatusBadge status={p.status} /></td>
                <td className="small text-muted">{p.payoutDate ? formatDateTime(p.payoutDate) : '—'}</td>
                {canManage && (
                  <td>
                    {p.status === 'FAILED' && (
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-warning py-0"
                          onClick={() => retry(p.payoutId, false)}
                          disabled={busyId === p.payoutId}
                          title="Sync retry — waits for result"
                        >
                          {busyId === p.payoutId ? '...' : 'Retry'}
                        </button>
                        <button
                          className="btn btn-outline-secondary py-0"
                          onClick={() => retry(p.payoutId, true)}
                          disabled={busyId === p.payoutId}
                          title="Async retry — returns immediately"
                        >
                          Async
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default PayoutList;
