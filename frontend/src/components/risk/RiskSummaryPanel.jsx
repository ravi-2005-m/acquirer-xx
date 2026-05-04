import { formatNumber, formatCurrency } from '../../utils/formatters';

function Stat({ label, value, color = '', mono = false }) {
  return (
    <div className="col">
      <div className="text-muted small">{label}</div>
      <div className={`fw-bold ${color} ${mono ? 'font-monospace' : ''}`}>{value ?? '—'}</div>
    </div>
  );
}

function RiskSummaryPanel({ summary, loading }) {
  if (loading) {
    return (
      <div className="card mb-3">
        <div className="card-body py-2 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
          <span className="text-muted small">Loading risk summary...</span>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="card mb-3">
      <div className="card-body py-3">
        {/* Today */}
        <div className="text-uppercase text-muted small fw-semibold mb-2" style={{ letterSpacing: '0.05em' }}>
          Today
        </div>
        <div className="row text-center g-2 mb-3">
          <Stat label="Events Today"   value={formatNumber(summary.eventsToday)} />
          <Stat label="Allowed"        value={formatNumber(summary.allowedToday)}  color="text-success" />
          <Stat label="Reviewed"       value={formatNumber(summary.reviewedToday)} color="text-warning" />
          <Stat label="Blocked"        value={formatNumber(summary.blockedToday)}  color="text-danger" />
          <Stat label="Blocked Amount" value={summary.blockedAmountToday != null ? formatCurrency(summary.blockedAmountToday) : '—'} mono />
        </div>

        <hr className="my-2" />

        {/* All-time */}
        <div className="text-uppercase text-muted small fw-semibold mb-2" style={{ letterSpacing: '0.05em' }}>
          All Time
        </div>
        <div className="row text-center g-2 mb-3">
          <Stat label="Total Events"  value={formatNumber(summary.totalEvents)} />
          <Stat label="Allow Rate"    value={summary.allowRate   != null ? `${(summary.allowRate   * 100).toFixed(1)}%` : '—'} color="text-success" />
          <Stat label="Review Rate"   value={summary.reviewRate  != null ? `${(summary.reviewRate  * 100).toFixed(1)}%` : '—'} color="text-warning" />
          <Stat label="Block Rate"    value={summary.blockRate   != null ? `${(summary.blockRate   * 100).toFixed(1)}%` : '—'} color="text-danger" />
        </div>

        <hr className="my-2" />

        {/* Config */}
        <div className="text-uppercase text-muted small fw-semibold mb-2" style={{ letterSpacing: '0.05em' }}>
          Configuration
        </div>
        <div className="row text-center g-2">
          <Stat label="Active Rules"      value={formatNumber(summary.activeRules)} />
          <Stat label="Inactive Rules"    value={formatNumber(summary.inactiveRules)} color="text-muted" />
          <Stat label="Blacklist Entries" value={formatNumber(summary.blacklistEntries)} color="text-danger" />
        </div>
      </div>
    </div>
  );
}

export default RiskSummaryPanel;
