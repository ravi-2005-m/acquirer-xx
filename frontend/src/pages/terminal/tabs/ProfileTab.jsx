import { useState, useEffect, useCallback } from 'react';
import { terminalApi } from '../../../api/terminalApi';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorAlert from '../../../components/ErrorAlert';
import EmptyState from '../../../components/EmptyState';

// Sensible defaults for common POS parameters.
const DEFAULT_FORM = {
  emvKernel: 'v1.4',
  ctlsLimit: 5000,
  receiptCopies: 2,
  idleTimeoutSec: 60,
  autoBatchCloseHour: 23,
  currency: 'INR',
  pinRequiredAbove: 2000,
};

const EMV_KERNELS = ['v1.4', 'v1.3', 'v1.2'];

function buildParamsJson(form) {
  const obj = {};
  if (form.emvKernel)              obj.emvKernel          = form.emvKernel;
  if (form.ctlsLimit !== '')       obj.ctlsLimit          = Number(form.ctlsLimit);
  if (form.receiptCopies !== '')   obj.receiptCopies      = Number(form.receiptCopies);
  if (form.idleTimeoutSec !== '')  obj.idleTimeoutSec     = Number(form.idleTimeoutSec);
  if (form.autoBatchCloseHour !== '') obj.autoBatchCloseHour = Number(form.autoBatchCloseHour);
  if (form.currency)               obj.currency           = form.currency.toUpperCase();
  if (form.pinRequiredAbove !== '') obj.pinRequiredAbove   = Number(form.pinRequiredAbove);
  return JSON.stringify(obj, null, 2);
}

function ProfileTab({ terminal, onRefresh }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);

  // Create-profile state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [form, setForm] = useState(DEFAULT_FORM);
  const [advanced, setAdvanced] = useState(false);
  const [rawJson, setRawJson] = useState(JSON.stringify(DEFAULT_FORM, null, 2));
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await terminalApi.getActiveProfiles();
      setProfiles(response.data?.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleAssign = async () => {
    if (!selectedProfileId) return;
    setAssigning(true);
    setAssignError(null);
    try {
      await terminalApi.assignProfile(selectedProfileId, terminal.terminalId);
      setSelectedProfileId('');
      onRefresh();
    } catch (err) {
      setAssignError(err);
    } finally {
      setAssigning(false);
    }
  };

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // When user toggles to Advanced, pre-fill the JSON textarea from the form.
  // When toggling back, leave the form untouched (don't try to round-trip).
  const toggleAdvanced = () => {
    if (!advanced) {
      setRawJson(buildParamsJson(form));
    }
    setAdvanced(v => !v);
    setCreateError(null);
  };

  const resetCreateForm = () => {
    setNewName('');
    setForm(DEFAULT_FORM);
    setRawJson(JSON.stringify(DEFAULT_FORM, null, 2));
    setAdvanced(false);
    setCreateError(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    let paramsJson;
    if (advanced) {
      // Validate JSON
      try {
        JSON.parse(rawJson);
      } catch {
        setCreateError({ message: 'Parameters JSON is not valid JSON.' });
        return;
      }
      paramsJson = rawJson;
    } else {
      paramsJson = buildParamsJson(form);
    }

    setCreating(true);
    setCreateError(null);
    try {
      await terminalApi.createProfile({
        name: newName.trim(),
        paramsJson,
      });
      setShowCreate(false);
      resetCreateForm();
      fetchProfiles();
    } catch (err) {
      setCreateError(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h6 className="mb-3">Parameter Profile</h6>

      {/* Current profile */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title small text-muted text-uppercase mb-2">Current Assignment</h6>
          {terminal.paramProfileId ? (
            <div>
              <div className="fw-semibold">{terminal.paramProfileName}</div>
              <div className="text-muted small">Profile ID: {terminal.paramProfileId}</div>
            </div>
          ) : (
            <div className="text-muted">
              <i className="bi bi-info-circle me-1"></i>No profile assigned
            </div>
          )}
        </div>
      </div>

      {/* Assign existing profile */}
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="card-title small text-muted text-uppercase mb-0">
              Assign Different Profile
            </h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => {
                setShowCreate(v => !v);
                if (showCreate) resetCreateForm();
              }}
            >
              <i className={`bi ${showCreate ? 'bi-x-circle' : 'bi-plus-circle'} me-1`}></i>
              {showCreate ? 'Cancel' : 'New Profile'}
            </button>
          </div>

          {assignError && (
            <ErrorAlert
              error={assignError}
              title="Assignment failed"
              dismissible
              onDismiss={() => setAssignError(null)}
            />
          )}

          {loading && <LoadingSpinner text="Loading profiles..." />}

          {!loading && error && (
            <ErrorAlert error={error} title="Failed to load profiles" onRetry={fetchProfiles} />
          )}

          {!loading && !error && profiles.length === 0 && !showCreate && (
            <EmptyState
              icon="bi-gear"
              title="No active profiles"
              message="Create a parameter profile first using the New Profile button above."
            />
          )}

          {!loading && !error && profiles.length > 0 && (
            <div className="d-flex flex-wrap align-items-end gap-2">
              <div style={{ minWidth: '300px', flex: 1 }}>
                <label htmlFor="profileSelect" className="form-label small">
                  Available profiles
                </label>
                <select
                  id="profileSelect"
                  className="form-select"
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  disabled={assigning}
                >
                  <option value="">Select a profile...</option>
                  {profiles.map((p) => (
                    <option
                      key={p.paramProfileId}
                      value={p.paramProfileId}
                      disabled={p.paramProfileId === terminal.paramProfileId}
                    >
                      {p.name} (v{p.version})
                      {p.paramProfileId === terminal.paramProfileId ? ' — current' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAssign}
                className="btn btn-primary"
                disabled={
                  assigning ||
                  !selectedProfileId ||
                  selectedProfileId === String(terminal.paramProfileId)
                }
              >
                {assigning ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Assigning...
                  </>
                ) : (
                  <>
                    <i className="bi bi-link-45deg me-1"></i>
                    Assign
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Create Profile form */}
      {showCreate && (
        <div className="card mt-3 border-primary">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="card-title small text-muted text-uppercase mb-0">
                New Parameter Profile
              </h6>
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0"
                onClick={toggleAdvanced}
                title={advanced ? 'Switch to friendly form' : 'Switch to raw JSON'}
              >
                <i className={`bi ${advanced ? 'bi-list-ul' : 'bi-code-slash'} me-1`}></i>
                {advanced ? 'Use form view' : 'Advanced (raw JSON)'}
              </button>
            </div>

            {createError && (
              <ErrorAlert
                error={createError}
                title="Failed to create profile"
                dismissible
                onDismiss={() => setCreateError(null)}
              />
            )}

            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label htmlFor="newName" className="form-label">
                  Profile Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="newName"
                  className="form-control"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  disabled={creating}
                  placeholder="STD_RETAIL_v1"
                />
                <div className="form-text small">
                  A short identifier — operators see this when assigning the profile to a terminal.
                </div>
              </div>

              {!advanced ? (
                <>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="emvKernel" className="form-label">EMV Kernel</label>
                      <select
                        id="emvKernel"
                        className="form-select"
                        value={form.emvKernel}
                        onChange={(e) => setField('emvKernel', e.target.value)}
                        disabled={creating}
                      >
                        {EMV_KERNELS.map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="ctlsLimit" className="form-label">
                        Contactless Limit (₹)
                      </label>
                      <input
                        type="number"
                        id="ctlsLimit"
                        className="form-control"
                        value={form.ctlsLimit}
                        onChange={(e) => setField('ctlsLimit', e.target.value)}
                        disabled={creating}
                        min="0"
                        step="100"
                      />
                      <div className="form-text small">Tap-and-go threshold (PIN required above)</div>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="receiptCopies" className="form-label">Receipt Copies</label>
                      <select
                        id="receiptCopies"
                        className="form-select"
                        value={form.receiptCopies}
                        onChange={(e) => setField('receiptCopies', e.target.value)}
                        disabled={creating}
                      >
                        {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="idleTimeoutSec" className="form-label">
                        Idle Timeout (sec)
                      </label>
                      <input
                        type="number"
                        id="idleTimeoutSec"
                        className="form-control"
                        value={form.idleTimeoutSec}
                        onChange={(e) => setField('idleTimeoutSec', e.target.value)}
                        disabled={creating}
                        min="10"
                        max="600"
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="autoBatchCloseHour" className="form-label">
                        Auto-Batch Close (hr)
                      </label>
                      <input
                        type="number"
                        id="autoBatchCloseHour"
                        className="form-control"
                        value={form.autoBatchCloseHour}
                        onChange={(e) => setField('autoBatchCloseHour', e.target.value)}
                        disabled={creating}
                        min="0"
                        max="23"
                      />
                      <div className="form-text small">24-hour format (e.g. 23 = 11 PM)</div>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label htmlFor="currency" className="form-label">Currency</label>
                      <input
                        type="text"
                        id="currency"
                        className="form-control text-uppercase"
                        value={form.currency}
                        onChange={(e) => setField('currency', e.target.value.toUpperCase())}
                        disabled={creating}
                        maxLength={3}
                        pattern="[A-Z]{3}"
                      />
                    </div>
                  </div>

                  <div className="alert alert-light border small mb-3">
                    <i className="bi bi-info-circle me-1 text-muted"></i>
                    These fields are saved as JSON behind the scenes. Switch to{' '}
                    <strong>Advanced (raw JSON)</strong> at the top right if you need custom fields.
                  </div>
                </>
              ) : (
                <div className="mb-3">
                  <label htmlFor="rawJson" className="form-label">
                    Parameters JSON <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="rawJson"
                    className="form-control font-monospace small"
                    rows={10}
                    value={rawJson}
                    onChange={(e) => setRawJson(e.target.value)}
                    required
                    disabled={creating}
                  />
                  <div className="form-text small">
                    Free-form JSON of terminal parameters. Use the friendly form above unless you
                    really need custom fields.
                  </div>
                </div>
              )}

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={creating}>
                  {creating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Profile'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setShowCreate(false);
                    resetCreateForm();
                  }}
                  disabled={creating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="alert alert-info mt-3 mb-0">
        <i className="bi bi-info-circle me-2"></i>
        <span className="small">
          Parameter profiles are managed globally — once created, the same profile can be assigned
          to multiple terminals.
        </span>
      </div>
    </div>
  );
}

export default ProfileTab;
