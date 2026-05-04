import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userApi } from '../../api/userApi';
import StatusBadge from '../../components/StatusBadge';
import UserProfileTab from './tabs/UserProfileTab';
import UserAuditTab from './tabs/UserAuditTab';

function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('profile');

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.getUserById(id);
      setUser(res.data?.data ?? res.data ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadUser(); }, [loadUser]);

  if (loading) {
    return (
      <div className="container-fluid p-4 text-center py-5">
        <div className="spinner-border text-secondary" role="status"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-warning">User not found.</div>
        <Link to="/admin/users" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i>Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
        <Link to="/admin/users" className="btn btn-link text-muted text-decoration-none p-0 me-1">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <h4 className="mb-0">
          <i className="bi bi-person me-2"></i>{user.username}
        </h4>
        <StatusBadge status={user.status} />
        <span className="badge bg-secondary ms-1">{user.role?.replace('_', ' ')}</span>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {[
          { key: 'profile', icon: 'bi-person',       label: 'Profile' },
          { key: 'audit',   icon: 'bi-clock-history', label: 'Audit Log' },
        ].map((t) => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <i className={`bi ${t.icon} me-1`}></i>{t.label}
            </button>
          </li>
        ))}
      </ul>

      {tab === 'profile' && (
        <UserProfileTab user={user} onUserUpdated={loadUser} />
      )}
      {tab === 'audit' && (
        <UserAuditTab username={user.username} />
      )}
    </div>
  );
}

export default UserDetailPage;
