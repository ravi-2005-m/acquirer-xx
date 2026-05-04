import { Link } from 'react-router-dom';

function Forbidden() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-4 text-muted mb-3">403</h1>
      <h4 className="mb-3">Access Forbidden</h4>
      <p className="text-muted mb-4">
        You don't have permission to view this page.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        <i className="bi bi-house me-1"></i>
        Back to Dashboard
      </Link>
    </div>
  );
}

export default Forbidden;
