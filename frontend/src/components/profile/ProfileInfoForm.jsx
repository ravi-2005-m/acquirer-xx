import { useState, useEffect } from 'react';
import { profileApi } from '../../api/profileApi';

function ProfileInfoForm({ profile, onUpdated }) {
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName:  profile.lastName  || '',
        email:     profile.email     || '',
        phone:     profile.phone     || '',
      });
      setErrors({});
      setSuccess(false);
      setError(null);
    }
  }, [profile]);

  if (!profile) return null;

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (form.phone && !/^\d{10}$/.test(form.phone)) errs.phone = 'Phone must be 10 digits';
    return errs;
  };

  const isDirty =
    form.firstName !== (profile.firstName || '') ||
    form.lastName  !== (profile.lastName  || '') ||
    form.email     !== (profile.email     || '') ||
    form.phone     !== (profile.phone     || '');

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await profileApi.updateMyProfile({
        firstName: form.firstName.trim() || null,
        lastName:  form.lastName.trim()  || null,
        email:     form.email.trim(),
        phone:     form.phone.trim()     || null,
      });
      const updated = res.data?.data ?? res.data;
      setSuccess(true);
      onUpdated(updated);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      firstName: profile.firstName || '',
      lastName:  profile.lastName  || '',
      email:     profile.email     || '',
      phone:     profile.phone     || '',
    });
    setErrors({});
  };

  return (
    <div className="card">
      <div className="card-body">
        <h6 className="text-muted fw-semibold mb-3">Profile Information</h6>

        {error   && <div className="alert alert-danger  py-2 small">{error}</div>}
        {success && <div className="alert alert-success py-2 small"><i className="bi bi-check-circle me-1"></i>Profile updated successfully.</div>}

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-semibold">First Name</label>
            <input className="form-control" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-semibold">Last Name</label>
            <input className="form-control" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
          </div>
          <div className="col-md-8">
            <label className="form-label small fw-semibold">
              Email <span className="text-danger">*</span>
              {profile.emailVerified === false && (
                <span className="badge bg-warning text-dark ms-2">Unverified</span>
              )}
            </label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Phone</label>
            <input
              type="text"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="10 digits"
              maxLength={10}
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold">Username <span className="text-muted small fw-normal">(cannot change)</span></label>
            <input className="form-control bg-light font-monospace" value={profile.username || ''} disabled />
          </div>
        </div>

        <div className="mt-3 d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !isDirty}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {isDirty && (
            <button className="btn btn-link" onClick={handleReset} disabled={saving}>
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileInfoForm;
