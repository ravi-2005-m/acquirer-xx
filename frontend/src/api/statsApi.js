import api from './axiosConfig';

// ─── TODO: Stats endpoints currently fail (backend bugs) ────────
// Stats/summary calls have suppressToast: true to hide the user-facing
// red error toast. Pages handle the failure gracefully via try/catch
// and show "—" placeholders. Remove this suppression once the backend
// 500/404 errors are fixed.
// ────────────────────────────────────────────────────────────────

const unwrap = (res) => res.data?.data ?? res.data;

// All stats calls are best-effort background data — failures show a clean
// placeholder in the dashboard card rather than toasting the user.
const get = (url) => api.get(url, { suppressToast: true }).then(unwrap);

export const fetchMerchantStats    = () => get('/merchants/stats');
export const fetchTransactionStats = () => get('/txns/stats');
export const fetchTerminalStats    = () => get('/terminals/stats');
export const fetchDisputeStats     = () => get('/disputes/stats');
export const fetchSettlementStats  = () => get('/settlement/stats');
export const fetchReconStats       = () => get('/recon/stats');
