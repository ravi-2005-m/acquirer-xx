function ErrorAlert({
  error,
  onRetry = null,
  title = 'Something went wrong',
  dismissible = false,
  onDismiss = null,
}) {
  const message =
    typeof error === 'string'
      ? error
      : error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'An unknown error occurred';

  return (
    <div className="alert alert-danger d-flex align-items-start" role="alert">
      <i className="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
      <div className="flex-grow-1">
        {title && <div className="fw-semibold">{title}</div>}
        <div className="small">{message}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn btn-sm btn-outline-danger mt-2"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Try again
          </button>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          className="btn-close ms-2"
          onClick={onDismiss}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
}

export default ErrorAlert;
