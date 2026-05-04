function TxnTypeBadge({ type, size = 'md' }) {
  const upper = (type || '').toUpperCase();

  const config = {
    SALE: { color: 'primary', icon: 'bi-cart-check', label: 'Sale' },
    REFUND: { color: 'info', icon: 'bi-arrow-counterclockwise', label: 'Refund' },
    VOID: { color: 'secondary', icon: 'bi-slash-circle', label: 'Void' },
    REVERSAL: { color: 'warning', icon: 'bi-arrow-left-right', label: 'Reversal' },
  }[upper] || { color: 'secondary', icon: null, label: type || '—' };

  const sizeClass = size === 'sm' ? 'small' : '';

  return (
    <span className={`badge bg-${config.color} ${sizeClass}`}>
      {config.icon && <i className={`bi ${config.icon} me-1`}></i>}
      {config.label}
    </span>
  );
}

export default TxnTypeBadge;
