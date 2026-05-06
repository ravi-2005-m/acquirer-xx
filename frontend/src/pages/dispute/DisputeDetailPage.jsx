import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { disputeApi } from '../../api/disputeApi';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import StatusBadge from '../../components/StatusBadge';
import DocumentList from '../../components/disputes/EvidenceList';
import DisputeActionPanel from '../../components/disputes/DisputeActionPanel';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

const STAGES = ['RETRIEVAL', 'CHARGEBACK', 'REPRESENTMENT', 'ARBITRATION'];

const DOC_TYPES = [
  { value: 'RECEIPT',        label: 'Receipt' },
  { value: 'INVOICE',        label: 'Invoice' },
  { value: 'DELIVERY_PROOF', label: 'Delivery Proof' },
  { value: 'COMMUNICATION',  label: 'Communication' },
];

function StageStrip({ currentStage }) {
  const idx = STAGES.indexOf((currentStage || '').toUpperCase());
  return (
    <div className="d-flex gap-2 align-items-center flex-wrap">
      {STAGES.map((s, i) => (
        <div key={s} className="d-flex align-items-center">
          <span className={`badge ${i <= idx ? 'bg-primary' : 'bg-light text-muted border'}`}>
            {i + 1}. {s}
          </span>
          {i < STAGES.length - 1 && <span className="text-muted mx-1">›</span>}
        </div>
      ))}
    </div>
  );
}

function DisputeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const canManage = user?.role === 'DISPUTES' || user?.role === 'ADMIN';

  const [dispute, setDispute]   = useState(null);
  const [documents, setDocs]    = useState([]);
  const [actions, setActions]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [docType, setDocType] = useState('RECEIPT');
  const [docUri, setDocUri]   = useState('');
  const [linking, setLinking] = useState(false);
  const [linkErr, setLinkErr] = useState(null);

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

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await disputeApi.getDocuments(id);
      const data = res.data?.data ?? res.data ?? [];
      setDocs(Array.isArray(data) ? data : []);
    } catch {
      setDocs([]);
    }
  }, [id]);

  const fetchActions = useCallback(async () => {
    try {
      const res = await disputeApi.getActions(id);
      const data = res.data?.data ?? res.data ?? [];
      setActions(Array.isArray(data) ? data : []);
    } catch {
      setActions([]);
    }
  }, [id]);

  useEffect(() => {
    fetchDispute();
    fetchDocuments();
    fetchActions();
  }, [fetchDispute, fetchDocuments, fetchActions]);

  const handleLink = async (e) => {
    e.preventDefault();
    if (!docUri.trim()) return;
    setLinking(true);
    setLinkErr(null);
    try {
      await disputeApi.addDocument({ caseId: Number(id), docType, uri: docUri.trim() });
      setDocUri('');
      fetchDocuments();
    } catch (err) {
      setLinkErr(err?.response?.data?.message || 'Failed to add document');
    } finally {
      setLinking(false);
    }
  };

  const handleActionComplete = () => {
    fetchDispute();
    fetchActions();
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

  const isClosed = (dispute.status || '').toUpperCase() === 'CLOSED';

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-start mb-3">
        <Link to="/disputes" className="btn btn-link text-muted text-decoration-none p-0 me-2 mt-1" title="Back">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div className="flex-grow-1">
          <h3 className="mb-1">
            <i className="bi bi-chat-left-text me-2"></i>
            Dispute — {dispute.caseId ?? id}
          </h3>
          <div className="d-flex flex-wrap gap-2 align-items-center text-muted small">
            {dispute.merchantName && (
              <span><i className="bi bi-people me-1"></i>{dispute.merchantName}</span>
            )}
            {dispute.txnId && (
              <>
                <span>·</span>
                <Link to={`/transactions/${dispute.txnId}`} className="text-decoration-none small font-monospace">
                  Txn #{dispute.txnId}
                </Link>
              </>
            )}
            {dispute.panMasked && (
              <>
                <span>·</span>
                <span className="font-monospace">{dispute.panMasked}</span>
              </>
            )}
          </div>
        </div>
        <div className="d-flex gap-2 ms-3 align-items-center flex-wrap">
          <StatusBadge status={dispute.status} />
        </div>
      </div>

      {/* Stage strip */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <StageStrip currentStage={dispute.stage} />
        </div>
      </div>

      <div className="row g-3">
        <div className={canManage && !isClosed ? 'col-md-8' : 'col-md-12'}>
          {/* Details */}
          <div className="card mb-3">
            <div className="card-header bg-white">
              <span className="fw-semibold small">
                <i className="bi bi-info-circle me-2"></i>Dispute Details
              </span>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <InfoRow label="Reason Code" text={dispute.reasonCode} mono />
                  <InfoRow label="Stage"       text={dispute.stage} />
                  <InfoRow label="Amount"      text={formatCurrency(dispute.txnAmount)} />
                </div>
                <div className="col-md-6">
                  <InfoRow label="Opened"   text={formatDateTime(dispute.openedDate)} />
                  <InfoRow label="Deadline" text={dispute.deadline ? formatDateTime(dispute.deadline) : '—'} />
                  <InfoRow label="Closed"   text={dispute.closedDate ? formatDateTime(dispute.closedDate) : '—'} />
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card mb-3">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold small">
                <i className="bi bi-paperclip me-2"></i>Documents ({documents.length})
              </span>
            </div>
            <div className="card-body">
              <DocumentList documents={documents} />

              {canManage && !isClosed && (
                <form onSubmit={handleLink} className="mt-3 pt-3 border-top">
                  <div className="text-muted small mb-2 fw-semibold">Link a Document</div>
                  {linkErr && (
                    <div className="alert alert-danger small py-2 mb-2">
                      <i className="bi bi-exclamation-triangle me-1"></i>{linkErr}
                    </div>
                  )}
                  <div className="row g-2">
                    <div className="col-md-3">
                      <select
                        className="form-select form-select-sm"
                        value={docType}
                        onChange={e => setDocType(e.target.value)}
                        disabled={linking}
                      >
                        {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                    <div className="col-md-7">
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="Document URI (https://...)"
                        value={docUri}
                        onChange={e => setDocUri(e.target.value)}
                        required
                        disabled={linking}
                      />
                    </div>
                    <div className="col-md-2">
                      <button type="submit" className="btn btn-primary btn-sm w-100" disabled={linking || !docUri.trim()}>
                        {linking ? '…' : 'Link'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Action history */}
          <div className="card">
            <div className="card-header bg-white">
              <span className="fw-semibold small">
                <i className="bi bi-list-check me-2"></i>Action History ({actions.length})
              </span>
            </div>
            <div className="card-body">
              {actions.length === 0 ? (
                <p className="text-muted small mb-0">No actions logged yet.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {actions.map(a => (
                    <li key={a.actionId} className="list-group-item px-0 py-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="badge bg-light text-dark border me-2">{a.actionType}</span>
                          {a.notes && <span className="small">{a.notes}</span>}
                        </div>
                        <span className="text-muted small">{formatDateTime(a.actionDate)}</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Actor #{a.actorId}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {canManage && !isClosed && (
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
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, text, mono = false }) {
  return (
    <div className="d-flex justify-content-between small py-1 border-bottom">
      <span className="text-muted">{label}</span>
      <span className={mono ? 'font-monospace' : ''}>{text ?? '—'}</span>
    </div>
  );
}

export default DisputeDetailPage;
