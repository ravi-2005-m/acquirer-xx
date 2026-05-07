import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { merchantApi } from '../../api/merchantApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import ConfirmModal from '../../components/ConfirmModal';
import MerchantFormModal from '../../components/merchants/MerchantFormModal';
import { formatDateTime } from '../../utils/formatters';

import KycTab from './tabs/KycTab';
import PricingTab from './tabs/PricingTab';
import SettlementTab from './tabs/SettlementTab';
import StoresTab from './tabs/StoresTab';

const TABS = [
  { id: 'kyc',        label: 'KYC',        icon: 'bi-file-earmark-check' },
  { id: 'pricing',    label: 'Pricing',    icon: 'bi-currency-dollar' },
  { id: 'settlement', label: 'Settlement', icon: 'bi-bank' },
  { id: 'stores',     label: 'Stores',     icon: 'bi-shop' },
];

// Status workflow — which actions are available from each status
const WORKFLOW = {
  PENDING:   [{ label: 'Activate',     newStatus: 'ACTIVE',    variant: 'success' }],
  ACTIVE:    [{ label: 'Suspend',      newStatus: 'SUSPENDED', variant: 'warning' },
               { label: 'Deactivate',  newStatus: 'INACTIVE',  variant: 'secondary' }],
  SUSPENDED: [{ label: 'Reactivate',   newStatus: 'ACTIVE',    variant: 'success' }],
  INACTIVE:  [{ label: 'Reactivate',   newStatus: 'ACTIVE',    variant: 'success' }],
};

function MerchantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('kyc');

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const fetchMerchant = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await merchantApi.getById(id);
      setMerchant(response.data?.data ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMerchant();
  }, [fetchMerchant]);

  const handleStatusChange = async (newStatus) => {
    setStatusChanging(true);
    setStatusError(null);
    try {
      await merchantApi.updateStatus(merchant.merchantId, newStatus);
      fetchMerchant();
    } catch (err) {
      setStatusError(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusChanging(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await merchantApi.deleteById(merchant.merchantId);
      navigate('/merchants');
    } catch (err) {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setStatusError(err?.response?.data?.message || 'Failed to delete merchant');
    }
  };

  const handleEditSaved = (updated) => {
    setShowEdit(false);
    if (updated?.merchantId) {
      setMerchant(updated);
    } else {
      fetchMerchant();
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <LoadingSpinner text="Loading merchant..." />
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="container-fluid p-4">
        <ErrorAlert
          error={error || 'Merchant not found'}
          title="Failed to load merchant"
          onRetry={fetchMerchant}
        />
        <Link to="/merchants" className="btn btn-outline-secondary mt-2">
          <i className="bi bi-arrow-left me-1"></i>
          Back to list
        </Link>
      </div>
    );
  }

  const workflowActions = WORKFLOW[merchant.status] || [];

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex align-items-start mb-3">
        <Link
          to="/merchants"
          className="btn btn-link text-muted text-decoration-none p-0 me-2 mt-1"
          title="Back to list"
        >
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div className="flex-grow-1">
          <h3 className="mb-1">
            <i className="bi bi-people me-2"></i>
            {merchant.legalName}
          </h3>
          <div className="d-flex flex-wrap align-items-center gap-2 text-muted small">
            <span>ID: {merchant.merchantId}</span>
            {merchant.doingBusinessAs && (
              <><span>·</span><span>DBA: {merchant.doingBusinessAs}</span></>
            )}
            {merchant.mcc && (
              <><span>·</span><span>MCC: <code>{merchant.mcc}</code></span></>
            )}
            <span>·</span>
            <span>Created {formatDateTime(merchant.createdAt)}</span>
          </div>
        </div>
        <div className="d-flex gap-2 ms-3 align-items-center flex-wrap">
          <StatusBadge status={merchant.status} />
          <RiskBadge level={merchant.riskLevel} />
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowEdit(true)}
          >
            <i className="bi bi-pencil me-1"></i>
            Edit
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <i className="bi bi-trash me-1"></i>
            Delete
          </button>
        </div>
      </div>

      {/* Status workflow */}
      {(workflowActions.length > 0 || statusError) && (
        <div className="card shadow-sm mb-3">
          <div className="card-body py-2">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="text-muted small fw-semibold text-uppercase me-1">
                Status Actions:
              </span>
              {workflowActions.map(({ label, newStatus, variant }) => (
                <button
                  key={newStatus}
                  className={`btn btn-${variant} btn-sm`}
                  onClick={() => handleStatusChange(newStatus)}
                  disabled={statusChanging}
                >
                  {statusChanging ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : label}
                </button>
              ))}
              {statusError && (
                <span className="text-danger small ms-2">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  {statusError}
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
              <div className="text-muted small fw-semibold text-uppercase mb-1">Legal Name</div>
              <div>{merchant.legalName}</div>
            </div>
            {merchant.doingBusinessAs && (
              <div className="col-md-4">
                <div className="text-muted small fw-semibold text-uppercase mb-1">DBA</div>
                <div>{merchant.doingBusinessAs}</div>
              </div>
            )}
            <div className="col-md-4">
              <div className="text-muted small fw-semibold text-uppercase mb-1">MCC</div>
              <div>{merchant.mcc ? <code>{merchant.mcc}</code> : '—'}</div>
            </div>
            <div className="col-md-4">
              <div className="text-muted small fw-semibold text-uppercase mb-1">Risk Level</div>
              <div>{merchant.riskLevel || '—'}</div>
            </div>
            <div className="col-12">
              <div className="text-muted small fw-semibold text-uppercase mb-1">Contact Info</div>
              <div style={{ whiteSpace: 'pre-line' }} className="small">
                {merchant.contactInfo || '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-0">
        {TABS.map((tab) => (
          <li key={tab.id} className="nav-item">
            <button
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`bi ${tab.icon} me-1`}></i>
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="card border-top-0 rounded-top-0">
        <div className="card-body">
          {activeTab === 'kyc'        && <KycTab merchantId={merchant.merchantId} onMerchantChanged={fetchMerchant} />}
          {activeTab === 'pricing'    && <PricingTab merchantId={merchant.merchantId} />}
          {activeTab === 'settlement' && <SettlementTab merchantId={merchant.merchantId} />}
          {activeTab === 'stores'     && <StoresTab merchantId={merchant.merchantId} />}
        </div>
      </div>

      {/* Edit modal */}
      <MerchantFormModal
        show={showEdit}
        existing={merchant}
        onClose={() => setShowEdit(false)}
        onSaved={handleEditSaved}
      />

      {/* Delete confirm modal */}
      <ConfirmModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Merchant"
        message={`Are you sure you want to delete "${merchant.legalName}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
}

export default MerchantDetail;
