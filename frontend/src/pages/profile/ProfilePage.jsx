import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../../api/profileApi';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileInfoForm from '../../components/profile/ProfileInfoForm';
import ChangePasswordForm from '../../components/profile/ChangePasswordForm';
import PreferencesForm from '../../components/profile/PreferencesForm';
import LoginHistoryPanel from '../../components/profile/LoginHistoryPanel';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

const TABS = [
  { key: 'profile',  label: 'Profile',        icon: 'bi-person'        },
  { key: 'security', label: 'Security',        icon: 'bi-shield-lock'   },
  { key: 'prefs',    label: 'Preferences',     icon: 'bi-sliders'       },
  { key: 'history',  label: 'Login History',   icon: 'bi-clock-history' },
];

function ProfilePage() {
  const { user } = useAuth();

  const [tab, setTab] = useState('profile');

  const [profile, setProfile]       = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError]     = useState(null);

  const [prefs, setPrefs]             = useState(null);
  const [prefsLoading, setPrefsLoading] = useState(false);

  const [history, setHistory]         = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  const loadPrefs = useCallback(async () => {
    setPrefsLoading(true);
    try {
      const res = await profileApi.getMyPreferences();
      setPrefs(res.data?.data ?? res.data ?? null);
    } catch {
      setPrefs(null);
    } finally {
      setPrefsLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await profileApi.getMyLoginHistory({ size: 30 });
      setHistory(res.data?.data ?? res.data ?? null);
    } catch {
      setHistory(null);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  useEffect(() => {
    if (tab === 'prefs'   && prefs    === null) loadPrefs();
    if (tab === 'history' && history  === null) loadHistory();
  }, [tab, prefs, history, loadPrefs, loadHistory]);

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
        <p className="text-muted small mb-0">Manage your account information and preferences</p>
      </div>

      <ProfileHeader profile={profile} />

      {/* Tabs */}
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

      {tab === 'prefs' && (
        prefsLoading
          ? <div className="text-center py-5"><div className="spinner-border spinner-border-sm text-secondary" role="status"></div></div>
          : <PreferencesForm
              initialPreferences={prefs}
              onUpdated={(updated) => setPrefs(prev => ({ ...prev, ...updated }))}
            />
      )}

      {tab === 'history' && (
        <LoginHistoryPanel history={history} loading={historyLoading} />
      )}
    </div>
  );
}

export default ProfilePage;
