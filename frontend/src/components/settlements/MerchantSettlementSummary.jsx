import { formatINR, formatNumber } from '../../utils/formatters';

function MerchantSettlementSummary({ summary, loading }) {
  if (loading) {
    return (
      <div className="card mb-3">
        <div className="card-body py-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
          <span className="text-muted small">Loading summary...</span>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <SimpleMetric label="Total Batches" value={formatNumber(summary.totalBatchCount)}  icon="bi-box-seam" />
        </div>
        <div className="col-6 col-md-3">
          <SimpleMetric label="Paid"    value={formatNumber(summary.paidBatchCount)}    icon="bi-check-circle"  color="text-success" />
        </div>
        <div className="col-6 col-md-3">
          <SimpleMetric label="Ready"   value={formatNumber(summary.readyBatchCount)}   icon="bi-hourglass-split" color="text-primary" />
        </div>
        <div className="col-6 col-md-3">
          <SimpleMetric label="On Hold" value={formatNumber(summary.onHoldBatchCount)}  icon="bi-pause-circle"  color="text-warning" />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <SimpleMetric label="Gross"          value={formatINR(summary.totalGrossAmount, { compact: true })}   icon="bi-arrow-down-circle" color="text-primary" />
        </div>
        <div className="col-6 col-md-3">
          <SimpleMetric label="Fees Deducted"  value={formatINR(summary.totalFeesDeducted, { compact: true })} icon="bi-dash-circle"       color="text-warning" />
        </div>
        <div className="col-6 col-md-3">
          <SimpleMetric label="Net Paid"       value={formatINR(summary.totalNetPaid, { compact: true })}       icon="bi-arrow-up-circle"   color="text-success" />
        </div>
        <div className="col-6 col-md-3">
          <SimpleMetric label="Pending Payout" value={formatINR(summary.pendingPayoutAmount, { compact: true })} icon="bi-clock"            color="text-info" />
        </div>
      </div>

      {summary.totalAdjustments != null && summary.totalAdjustments !== 0 && (
        <div className={`alert ${summary.totalAdjustments < 0 ? 'alert-warning' : 'alert-info'} small mb-3`}>
          <strong>Total Adjustments:</strong>{' '}
          <span className={summary.totalAdjustments >= 0 ? 'text-success fw-semibold' : 'text-danger fw-semibold'}>
            {summary.totalAdjustments >= 0 ? '+' : ''}{formatINR(summary.totalAdjustments)}
          </span>
        </div>
      )}
    </>
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

export default MerchantSettlementSummary;
