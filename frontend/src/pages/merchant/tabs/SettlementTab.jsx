import { useState, useEffect, useCallback } from 'react';
import { merchantApi } from '../../../api/merchantApi';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorAlert from '../../../components/ErrorAlert';
import EmptyState from '../../../components/EmptyState';
import StatusBadge from '../../../components/StatusBadge';
import { formatDateTime } from '../../../utils/formatters';

const CYCLES = ['DAILY', 'T_PLUS_1', 'T_PLUS_2', 'WEEKLY'];

function SettlementTab({ merchantId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    settlementCycle: 'T_PLUS_1',
    bankAccountRef: '',
    reservePct: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [actionId, setActionId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await merchantApi.getSettlementProfilesByMerchant(merchantId);
      setItems(response.data?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (profile) => {
    setEditingId(profile.settleProfileId);
    setFormData({
      settlementCycle: profile.settlementCycle,
      bankAccountRef: profile.bankAccountRef,
      reservePct: profile.reservePct,
    });
    setShowForm(true);
  };

  const startCreate = () => {
    setEditingId(null);
    setFormData({ settlementCycle: 'T_PLUS_1', bankAccountRef: '', reservePct: 0 });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        merchantId,
        settlementCycle: formData.settlementCycle,
        bankAccountRef: formData.bankAccountRef.trim(),
        reservePct: parseFloat(formData.reservePct) || 0,
      };

      if (editingId) {
        await merchantApi.updateSettlementProfile(editingId, payload);
      } else {
        await merchantApi.createSettlementProfile(payload);
      }

      setShowForm(false);
      setEditingId(null);
      fetchItems();
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (profileId) => {
    if (!window.confirm('Deactivate this settlement profile?')) return;
    setActionId(profileId);
    setActionError(null);
    try {
      await merchantApi.deactivateSettlementProfile(profileId);
      fetchItems();
    } catch (err) {
      setActionError(err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Settlement Profiles</h6>
        <button onClick={startCreate} className="btn btn-primary btn-sm">
          <i className="bi bi-plus-circle me-1"></i>
          Add Profile
        </button>
      </div>

      {showForm && (
        <div className="card mb-3 border-primary">
          <div className="card-body">
            <h6 className="card-title small text-muted text-uppercase mb-3">
              {editingId ? 'Edit Settlement Profile' : 'New Settlement Profile'}
            </h6>

            {submitError && (
              <ErrorAlert
                error={submitError}
                title="Save failed"
                dismissible
                onDismiss={() => setSubmitError(null)}
              />
            )}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="settlementCycle" className="form-label">Cycle</label>
                  <select
                    id="settlementCycle"
                    name="settlementCycle"
                    className="form-select"
                    value={formData.settlementCycle}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    {CYCLES.map((c) => (
                      <option key={c} value={c}>{c.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-5 mb-3">
                  <label htmlFor="bankAccountRef" className="form-label">
                    Bank Account Ref <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="bankAccountRef"
                    name="bankAccountRef"
                    className="form-control"
                    value={formData.bankAccountRef}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    placeholder="ACC-12345"
                  />
                </div>

                <div className="col-md-3 mb-3">
                  <label htmlFor="reservePct" className="form-label">Reserve %</label>
                  <input
                    type="number"
                    id="reservePct"
                    name="reservePct"
                    className="form-control"
                    value={formData.reservePct}
                    onChange={handleChange}
                    disabled={submitting}
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Save' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="btn btn-outline-secondary btn-sm"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionError && (
        <ErrorAlert
          error={actionError}
          title="Action failed"
          dismissible
          onDismiss={() => setActionError(null)}
        />
      )}

      {loading && <LoadingSpinner text="Loading settlement profiles..." />}
      {!loading && error && (
        <ErrorAlert error={error} title="Failed to load profiles" onRetry={fetchItems} />
      )}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon="bi-bank"
          title="No settlement profiles"
          message="Configure how this merchant gets paid."
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Cycle</th>
                <th>Bank Ref</th>
                <th>Reserve %</th>
                <th>Status</th>
                <th>Updated</th>
                <th style={{ width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.settleProfileId}>
                  <td className="text-muted small">{p.settleProfileId}</td>
                  <td className="small">{(p.settlementCycle || '').replaceAll('_', ' ')}</td>
                  <td className="small"><code>{p.bankAccountRef}</code></td>
                  <td className="small">{p.reservePct}%</td>
                  <td><StatusBadge status={p.status} size="sm" /></td>
                  <td className="text-muted small">
                    {formatDateTime(p.updatedAt || p.createdAt)}
                  </td>
                  <td>
                    {p.status === 'ACTIVE' && (
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => startEdit(p)}
                          className="btn btn-outline-secondary btn-sm"
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleDeactivate(p.settleProfileId)}
                          disabled={actionId === p.settleProfileId}
                          className="btn btn-outline-danger btn-sm"
                          title="Deactivate"
                        >
                          <i className="bi bi-pause-circle"></i>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SettlementTab;
