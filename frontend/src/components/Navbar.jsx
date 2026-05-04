import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import GlobalSearchBar from './search/GlobalSearchBar';

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className="navbar bg-white border-bottom px-3 d-flex justify-content-between align-items-center"
      style={{ height: '60px', position: 'sticky', top: 0, zIndex: 1030 }}
    >
      {/* Left — hamburger (mobile only) + brand */}
      <div className="d-flex align-items-center gap-3 flex-shrink-0">
        <button
          className="btn btn-outline-secondary btn-sm d-md-none"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <Link to="/dashboard" className="navbar-brand mb-0 fw-semibold text-dark text-decoration-none">
          <i className="bi bi-credit-card-2-front me-2 text-primary"></i>
          AcquirerX
        </Link>
      </div>

      {/* Centre — global search */}
      <div className="d-none d-md-flex flex-grow-1 justify-content-center px-3">
        <GlobalSearchBar />
      </div>

      {/* Right — bell, username, role badge, logout */}
      <div className="d-flex align-items-center gap-3">
        <NotificationBell />
        {user && (
          <>
            <Link
              to="/profile"
              className="text-muted small d-none d-md-inline text-decoration-none"
            >
              {user.fullName || user.username}
            </Link>
            <span className="badge bg-primary-subtle text-primary text-uppercase fw-semibold">
              {user.role}
            </span>
          </>
        )}
        <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1"></i>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
