import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificationApi } from '../api/notificationApi';

const POLL_MS = 30000;

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount]   = useState(0);
  const [recentUnread, setRecentUnread] = useState([]);
  const [loading, setLoading]           = useState(false);
  const intervalRef = useRef(null);

  const userId = user?.id;

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [countRes, recentRes] = await Promise.allSettled([
        notificationApi.getUnreadCount(userId),
        notificationApi.getUnread(userId, { size: 5 }),
      ]);

      if (countRes.status === 'fulfilled') {
        const raw = countRes.value.data?.data ?? countRes.value.data ?? 0;
        setUnreadCount(typeof raw === 'number' ? raw : (raw?.count ?? 0));
      }

      if (recentRes.status === 'fulfilled') {
        const body = recentRes.value.data?.data ?? recentRes.value.data ?? {};
        setRecentUnread(body.content ?? []);
      }
    } catch {
      // silent — don't disrupt the page on polling failure
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      setRecentUnread([]);
      return;
    }
    refresh();
    intervalRef.current = setInterval(refresh, POLL_MS);
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [userId, refresh]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationApi.markRead(id);
      setRecentUnread(prev => prev.filter(n => n.notificationId !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      refresh();
    } catch {
      refresh();
    }
  }, [refresh]);

  const dismiss = useCallback(async (id) => {
    try {
      await notificationApi.dismiss(id);
      setRecentUnread(prev => prev.filter(n => n.notificationId !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      refresh();
    } catch {
      refresh();
    }
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    try {
      await notificationApi.markAllRead(userId);
      setRecentUnread([]);
      setUnreadCount(0);
      refresh();
    } catch {
      refresh();
    }
  }, [userId, refresh]);

  return (
    <NotificationContext.Provider value={{ unreadCount, recentUnread, loading, refresh, markAsRead, dismiss, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
