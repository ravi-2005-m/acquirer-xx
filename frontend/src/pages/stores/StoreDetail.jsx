import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { storeApi } from '../../api/storeApi';
import { terminalApi } from '../../api/terminalApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import StoreFormModal from '../../components/stores/StoreFormModal';
import HeartbeatBadge from '../../components/common/HeartbeatBadge';
import { formatDateTime, formatDate } from '../../utils/formatters';

const WORKFLOW = {
  PENDING:   [{ label: 'Activate',    newStatus: 'ACTIVE',    variant: 'success' }],
  ACTIVE:    [{ label: 'Suspend',     newStatus: 'SUSPENDED', variant: 'warning' },
               { label: 'Deactivate', newStatus: 'INACTIVE',  variant: 'secondary' }],
  SUSPENDED: [{ label: 'Reactivate', newStatus: 'ACTIVE',    variant: 'success' }],
  INACTIVE:  [{ label: 'Reactivate', newStatus: 'ACTIVE',    variant: 'success' }],
};

function StoreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const [terminals, setTerminals]   = useState([]);
  const [terminalsLoading, setTerminalsLoading] = useState(true);

  const [showEdit, setShowEdit]             = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting]             = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [statusError, setStatusError]       = useState(null);

  const fetchStore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await storeApi.getById(id);
      setStore(res.data?.data ?? res.data ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTerminals = useCallback(async () => {
    setTerminalsLoading(true);
    try {
      const res = await terminalApi.getByStore(id, { size: 5 });
      const body = res.data?.data ?? res.data ?? {};
      setTerminals(body.content ?? []);
    } catch {
      setTerminals([]);
    } finally {
      setTerminalsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStore();
    fetchTerminals();
  }, [fetchStore, fetchTerminals]);

  const handleStatusChange = async (newStatus) => {
    setStatusChanging(true);
    setStatusError(null);
    try {
      await storeApi.updateStatus(id, newStatus);
      fetchStore();
    } catch (err) {
      setStatusError(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusChanging(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await storeApi.deleteById(id);
      navigate('/stores');
    } catch (err) {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setStatusError(err?.response?.data?.message || 'Failed to delete store');
    }
  };

  const handleEditSaved = (updated) => {
    setShowEdit(false);
    if (updated?.storeId) setStore(updated);
    else fetchStore();
  };

  if (loading) {
    return <div className="container-fluid p-4"><LoadingSpinner text="Loading store..." /></div>;
  }

  if (error || !store) {
    return (
      <div className="container-fluid p-4">
        <ErrorAlert error={error || 'Store not found'} title="Failed to load store" onRetry={fetchStore} />
        <Link to="/stores" className="btn btn-outline-secondary mt-2">
          <i className="bi bi-arrow-left me-1"></i>Back to list
        </Link>
      </div>
    );
  }

  const workflowActions = WORKFLOW[store.status] || [];

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex align-items-start mb-3">
        <Link to="/stores" className="btn btn-link text-muted text-decoration-none p-0 me-2 mt-1" title="Back to list">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div className="flex-grow-1">
          <h3 className="mb-1">
            <i className="bi bi-shop me-2"></i>{store.storeName}
          </h3>
          <div className="d-flex flex-wrap align-items-center gap-2 text-muted small">
            <span>ID: {store.storeId}</span>
            {store.region && <><span>·</span><span>{store.region}</span></>}
            {store.merchantId && (
              <>
                <span>·</span>
                <Link to={`/merchants/${store.merchantId}`} className="text-decoration-none small">
                  <i className="bi bi-people me-1"></i>
                  {store.merchantName || `Merchant #${store.merchantId}`}
                </Link>
              </>
            )}
            <span>·</span>
            <span>Created {formatDateTime(store.createdAt)}</span>
          </div>
        </div>
        <div className="d-flex gap-2 ms-3 align-items-center flex-wrap">
          <StatusBadge status={store.status} />
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

      {/* Overview card */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="text-muted small fw-semibold text-uppercase mb-1">Store Name</div>
              <div>{store.storeName}</div>
            </div>
            <div className="col-md-4">
              <div className="text-muted small fw-semibold text-uppercase mb-1">Region</div>
              <div>{store.region || '—'}</div>
            </div>
            <div className="col-md-4">
              <div className="text-muted small fw-semibold text-uppercase mb-1">City / State</div>
              <div>{[store.city, store.state].filter(Boolean).join(', ') || '—'}</div>
            </div>
            <div className="col-md-4">
              <div className="text-muted small fw-semibold text-uppercase mb-1">Pincode</div>
              <div>{store.pincode || '—'}</div>
            </div>
            <div className="col-md-4">
              <div className="text-muted small fw-semibold text-uppercase mb-1">Contact Person</div>
              <div>{store.contactPerson || '—'}</div>
            </div>
            <div className="col-md-4">
              <div className="text-muted small fw-semibold text-uppercase mb-1">Contact Phone</div>
              <div>{store.contactPhone || '—'}</div>
            </div>
            {store.address && (
              <div className="col-12">
                <div className="text-muted small fw-semibold text-uppercase mb-1">Address</div>
                <div className="small" style={{ whiteSpace: 'pre-line' }}>{store.address}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminals */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center bg-white">
          <span className="fw-semibold small">
            <i className="bi bi-printer me-2"></i>Terminals
          </span>
          <Link
            to={`/terminals?storeId=${store.storeId}`}
            className="btn btn-outline-primary btn-sm"
          >
            <i className="bi bi-arrow-right me-1"></i>View all
          </Link>
        </div>
        <div className="card-body p-0">
          {terminalsLoading && (
            <div className="p-3"><LoadingSpinner text="Loading terminals..." /></div>
          )}
          {!terminalsLoading && terminals.length === 0 && (
            <div className="text-muted small p-3 text-center">No terminals assigned to this store.</div>
          )}
          {!terminalsLoading && terminals.length > 0 && (
            <table className="table table-hover mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>TID</th>
                  <th>Brand / Model</th>
                  <th>Capability</th>
                  <th>Heartbeat</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th style={{ width: '110px' }}>Created</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {terminals.map(t => (
                  <tr
                    key={t.terminalId}
                    onClick={() => navigate(`/terminals/${t.terminalId}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td><code>{t.tid}</code></td>
                    <td className="text-muted">{t.brandModel || '—'}</td>
                    <td className="text-muted">{t.capability || '—'}</td>
                    <td><HeartbeatBadge lastSeenAt={t.lastSeenAt} lastSeen={t.lastSeen} /></td>
                    <td><StatusBadge status={t.status} size="sm" /></td>
                    <td className="text-muted">{formatDate(t.createdAt)}</td>
                    <td className="text-end">
                      <i className="bi bi-chevron-right text-muted"></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <StoreFormModal
        show={showEdit}
        existing={store}
        onClose={() => setShowEdit(false)}
        onSaved={handleEditSaved}
      />

      <ConfirmModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Store"
        message={`Are you sure you want to delete "${store.storeName}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default StoreDetail;
