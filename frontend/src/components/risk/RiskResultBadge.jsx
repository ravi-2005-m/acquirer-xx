function RiskResultBadge({ result }) {
  const upper = (result || '').toUpperCase();
  const config = {
    ALLOW:  { color: 'success', icon: 'bi-check-circle-fill',    label: 'Allow'  },
    REVIEW: { color: 'warning', icon: 'bi-exclamation-triangle-fill', label: 'Review' },
    BLOCK:  { color: 'danger',  icon: 'bi-x-circle-fill',        label: 'Block'  },
  }[upper] || { color: 'secondary', icon: 'bi-question-circle', label: upper || '—' };

  return (
    <span className={`badge bg-${config.color}`}>
      <i className={`bi ${config.icon} me-1`}></i>
      {config.label}
    </span>
  );
}

export default RiskResultBadge;
