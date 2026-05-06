import api from './axiosConfig';

// Pagination helper for SettlementBatch endpoints (default sort: settleBatchId).
const batchPp = (p = {}) => ({
  page: p.page ?? 0,
  size: p.size ?? 10,
  sortBy: p.sortBy ?? 'settleBatchId',
  sortDir: p.sortDir ?? 'DESC',
});

// Pagination helper for Adjustment endpoints (allowed sort fields per backend:
// type, status, amount, merchantId, postedDate, adjustmentId).
const adjustmentPp = (p = {}) => ({
  page: p.page ?? 0,
  size: p.size ?? 10,
  sortBy: p.sortBy ?? 'postedDate',
  sortDir: p.sortDir ?? 'DESC',
});

export const settlementApi = {
  // Batch lists
  getBatches:            (pagination)             => api.get('/settlement', { params: batchPp(pagination) }),
  searchBatches:         (filters, pagination)    => api.post('/settlement/search', filters, { params: batchPp(pagination) }),
  getMerchantBatches:    (merchantId, pagination) => api.get(`/settlement/merchant/${merchantId}`, { params: batchPp(pagination) }),

  // Batch / merchant actions
  // Suppress the global red toast — RunSettlementModal handles its own
  // inline messaging so the "no unsettled txns" case can be shown as info.
  runMerchantSettlement: (merchantId)             => api.post(`/settlement/merchant/${merchantId}`, null, { suppressToast: true }),
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
    api.get(`/settlement/adjustments/merchant/${merchantId}`, { params: adjustmentPp(pagination) }),
};
