function RiskBadge({ level }) {
  const upper = (level || '').toUpperCase();

  const config = {
    LOW: { color: 'success', icon: 'bi-shield-check', label: 'Low' },
    MEDIUM: { color: 'warning', icon: 'bi-shield-exclamation', label: 'Medium' },
    HIGH: { color: 'danger', icon: 'bi-shield-fill-exclamation', label: 'High' },
    CRITICAL: { color: 'dark', icon: 'bi-shield-fill-x', label: 'Critical' },
  }[upper] || { color: 'secondary', icon: null, label: level || '—' };

  return (
    <span className={`badge bg-${config.color} small`}>
      {config.icon && <i className={`bi ${config.icon} me-1`}></i>}
      {config.label}
    </span>
  );
}

export default RiskBadge;
