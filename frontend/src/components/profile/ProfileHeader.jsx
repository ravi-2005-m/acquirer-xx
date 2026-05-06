import { getRoleConfig } from '../../utils/roles';
import StatusBadge from '../StatusBadge';
import { formatDate } from '../../utils/formatters';

function ProfileHeader({ profile }) {
  if (!profile) return null;

  const roleConfig = getRoleConfig(profile.role);
  const fullName   = profile.name || profile.username;
  const initials   = fullName.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: '64px', height: '64px', fontSize: '1.4rem' }}
          >
            {initials || '?'}
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <h5 className="mb-0">{fullName}</h5>
              <span className={`badge ${roleConfig.color}`}>{roleConfig.label}</span>
              {profile.status && <StatusBadge status={profile.status} />}
            </div>
            <div className="text-muted small">
              <span className="font-monospace">{profile.username}</span>
              {profile.email && <> · {profile.email}</>}
            </div>
            {profile.createdAt && (
              <div className="text-muted small">Member since {formatDate(profile.createdAt)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
