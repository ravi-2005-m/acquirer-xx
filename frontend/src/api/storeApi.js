import api from './axiosConfig';

// ─── TODO: Stats endpoints currently fail (backend bugs) ────────
// Stats/summary calls have suppressToast: true to hide the user-facing
// red error toast. Pages handle the failure gracefully via try/catch
// and show "—" placeholders. Remove this suppression once the backend
// 500/404 errors are fixed.
// ────────────────────────────────────────────────────────────────

export const storeApi = {
  getByMerchant: (merchantId, pagination = {}) =>
    api.get(`/merchants/${merchantId}/stores`, {
      params: {
        page: pagination.page ?? 0,
        size: pagination.size ?? 10,
      },
    }),

  create: (merchantId, data) =>
    api.post(`/merchants/${merchantId}/stores`, data),

  getById: (id) => api.get(`/stores/${id}`),

  updateStatus: (id, newStatus) =>
    api.patch(`/stores/${id}/status`, null, { params: { newStatus } }),

  search: (filters, pagination = {}) =>
    api.post('/stores/search', filters, {
      params: {
        page: pagination.page ?? 0,
        size: pagination.size ?? 10,
      },
    }),

  getAll: (pagination = {}) =>
    api.get('/stores', {
      params: {
        page: pagination.page ?? 0,
        size: pagination.size ?? 10,
        sortBy: pagination.sortBy ?? 'storeName',
      },
    }),

  getStats: () => api.get('/stores/stats', { suppressToast: true }),

  update: (id, data) => api.put(`/stores/${id}`, data),

  deleteById: (id) => api.delete(`/stores/${id}`),
};
