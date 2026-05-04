import { useState } from 'react';
import { profileApi } from '../../api/profileApi';

function strength(pw) {
  if (!pw) return { score: 0, label: '', color: '', pct: 0 };
  let s = 0;
  if (pw.length >= 8)                                       s++;
  if (pw.length >= 12)                                      s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw))                s++;
  if (/\d/.test(pw))                                        s++;
  if (/[^a-zA-Z0-9]/.test(pw))                             s++;
  if (s <= 1) return { score: s, label: 'Weak',   color: 'danger',  pct: 25 };
  if (s <= 2) return { score: s, label: 'Fair',   color: 'warning', pct: 50 };
  if (s <= 3) return { score: s, label: 'Good',   color: 'info',    pct: 75 };
  return      { score: s, label: 'Strong', color: 'success', pct: 100 };
}

const INIT = { currentPassword: '', newPassword: '', confirmPassword: '' };

function ChangePasswordForm() {
  const [form, setForm]       = useState(INIT);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);
  const [showPw, setShowPw]   = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const pw  = strength(form.newPassword);

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password required';
    if (!form.newPassword) errs.newPassword = 'New password required';
    else if (form.newPassword.length < 8) errs.newPassword = 'Must be at least 8 characters';
    else if (form.newPassword === form.currentPassword) errs.newPassword = 'Must differ from current password';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await profileApi.changeMyPassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      setSuccess(true);
      setForm(INIT);
      setErrors({});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const pwType = showPw ? 'text' : 'password';

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-muted fw-semibold mb-0">Change Password</h6>
          <div className="form-check form-switch mb-0">
            <input
              type="checkbox"
              className="form-check-input"
              id="show-pw"
              checked={showPw}
              onChange={e => setShowPw(e.target.checked)}
            />
            <label className="form-check-label small text-muted" htmlFor="show-pw">Show passwords</label>
          </div>
        </div>

        {error   && <div className="alert alert-danger  py-2 small">{error}</div>}
        {success && (
          <div className="alert alert-success py-2 small">
            <i className="bi bi-check-circle me-1"></i>Password changed. Use your new password next time you log in.
          </div>
        )}

        <div className="mb-3">
          <label className="form-label small fw-semibold">Current Password <span className="text-danger">*</span></label>
          <input
            type={pwType}
            autoComplete="current-password"
            className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
            value={form.currentPassword}
            onChange={e => set('currentPassword', e.target.value)}
          />
          {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">New Password <span className="text-danger">*</span></label>
          <input
            type={pwType}
            autoComplete="new-password"
            className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
            value={form.newPassword}
            onChange={e => set('newPassword', e.target.value)}
          />
          {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}

          {form.newPassword && (
            <div className="mt-2">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Strength:</span>
                <span className={`text-${pw.color} fw-semibold`}>{pw.label}</span>
              </div>
              <div className="progress" style={{ height: '4px' }}>
                <div className={`progress-bar bg-${pw.color}`} style={{ width: `${pw.pct}%`, transition: 'width 0.3s' }} />
              </div>
              <ul className="text-muted mt-2 mb-0 ps-3" style={{ fontSize: '0.75rem' }}>
                <li className={form.newPassword.length >= 8 ? 'text-success' : ''}>At least 8 characters</li>
                <li className={/[a-z]/.test(form.newPassword) && /[A-Z]/.test(form.newPassword) ? 'text-success' : ''}>Upper &amp; lowercase mix</li>
                <li className={/\d/.test(form.newPassword) ? 'text-success' : ''}>Contains a number</li>
                <li className={/[^a-zA-Z0-9]/.test(form.newPassword) ? 'text-success' : ''}>Contains a symbol</li>
              </ul>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Confirm New Password <span className="text-danger">*</span></label>
          <input
            type={pwType}
            autoComplete="new-password"
            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
            value={form.confirmPassword}
            onChange={e => set('confirmPassword', e.target.value)}
          />
          {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
        </div>

        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </div>
  );
}

export default ChangePasswordForm;
