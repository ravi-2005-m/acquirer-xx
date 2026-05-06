import api from './axiosConfig';

const paginationParams = (pagination = {}) => ({
  page: pagination.page ?? 0,
  size: pagination.size ?? 10,
  sortBy: pagination.sortBy ?? 'createdAt',
  sortDir: pagination.sortDir ?? 'DESC',
});

export const merchantApi = {
  // Core merchant CRUD
  getAll: (pagination = {}) =>
    api.get('/merchants', { params: paginationParams(pagination) }),

  getById: (id) => api.get(`/merchants/${id}`),

  create: (data) => api.post('/merchants', data),

  updateStatus: (id, newStatus) =>
    api.patch(`/merchants/${id}/status`, null, { params: { newStatus } }),

  search: (filters, pagination = {}) =>
    api.post('/merchants/search', filters, { params: paginationParams(pagination) }),

  getByStatus: (status, pagination = {}) =>
    api.get(`/merchants/status/${status}`, { params: paginationParams(pagination) }),

  getStats: () => api.get('/merchants/stats', { suppressToast: true }),

  update: (id, data) => api.put(`/merchants/${id}`, data),

  deleteById: (id) => api.delete(`/merchants/${id}`),

  // KYC  — backend controller base: /merchants/onboarding
  getKycByMerchant: (merchantId) =>
    api.get(`/merchants/onboarding/kyc/merchant/${merchantId}`),

  submitKyc: (data) =>
    api.post('/merchants/onboarding/kyc', data),

  verifyKyc: (kycId) =>
    api.patch(`/merchants/onboarding/kyc/${kycId}/verify`),

  rejectKyc: (kycId, reason) =>
    api.patch(`/merchants/onboarding/kyc/${kycId}/reject`, null, { params: { reason } }),

  // Pricing
  getPricingByMerchant: (merchantId) =>
    api.get(`/merchants/onboarding/pricing/merchant/${merchantId}`),

  createPricing: (data) =>
    api.post('/merchants/onboarding/pricing', data),

  deactivatePricing: (pricingId) =>
    api.patch(`/merchants/onboarding/pricing/${pricingId}/deactivate`),

  // Settlement Profiles
  getSettlementProfilesByMerchant: (merchantId) =>
    api.get(`/merchants/onboarding/settlement-profile/merchant/${merchantId}`),

  createSettlementProfile: (data) =>
    api.post('/merchants/onboarding/settlement-profile', data),

  updateSettlementProfile: (profileId, data) =>
    api.put(`/merchants/onboarding/settlement-profile/${profileId}`, data),

  deactivateSettlementProfile: (profileId) =>
    api.patch(`/merchants/onboarding/settlement-profile/${profileId}/deactivate`),
};
