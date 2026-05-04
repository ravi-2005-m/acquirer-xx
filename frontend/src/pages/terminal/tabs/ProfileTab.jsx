import { useState, useEffect, useCallback } from 'react';
import { terminalApi } from '../../../api/terminalApi';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorAlert from '../../../components/ErrorAlert';
import EmptyState from '../../../components/EmptyState';

function ProfileTab({ terminal, onRefresh }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);

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

      {/* Assign new profile */}
      <div className="card">
        <div className="card-body">
          <h6 className="card-title small text-muted text-uppercase mb-3">
            Assign Different Profile
          </h6>

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

          {!loading && !error && profiles.length === 0 && (
            <EmptyState
              icon="bi-gear"
              title="No active profiles"
              message="Create a parameter profile first."
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

      <div className="alert alert-info mt-3 mb-0">
        <i className="bi bi-info-circle me-2"></i>
        <span className="small">
          Parameter profiles are managed globally. To create a new profile, go to the dedicated
          parameter profiles page.
        </span>
      </div>
    </div>
  );
}

export default ProfileTab;
