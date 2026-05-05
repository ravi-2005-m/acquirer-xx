import { useState, useEffect, useCallback } from 'react';
import { transactionApi } from '../../api/transactionApi';
import StatusBadge from '../StatusBadge';
import ConfirmModal from '../ConfirmModal';
import LoadingSpinner from '../LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';
import { toast } from '../../utils/toast';

function BatchControlPanel({ terminalId, tid }) {
  const [batches, setBatches]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [acting, setActing]           = useState(false);
  const [showClose, setShowClose]     = useState(false);

  const openBatch = batches.find(b => b.status === 'OPEN') ?? null;
  const history   = batches.filter(b => b.status !== 'OPEN').slice(0, 5);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionApi.getBatches(terminalId);
      const data = res.data?.data ?? res.data ?? [];
      setBatches(Array.isArray(data) ? data : []);
    } catch {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [terminalId]);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const handleOpen = async () => {
    setActing(true);
    try {
      await transactionApi.openBatch(terminalId);
      toast.success('Batch opened successfully');
      fetchBatches();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to open batch');
    } finally {
      setActing(false);
    }
  };

  const handleClose = async () => {
    setShowClose(false);
    setActing(true);
    try {
      await transactionApi.closeBatch(terminalId);
      toast.success('Batch closed successfully');
      fetchBatches();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to close batch');
    } finally {
      setActing(false);
    }
  };

  return (
    <>
      <div className="card border-0 bg-light rounded mb-0">
        <div className="card-body p-3">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="mb-0 fw-semibold text-uppercase small text-muted">
              <i className="bi bi-stack me-2"></i>Batch Control
            </h6>
            <button
              className="btn btn-link btn-sm text-muted p-0"
              onClick={fetchBatches}
              disabled={loading || acting}
              title="Refresh"
            >
              <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
            </button>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading batch..." />
          ) : openBatch ? (
            <div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div>
                  <div className="text-muted small fw-semibold text-uppercase mb-1">Batch ID</div>
                  <div className="fw-semibold">#{openBatch.batchId}</div>
                </div>
                <div>
                  <div className="text-muted small fw-semibold text-uppercase mb-1">Status</div>
                  <StatusBadge status="OPEN" />
                </div>
                <div>
                  <div className="text-muted small fw-semibold text-uppercase mb-1">Opened</div>
                  <div className="small">{formatDateTime(openBatch.openTime)}</div>
                </div>
                <div className="ms-auto">
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => setShowClose(true)}
                    disabled={acting}
                  >
                    {acting
                      ? <span className="spinner-border spinner-border-sm" role="status"></span>
                      : <><i className="bi bi-stop-circle me-1"></i>Close Batch</>}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted small">No open batch on this terminal.</span>
              <button
                className="btn btn-success btn-sm"
                onClick={handleOpen}
                disabled={acting}
              >
                {acting
                  ? <span className="spinner-border spinner-border-sm" role="status"></span>
                  : <><i className="bi bi-play-circle me-1"></i>Open Batch</>}
              </button>
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-3">
              <div className="text-muted small fw-semibold text-uppercase mb-2">Recent Batches</div>
              <div className="table-responsive">
                <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr className="text-muted">
                      <th>ID</th>
                      <th>Status</th>
                      <th>Opened</th>
                      <th>Closed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(b => (
                      <tr key={b.batchId}>
                        <td>#{b.batchId}</td>
                        <td><StatusBadge status={b.status} size="sm" /></td>
                        <td>{formatDateTime(b.openTime)}</td>
                        <td>{formatDateTime(b.closeTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        show={showClose}
        onClose={() => setShowClose(false)}
        onConfirm={handleClose}
        title="Close Batch"
        message={`Close the open batch on terminal ${tid ?? terminalId}? Transactions cannot be processed until a new batch is opened.`}
        confirmLabel="Close Batch"
        confirmVariant="danger"
        loading={acting}
      />
    </>
  );
}

export default BatchControlPanel;
