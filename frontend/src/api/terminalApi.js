import api from './axiosConfig';

// ─── TODO: Stats endpoints currently fail (backend bugs) ────────
// Stats/summary calls have suppressToast: true to hide the user-facing
// red error toast. Pages handle the failure gracefully via try/catch
// and show "—" placeholders. Remove this suppression once the backend
// 500/404 errors are fixed.
// ────────────────────────────────────────────────────────────────

const paginationParams = (pagination = {}) => ({
  page: pagination.page ?? 0,
  size: pagination.size ?? 10,
  sortBy: pagination.sortBy ?? 'createdAt',
  sortDir: pagination.sortDir ?? 'DESC',
});

export const terminalApi = {
  // Core terminal endpoints
  getAll: (pagination = {}) =>
    api.get('/terminals', { params: paginationParams(pagination) }),

  create: (data) => api.post('/terminals', data),

  update: (id, data) => api.put(`/terminals/${id}`, data),

  deleteById: (id) => api.delete(`/terminals/${id}`),

  getById: (id) => api.get(`/terminals/${id}`),

  search: (filters, pagination = {}) =>
    api.post('/terminals/search', filters, { params: paginationParams(pagination) }),

  updateStatus: (id, newStatus) =>
    api.patch(`/terminals/${id}/status`, null, { params: { newStatus } }),

  getStats: () => api.get('/terminals/stats', { suppressToast: true }),

  // Store-scoped endpoints
  getByStore: (storeId, pagination = {}) =>
    api.get(`/stores/${storeId}/terminals`, { params: paginationParams(pagination) }),

  createInStore: (storeId, data) =>
    api.post(`/stores/${storeId}/terminals`, data),

  // Parameter profiles
  getAllProfiles: () => api.get('/terminals/provisioning/profiles'),

  getActiveProfiles: () => api.get('/terminals/provisioning/profiles/active'),

  createProfile: (data) => api.post('/terminals/provisioning/profiles', data),

  updateProfile: (profileId, data) =>
    api.put(`/terminals/provisioning/profiles/${profileId}`, data),

  deactivateProfile: (profileId) =>
    api.patch(`/terminals/provisioning/profiles/${profileId}/deactivate`),

  assignProfile: (profileId, terminalId) =>
    api.post(`/terminals/provisioning/profiles/${profileId}/assign/${terminalId}`),

  // Health monitoring
  getHealth: (terminalId) =>
    api.get(`/terminals/provisioning/health/${terminalId}`),

  recordHealthPing: (terminalId, params) =>
    api.post(`/terminals/provisioning/health/${terminalId}`, null, { params }),

  getAllHealth: () => api.get('/terminals/provisioning/health'),

  getHealthByStatus: (status) =>
    api.get(`/terminals/provisioning/health/status/${status}`),

  getStaleTerminals: () => api.get('/terminals/provisioning/health/stale'),

  getLowBatteryTerminals: () => api.get('/terminals/provisioning/health/low-battery'),
};
