import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { transactionApi } from '../../api/transactionApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

function SettledDetail() {
  const { id } = useParams();

  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTxn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionApi.getTxnById(id);
      setTxn(response.data?.data ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTxn();
  }, [fetchTxn]);

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <LoadingSpinner text="Loading settled transaction..." />
      </div>
    );
  }

  if (error || !txn) {
    return (
      <div className="container-fluid p-4">
        <ErrorAlert error={error || 'Transaction not found'} title="Failed to load transaction" onRetry={fetchTxn} />
        <Link to="/transactions/settled" className="btn btn-outline-secondary mt-2">
          <i className="bi bi-arrow-left me-1"></i>Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex align-items-start mb-3">
        <Link
          to="/transactions/settled"
          className="btn btn-link text-muted text-decoration-none p-0 me-2 mt-1"
          title="Back to list"
        >
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div className="flex-grow-1">
          <h3 className="mb-1">
            <i className="bi bi-cash-coin me-2"></i>
            Txn #{txn.txnId}
          </h3>
          <div className="d-flex flex-wrap align-items-center gap-2 text-muted small">
            {txn.settled ? (
              <span className="badge bg-success small">
                <i className="bi bi-check-circle me-1"></i>Settled
              </span>
            ) : (
              <span className="badge bg-warning small">
                <i className="bi bi-clock me-1"></i>Unsettled
              </span>
            )}
            <span>·</span>
            <span>{formatDateTime(txn.txnDate)}</span>
            {txn.authId && (
              <>
                <span>·</span>
                <span>
                  Auth: <Link to={`/transactions/${txn.authId}`}>#{txn.authId}</Link>
                </span>
              </>
            )}
          </div>
        </div>
        <StatusBadge status={txn.status} />
      </div>

      <div className="row g-3">
        {/* Transaction Details */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title text-muted text-uppercase small fw-semibold mb-3">Transaction</h6>
              <table className="table table-sm mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted">Amount</td>
                    <td className="fw-semibold">{formatCurrency(txn.amount, txn.currency || 'INR')}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Currency</td>
                    <td>{txn.currency || '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Status</td>
                    <td><StatusBadge status={txn.status} size="sm" /></td>
                  </tr>
                  <tr>
                    <td className="text-muted">Settled</td>
                    <td>
                      {txn.settled ? (
                        <span className="badge bg-success small">Yes</span>
                      ) : (
                        <span className="badge bg-warning small">No</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Date</td>
                    <td className="small">{formatDateTime(txn.txnDate)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Auth Ref</td>
                    <td>
                      {txn.authId ? (
                        <Link to={`/transactions/${txn.authId}`}>Auth #{txn.authId}</Link>
                      ) : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Merchant</td>
                    <td>
                      {txn.merchantId ? (
                        <Link to={`/merchants/${txn.merchantId}`}>
                          {txn.merchantName || `Merchant #${txn.merchantId}`}
                        </Link>
                      ) : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Terminal</td>
                    <td>
                      {txn.tid ? (
                        <Link to={`/terminals/${txn.terminalId}`}><code>{txn.tid}</code></Link>
                      ) : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title text-muted text-uppercase small fw-semibold mb-3">Fee Breakdown</h6>
              <table className="table table-sm mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted">Scheme Fee</td>
                    <td className="text-end">{formatCurrency(txn.schemeFee, txn.currency || 'INR')}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Interchange Fee</td>
                    <td className="text-end">{formatCurrency(txn.interchangeFee, txn.currency || 'INR')}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Acquirer Markup</td>
                    <td className="text-end">{formatCurrency(txn.acquirerMarkup, txn.currency || 'INR')}</td>
                  </tr>
                  <tr className="table-light fw-semibold">
                    <td>Total Fee</td>
                    <td className="text-end">{formatCurrency(txn.totalFee, txn.currency || 'INR')}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Gross Amount</td>
                    <td className="text-end">{formatCurrency(txn.amount, txn.currency || 'INR')}</td>
                  </tr>
                  <tr className="table-success fw-semibold">
                    <td>Net to Merchant</td>
                    <td className="text-end">{formatCurrency(txn.netMerchantAmount, txn.currency || 'INR')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettledDetail;
