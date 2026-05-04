function HeartbeatBadge({ lastSeenAt, lastSeen }) {
  const ts = lastSeenAt || lastSeen;

  if (!ts) {
    return <span className="badge bg-secondary">Never seen</span>;
  }

  const diffMinutes = (Date.now() - new Date(ts).getTime()) / 60000;

  let label, color;
  if (diffMinutes < 5) {
    label = 'Online';
    color = 'bg-success';
  } else if (diffMinutes < 30) {
    label = `Idle ${Math.floor(diffMinutes)}m`;
    color = 'bg-warning text-dark';
  } else {
    label = `Offline ${formatDur(diffMinutes)}`;
    color = 'bg-danger';
  }

  return <span className={`badge ${color}`}>{label}</span>;
}

function formatDur(minutes) {
  if (minutes < 60)   return `${Math.floor(minutes)}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

export default HeartbeatBadge;
