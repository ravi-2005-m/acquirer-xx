const STYLES = {
  PENDING:    { bg: 'bg-secondary',          label: 'Pending',    icon: 'bi-circle' },
  INITIATED:  { bg: 'bg-info',               label: 'Initiated',  icon: 'bi-arrow-up-right' },
  PROCESSING: { bg: 'bg-primary',            label: 'Processing', icon: 'bi-arrow-repeat' },
  COMPLETED:  { bg: 'bg-success',            label: 'Completed',  icon: 'bi-check-circle' },
  FAILED:     { bg: 'bg-danger',             label: 'Failed',     icon: 'bi-x-circle' },
  REVERSED:   { bg: 'bg-warning text-dark',  label: 'Reversed',   icon: 'bi-arrow-counterclockwise' },
};

function PayoutStatusBadge({ status }) {
  const s = STYLES[status] || { bg: 'bg-light text-dark', label: status || '—', icon: 'bi-question-circle' };
  return (
    <span className={`badge ${s.bg}`}>
      <i className={`bi ${s.icon} me-1`}></i>{s.label}
    </span>
  );
}

export default PayoutStatusBadge;
