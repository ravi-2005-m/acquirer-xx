import api from './axiosConfig';

// ─── TODO: Stats endpoints currently fail (backend bugs) ────────
// Stats/summary calls have suppressToast: true to hide the user-facing
// red error toast. Pages handle the failure gracefully via try/catch
// and show "—" placeholders. Remove this suppression once the backend
// 500/404 errors are fixed.
// ────────────────────────────────────────────────────────────────

const pp = (p = {}) => ({
  page: p.page ?? 0,
  size: p.size ?? 10,
  sortBy: p.sortBy ?? 'settleBatchId',
  sortDir: p.sortDir ?? 'DESC',
});

export const settlementApi = {
  // Batch lists
  getBatches:            (pagination)             => api.get('/settlement', { params: pp(pagination) }),
  searchBatches:         (filters, pagination)    => api.post('/settlement/search', filters, { params: pp(pagination) }),
  getMerchantBatches:    (merchantId, pagination) => api.get(`/settlement/merchant/${merchantId}`, { params: pp(pagination) }),

  // Batch / merchant actions
  runMerchantSettlement: (merchantId)             => api.post(`/settlement/merchant/${merchantId}`),
  triggerBatchPayout:    (settleBatchId)          => api.post(`/settlement/payout/${settleBatchId}`),

  // Payouts
  getBatchPayouts:       (settleBatchId)          => api.get(`/settlement/${settleBatchId}/payouts`),
  triggerSyncPayout:     (settlementId)           => api.post(`/payout/${settlementId}`),
  triggerAsyncPayout:    (settlementId)           => api.post(`/payout/async/${settlementId}`),

  // Summary
  getMerchantSummary:    (merchantId)             => api.get(`/settlement/summary/merchant/${merchantId}`, { suppressToast: true }),

  // Adjustments
  createAdjustment:        (payload)              => api.post('/settlement/adjustments', payload),
  getMerchantAdjustments:  (merchantId, pagination) =>
    api.get(`/settlement/adjustments/merchant/${merchantId}`, { params: pp(pagination) }),
};
