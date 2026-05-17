import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const actions = [
  { label: '+ New Merchant',      to: '/merchants',       icon: 'bi-plus-circle',    roles: ['ADMIN', 'MERCHANT_OPS'] },
  { label: 'View Transactions',   to: '/transactions',    icon: 'bi-receipt',        roles: ['ADMIN', 'MERCHANT_OPS', 'RISK'] },
  { label: 'Open Disputes',       to: '/disputes',        icon: 'bi-chat-left-text', roles: ['ADMIN', 'DISPUTES'] },
  { label: 'Pending Settlements', to: '/settlement',      icon: 'bi-bank',           roles: ['ADMIN', 'RECON'] },
  { label: 'Recon Alerts',        to: '/reconciliation',  icon: 'bi-clipboard-check',roles: ['ADMIN', 'RECON'] },
  { label: 'Risk Reviews',        to: '/risk',            icon: 'bi-shield-check',   roles: ['ADMIN', 'RISK'] },
];

function QuickActions({ onRefresh }) {
  const { user } = useAuth();

  const visible = actions.filter(a => user?.role && a.roles.includes(user.role));

  if (visible.length === 0) return null;

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h6 className="card-subtitle text-muted text-uppercase small fw-semibold mb-3">
          Quick Actions
        </h6>
        <div className="d-flex flex-wrap gap-2">
          {visible.map(a => (
            <Link key={a.to} to={a.to} className="btn btn-outline-primary btn-sm">
              <i className={`bi ${a.icon} me-1`}></i>
              {a.label}
            </Link>
          ))}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn btn-outline-secondary btn-sm ms-auto"
              title="Refresh stats"
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuickActions;
