import api from './axiosConfig';

const pp = (p = {}) => ({ page: p.page ?? 0, size: p.size ?? 20, sortBy: 'openedDate', sortDir: 'DESC' });

export const disputeApi = {
  getDisputes:    (pagination)          => api.get('/disputes', { params: pp(pagination) }),
  searchDisputes: (filters, pagination) => api.post('/disputes/search', filters, { params: pp(pagination) }),
  getDisputeById: (id)                  => api.get(`/disputes/${id}`),
  getOpen:        (pagination)          => api.get('/disputes/open', { params: pp(pagination) }),
  getByStage:     (stage, pagination)   => api.get(`/disputes/stage/${stage}`, { params: pp(pagination) }),

  openDispute:    (payload)             => api.post('/disputes', payload),
  advanceStage:   (id)                  => api.patch(`/disputes/${id}/advance`),
  closeDispute:   (id)                  => api.patch(`/disputes/${id}/close`),

  getDocuments:   (id)                          => api.get(`/disputes/${id}/documents`),
  addDocument:    ({ caseId, docType, uri })    => api.post('/disputes/documents', { caseId, docType, uri }),

  getActions:     (id)                                          => api.get(`/disputes/${id}/actions`),
  addAction:      ({ caseId, actionType, actorId, notes })      =>
    api.post('/disputes/actions', { caseId, actionType, actorId, notes }),

  getStats:       () => api.get('/disputes/stats', { suppressToast: true }),
  getSummary:     (filters = {}) => api.post('/disputes/summary', filters, { suppressToast: true }),
};
