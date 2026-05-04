function StatsCard({
  icon,
  label,
  value,
  color = 'primary',
  loading = false,
  error = null,
  subtitle = null,
}) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <span className="text-muted small fw-semibold text-uppercase">{label}</span>
          <span className={`text-${color}`}>
            <i className={`bi ${icon}`} style={{ fontSize: '1.5rem' }}></i>
          </span>
        </div>

        {loading && (
          <div className="d-flex align-items-center text-muted small py-1">
            <div
              className="spinner-border spinner-border-sm me-2"
              role="status"
            ></div>
            Loading...
          </div>
        )}

        {error && (
          <div className="text-danger small py-1">
            <i className="bi bi-exclamation-triangle me-1"></i>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <h3 className="mb-0 fw-bold">
              {value != null ? Number(value).toLocaleString() : '—'}
            </h3>
            {subtitle && (
              <p className="text-muted small mb-0 mt-1">{subtitle}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
