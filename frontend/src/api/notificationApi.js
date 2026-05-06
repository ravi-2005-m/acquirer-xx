import api from './axiosConfig';

const pp = ({ page = 0, size = 15, sortBy = 'createdAt', sortDir = 'DESC' } = {}) => ({
  page, size, ...(sortBy && { sortBy }), sortDir,
});

export const notificationApi = {
  send: ({ userId, message, category }) => {
    const params = new URLSearchParams({ userId, message, category });
    return api.post(`/notifications/send?${params.toString()}`);
  },

  search: (filters, pagination) =>
    api.post('/notifications/search', filters, { params: pp(pagination) }),

  getAll: () =>
    api.get('/notifications'),

  getUserNotifications: (userId, pagination) =>
    api.get(`/notifications/user/${userId}`, { params: pp(pagination) }),

  getUnread: (userId, pagination) =>
    api.get(`/notifications/user/${userId}/unread`, { params: pp(pagination), suppressToast: true }),

  getUnreadCount: (userId) =>
    api.get(`/notifications/user/${userId}/unread-count`, { suppressToast: true }),

  getStats: () =>
    api.get('/notifications/stats', { suppressToast: true }),

  markRead: (id) =>
    api.patch(`/notifications/${id}/read`),

  dismiss: (id) =>
    api.patch(`/notifications/${id}/dismiss`),

  markAllRead: (userId) =>
    api.patch(`/notifications/user/${userId}/read-all`),
};
