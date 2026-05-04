import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

function NotificationDropdown({ onClose }) {
  const { recentUnread, unreadCount, markAsRead, dismiss, markAllRead, loading } = useNotifications();

  return (
    <div
      className="card shadow"
      style={{
        position: 'absolute',
        right: 0,
        top: 'calc(100% + 8px)',
        width: '380px',
        maxHeight: '480px',
        zIndex: 1050,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-2">
        <span className="fw-semibold small">
          <i className="bi bi-bell me-1"></i>Notifications
          {unreadCount > 0 && (
            <span className="badge bg-primary ms-2" style={{ fontSize: '0.65rem' }}>{unreadCount}</span>
          )}
        </span>
        {unreadCount > 0 && (
          <button className="btn btn-sm btn-link p-0 small" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading && recentUnread.length === 0 && (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
          </div>
        )}

        {!loading && recentUnread.length === 0 && (
          <div className="text-center py-4 text-muted small">
            <i className="bi bi-check-circle fs-4 d-block mb-1 opacity-50"></i>
            No unread notifications
          </div>
        )}

        {recentUnread.map(n => (
          <NotificationItem
            key={n.notificationId}
            notification={n}
            onMarkRead={markAsRead}
            onDismiss={dismiss}
            compact
          />
        ))}
      </div>

      <div className="card-footer bg-white text-center py-2">
        <Link to="/notifications" onClick={onClose} className="btn btn-link btn-sm p-0 small">
          View all notifications <i className="bi bi-arrow-right ms-1"></i>
        </Link>
      </div>
    </div>
  );
}

export default NotificationDropdown;
