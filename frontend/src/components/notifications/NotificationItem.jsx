import { formatDateTime } from '../../utils/formatters';

const CATEGORY_STYLE = {
  BATCH:      { color: 'bg-primary',            icon: 'bi-box-seam' },
  SETTLEMENT: { color: 'bg-success',            icon: 'bi-cash-stack' },
  DISPUTE:    { color: 'bg-warning text-dark',  icon: 'bi-exclamation-circle' },
  RISK:       { color: 'bg-danger',             icon: 'bi-shield-exclamation' },
  RECON:      { color: 'bg-info',               icon: 'bi-clipboard-check' },
  SYSTEM:     { color: 'bg-secondary',          icon: 'bi-gear' },
};

function NotificationItem({ notification, onMarkRead, onDismiss, compact = false }) {
  const isUnread = notification.status === 'UNREAD' || !notification.status;
  const style = CATEGORY_STYLE[notification.category] || { color: 'bg-secondary', icon: 'bi-bell' };

  return (
    <div className={`p-3 border-bottom d-flex gap-3 align-items-start ${isUnread ? 'bg-light' : ''}`}>
      <div
        className={`${style.color} rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}
        style={{ width: '34px', height: '34px', minWidth: '34px' }}
      >
        <i className={`bi ${style.icon} text-white small`}></i>
      </div>

      <div className="flex-grow-1 min-w-0">
        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
          <span className={`badge ${style.color} small`} style={{ fontSize: '0.65rem' }}>
            {notification.category || 'SYSTEM'}
          </span>
          {isUnread && (
            <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>NEW</span>
          )}
        </div>
        <div className="small text-body">{notification.message}</div>
        <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '3px' }}>
          {formatDateTime(notification.createdAt)}
        </div>
      </div>

      {!compact && (onMarkRead || onDismiss) && (
        <div className="d-flex flex-column gap-1 flex-shrink-0 text-end">
          {isUnread && onMarkRead && (
            <button
              className="btn btn-sm btn-link p-0 small text-primary"
              onClick={() => onMarkRead(notification.notificationId)}
            >
              Mark read
            </button>
          )}
          {onDismiss && (
            <button
              className="btn btn-sm btn-link p-0 small text-muted"
              onClick={() => onDismiss(notification.notificationId)}
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationItem;
