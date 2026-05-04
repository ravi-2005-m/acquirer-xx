function EmptyState({
  icon = 'bi-inbox',
  title = 'Nothing here yet',
  message = 'There are no items to display.',
  actionLabel = null,
  onAction = null,
}) {
  return (
    <div className="text-center py-5">
      <i className={`bi ${icon} text-muted`} style={{ fontSize: '3rem' }}></i>
      <h6 className="mt-3 mb-1">{title}</h6>
      <p className="text-muted small mb-3">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          <i className="bi bi-plus-circle me-1"></i>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
