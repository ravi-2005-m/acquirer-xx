import api from './axiosConfig';

// ─── TODO: Stats endpoints currently fail (backend bugs) ────────
// Stats/summary calls have suppressToast: true to hide the user-facing
// red error toast. Pages handle the failure gracefully via try/catch
// and show "—" placeholders. Remove this suppression once the backend
// 500/404 errors are fixed.
// ────────────────────────────────────────────────────────────────

const pp = (p = {}, sortDefault = 'eventDate') => ({
  page: p.page ?? 0,
  size: p.size ?? 20,
  sortBy: p.sortBy ?? sortDefault,
  sortDir: p.sortDir ?? 'DESC',
});

export const riskApi = {
  getSummary: () =>
    api.get('/risk/summary', { suppressToast: true }),

  checkRisk: (params) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') qs.append(k, v); });
    return api.post(`/risk/check?${qs.toString()}`);
  },

  getEvents: (pagination) =>
    api.get('/risk/events', { params: pp(pagination) }),

  searchEvents: (filters, pagination) =>
    api.post('/risk/events/search', filters, { params: pp(pagination) }),

  getRules: () =>
    api.get('/risk/rules'),

  createRule: (payload) =>
    api.post('/risk/rules', payload),

  deactivateRule: (id) =>
    api.patch(`/risk/rules/${id}/deactivate`),

  getBlacklist: (pagination) =>
    api.get('/risk/blacklist', { params: pp(pagination, 'createdAt') }),

  addBlacklist: (payload) =>
    api.post('/risk/blacklist', payload),

  removeBlacklist: (id) =>
    api.delete(`/risk/blacklist/${id}`),
};
