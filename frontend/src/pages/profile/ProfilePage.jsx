import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '../../api/profileApi';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileInfoForm from '../../components/profile/ProfileInfoForm';
import ChangePasswordForm from '../../components/profile/ChangePasswordForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

const TABS = [
  { key: 'profile',  label: 'Profile',  icon: 'bi-person'      },
  { key: 'security', label: 'Security', icon: 'bi-shield-lock' },
];

function ProfilePage() {
  const [tab, setTab] = useState('profile');

  const [profile, setProfile]               = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError]     = useState(null);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await profileApi.getMyProfile();
      setProfile(res.data?.data ?? res.data ?? null);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  if (profileLoading) {
    return <div className="container-fluid p-4"><LoadingSpinner text="Loading profile..." /></div>;
  }

  if (profileError) {
    return (
      <div className="container-fluid p-4">
        <ErrorAlert error={profileError} title="Failed to load profile" />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <h3 className="mb-1"><i className="bi bi-person-circle me-2"></i>My Profile</h3>
        <p className="text-muted small mb-0">Manage your account information</p>
      </div>

      <ProfileHeader profile={profile} />

      <ul className="nav nav-tabs mb-3">
        {TABS.map(t => (
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
        <ProfileInfoForm
          profile={profile}
          onUpdated={(updated) => setProfile(prev => ({ ...prev, ...updated }))}
        />
      )}

      {tab === 'security' && <ChangePasswordForm />}
    </div>
  );
}

export default ProfilePage;
