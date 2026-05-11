import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import GlobalSearchBar from './search/GlobalSearchBar';

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="ax-navbar">
      {/* Left — hamburger + brand */}
      <div className="d-flex align-items-center gap-3 flex-shrink-0">
        <button
          className="btn btn-sm d-md-none"
          style={{ color: 'var(--ax-text-muted)', border: '1px solid var(--ax-card-border)' }}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <Link to="/dashboard" className="ax-brand">
          <i className="bi bi-credit-card-2-front text-primary" style={{ fontSize: '1.2rem' }}></i>
          AcquirerX
        </Link>
      </div>

      {/* Centre — global search */}
      <div className="d-none d-md-flex flex-grow-1 justify-content-center px-4">
        <GlobalSearchBar />
      </div>

      {/* Right — theme toggle, bell, user, logout */}
      <div className="d-flex align-items-center gap-2">
        <button
          className="ax-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
        </button>

        <NotificationBell />

        {user && (
          <>
            <Link to="/profile" className="ax-nav-text d-none d-md-inline">
              {user.fullName || user.username}
            </Link>
            <span
              className="badge text-uppercase fw-semibold"
              style={{
                backgroundColor: 'var(--ax-sidebar-active-bg)',
                color: 'var(--ax-sidebar-active-text)',
              }}
            >
              {user.role}
            </span>
          </>
        )}

        <button
          className="btn btn-sm"
          style={{
            color: 'var(--ax-text-muted)',
            border: '1px solid var(--ax-card-border)',
            borderRadius: '6px',
          }}
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-1"></i>
          <span className="d-none d-md-inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
