import { useState, useEffect } from 'react';

function DeadlineCountdown({ deadline, className = '' }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!deadline) return;

    const compute = () => {
      const diff = new Date(deadline) - Date.now();
      setRemaining(diff);
    };

    compute();
    const timer = setInterval(compute, 60_000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (!deadline || remaining === null) return null;

  const isExpired  = remaining <= 0;
  const hours      = Math.floor(Math.abs(remaining) / 3_600_000);
  const minutes    = Math.floor((Math.abs(remaining) % 3_600_000) / 60_000);
  const days       = Math.floor(hours / 24);
  const remHours   = hours % 24;

  let label, colorClass;

  if (isExpired) {
    label = 'Deadline passed';
    colorClass = 'text-danger';
  } else if (hours < 24) {
    label = `${hours}h ${minutes}m left`;
    colorClass = 'text-danger';
  } else if (days <= 2) {
    label = `${days}d ${remHours}h left`;
    colorClass = 'text-warning';
  } else {
    label = `${days}d ${remHours}h left`;
    colorClass = 'text-success';
  }

  return (
    <span className={`${colorClass} small fw-semibold ${className}`}>
      <i className="bi bi-clock me-1"></i>{label}
    </span>
  );
}

export default DeadlineCountdown;
