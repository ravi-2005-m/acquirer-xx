import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { settlementApi } from '../../api/settlementApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import PayoutList from '../../components/settlements/PayoutList';
import { formatINR, formatDate, formatDateTime, formatNumber } from '../../utils/formatters';

function SettlementBatchPage() {
  const { id }       = useParams();
  const location     = useLocation();
  const { user }     = useAuth();
  const canManage    = user?.role === 'RECON' || user?.role === 'ADMIN';

  const [batch, setBatch]               = useState(location.state?.batch || null);
  const [payouts, setPayouts]           = useState([]);
  const [adjustments, setAdjustments]   = useState([]);
  const [loading, setLoading]           = useState(!location.state?.batch);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [error, setError]               = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError]   = useState(null);
  const [showPayoutConfirm, setShowPayoutConfirm] = useState(false);

  const fetchPayouts = useCallback(async () => {
    setPayoutsLoading(true);
    try {
      const res  = await settlementApi.getBatchPayouts(id);
      const data = res.data?.data ?? res.data ?? [];
      setPayouts(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      setPayouts([]);
    } finally {
      setPayoutsLoading(false);
    }
  }, [id]);

  const fetchAdjustments = useCallback(async () => {
    try {
      const res  = await settlementApi.getBatchAdjustments(id);
      const data = res.data?.data ?? res.data ?? [];
      setAdjustments(Array.isArray(data) ? data : []);
    } catch {
      setAdjustments([]);
    }
  }, [id]);

  const fetchBatch = useCallback(async () => {
    if (batch) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await settlementApi.getBatches({ size: 100 });
      const body = res.data?.data ?? res.data ?? {};
      const all  = body.content ?? [];
      const found = all.find(b => String(b.settleBatchId) === String(id));
      if (!found) throw new Error('not found');
      setBatch(found);
    } catch {
      setError('Settlement batch not found or service unavailable.');
    } finally {
      setLoading(false);
    }
  }, [id, batch]);

  useEffect(() => {
    fetchBatch();
    fetchPayouts();
    fetchAdjustments();
  }, [fetchBatch, fetchPayouts, fetchAdjustments]);

  const handleTriggerPayout = async () => {
    setActionLoading(true);
    setActionError(null);
    setShowPayoutConfirm(false);
    try {
      await settlementApi.triggerBatchPayout(id);
      fetchPayouts();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to trigger payout');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="container-fluid p-4"><LoadingSpinner text="Loading batch..." /></div>;
  }

  if (error || !batch) {
    return (
      <div className="container-fluid p-4">
        <ErrorAlert error={error || 'Batch not found'} title="Failed to load settlement batch" />
        <Link to="/settlement" className="btn btn-outline-secondary mt-2">
          <i className="bi bi-arrow-left me-1"></i>Back to Settlements
        </Link>
      </div>
    );
  }

  const canTriggerPayout = canManage && (batch.status === 'READY' || batch.status === 'FAILED');

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex align-items-start mb-3">
        <Link to="/settlement" className="btn btn-link text-muted text-decoration-none p-0 me-2 mt-1" title="Back">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div className="flex-grow-1">
          <h3 className="mb-1">
            <i className="bi bi-bank me-2"></i>
            Settlement Batch #{batch.settleBatchId}
          </h3>
          <div className="d-flex flex-wrap gap-2 align-items-center text-muted small">
            <span>Period: {formatDate(batch.periodStart)} → {formatDate(batch.periodEnd)}</span>
            {batch.merchantId && (
              <>
                <span>·</span>
                <Link to={`/settlement/merchant/${batch.merchantId}`} className="text-decoration-none small">
                  <i className="bi bi-people me-1"></i>
                  {batch.merchantName || `Merchant #${batch.merchantId}`}
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="d-flex gap-2 ms-3 align-items-center flex-wrap">
          <StatusBadge status={batch.status} />
          {canTriggerPayout && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => setShowPayoutConfirm(true)}
              disabled={actionLoading}
            >
              {actionLoading
                ? <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Triggering...</>
                : <><i className="bi bi-send me-1"></i>Trigger Payout</>
              }
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="alert alert-danger alert-dismissible small mb-3">
          <i className="bi bi-exclamation-triangle me-2"></i>{actionError}
          <button type="button" className="btn-close" onClick={() => setActionError(null)}></button>
        </div>
      )}

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <SimpleMetric label="Transactions" value={formatNumber(batch.txnCount)}   icon="bi-receipt" />
        </div>
        <div className="col-6 col-md-3">
          <SimpleMetric label="Gross Amount" value={formatINR(batch.grossAmount)}   icon="bi-arrow-down-circle" color="text-primary" />
        </div>
        <div className="col-6 col-md-3">
          <SimpleMetric label="Total Fees"   value={formatINR(batch.totalFees)}     icon="bi-dash-circle"       color="text-warning" />
        </div>
        <div className="col-6 col-md-3">
          <SimpleMetric label="Net Payout"   value={formatINR(batch.netAmount)}     icon="bi-arrow-up-circle"   color="text-success" />
        </div>
      </div>

      {/* Batch details + Fee breakdown */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title text-muted text-uppercase small fw-semibold mb-3">Batch Details</h6>
              <InfoRow label="Batch ID"  value={`#${batch.settleBatchId}`} mono />
              <InfoRow label="Status"    value={<StatusBadge status={batch.status} />} />
              <InfoRow label="Merchant"  value={batch.merchantName || `#${batch.merchantId}`} />
              <InfoRow label="Posted"    value={batch.postedDate ? formatDateTime(batch.postedDate) : '—'} />
              <InfoRow label="Period"    value={`${formatDate(batch.periodStart)} → ${formatDate(batch.periodEnd)}`} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title text-muted text-uppercase small fw-semibold mb-3">Fee Breakdown</h6>
              <InfoRow label="Gross Amount"     value={formatINR(batch.grossAmount)} />
              <InfoRow label="Scheme Fee"       value={<span className="text-danger">− {formatINR(batch.schemeFees)}</span>} />
              <InfoRow label="Interchange Fee"  value={<span className="text-danger">− {formatINR(batch.interchangeFees)}</span>} />
              <InfoRow label="Acquirer Markup"  value={<span className="text-danger">− {formatINR(batch.acquirerMarkups)}</span>} />
              {batch.adjustmentTotal != null && Number(batch.adjustmentTotal) !== 0 && (
                <InfoRow
                  label="Adjustments"
                  value={
                    <span className={Number(batch.adjustmentTotal) < 0 ? 'text-danger' : 'text-success'}>
                      {Number(batch.adjustmentTotal) < 0 ? '− ' : '+ '}
                      {formatINR(Math.abs(batch.adjustmentTotal))}
                    </span>
                  }
                />
              )}
              <div className="border-top mt-2 pt-2 d-flex justify-content-between fw-semibold small">
                <span>Net Payout</span>
                <span className="text-success">{formatINR(batch.netAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="card-title text-muted text-uppercase small fw-semibold mb-3">
                <i className="bi bi-sliders me-1"></i>Adjustments Applied
                {adjustments.length > 0 && (
                  <span className="badge bg-secondary ms-2">{adjustments.length}</span>
                )}
              </h6>
              {adjustments.length === 0 ? (
                <p className="text-muted small mb-0">No adjustments applied to this batch.</p>
              ) : (
                adjustments.map(adj => (
                  <div key={adj.adjustmentId} className="d-flex justify-content-between align-items-start small py-1 border-bottom">
                    <div>
                      <span className={`badge me-1 ${Number(adj.amount) < 0 ? 'bg-danger' : 'bg-success'}`}>
                        {adj.type?.replace('_', ' ')}
                      </span>
                      <span className="text-muted">{adj.reason}</span>
                    </div>
                    <span className={`fw-semibold ms-2 text-nowrap ${Number(adj.amount) < 0 ? 'text-danger' : 'text-success'}`}>
                      {Number(adj.amount) < 0 ? '−' : '+'} {formatINR(Math.abs(adj.amount))}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction list */}
      {batch.txnSummary && (() => {
        let txns = [];
        try { txns = JSON.parse(batch.txnSummary); } catch { txns = []; }
        return txns.length > 0 ? (
          <div className="card mb-4">
            <div className="card-header bg-white">
              <span className="fw-semibold small">
                <i className="bi bi-receipt me-2"></i>Transactions in this Batch
                <span className="badge bg-secondary ms-2">{txns.length}</span>
              </span>
            </div>
            <div className="card-body p-0">
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="small">Txn ID</th>
                    <th className="small text-end">Amount</th>
                    <th className="small text-end">Scheme Fee</th>
                    <th className="small text-end">Interchange</th>
                    <th className="small text-end">Acquirer Markup</th>
                    <th className="small text-end">Total Fee</th>
                    <th className="small text-end">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map(t => (
                    <tr key={t.txnId}>
                      <td className="small font-monospace">#{t.txnId}</td>
                      <td className="small text-end">{formatINR(t.amount)}</td>
                      <td className="small text-end text-muted">{formatINR(t.schemeFee)}</td>
                      <td className="small text-end text-muted">{formatINR(t.interchangeFee)}</td>
                      <td className="small text-end text-muted">{formatINR(t.acquirerMarkup)}</td>
                      <td className="small text-end text-warning">{formatINR(t.totalFee)}</td>
                      <td className="small text-end text-success fw-semibold">{formatINR(t.amount - t.totalFee)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null;
      })()}

      {/* Payouts */}
      <div className="card">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-semibold small">
            <i className="bi bi-send me-2"></i>Payouts
          </span>
          {payoutsLoading && (
            <span className="spinner-border spinner-border-sm text-secondary" role="status"></span>
          )}
        </div>
        <div className="card-body p-0">
          <PayoutList payouts={payouts} canManage={canManage} onChanged={fetchPayouts} />
        </div>
      </div>

      <ConfirmModal
        show={showPayoutConfirm}
        onClose={() => setShowPayoutConfirm(false)}
        onConfirm={handleTriggerPayout}
        title="Trigger Payout"
        message={
          <div>
            <p>Trigger payout for batch <strong>#{batch.settleBatchId}</strong>?</p>
            <p className="text-muted small mb-0">
              Net payout of <strong>{formatINR(batch.netAmount)}</strong> will be initiated.
            </p>
          </div>
        }
        confirmLabel="Trigger Payout"
        confirmVariant="success"
        loading={actionLoading}
      />
    </div>
  );
}

function SimpleMetric({ label, value, icon, color = '' }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="text-muted small mb-1">{label}</div>
            <div className={`h5 fw-bold mb-0 ${color}`}>{value ?? '—'}</div>
          </div>
          <i className={`bi ${icon} text-muted`} style={{ fontSize: '1.4rem', opacity: 0.6 }}></i>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="d-flex justify-content-between small py-1 border-bottom align-items-center">
      <span className="text-muted">{label}</span>
      <span className={mono ? 'font-monospace' : ''}>{value}</span>
    </div>
  );
}

export default SettlementBatchPage;
