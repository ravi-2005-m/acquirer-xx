import api from './axiosConfig';

const unwrap = (res) => res.data?.data ?? res.data;

// Stats are best-effort background data — failures show a clean "—"
// placeholder in the dashboard card rather than toasting the user.
const get = (url) => api.get(url, { suppressToast: true }).then(unwrap);

export const fetchMerchantStats    = () => get('/merchants/stats');
export const fetchTransactionStats = () => get('/txns/stats');
export const fetchTerminalStats    = () => get('/terminals/stats');
export const fetchDisputeStats     = () => get('/disputes/stats');
export const fetchSettlementStats  = () => get('/settlement/stats');
export const fetchReconStats       = () => get('/recon/stats');
