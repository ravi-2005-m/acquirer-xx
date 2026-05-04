import { useState, useEffect } from 'react';
import { profileApi } from '../../api/profileApi';

const NOTIFICATION_CATEGORIES = ['BATCH', 'SETTLEMENT', 'DISPUTE', 'RISK', 'RECON'];
const PAGE_SIZES = [10, 20, 50];

const DEFAULT_PREFS = {
  emailNotifications: true,
  inAppNotifications: true,
  notificationCategories: { BATCH: true, SETTLEMENT: true, DISPUTE: true, RISK: true, RECON: true },
  defaultPageSize: 10,
};

function PreferencesForm({ initialPreferences, onUpdated }) {
  const [prefs, setPrefs]     = useState(DEFAULT_PREFS);
  const [original, setOriginal] = useState(DEFAULT_PREFS);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (initialPreferences) {
      const merged = {
        ...DEFAULT_PREFS,
        ...initialPreferences,
        notificationCategories: {
          ...DEFAULT_PREFS.notificationCategories,
          ...(initialPreferences.notificationCategories || {}),
        },
      };
      setPrefs(merged);
      setOriginal(merged);
    }
  }, [initialPreferences]);

  const isDirty = JSON.stringify(prefs) !== JSON.stringify(original);

  const setField = (k, v) => setPrefs(prev => ({ ...prev, [k]: v }));
  const setCategory = (cat, val) =>
    setPrefs(prev => ({ ...prev, notificationCategories: { ...prev.notificationCategories, [cat]: val } }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await profileApi.updateMyPreferences(prefs);
      const updated = res.data?.data ?? res.data;
      setOriginal(prefs);
      setSuccess(true);
      onUpdated(updated);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h6 className="text-muted fw-semibold mb-3">Preferences</h6>

        {error   && <div className="alert alert-danger  py-2 small">{error}</div>}
        {success && <div className="alert alert-success py-2 small"><i className="bi bi-check-circle me-1"></i>Preferences saved.</div>}

        {/* Notifications */}
        <div className="mb-4">
          <div className="fw-semibold small mb-2">Notifications</div>
          <div className="form-check form-switch mb-2">
            <input
              type="checkbox"
              className="form-check-input"
              id="email-notif"
              checked={prefs.emailNotifications}
              onChange={e => setField('emailNotifications', e.target.checked)}
            />
            <label className="form-check-label small" htmlFor="email-notif">Email notifications</label>
          </div>
          <div className="form-check form-switch mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="inapp-notif"
              checked={prefs.inAppNotifications}
              onChange={e => setField('inAppNotifications', e.target.checked)}
            />
            <label className="form-check-label small" htmlFor="inapp-notif">In-app notifications</label>
          </div>

          <div className="text-muted small mb-2">Notify me about:</div>
          <div className="d-flex flex-wrap gap-2">
            {NOTIFICATION_CATEGORIES.map(cat => (
              <div key={cat} className="form-check form-switch mb-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`cat-${cat}`}
                  checked={prefs.notificationCategories?.[cat] ?? true}
                  onChange={e => setCategory(cat, e.target.checked)}
                />
                <label className="form-check-label small" htmlFor={`cat-${cat}`}>{cat}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Display */}
        <div className="mb-0">
          <div className="fw-semibold small mb-2">Display</div>
          <label className="form-label small">Default page size</label>
          <div className="d-flex gap-2">
            {PAGE_SIZES.map(n => (
              <div key={n} className="form-check">
                <input
                  type="radio"
                  className="form-check-input"
                  id={`pg-${n}`}
                  name="pageSize"
                  checked={prefs.defaultPageSize === n}
                  onChange={() => setField('defaultPageSize', n)}
                />
                <label className="form-check-label small" htmlFor={`pg-${n}`}>{n}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !isDirty}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
          {isDirty && (
            <button className="btn btn-link" onClick={() => setPrefs(original)} disabled={saving}>
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreferencesForm;
