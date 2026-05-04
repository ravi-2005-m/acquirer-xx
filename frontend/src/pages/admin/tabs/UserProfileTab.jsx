import { useState } from 'react';
import StatusBadge from '../../../components/StatusBadge';
import ConfirmModal from '../../../components/ConfirmModal';
import ChangeRoleModal from '../../../components/admin/ChangeRoleModal';
import { userApi } from '../../../api/userApi';
import { toast } from '../../../utils/toast';

function Row({ label, value }) {
  return (
    <div className="row mb-2">
      <div className="col-4 text-muted small fw-semibold">{label}</div>
      <div className="col-8 small">{value ?? '—'}</div>
    </div>
  );
}

export default function UserProfileTab({ user, onUserUpdated }) {
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [acting, setActing] = useState(false);

  const isActive = user.status === 'ACTIVE';

  const handleToggleStatus = async () => {
    setActing(true);
    try {
      if (isActive) {
        await userApi.deactivate(user.userId);
        toast.success(`${user.username} deactivated`);
      } else {
        await userApi.reactivate(user.userId);
        toast.success(`${user.username} reactivated`);
      }
      onUserUpdated();
    } catch {
      // interceptor handles toast
    } finally {
      setActing(false);
      setConfirmToggle(false);
    }
  };

  const handleChangeRole = async (newRole) => {
    await userApi.changeRole(user.userId, newRole);
    toast.success(`Role changed to ${newRole}`);
    setShowRoleModal(false);
    onUserUpdated();
  };

  return (
    <div className="row g-4">
      <div className="col-md-7">
        <div className="card">
          <div className="card-header bg-white">
            <span className="fw-semibold small"><i className="bi bi-person me-2"></i>User Info</span>
          </div>
          <div className="card-body">
            <Row label="User ID"    value={user.userId} />
            <Row label="Username"   value={user.username} />
            <Row label="Email"      value={user.email} />
            <Row label="Role"       value={user.role?.replace('_', ' ')} />
            <Row label="Status"     value={<StatusBadge status={user.status} />} />
            <Row label="Created At" value={user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'} />
          </div>
        </div>
      </div>

      <div className="col-md-5">
        <div className="card">
          <div className="card-header bg-white">
            <span className="fw-semibold small"><i className="bi bi-sliders me-2"></i>Actions</span>
          </div>
          <div className="card-body d-flex flex-column gap-2">
            <button
              className={`btn btn-sm ${isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
              onClick={() => setConfirmToggle(true)}
              disabled={acting}
            >
              <i className={`bi ${isActive ? 'bi-slash-circle' : 'bi-check-circle'} me-2`}></i>
              {isActive ? 'Deactivate User' : 'Activate User'}
            </button>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowRoleModal(true)}
            >
              <i className="bi bi-person-gear me-2"></i>Change Role
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={confirmToggle}
        title={isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${user.username}?`}
        confirmLabel={isActive ? 'Deactivate' : 'Activate'}
        confirmVariant={isActive ? 'warning' : 'success'}
        onConfirm={handleToggleStatus}
        onClose={() => setConfirmToggle(false)}
      />

      <ChangeRoleModal
        show={showRoleModal}
        user={user}
        onClose={() => setShowRoleModal(false)}
        onSaved={handleChangeRole}
      />
    </div>
  );
}
