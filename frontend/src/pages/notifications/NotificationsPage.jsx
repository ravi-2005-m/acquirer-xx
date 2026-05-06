import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { notificationApi } from '../../api/notificationApi';
import { toBackendDateTime } from '../../utils/formatters';
import NotificationStatsBar from '../../components/notifications/NotificationStatsBar';
import NotificationFilters from '../../components/notifications/NotificationFilters';
import NotificationItem from '../../components/notifications/NotificationItem';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 15;

function NotificationsPage() {
  const { user }                                     = useAuth();
  const { markAsRead, dismiss, markAllRead, refresh: refreshBell } = useNotifications();

  const [filters, setFilters] = useState({
    messageContains: '', category: '', status: '', fromDate: '', toDate: '',
  });
  const [page, setPage]                               = useState(0);
  const [notifications, setNotifications]             = useState([]);
  const [totalPages, setTotalPages]                   = useState(0);
  const [totalElements, setTotalElements]             = useState(0);
  const [loading, setLoading]                         = useState(true);

  const [stats, setStats]           = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const userId = user?.id;

  const hasFilters = !!(filters.messageContains || filters.category || filters.status || filters.fromDate || filters.toDate);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      let res;
      const pagination = { page, size: PAGE_SIZE };
      if (hasFilters) {
        const body = {};
        if (filters.messageContains) body.messageContains = filters.messageContains;
        if (filters.category)        body.category        = filters.category;
        if (filters.status)          body.status          = filters.status;
        if (filters.fromDate)        body.fromDate        = toBackendDateTime(filters.fromDate, false);
        if (filters.toDate)          body.toDate          = toBackendDateTime(filters.toDate,   true);
        body.userId = userId;
        res = await notificationApi.search(body, pagination);
      } else {
        res = await notificationApi.getUserNotifications(userId, pagination);
      }
      const body = res.data?.data ?? res.data ?? {};
      setNotifications(body.content ?? []);
      setTotalPages(body.totalPages ?? 0);
      setTotalElements(body.totalElements ?? 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId, filters, page, hasFilters]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await notificationApi.getStats();
      setStats(res.data?.data ?? res.data ?? null);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleFilterChange = (f) => { setFilters(f); setPage(0); };

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    load();
    loadStats();
  };

  const handleDismiss = async (id) => {
    await dismiss(id);
    load();
    loadStats();
  };

  const handleMarkAllRead = async () => {
    if (!window.confirm('Mark all notifications as read?')) return;
    await markAllRead();
    load();
    loadStats();
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="mb-1"><i className="bi bi-bell me-2"></i>Notifications</h3>
          <p className="text-muted small mb-0">Your activity feed and system alerts</p>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={handleMarkAllRead}>
          <i className="bi bi-check2-all me-1"></i>Mark all read
        </button>
      </div>

      <NotificationStatsBar stats={stats} loading={statsLoading} />

      <NotificationFilters filters={filters} onChange={handleFilterChange} />

      <div className="card">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-semibold small"><i className="bi bi-list-ul me-2"></i>Notifications</span>
          <span className="text-muted small">{totalElements} total</span>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
              <div className="text-muted small mt-2">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-bell-slash fs-2 d-block mb-2 opacity-25"></i>
              No notifications found.
            </div>
          ) : (
            notifications.map(n => (
              <NotificationItem
                key={n.notificationId}
                notification={n}
                onMarkRead={handleMarkRead}
                onDismiss={handleDismiss}
              />
            ))
          )}
        </div>
        {totalPages > 1 && (
          <div className="card-footer bg-white">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
