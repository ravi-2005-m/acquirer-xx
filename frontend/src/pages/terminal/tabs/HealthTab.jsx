import { useState, useEffect, useCallback } from 'react';
import { terminalApi } from '../../../api/terminalApi';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorAlert from '../../../components/ErrorAlert';
import EmptyState from '../../../components/EmptyState';
import StatusBadge from '../../../components/StatusBadge';
import { formatDateTime } from '../../../utils/formatters';

function batteryColor(pct) {
  if (pct == null) return 'secondary';
  if (pct > 60) return 'success';
  if (pct > 25) return 'warning';
  return 'danger';
}

function signalColor(strength) {
  if (strength == null) return 'secondary';
  if (strength > 70) return 'success';
  if (strength > 40) return 'warning';
  return 'danger';
}

function HealthTab({ terminalId, onRefresh, onHealthLoaded }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    batteryPct: '',
    signalStrength: '',
    firmwareVersion: '',
    ipAddress: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await terminalApi.getHealth(terminalId, { suppressToast: true });
      const healthData = response.data?.data ?? null;
      setHealth(healthData);
      if (onHealthLoaded && healthData?.lastSeen) onHealthLoaded(healthData.lastSeen);
    } catch (err) {
      if (err.response?.status === 404) {
        setHealth(null);
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [terminalId]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const params = {};
      if (formData.batteryPct !== '') params.batteryPct = parseInt(formData.batteryPct, 10);
      if (formData.signalStrength !== '') params.signalStrength = parseInt(formData.signalStrength, 10);
      if (formData.firmwareVersion.trim()) params.firmwareVersion = formData.firmwareVersion.trim();
      if (formData.ipAddress.trim()) params.ipAddress = formData.ipAddress.trim();

      await terminalApi.recordHealthPing(terminalId, params);
      setShowForm(false);
      setFormData({ batteryPct: '', signalStrength: '', firmwareVersion: '', ipAddress: '' });
      fetchHealth();
      if (onRefresh) onRefresh();
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Health Status</h6>
        <div className="d-flex gap-2">
          <button
            onClick={fetchHealth}
            className="btn btn-outline-secondary btn-sm"
            disabled={loading}
            title="Refresh"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
            <i className={`bi ${showForm ? 'bi-x-circle' : 'bi-broadcast-pin'} me-1`}></i>
            {showForm ? 'Cancel' : 'Record Ping'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-3 border-primary">
          <div className="card-body">
            <h6 className="card-title small text-muted text-uppercase mb-3">Record Health Ping</h6>

            {submitError && (
              <ErrorAlert
                error={submitError}
                title="Failed to record ping"
                dismissible
                onDismiss={() => setSubmitError(null)}
              />
            )}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label htmlFor="batteryPct" className="form-label">Battery %</label>
                  <input
                    type="number"
                    id="batteryPct"
                    name="batteryPct"
                    className="form-control"
                    value={formData.batteryPct}
                    onChange={handleChange}
                    disabled={submitting}
                    min="0"
                    max="100"
                    placeholder="85"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="signalStrength" className="form-label">Signal (0-100)</label>
                  <input
                    type="number"
                    id="signalStrength"
                    name="signalStrength"
                    className="form-control"
                    value={formData.signalStrength}
                    onChange={handleChange}
                    disabled={submitting}
                    min="0"
                    max="100"
                    placeholder="75"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="firmwareVersion" className="form-label">Firmware</label>
                  <input
                    type="text"
                    id="firmwareVersion"
                    name="firmwareVersion"
                    className="form-control"
                    value={formData.firmwareVersion}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="v2.4.1"
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="ipAddress" className="form-label">IP Address</label>
                  <input
                    type="text"
                    id="ipAddress"
                    name="ipAddress"
                    className="form-control"
                    value={formData.ipAddress}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="192.168.1.20"
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? 'Recording...' : 'Record'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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

      {loading && <LoadingSpinner text="Loading health..." />}

      {!loading && error && (
        <ErrorAlert error={error} title="Failed to load health" onRetry={fetchHealth} />
      )}

      {!loading && !error && !health && (
        <EmptyState
          icon="bi-heart-pulse"
          title="No health data"
          message="No health pings have been recorded for this terminal."
        />
      )}

      {!loading && !error && health && (
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title small text-muted text-uppercase mb-3">Connectivity</h6>
                <table className="table table-sm mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted">Status</td>
                      <td><StatusBadge status={health.status} size="sm" /></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Last Seen</td>
                      <td className="small">{formatDateTime(health.lastSeen)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">IP Address</td>
                      <td><code>{health.ipAddress || '—'}</code></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Firmware</td>
                      <td><code>{health.firmwareVersion || '—'}</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h6 className="card-title small text-muted text-uppercase mb-3">Device Metrics</h6>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small text-muted">
                      <i className="bi bi-battery-half me-1"></i>Battery
                    </span>
                    <span className="small fw-semibold">
                      {health.batteryPct != null ? `${health.batteryPct}%` : '—'}
                    </span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar bg-${batteryColor(health.batteryPct)}`}
                      style={{ width: `${health.batteryPct ?? 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small text-muted">
                      <i className="bi bi-reception-4 me-1"></i>Signal Strength
                    </span>
                    <span className="small fw-semibold">
                      {health.signalStrength != null ? `${health.signalStrength}/100` : '—'}
                    </span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar bg-${signalColor(health.signalStrength)}`}
                      style={{ width: `${health.signalStrength ?? 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-muted small">Updated {formatDateTime(health.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthTab;
