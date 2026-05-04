import { useLocation } from 'react-router-dom';

function StubPage({ title, icon, plannedModule }) {
  const location = useLocation();

  return (
    <div className="container-fluid p-4">
      <h3 className="mb-3">
        {icon && <i className={`bi ${icon} me-2`}></i>}
        {title}
      </h3>
      <div className="alert alert-warning">
        <i className="bi bi-tools me-2"></i>
        This page is a placeholder. Will be built in Module {plannedModule}.
      </div>
      <p className="text-muted small mb-0">
        Current path: <code>{location.pathname}</code>
      </p>
    </div>
  );
}

export default StubPage;
