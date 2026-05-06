import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ALL_ROLES = ['ADMIN', 'MERCHANT_OPS', 'POS_OPS', 'RISK', 'DISPUTES', 'RECON'];

const navItems = [
  { to: '/dashboard',      icon: 'bi-speedometer2',   label: 'Dashboard',       roles: ALL_ROLES },
  { to: '/merchants',      icon: 'bi-people',          label: 'Merchants',       roles: ['ADMIN', 'MERCHANT_OPS'] },
  { to: '/stores',         icon: 'bi-shop',            label: 'Stores',          roles: ['ADMIN', 'MERCHANT_OPS'] },
  { to: '/terminals',      icon: 'bi-printer',         label: 'Terminals',       roles: ['ADMIN', 'POS_OPS'] },
  { to: '/transactions',   icon: 'bi-receipt',         label: 'Transactions',    roles: ['ADMIN', 'MERCHANT_OPS', 'RISK'] },
  { to: '/risk',           icon: 'bi-shield-check',    label: 'Risk',            roles: ['ADMIN', 'RISK'] },
  { to: '/disputes',       icon: 'bi-chat-left-text',  label: 'Disputes',        roles: ['ADMIN', 'DISPUTES'] },
  { to: '/settlement',     icon: 'bi-bank',            label: 'Settlements',     roles: ['ADMIN', 'RECON'] },
  { to: '/reconciliation', icon: 'bi-clipboard-check', label: 'Reconciliation',  roles: ['ADMIN', 'RECON'] },
  { to: '/reports',        icon: 'bi-graph-up',        label: 'Reports',         roles: ['ADMIN', 'MERCHANT_OPS', 'RECON'] },
  { to: '/notifications',  icon: 'bi-bell',            label: 'Notifications',   roles: ALL_ROLES },
];

const adminItems = [
  { to: '/admin/users',      icon: 'bi-person-gear', label: 'User Management', roles: ['ADMIN'] },
  { to: '/admin/fee-rules',  icon: 'bi-percent',     label: 'Fee Rules',       roles: ['ADMIN'] },
];

function Sidebar({ show, onClose }) {
  const { user } = useAuth();

  const visibleNav = navItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  );
  const visibleAdmin = adminItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Dark overlay — mobile only, closes sidebar on tap */}
      {show && (
        <div
          className="d-md-none"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 1040,
          }}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`ax-sidebar bg-white border-end${show ? ' ax-sidebar--open' : ''}`}
      >
        <nav className="nav flex-column p-3">
          <div className="text-muted text-uppercase small fw-bold mb-2 px-2">
            Main
          </div>

          {visibleNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center px-2 py-2 mb-1 rounded ${
                  isActive ? 'bg-primary-subtle text-primary fw-semibold' : 'text-dark'
                }`
              }
            >
              <i className={`bi ${item.icon} me-2`}></i>
              {item.label}
            </NavLink>
          ))}

          {visibleAdmin.length > 0 && (
            <>
              <div className="text-muted text-uppercase small fw-bold mt-3 mb-2 px-2">
                Administration
              </div>
              {visibleAdmin.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center px-2 py-2 mb-1 rounded ${
                      isActive ? 'bg-primary-subtle text-primary fw-semibold' : 'text-dark'
                    }`
                  }
                >
                  <i className={`bi ${item.icon} me-2`}></i>
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
