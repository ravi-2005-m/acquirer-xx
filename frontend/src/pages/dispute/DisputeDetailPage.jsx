import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { disputeApi } from '../../api/disputeApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import StatusBadge from '../../components/StatusBadge';
import ReasonBadge from '../../components/disputes/ReasonBadge';
import EvidenceList from '../../components/disputes/EvidenceList';
import DisputeActionPanel from '../../components/disputes/DisputeActionPanel';
import DisputeStageTimeline from '../../components/common/DisputeStageTimeline';
import DeadlineCountdown from '../../components/common/DeadlineCountdown';
import FileUploader from '../../components/common/FileUploader';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatters';

function DisputeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const canManage = user?.role === 'DISPUTES' || user?.role === 'ADMIN';

  const [dispute, setDispute]     = useState(null);
  const [evidence, setEvidence]   = useState([]);
  const [stages, setStages]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const fetchDispute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await disputeApi.getDisputeById(id);
      setDispute(res.data?.data ?? res.data ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchEvidence = useCallback(async () => {
    try {
      const res = await disputeApi.getEvidence(id);
      const data = res.data?.data ?? res.data ?? [];
      setEvidence(Array.isArray(data) ? data : data.content ?? []);
    } catch {
      setEvidence([]);
    }
  }, [id]);

  const fetchStages = useCallback(async () => {
    try {
      const res = await disputeApi.getStages(id);
      const data = res.data?.data ?? res.data ?? [];
      setStages(Array.isArray(data) ? data : []);
    } catch {
      setStages([]);
    }
  }, [id]);

  useEffect(() => {
    fetchDispute();
    fetchEvidence();
    fetchStages();
  }, [fetchDispute, fetchEvidence, fetchStages]);

  const handleUpload = async (file, description) => {
    setUploading(true);
    setUploadError(null);
    try {
      await disputeApi.uploadEvidence(id, file, description);
      fetchEvidence();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Upload failed';
      setUploadError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEvidence = async (evidenceId) => {
    setDeleting(evidenceId);
    try {
      await disputeApi.deleteEvidence(id, evidenceId);
      setEvidence(prev => prev.filter(e => (e.evidenceId ?? e.id) !== evidenceId));
    } catch {
      // silently ignore — keep UI consistent
    } finally {
      setDeleting(null);
    }
  };

  const handleActionComplete = () => {
    fetchDispute();
    fetchStages();
  };

  if (loading) {
    return <div className="container-fluid p-4"><LoadingSpinner text="Loading dispute..." /></div>;
  }

  if (error || !dispute) {
    return (
      <div className="container-fluid p-4">
        <ErrorAlert error={error || 'Dispute not found'} title="Failed to load dispute" onRetry={fetchDispute} />
        <Link to="/disputes" className="btn btn-outline-secondary mt-2">
          <i className="bi bi-arrow-left me-1"></i>Back to Disputes
        </Link>
      </div>
    );
  }

  const isTerminal = ['ACCEPTED', 'REJECTED', 'WON', 'LOST', 'RESOLVED', 'CLOSED'].includes(dispute.status);

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex align-items-start mb-3">
        <Link to="/disputes" className="btn btn-link text-muted text-decoration-none p-0 me-2 mt-1" title="Back">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div className="flex-grow-1">
          <h3 className="mb-1">
            <i className="bi bi-chat-left-text me-2"></i>
            Dispute — {dispute.disputeId ?? id}
          </h3>
          <div className="d-flex flex-wrap gap-2 align-items-center text-muted small">
            {dispute.merchantId && (
              <Link to={`/merchants/${dispute.merchantId}`} className="text-decoration-none small">
                <i className="bi bi-people me-1"></i>
                {dispute.merchantName || `Merchant #${dispute.merchantId}`}
              </Link>
            )}
            {dispute.txnRef && (
              <>
                <span>·</span>
                <Link to={`/transactions/${dispute.transactionId ?? dispute.txnRef}`} className="text-decoration-none small font-monospace">
                  {dispute.txnRef}
                </Link>
              </>
            )}
            {dispute.network && (
              <>
                <span>·</span>
                <span className="badge bg-light text-dark border">{dispute.network}</span>
              </>
            )}
          </div>
        </div>
        <div className="d-flex gap-2 ms-3 align-items-center flex-wrap">
          <StatusBadge status={dispute.status} />
          {!isTerminal && <DeadlineCountdown deadline={dispute.responseDeadline ?? dispute.deadline} />}
        </div>
      </div>

      {/* Stage timeline */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <DisputeStageTimeline currentStatus={dispute.status} stages={stages} />
        </div>
      </div>

      <div className="row g-3">
        {/* Left column: details + evidence */}
        <div className={canManage && !isTerminal ? 'col-md-8' : 'col-md-12'}>
          {/* Dispute details */}
          <div className="card mb-3">
            <div className="card-header bg-white">
              <span className="fw-semibold small">
                <i className="bi bi-info-circle me-2"></i>Dispute Details
              </span>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <InfoRow label="Reason">
                    <ReasonBadge reason={dispute.reason} />
                  </InfoRow>
                  <InfoRow label="Dispute Amount" text={formatCurrency(dispute.disputeAmount ?? dispute.amount)} />
                  <InfoRow label="Currency" text={dispute.currency || 'INR'} />
                  <InfoRow label="Card Number" text={dispute.maskedPan || dispute.cardNumber || '—'} mono />
                </div>
                <div className="col-md-6">
                  <InfoRow label="Raised"   text={formatDateTime(dispute.raisedAt ?? dispute.createdAt)} />
                  <InfoRow label="Deadline" text={dispute.responseDeadline ? formatDateTime(dispute.responseDeadline) : '—'} />
                  <InfoRow label="Resolved" text={dispute.resolvedAt ? formatDateTime(dispute.resolvedAt) : '—'} />
                  {dispute.caseNumber && <InfoRow label="Case Number" text={dispute.caseNumber} mono />}
                </div>
              </div>
              {dispute.description && (
                <div className="mt-3 pt-3 border-top">
                  <div className="text-muted small mb-1">Description</div>
                  <div className="small">{dispute.description}</div>
                </div>
              )}
            </div>
          </div>

          {/* Evidence */}
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold small">
                <i className="bi bi-paperclip me-2"></i>Evidence ({evidence.length})
              </span>
            </div>
            <div className="card-body">
              <EvidenceList
                evidence={evidence}
                canDelete={canManage && !isTerminal}
                onDelete={handleDeleteEvidence}
                deleting={deleting}
              />

              {canManage && !isTerminal && (
                <div className="mt-3 pt-3 border-top">
                  <div className="text-muted small mb-2 fw-semibold">Upload Evidence</div>
                  {uploadError && (
                    <div className="alert alert-danger small py-2 mb-2">
                      <i className="bi bi-exclamation-triangle me-1"></i>{uploadError}
                    </div>
                  )}
                  <FileUploader
                    onUpload={handleUpload}
                    uploading={uploading}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    maxSizeMB={10}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: action panel */}
        {canManage && !isTerminal && (
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-white">
                <span className="fw-semibold small">
                  <i className="bi bi-lightning-charge me-2"></i>Actions
                </span>
              </div>
              <div className="card-body">
                <DisputeActionPanel dispute={dispute} onActionComplete={handleActionComplete} />
              </div>
            </div>

            {/* Deadline reminder */}
            {(dispute.responseDeadline ?? dispute.deadline) && (
              <div className="card mt-3 border-warning">
                <div className="card-body py-2 text-center">
                  <div className="text-warning small fw-semibold mb-1">
                    <i className="bi bi-alarm me-1"></i>Response Deadline
                  </div>
                  <div className="small">{formatDate(dispute.responseDeadline ?? dispute.deadline)}</div>
                  <DeadlineCountdown deadline={dispute.responseDeadline ?? dispute.deadline} className="d-block mt-1" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, text, mono = false, children }) {
  return (
    <div className="d-flex justify-content-between small py-1 border-bottom">
      <span className="text-muted">{label}</span>
      {children ?? <span className={mono ? 'font-monospace' : ''}>{text ?? '—'}</span>}
    </div>
  );
}

export default DisputeDetailPage;
