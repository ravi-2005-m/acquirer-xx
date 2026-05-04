import api from './axiosConfig';

// ─── TODO: Stats endpoints currently fail (backend bugs) ────────
// Stats/summary calls have suppressToast: true to hide the user-facing
// red error toast. Pages handle the failure gracefully via try/catch
// and show "—" placeholders. Remove this suppression once the backend
// 500/404 errors are fixed.
// ────────────────────────────────────────────────────────────────

const pp = (p = {}) => ({ page: p.page ?? 0, size: p.size ?? 20, sortBy: 'openedDate', sortDir: 'DESC' });

export const disputeApi = {
  getDisputes:        (pagination)          => api.get('/disputes', { params: pp(pagination) }),
  searchDisputes:     (filters, pagination) => api.post('/disputes/search', filters, { params: pp(pagination) }),
  getDisputeById:     (id)                  => api.get(`/disputes/${id}`),
  getEvidence:        (id)                  => api.get(`/disputes/${id}/evidence`),
  getStages:          (id)                  => api.get(`/disputes/${id}/stages`),
  getSummary:         (filters = {})        => api.post('/disputes/summary', filters, { suppressToast: true }),

  accept:              (id, payload) => api.post(`/disputes/${id}/accept`, payload),
  reject:              (id, payload) => api.post(`/disputes/${id}/reject`, payload),
  sendToPreArbitration:(id, payload) => api.post(`/disputes/${id}/pre-arbitration`, payload),
  sendToArbitration:   (id, payload) => api.post(`/disputes/${id}/arbitration`, payload),
  resolve:             (id, payload) => api.post(`/disputes/${id}/resolve`, payload),

  uploadEvidence: (disputeId, file, description) => {
    const fd = new FormData();
    fd.append('file', file);
    if (description) fd.append('description', description);
    return api.post(`/disputes/${disputeId}/evidence`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteEvidence: (disputeId, evidenceId) =>
    api.delete(`/disputes/${disputeId}/evidence/${evidenceId}`),
};
