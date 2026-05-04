import api from './axiosConfig';

const safe = (promise) =>
  promise
    .then((res) => {
      const body = res.data?.data ?? res.data ?? {};
      return Array.isArray(body) ? body : (body.content ?? []);
    })
    .catch(() => []);

export async function fanOutSearch(query) {
  if (!query || query.trim().length < 2) return emptyResults();

  const q = query.trim();
  const isNumeric = /^\d+(\.\d+)?$/.test(q);

  const [merchants, terminals, auths, disputes, settlements, reconFiles] =
    await Promise.all([
      safe(api.post('/merchants/search',     { legalNameContains: q },              { params: { size: 5 } })),
      safe(api.post('/terminals/search',     { tidContains: q },                    { params: { size: 5 } })),
      safe(api.post('/transactions/search',  {
        panMaskedContains: q,
        ...(isNumeric ? { exactAmount: parseFloat(q) } : {}),
      }, { params: { size: 5 } })),
      safe(api.post('/disputes/search',      { caseRefContains: q },                { params: { size: 5 } })),
      safe(api.post('/settlement/search',    { batchRefContains: q },               { params: { size: 5 } })),
      safe(api.post('/recon/files/search',   { fileNameContains: q },               { params: { size: 5 } })),
    ]);

  return { merchants, terminals, auths, disputes, settlements, reconFiles };
}

function emptyResults() {
  return { merchants: [], terminals: [], auths: [], disputes: [], settlements: [], reconFiles: [] };
}

export function totalCount(results) {
  if (!results) return 0;
  return Object.values(results).reduce((sum, g) => sum + (g?.length || 0), 0);
}

// Entity-to-route mapping used by both bar and page
export const ENTITY_CONFIG = [
  {
    key:      'merchants',
    label:    'Merchants',
    icon:     'bi-shop',
    route:    '/merchants',
    idField:  (item) => item.merchantId ?? item.id,
    endpoint: '/merchants/search',
    payload:  (q) => ({ legalNameContains: q }),
  },
  {
    key:      'terminals',
    label:    'Terminals',
    icon:     'bi-printer',
    route:    '/terminals',
    idField:  (item) => item.terminalId ?? item.id,
    endpoint: '/terminals/search',
    payload:  (q) => ({ tidContains: q }),
  },
  {
    key:      'auths',
    label:    'Transactions',
    icon:     'bi-receipt',
    route:    '/transactions',
    idField:  (item) => item.authId ?? item.id,
    endpoint: '/transactions/search',
    payload:  (q) => ({ panMaskedContains: q }),
  },
  {
    key:      'disputes',
    label:    'Disputes',
    icon:     'bi-chat-left-text',
    route:    '/disputes',
    idField:  (item) => item.disputeId ?? item.caseId ?? item.id,
    endpoint: '/disputes/search',
    payload:  (q) => ({ caseRefContains: q }),
  },
  {
    key:      'settlements',
    label:    'Settlements',
    icon:     'bi-bank',
    route:    '/settlement',
    idField:  (item) => item.settleBatchId ?? item.batchId ?? item.id,
    endpoint: '/settlement/search',
    payload:  (q) => ({ batchRefContains: q }),
  },
  {
    key:      'reconFiles',
    label:    'Recon Files',
    icon:     'bi-clipboard-check',
    route:    '/reconciliation',
    idField:  (item) => item.reconFileId ?? item.fileId ?? item.id,
    endpoint: '/recon/files/search',
    payload:  (q) => ({ fileNameContains: q }),
  },
];
