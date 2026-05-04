import api from './axiosConfig';

// ─── TODO: Stats endpoints currently fail (backend bugs) ────────
// Stats/summary calls have suppressToast: true to hide the user-facing
// red error toast. Pages handle the failure gracefully via try/catch
// and show "—" placeholders. Remove this suppression once the backend
// 500/404 errors are fixed.
// ────────────────────────────────────────────────────────────────

const get = (path) =>
  api.get(path, { suppressToast: true }).then((r) => r.data?.data ?? r.data ?? {});

export const reportsApi = {
  getDashboardSummary:    () => get('/reports/dashboard-summary'),
  getTransactionVolume:   () => get('/reports/transaction-volume'),
  getSettlementSummary:   () => get('/reports/settlement-summary'),
  getDisputeSummary:      () => get('/reports/dispute-summary'),
  getRiskSummary:         () => get('/reports/risk-summary'),
  getMerchantAnalytics:   () => get('/reports/top-merchants'),
};
