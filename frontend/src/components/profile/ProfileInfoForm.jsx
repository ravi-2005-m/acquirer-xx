import { useState, useEffect } from 'react';
import { profileApi } from '../../api/profileApi';

function ProfileInfoForm({ profile, onUpdated }) {
  const [form, setForm]       = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (profile) {
      setForm({
        name:  profile.name  || '',
        email: profile.email || '',
        phone: profile.phone || '',
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
    if (form.phone && !/^[+0-9 ()-]{6,20}$/.test(form.phone)) errs.phone = 'Phone must be 6-20 digits';
    return errs;
  };

  const isDirty =
    form.name  !== (profile.name  || '') ||
    form.email !== (profile.email || '') ||
    form.phone !== (profile.phone || '');

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await profileApi.updateMyProfile({
        name:  form.name.trim()  || null,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
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
      name:  profile.name  || '',
      email: profile.email || '',
      phone: profile.phone || '',
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
          <div className="col-md-12">
            <label className="form-label small fw-semibold">Full Name</label>
            <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="col-md-8">
            <label className="form-label small fw-semibold">
              Email <span className="text-danger">*</span>
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
              placeholder="+91 9999999999"
              maxLength={20}
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
