import { Link } from 'react-router-dom';
import StatusBadge from '../StatusBadge';

function RoleBadge({ role }) {
  const map = {
    ADMIN:        'bg-danger',
    MERCHANT_OPS: 'bg-primary',
    POS_OPS:      'bg-info text-dark',
    RISK:         'bg-warning text-dark',
    DISPUTES:     'bg-secondary',
    RECON:        'bg-success',
  };
  return (
    <span className={`badge ${map[role] ?? 'bg-secondary'}`}>
      {role?.replace('_', ' ')}
    </span>
  );
}

export default function UserTable({ users, loading, onToggleStatus, onChangeRole }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <div className="text-muted small mt-2">Loading users…</div>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-people fs-2 d-block mb-2 opacity-25"></i>
        No users found.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0 small">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userId}>
              <td className="text-muted">{u.userId}</td>
              <td className="fw-semibold">{u.username}</td>
              <td className="text-muted">{u.email || '—'}</td>
              <td><RoleBadge role={u.role} /></td>
              <td><StatusBadge status={u.status} /></td>
              <td className="text-muted">
                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
              </td>
              <td className="text-end">
                <div className="d-flex gap-1 justify-content-end">
                  <Link
                    to={`/admin/users/${u.userId}`}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    <i className="bi bi-eye"></i>
                  </Link>
                  <button
                    className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    onClick={() => onToggleStatus(u)}
                    title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  >
                    <i className={`bi ${u.status === 'ACTIVE' ? 'bi-slash-circle' : 'bi-check-circle'}`}></i>
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => onChangeRole(u)}
                    title="Change Role"
                  >
                    <i className="bi bi-person-gear"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
