function StatusBadge({ status, size = 'md' }) {
  const config = getStatusConfig(status);
  const sizeClass = size === 'sm' ? 'small' : '';

  return (
    <span className={`badge bg-${config.color} ${sizeClass}`}>
      {config.icon && <i className={`bi ${config.icon} me-1`}></i>}
      {config.label}
    </span>
  );
}

function getStatusConfig(status) {
  const upper = (status || '').toUpperCase();

  switch (upper) {
    case 'ACTIVE':
      return { color: 'success', icon: 'bi-check-circle', label: 'Active' };
    case 'INACTIVE':
      return { color: 'secondary', icon: 'bi-pause-circle', label: 'Inactive' };
    case 'PENDING':
      return { color: 'warning', icon: 'bi-clock', label: 'Pending' };
    case 'SUSPENDED':
      return { color: 'danger', icon: 'bi-slash-circle', label: 'Suspended' };
    case 'APPROVED':
      return { color: 'success', icon: 'bi-check-circle', label: 'Approved' };
    case 'REJECTED':
    case 'DECLINED':
      return { color: 'danger', icon: 'bi-x-circle', label: 'Rejected' };
    case 'COMPLETED':
    case 'SUCCESS':
      return { color: 'success', icon: 'bi-check-circle', label: 'Completed' };
    case 'FAILED':
      return { color: 'danger', icon: 'bi-exclamation-circle', label: 'Failed' };
    case 'PROCESSING':
      return { color: 'info', icon: 'bi-arrow-repeat', label: 'Processing' };
    case 'CANCELLED':
    case 'VOIDED':
      return { color: 'secondary', icon: 'bi-x-circle', label: 'Cancelled' };
    case 'REFUNDED':
      return { color: 'info', icon: 'bi-arrow-counterclockwise', label: 'Refunded' };
    case 'OPEN':
      return { color: 'primary', icon: 'bi-circle', label: 'Open' };
    case 'CLOSED':
      return { color: 'secondary', icon: 'bi-check-circle', label: 'Closed' };
    default:
      return { color: 'secondary', icon: null, label: status || 'Unknown' };
  }
}

export default StatusBadge;
