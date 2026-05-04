import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { terminalApi } from '../../api/terminalApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import TerminalFormModal from '../../components/terminals/TerminalFormModal';
import HeartbeatBadge from '../../components/common/HeartbeatBadge';
import { formatDateTime } from '../../utils/formatters';

import OverviewTab from './tabs/OverviewTab';
import HealthTab from './tabs/HealthTab';
import ProfileTab from './tabs/ProfileTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'bi-info-circle' },
  { id: 'health',   label: 'Health',   icon: 'bi-heart-pulse' },
  { id: 'profile',  label: 'Profile',  icon: 'bi-gear' },
];

const WORKFLOW = {
  PENDING:  [{ label: 'Activate',    newStatus: 'ACTIVE',   variant: 'success' }],
  ACTIVE:   [{ label: 'Deactivate', newStatus: 'INACTIVE', variant: 'secondary' }],
  INACTIVE: [{ label: 'Reactivate', newStatus: 'ACTIVE',   variant: 'success' }],
};

function TerminalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [terminal, setTerminal]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activeTab, setActiveTab]   = useState('overview');

  const [showEdit, setShowEdit]             = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting]             = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [statusError, setStatusError]       = useState(null);

  const fetchTerminal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await terminalApi.getById(id);
      setTerminal(response.data?.data ?? response.data ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTerminal(); }, [fetchTerminal]);

  const handleStatusChange = async (newStatus) => {
    setStatusChanging(true);
    setStatusError(null);
    try {
      await terminalApi.updateStatus(id, newStatus);
      fetchTerminal();
    } catch (err) {
      setStatusError(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusChanging(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await terminalApi.deleteById(id);
      navigate('/terminals');
    } catch (err) {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setStatusError(err?.response?.data?.message || 'Failed to delete terminal');
    }
  };

  const handleEditSaved = (updated) => {
    setShowEdit(false);
    if (updated?.terminalId) setTerminal(updated);
    else fetchTerminal();
  };

  if (loading) {
    return <div className="container-fluid p-4"><LoadingSpinner text="Loading terminal..." /></div>;
  }

  if (error || !terminal) {
    return (
      <div className="container-fluid p-4">
        <ErrorAlert error={error || 'Terminal not found'} title="Failed to load terminal" onRetry={fetchTerminal} />
        <Link to="/terminals" className="btn btn-outline-secondary mt-2">
          <i className="bi bi-arrow-left me-1"></i>Back to list
        </Link>
      </div>
    );
  }

  const workflowActions = WORKFLOW[terminal.status] || [];

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex align-items-start mb-3">
        <Link to="/terminals" className="btn btn-link text-muted text-decoration-none p-0 me-2 mt-1" title="Back to list">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div className="flex-grow-1">
          <h3 className="mb-1">
            <i className="bi bi-printer me-2"></i>
            <code className="text-dark">{terminal.tid}</code>
          </h3>
          <div className="d-flex flex-wrap align-items-center gap-2 text-muted small">
            <span>ID: {terminal.terminalId}</span>
            <span>·</span>
            <span>{terminal.brandModel || '—'}</span>
            {terminal.storeId && (
              <>
                <span>·</span>
                <Link to={`/stores/${terminal.storeId}`} className="text-decoration-none small">
                  <i className="bi bi-shop me-1"></i>{terminal.storeName || `Store #${terminal.storeId}`}
                </Link>
              </>
            )}
            {terminal.merchantId && (
              <>
                <span>·</span>
                <Link to={`/merchants/${terminal.merchantId}`} className="text-decoration-none small">
                  <i className="bi bi-people me-1"></i>{terminal.merchantName || `Merchant #${terminal.merchantId}`}
                </Link>
              </>
            )}
            <span>·</span>
            <span>Created {formatDateTime(terminal.createdAt)}</span>
          </div>
        </div>
        <div className="d-flex gap-2 ms-3 align-items-center flex-wrap">
          <HeartbeatBadge lastSeenAt={terminal.lastSeenAt} lastSeen={terminal.lastSeen} />
          <StatusBadge status={terminal.status} />
          <button className="btn btn-outline-primary btn-sm" onClick={() => setShowEdit(true)}>
            <i className="bi bi-pencil me-1"></i>Edit
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
            <i className="bi bi-trash me-1"></i>Delete
          </button>
        </div>
      </div>

      {/* Status workflow */}
      {(workflowActions.length > 0 || statusError) && (
        <div className="card shadow-sm mb-3">
          <div className="card-body py-2">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="text-muted small fw-semibold text-uppercase me-1">Status Actions:</span>
              {workflowActions.map(({ label, newStatus, variant }) => (
                <button
                  key={newStatus}
                  className={`btn btn-${variant} btn-sm`}
                  onClick={() => handleStatusChange(newStatus)}
                  disabled={statusChanging}
                >
                  {statusChanging
                    ? <span className="spinner-border spinner-border-sm" role="status"></span>
                    : label}
                </button>
              ))}
              {statusError && (
                <span className="text-danger small ms-2">
                  <i className="bi bi-exclamation-triangle me-1"></i>{statusError}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-0">
        {TABS.map(tab => (
          <li key={tab.id} className="nav-item">
            <button
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`bi ${tab.icon} me-1`}></i>{tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="card border-top-0 rounded-top-0">
        <div className="card-body">
          {activeTab === 'overview' && <OverviewTab terminal={terminal} onRefresh={fetchTerminal} />}
          {activeTab === 'health'   && <HealthTab terminalId={terminal.terminalId} />}
          {activeTab === 'profile'  && <ProfileTab terminal={terminal} onRefresh={fetchTerminal} />}
        </div>
      </div>

      <TerminalFormModal
        show={showEdit}
        existing={terminal}
        onClose={() => setShowEdit(false)}
        onSaved={handleEditSaved}
      />

      <ConfirmModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Terminal"
        message={`Are you sure you want to delete terminal "${terminal.tid}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default TerminalDetail;
