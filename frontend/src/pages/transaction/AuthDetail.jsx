import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { transactionApi } from '../../api/transactionApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import StatusBadge from '../../components/StatusBadge';
import TxnTypeBadge from '../../components/TxnTypeBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDateTime, formatCurrency, maskPAN } from '../../utils/formatters';

function AuthDetail() {
  const { id } = useParams();

  const [auth, setAuth]   = useState(null);
  const [txn, setTxn]     = useState(undefined); // undefined = not yet fetched, null = confirmed no txn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showRefund, setShowRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState(null);

  const [showVoid, setShowVoid] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const [voidError, setVoidError] = useState(null);

  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState(null);
  const [convertSuccess, setConvertSuccess] = useState(null);

  const fetchAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionApi.getAuthById(id);
      const authData = response.data?.data ?? response.data ?? null;
      setAuth(authData);
      // Fetch associated txn silently — 404 means not yet converted
      try {
        const txnRes = await transactionApi.getTxnByAuthId(id);
        setTxn(txnRes.data?.data ?? txnRes.data ?? null);
      } catch {
        setTxn(null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAuth(); }, [fetchAuth]);

  const handleRefund = async () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) return;
    setRefunding(true);
    setRefundError(null);
    try {
      await transactionApi.refund(
        {
          originalAuthId: auth.authId,
          terminalId: auth.terminalId,
          amount: parseFloat(refundAmount),
          currency: auth.currency,
        },
        `refund-${auth.authId}-${Date.now()}`
      );
      setShowRefund(false);
      setRefundAmount('');
      fetchAuth();
    } catch (err) {
      setRefundError(err);
    } finally {
      setRefunding(false);
    }
  };

  const handleVoid = async () => {
    setVoiding(true);
    setVoidError(null);
    try {
      await transactionApi.voidAuth(
        { originalAuthId: auth.authId, terminalId: auth.terminalId },
        `void-${auth.authId}-${Date.now()}`
      );
      setShowVoid(false);
      fetchAuth();
    } catch (err) {
      setVoidError(err);
    } finally {
      setVoiding(false);
    }
  };

  const handleConvert = async () => {
    setConverting(true);
    setConvertError(null);
    setConvertSuccess(null);
    try {
      const response = await transactionApi.createTxnFromAuth(
        auth.authId,
        `convert-${auth.authId}-${Date.now()}`
      );
      const newTxn = response.data?.data ?? null;
      setConvertSuccess(newTxn?.txnId ?? true);
      setTxn(newTxn);
      fetchAuth();
    } catch (err) {
      setConvertError(err);
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return <div className="container-fluid p-4"><LoadingSpinner text="Loading transaction..." /></div>;
  }

  if (error || !auth) {
    return (
      <div className="container-fluid p-4">
        <ErrorAlert error={error || 'Transaction not found'} title="Failed to load transaction" onRetry={fetchAuth} />
        <Link to="/transactions" className="btn btn-outline-secondary mt-2">
          <i className="bi bi-arrow-left me-1"></i>Back to list
        </Link>
      </div>
    );
  }

  const txnFetched = txn !== undefined;
  const hasTxn     = txn !== null && txn !== undefined;
  const canConvert = auth.status === 'APPROVED' && auth.txnType === 'SALE' && txnFetched && !hasTxn;
  const canRefund  = auth.status === 'APPROVED' && hasTxn && txn?.settled === true;
  const canVoid    = auth.status === 'APPROVED' && auth.txnType === 'SALE' && txnFetched && (!hasTxn || txn?.settled === false);

  // Build lifecycle events from available fields
  const lifecycleEvents = [
    auth.txnTime      && { label: 'Authorization Received', time: auth.txnTime,      color: 'primary' },
    auth.status === 'APPROVED'  && { label: 'Approved',          time: auth.txnTime,      color: 'success' },
    auth.status === 'DECLINED'  && { label: 'Declined',          time: auth.txnTime,      color: 'danger' },
    auth.status === 'REVERSED'  && { label: 'Reversed / Voided', time: auth.updatedAt ?? auth.txnTime, color: 'secondary' },
    convertSuccess && typeof convertSuccess === 'number' && {
      label: 'Converted to Settled Txn', time: new Date().toISOString(), color: 'info',
    },
  ].filter(Boolean);

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex align-items-start mb-3">
        <Link to="/transactions" className="btn btn-link text-muted text-decoration-none p-0 me-2 mt-1" title="Back to list">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div className="flex-grow-1">
          <h3 className="mb-1">
            <i className="bi bi-receipt me-2"></i>Auth #{auth.authId}
          </h3>
          <div className="d-flex flex-wrap align-items-center gap-2 text-muted small">
            <TxnTypeBadge type={auth.txnType} size="sm" />
            <span>·</span>
            <span>{formatDateTime(auth.txnTime)}</span>
            {auth.originalAuthId && (
              <>
                <span>·</span>
                <span>Original: <Link to={`/transactions/${auth.originalAuthId}`}>#{auth.originalAuthId}</Link></span>
              </>
            )}
          </div>
        </div>
        <StatusBadge status={auth.status} />
      </div>

      {convertSuccess && (
        <div className="alert alert-success alert-dismissible mb-3">
          <i className="bi bi-check-circle me-2"></i>
          Settled transaction created{typeof convertSuccess === 'number' ? ` (Txn ID: ${convertSuccess})` : ''}.{' '}
          {typeof convertSuccess === 'number' && (
            <Link to={`/transactions/settled/${convertSuccess}`}>View</Link>
          )}
          <button type="button" className="btn-close" onClick={() => setConvertSuccess(null)}></button>
        </div>
      )}

      <div className="row g-3">
        {/* Transaction Details */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title text-muted text-uppercase small fw-semibold mb-3">Transaction</h6>
              <table className="table table-sm mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted">Type</td>
                    <td><TxnTypeBadge type={auth.txnType} size="sm" /></td>
                  </tr>
                  <tr>
                    <td className="text-muted">Amount</td>
                    <td className="fw-semibold">{formatCurrency(auth.amount, auth.currency)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Currency</td>
                    <td>{auth.currency || '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Auth Code</td>
                    <td><code>{auth.authCode || '—'}</code></td>
                  </tr>
                  <tr>
                    <td className="text-muted">Response Code</td>
                    <td>
                      <code>{auth.responseCode || '—'}</code>
                      {auth.responseCode === '00' && <span className="text-success small ms-2">(OK)</span>}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Network</td>
                    <td><span className="badge bg-light text-dark border small">{auth.network || '—'}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Card & Counterparties */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title text-muted text-uppercase small fw-semibold mb-3">Card & Counterparties</h6>
              <table className="table table-sm mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted">PAN</td>
                    <td><code className="small">{auth.panMasked ? maskPAN(auth.panMasked.replace(/\D/g,'')) : '—'}</code></td>
                  </tr>
                  <tr>
                    <td className="text-muted">Risk Score</td>
                    <td>{auth.riskScore != null ? auth.riskScore : '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Risk Reason</td>
                    <td className="small">{auth.riskReason || '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Terminal</td>
                    <td>
                      {auth.tid ? (
                        <Link to={`/terminals/${auth.terminalId}`}><code>{auth.tid}</code></Link>
                      ) : auth.terminalId ? (
                        <Link to={`/terminals/${auth.terminalId}`}>ID: {auth.terminalId}</Link>
                      ) : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Merchant</td>
                    <td>
                      {auth.merchantId ? (
                        <Link to={`/merchants/${auth.merchantId}`}>
                          {auth.merchantName || `Merchant #${auth.merchantId}`}
                        </Link>
                      ) : '—'}
                    </td>
                  </tr>
                  {auth.originalAuthId && (
                    <tr>
                      <td className="text-muted">Original Auth</td>
                      <td><Link to={`/transactions/${auth.originalAuthId}`}>#{auth.originalAuthId}</Link></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title text-muted text-uppercase small fw-semibold mb-3">Actions</h6>

              {!canRefund && !canVoid && !canConvert && (
                <p className="text-muted small mb-0">No actions available for this status.</p>
              )}

              <div className="d-flex flex-column gap-2">
                {canConvert && (
                  <button onClick={handleConvert} className="btn btn-primary btn-sm" disabled={converting}>
                    {converting ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Converting...</>
                    ) : (
                      <><i className="bi bi-cash-coin me-1"></i>Convert to Settled Txn</>
                    )}
                  </button>
                )}
                {canRefund && (
                  <button onClick={() => { setRefundAmount(String(auth.amount)); setShowRefund(true); }} className="btn btn-outline-info btn-sm">
                    <i className="bi bi-arrow-counterclockwise me-1"></i>Refund
                  </button>
                )}
                {canVoid && (
                  <button onClick={() => setShowVoid(true)} className="btn btn-outline-danger btn-sm">
                    <i className="bi bi-slash-circle me-1"></i>Void
                  </button>
                )}
              </div>

              {convertError && <div className="mt-2"><ErrorAlert error={convertError} title="Conversion failed" /></div>}
              {refundError  && <div className="mt-2"><ErrorAlert error={refundError} title="Refund failed" /></div>}
              {voidError    && <div className="mt-2"><ErrorAlert error={voidError} title="Void failed" /></div>}
            </div>
          </div>
        </div>

        {/* Lifecycle Timeline */}
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title text-muted text-uppercase small fw-semibold mb-3">
                <i className="bi bi-clock-history me-2"></i>Lifecycle
              </h6>
              {lifecycleEvents.length === 0 ? (
                <p className="text-muted small mb-0">No lifecycle events recorded.</p>
              ) : (
                <div className="d-flex flex-wrap gap-4">
                  {lifecycleEvents.map((ev, i) => (
                    <div key={i} className="d-flex align-items-start gap-2">
                      <div
                        className={`bg-${ev.color} rounded-circle mt-1 flex-shrink-0`}
                        style={{ width: 10, height: 10, boxShadow: '0 0 0 3px rgba(0,0,0,0.07)' }}
                      />
                      <div>
                        <div className="small fw-medium">{ev.label}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDateTime(ev.time)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Refund modal */}
      {showRefund && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-arrow-counterclockwise text-info me-2"></i>Process Refund
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowRefund(false)} disabled={refunding}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  Refund part or all of Auth #{auth.authId}. Original: {formatCurrency(auth.amount, auth.currency)}.
                </p>
                <label className="form-label">Refund Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                  step="0.01" min="0.01" max={auth.amount}
                  disabled={refunding}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShowRefund(false)} disabled={refunding}>Cancel</button>
                <button className="btn btn-info" onClick={handleRefund} disabled={refunding || !refundAmount}>
                  {refunding ? 'Processing...' : 'Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={showVoid}
        onClose={() => setShowVoid(false)}
        onConfirm={handleVoid}
        title="Void Transaction"
        message={
          <div>
            <p>Void Auth #{auth.authId} for <strong>{formatCurrency(auth.amount, auth.currency)}</strong>?</p>
            <p className="text-muted small mb-0">Voids cannot be undone.</p>
          </div>
        }
        confirmLabel="Void Transaction"
        loading={voiding}
      />
    </div>
  );
}

export default AuthDetail;
