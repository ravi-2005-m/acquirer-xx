import api from './axiosConfig';

// ─── TODO: Stats endpoints currently fail (backend bugs) ────────
// Stats/summary calls have suppressToast: true to hide the user-facing
// red error toast. Pages handle the failure gracefully via try/catch
// and show "—" placeholders. Remove this suppression once the backend
// 500/404 errors are fixed.
// ────────────────────────────────────────────────────────────────

const pp = (p = {}, sortDefault = 'loadedAt') => ({
  page: p.page ?? 0,
  size: p.size ?? 10,
  sortBy: p.sortBy ?? sortDefault,
  sortDir: p.sortDir ?? 'DESC',
});

export const reconApi = {
  // Load
  loadFile: (payload) => api.post('/recon/load', payload),

  // Files
  getFiles:      (pagination)          => api.get('/recon/files', { params: pp(pagination) }),
  searchFiles:   (filters, pagination) => api.post('/recon/files/search', filters, { params: pp(pagination) }),
  getFileItems:  (fileId, pagination)  => api.get(`/recon/files/${fileId}/items`, { params: pp(pagination, 'reconItemId') }),

  // Items
  searchItems:   (filters, pagination) => api.post('/recon/items/search', filters, { params: pp(pagination, 'reconItemId') }),

  // Exceptions
  getExceptions:     (pagination)          => api.get('/recon/exceptions', { params: pp(pagination, 'createdAt') }),
  getOpenExceptions: (pagination)          => api.get('/recon/exceptions/open', { params: pp(pagination, 'createdAt') }),
  searchExceptions:  (filters, pagination) => api.post('/recon/exceptions/search', filters, { params: pp(pagination, 'createdAt') }),
  resolveException:  (id, payload)         => api.patch(`/recon/exceptions/${id}/resolve`, payload),

  // Summary
  getSummary: () => api.get('/recon/summary', { suppressToast: true }),
};
