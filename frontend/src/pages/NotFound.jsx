import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-4 text-muted mb-3">404</h1>
      <h4 className="mb-3">Page Not Found</h4>
      <p className="text-muted mb-4">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn btn-primary">
        <i className="bi bi-house me-1"></i>
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;
