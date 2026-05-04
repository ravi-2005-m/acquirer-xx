import { useState } from 'react';
import { merchantApi } from '../../../api/merchantApi';
import ErrorAlert from '../../../components/ErrorAlert';

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'PENDING'];

function OverviewTab({ merchant, onRefresh }) {
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [newStatus, setNewStatus] = useState(merchant.status);

  const handleStatusChange = async () => {
    if (newStatus === merchant.status) return;

    setChangingStatus(true);
    setStatusError(null);
    try {
      await merchantApi.updateStatus(merchant.merchantId, newStatus);
      onRefresh();
    } catch (err) {
      setStatusError(err);
    } finally {
      setChangingStatus(false);
    }
  };

  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="text-muted small fw-semibold text-uppercase mb-1">Legal Name</div>
          <div>{merchant.legalName}</div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="text-muted small fw-semibold text-uppercase mb-1">DBA</div>
          <div>{merchant.doingBusinessAs || '—'}</div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="text-muted small fw-semibold text-uppercase mb-1">MCC</div>
          <div>{merchant.mcc ? <code>{merchant.mcc}</code> : '—'}</div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="text-muted small fw-semibold text-uppercase mb-1">Risk Level</div>
          <div>{merchant.riskLevel || '—'}</div>
        </div>
        <div className="col-12 mb-3">
          <div className="text-muted small fw-semibold text-uppercase mb-1">Contact Info</div>
          <div style={{ whiteSpace: 'pre-line' }}>{merchant.contactInfo || '—'}</div>
        </div>
      </div>

      <hr />

      <div>
        <h6 className="text-muted text-uppercase fw-semibold small mb-3">
          Status Management
        </h6>

        {statusError && (
          <ErrorAlert
            error={statusError}
            title="Failed to update status"
            dismissible
            onDismiss={() => setStatusError(null)}
          />
        )}

        <div className="d-flex flex-wrap align-items-end gap-2">
          <div>
            <label htmlFor="statusSelect" className="form-label small">
              Change status
            </label>
            <select
              id="statusSelect"
              className="form-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              disabled={changingStatus}
              style={{ width: '200px' }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleStatusChange}
            className="btn btn-primary"
            disabled={changingStatus || newStatus === merchant.status}
          >
            {changingStatus ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Updating...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-1"></i>
                Update Status
              </>
            )}
          </button>
        </div>

        <div className="form-text small mt-2">
          Current status: <strong>{merchant.status}</strong>. Status changes take effect immediately.
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
