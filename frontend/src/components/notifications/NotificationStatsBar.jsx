import { formatNumber } from '../../utils/formatters';

function Stat({ label, value, color = '' }) {
  return (
    <div className="col">
      <div className="text-muted small">{label}</div>
      <div className={`fw-bold ${color}`}>{formatNumber(value) ?? '—'}</div>
    </div>
  );
}

function NotificationStatsBar({ stats, loading }) {
  if (loading) {
    return (
      <div className="card mb-3">
        <div className="card-body py-2 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
          <span className="text-muted small">Loading stats...</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="card mb-3">
      <div className="card-body py-3">
        <div className="row text-center g-2 mb-2">
          <Stat label="Total"        value={stats.totalNotifications} />
          <Stat label="Unread"       value={stats.unreadCount}     color="text-primary" />
          <Stat label="Read"         value={stats.readCount}        color="text-muted" />
          <Stat label="Dismissed"    value={stats.dismissedCount}   color="text-muted" />
          <Stat label="Sent Today"   value={stats.sentToday}        color="text-info" />
          <Stat label="Unread Today" value={stats.unreadToday}      color="text-warning" />
        </div>

        <hr className="my-2" />

        <div className="row text-center g-2">
          {[
            { label: 'Batch',      key: 'batchNotifications',      icon: 'bi-box-seam' },
            { label: 'Settlement', key: 'settlementNotifications',  icon: 'bi-cash-stack' },
            { label: 'Dispute',    key: 'disputeNotifications',     icon: 'bi-exclamation-circle' },
            { label: 'Risk',       key: 'riskNotifications',        icon: 'bi-shield-exclamation' },
            { label: 'Recon',      key: 'reconNotifications',       icon: 'bi-clipboard-check' },
          ].map(({ label, key, icon }) => (
            <div key={key} className="col">
              <div className="text-muted small">
                <i className={`bi ${icon} me-1`}></i>{label}
              </div>
              <div className="fw-bold">{formatNumber(stats[key] ?? 0)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificationStatsBar;
