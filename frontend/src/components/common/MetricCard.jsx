import { formatINR, formatNumber } from '../../utils/formatters';

function MetricCard({
  title,
  value,
  format = 'number',
  icon,
  trend,
  color = 'primary',
  loading = false,
}) {
  const display = (v) => {
    if (v === null || v === undefined) return '—';
    if (format === 'currency')         return formatINR(v);
    if (format === 'compact-currency') return formatINR(v, { compact: true });
    return formatNumber(v);
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="card-subtitle text-muted mb-0 small">{title}</h6>
          {icon && <span style={{ fontSize: '1.4rem', opacity: 0.75 }}>{icon}</span>}
        </div>

        {loading ? (
          <div className="d-flex align-items-center gap-2 mt-3">
            <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
            <span className="text-muted small">Loading...</span>
          </div>
        ) : (
          <>
            <div className={`fw-bold fs-4 text-${color} mt-2 mb-1`}>{display(value)}</div>
            {trend && (
              <div className="small">
                <span className={trend.delta >= 0 ? 'text-success' : 'text-danger'}>
                  {trend.delta >= 0 ? '↑' : '↓'} {Math.abs(trend.delta)}{trend.isPercent ? '%' : ''}
                </span>
                <span className="text-muted ms-1">vs {trend.comparedTo || 'previous'}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MetricCard;
