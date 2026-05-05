import { useState } from 'react';
import { terminalApi } from '../../../api/terminalApi';
import ErrorAlert from '../../../components/ErrorAlert';
import BatchControlPanel from '../../../components/terminals/BatchControlPanel';

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'PENDING'];

function OverviewTab({ terminal, onRefresh }) {
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [newStatus, setNewStatus] = useState(terminal.status);

  const handleStatusChange = async () => {
    if (newStatus === terminal.status) return;

    setChangingStatus(true);
    setStatusError(null);
    try {
      await terminalApi.updateStatus(terminal.terminalId, newStatus);
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
          <div className="text-muted small fw-semibold text-uppercase mb-1">TID</div>
          <div><code>{terminal.tid}</code></div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="text-muted small fw-semibold text-uppercase mb-1">Brand / Model</div>
          <div>{terminal.brandModel || '—'}</div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="text-muted small fw-semibold text-uppercase mb-1">Capability</div>
          <div>{terminal.capability || '—'}</div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="text-muted small fw-semibold text-uppercase mb-1">Param Profile</div>
          <div>
            {terminal.paramProfileName || <span className="text-muted">Not assigned</span>}
            {terminal.paramProfileId && (
              <span className="text-muted small ms-2">(ID: {terminal.paramProfileId})</span>
            )}
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="text-muted small fw-semibold text-uppercase mb-1">Store</div>
          <div>
            {terminal.storeName || '—'}
            {terminal.storeId && (
              <span className="text-muted small ms-2">(ID: {terminal.storeId})</span>
            )}
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="text-muted small fw-semibold text-uppercase mb-1">Merchant</div>
          <div>
            {terminal.merchantName || '—'}
            {terminal.merchantId && (
              <span className="text-muted small ms-2">(ID: {terminal.merchantId})</span>
            )}
          </div>
        </div>
      </div>

      <hr />

      <div className="mb-4">
        <h6 className="text-muted text-uppercase fw-semibold small mb-3">Batch Control</h6>
        <BatchControlPanel terminalId={terminal.terminalId} tid={terminal.tid} />
      </div>

      <hr />

      <div>
        <h6 className="text-muted text-uppercase fw-semibold small mb-3">Status Management</h6>

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
            <label htmlFor="statusSelect" className="form-label small">Change status</label>
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
            disabled={changingStatus || newStatus === terminal.status}
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
      </div>
    </div>
  );
}

export default OverviewTab;
