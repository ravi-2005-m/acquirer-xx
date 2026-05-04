import api from './axiosConfig';

const pp = (p = {}) => ({
  page: p.page ?? 0,
  size: p.size ?? 20,
  sortBy: p.sortBy ?? 'createdAt',
  sortDir: p.sortDir ?? 'DESC',
});

const auditPp = (p = {}) => ({
  page: p.page ?? 0,
  size: p.size ?? 20,
  sortBy: p.sortBy ?? 'performedAt',
  sortDir: p.sortDir ?? 'DESC',
});

export const userApi = {
  getUsers: (pagination) =>
    api.get('/auth/users', { params: pp(pagination) }),

  searchUsers: (filters, pagination) =>
    api.post('/auth/users/search', filters, { params: pp(pagination) }),

  getUserById: (id) =>
    api.get(`/auth/users/${id}`),

  deactivate: (id) =>
    api.patch(`/auth/users/${id}/deactivate`),

  reactivate: (id) =>
    api.patch(`/auth/users/${id}/reactivate`),

  // Backend uses @RequestParam String role — pass as query param
  changeRole: (id, role) =>
    api.patch(`/auth/users/${id}/role`, null, { params: { role } }),

  createUser: (payload) =>
    api.post('/auth/register', payload),

  // No per-user audit endpoint — search audit logs by actorUsername
  getUserAuditLogs: (username, filters, pagination) =>
    api.post('/auth/audit/search', { actorUsername: username, ...filters }, { params: auditPp(pagination) }),
};
