import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ALL_ROLES = ['ADMIN', 'MERCHANT_OPS', 'POS_OPS', 'RISK', 'DISPUTES', 'RECON'];

const mainItems = [
  { to: '/dashboard',      icon: 'bi-speedometer2',    label: 'Dashboard',      roles: ALL_ROLES },
  { to: '/merchants',      icon: 'bi-people',           label: 'Merchants',      roles: ['ADMIN', 'MERCHANT_OPS'] },
  { to: '/stores',         icon: 'bi-shop',             label: 'Stores',         roles: ['ADMIN', 'MERCHANT_OPS'] },
  { to: '/terminals',      icon: 'bi-printer',          label: 'Terminals',      roles: ['ADMIN', 'POS_OPS'] },
  { to: '/transactions',   icon: 'bi-receipt',          label: 'Transactions',   roles: ['ADMIN', 'MERCHANT_OPS', 'RISK'] },
  { to: '/admin/fee-rules',icon: 'bi-percent',          label: 'Fee Rules',      roles: ['ADMIN'] },
  { to: '/risk',           icon: 'bi-shield-check',     label: 'Risk',           roles: ['ADMIN', 'RISK'] },
  { to: '/disputes',       icon: 'bi-chat-left-text',   label: 'Disputes',       roles: ['ADMIN', 'DISPUTES'] },
  { to: '/settlement',     icon: 'bi-bank',             label: 'Settlements',    roles: ['ADMIN', 'RECON'] },
  { to: '/reconciliation', icon: 'bi-clipboard-check',  label: 'Reconciliation', roles: ['ADMIN', 'RECON'] },
  { to: '/reports',        icon: 'bi-graph-up',         label: 'Reports',        roles: ['ADMIN', 'MERCHANT_OPS', 'RECON'] },
];

const systemItems = [
  { to: '/notifications',  icon: 'bi-bell',             label: 'Notifications',  roles: ALL_ROLES },
  { to: '/admin/users',    icon: 'bi-person-gear',      label: 'User Management',roles: ['ADMIN'] },
];

function Sidebar({ show, onClose }) {
  const { user } = useAuth();

  const visible = (items) =>
    items.filter(item => user?.role && item.roles.includes(user.role));

  return (
    <>
      {show && (
        <div
          className="d-md-none"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1040,
          }}
        />
      )}

      <aside className={`ax-sidebar${show ? ' ax-sidebar--open' : ''}`}>
        <nav style={{ padding: '0.75rem 0 1rem' }}>

          <div className="ax-nav-section">Main</div>
          {visible(mainItems).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) => `ax-nav-link${isActive ? ' active' : ''}`}
            >
              <i className={`bi ${item.icon}`}></i>
              {item.label}
            </NavLink>
          ))}

          {visible(systemItems).length > 0 && (
            <>
              <div className="ax-nav-section" style={{ marginTop: '1rem' }}>System</div>
              {visible(systemItems).map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) => `ax-nav-link${isActive ? ' active' : ''}`}
                >
                  <i className={`bi ${item.icon}`}></i>
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
