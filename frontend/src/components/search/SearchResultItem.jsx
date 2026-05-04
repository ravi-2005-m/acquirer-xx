function describe(key, item) {
  switch (key) {
    case 'merchants':
      return {
        primary:   item.legalName || `Merchant #${item.merchantId ?? item.id}`,
        secondary: item.mid ? `MID: ${item.mid}` : null,
        badge:     item.status ? { label: item.status, cls: badgeCls(item.status) } : null,
      };
    case 'terminals':
      return {
        primary:   item.tid || `Terminal #${item.terminalId ?? item.id}`,
        secondary: item.brandModel || null,
        badge:     item.status ? { label: item.status, cls: badgeCls(item.status) } : null,
      };
    case 'auths':
      return {
        primary:   [item.panMasked, item.amount != null ? `₹${Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : null].filter(Boolean).join(' · ') || 'Transaction',
        secondary: item.authCode ? `Auth: ${item.authCode}` : null,
        badge:     item.responseCode
          ? { label: item.responseCode === '00' ? 'APPROVED' : 'DECLINED', cls: item.responseCode === '00' ? 'bg-success' : 'bg-danger' }
          : null,
      };
    case 'disputes':
      return {
        primary:   item.caseRef || `Dispute #${item.disputeId ?? item.caseId ?? item.id}`,
        secondary: item.reasonCode || null,
        badge:     item.stage ? { label: item.stage, cls: 'bg-warning text-dark' } : null,
      };
    case 'settlements':
      return {
        primary:   item.batchRef || `Batch #${item.settleBatchId ?? item.batchId ?? item.id}`,
        secondary: item.merchantName || null,
        badge:     item.status ? { label: item.status, cls: badgeCls(item.status) } : null,
      };
    case 'reconFiles':
      return {
        primary:   item.fileName || `File #${item.reconFileId ?? item.fileId ?? item.id}`,
        secondary: item.rowCount != null ? `${item.rowCount} rows` : null,
        badge:     item.status ? { label: item.status, cls: 'bg-secondary' } : null,
      };
    default:
      return { primary: '—', secondary: null, badge: null };
  }
}

function badgeCls(status) {
  const s = (status || '').toUpperCase();
  if (['ACTIVE', 'APPROVED', 'SETTLED', 'PAID'].includes(s)) return 'bg-success';
  if (['PENDING', 'OPEN', 'IN_PROGRESS'].includes(s))         return 'bg-warning text-dark';
  if (['INACTIVE', 'CLOSED', 'DECLINED', 'FAILED'].includes(s)) return 'bg-secondary';
  return 'bg-info';
}

function SearchResultItem({ entityKey, item, url, highlighted, onSelect }) {
  const { primary, secondary, badge } = describe(entityKey, item);

  return (
    <li
      className={`ax-search-item px-3 py-2 d-flex justify-content-between align-items-center border-bottom ${highlighted ? 'bg-primary-subtle' : ''}`}
      style={{ cursor: 'pointer', listStyle: 'none' }}
      onClick={() => onSelect(url)}
    >
      <div className="d-flex flex-column min-w-0 me-2">
        <span className="small fw-semibold text-truncate">{primary}</span>
        {secondary && <span className="small text-muted text-truncate">{secondary}</span>}
      </div>
      {badge && (
        <span className={`badge ${badge.cls} flex-shrink-0`} style={{ fontSize: '0.65rem' }}>
          {badge.label}
        </span>
      )}
    </li>
  );
}

export default SearchResultItem;
