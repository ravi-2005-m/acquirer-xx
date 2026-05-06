import api from './axiosConfig';

// ─── TODO: Stats endpoints currently fail (backend bugs) ────────
// Stats/summary calls have suppressToast: true to hide the user-facing
// red error toast. Pages handle the failure gracefully via try/catch
// and show "—" placeholders. Remove this suppression once the backend
// 500/404 errors are fixed.
// ────────────────────────────────────────────────────────────────

const authPagination = (pagination = {}) => ({
  page: pagination.page ?? 0,
  size: pagination.size ?? 10,
  sortBy: pagination.sortBy ?? 'txnTime',
  sortDir: pagination.sortDir ?? 'DESC',
});

const txnPagination = (pagination = {}) => ({
  page: pagination.page ?? 0,
  size: pagination.size ?? 10,
  sortBy: pagination.sortBy ?? 'txnDate',
  sortDir: pagination.sortDir ?? 'DESC',
});

export const transactionApi = {
  // ---- AuthMessage endpoints (/transactions) ----

  getAuths: (pagination = {}) =>
    api.get('/transactions', { params: authPagination(pagination) }),

  getAuthById: (id) => api.get(`/transactions/${id}`),

  searchAuths: (filters, pagination = {}) =>
    api.post('/transactions/search', filters, { params: authPagination(pagination) }),

  getAuthStats: (filters = {}) =>
    api.post('/transactions/stats', filters, { suppressToast: true }),

  authorize: (data, idempotencyKey) =>
    api.post('/transactions/authorize', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    }),

  refund: (data, idempotencyKey) =>
    api.post('/transactions/refund', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    }),

  voidAuth: (data, idempotencyKey) =>
    api.post('/transactions/void', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    }),

  getBatches: (terminalId) => api.get(`/transactions/batch/${terminalId}`),
  openBatch: (terminalId) => api.post(`/transactions/batch/${terminalId}/open`),
  closeBatch: (terminalId) => api.post(`/transactions/batch/${terminalId}/close`),

  // ---- Txn endpoints (/txns) ----

  getTxns: (pagination = {}) =>
    api.get('/txns', { params: txnPagination(pagination) }),

  getTxnById: (txnId) => api.get(`/txns/${txnId}`),

  getTxnByAuthId: (authId) =>
    api.get(`/txns/by-auth/${authId}`, { suppressToast: true }),

  searchTxns: (filters, pagination = {}) =>
    api.post('/txns/search', filters, { params: txnPagination(pagination) }),

  getTxnsByMerchant: (merchantId, pagination = {}) =>
    api.get(`/txns/merchant/${merchantId}`, { params: txnPagination(pagination) }),

  getUnsettledByMerchant: (merchantId) =>
    api.get(`/txns/merchant/${merchantId}/unsettled`),

  getAllTxns: () => api.get('/txns/all'),

  createTxnFromAuth: (authId, idempotencyKey) =>
    api.post(`/txns/from-auth/${authId}`, null, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    }),

  markMerchantSettled: (merchantId) =>
    api.put(`/txns/merchant/${merchantId}/mark-settled`),

  getMerchantFeeSummary: (merchantId) =>
    api.get(`/merchants/${merchantId}/fee-summary`),

  getStats: () => api.get('/txns/stats', { suppressToast: true }),
};
