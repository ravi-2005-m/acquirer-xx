function LoadingSpinner({ text = 'Loading...', size = 'md', minHeight = '200px' }) {
  if (size === 'sm') {
    return (
      <span className="d-inline-flex align-items-center text-muted small">
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
        ></span>
        {text}
      </span>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight }}
    >
      <div className="text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted small mt-2 mb-0">{text}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
