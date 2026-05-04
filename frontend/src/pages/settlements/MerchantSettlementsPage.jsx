import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { settlementApi } from '../../api/settlementApi';
import { merchantApi } from '../../api/merchantApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import MerchantSettlementSummary from '../../components/settlements/MerchantSettlementSummary';
import BatchTable from '../../components/settlements/BatchTable';
import AdjustmentList from '../../components/settlements/AdjustmentList';
import AdjustmentModal from '../../components/settlements/AdjustmentModal';
import RunSettlementModal from '../../components/settlements/RunSettlementModal';
import Pagination from '../../components/Pagination';

const BATCH_PAGE_SIZE = 10;

function MerchantSettlementsPage() {
  const { merchantId } = useParams();
  const { user }       = useAuth();
  const canManage      = user?.role === 'RECON' || user?.role === 'ADMIN';

  const [merchant, setMerchant]           = useState(null);

  const [summary, setSummary]             = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [batches, setBatches]             = useState([]);
  const [batchPage, setBatchPage]         = useState(0);
  const [batchTotalPages, setBatchTotalPages]     = useState(0);
  const [batchTotalElements, setBatchTotalElements] = useState(0);
  const [batchesLoading, setBatchesLoading] = useState(true);

  const [adjustments, setAdjustments]     = useState([]);
  const [adjLoading, setAdjLoading]       = useState(true);

  const [showAdjModal, setShowAdjModal]   = useState(false);
  const [showRunModal, setShowRunModal]   = useState(false);

  const fetchMerchant = useCallback(async () => {
    try {
      const res = await merchantApi.getById(merchantId);
      setMerchant(res.data?.data ?? res.data ?? null);
    } catch {
      setMerchant(null);
    }
  }, [merchantId]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await settlementApi.getMerchantSummary(merchantId);
      setSummary(res.data?.data ?? res.data ?? null);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [merchantId]);

  const fetchBatches = useCallback(async () => {
    setBatchesLoading(true);
    try {
      const res  = await settlementApi.getMerchantBatches(merchantId, { page: batchPage, size: BATCH_PAGE_SIZE });
      const body = res.data?.data ?? res.data ?? {};
      setBatches(body.content ?? []);
      setBatchTotalPages(body.totalPages ?? 0);
      setBatchTotalElements(body.totalElements ?? 0);
    } catch {
      setBatches([]);
    } finally {
      setBatchesLoading(false);
    }
  }, [merchantId, batchPage]);

  const fetchAdjustments = useCallback(async () => {
    setAdjLoading(true);
    try {
      const res  = await settlementApi.getMerchantAdjustments(merchantId, { size: 20 });
      const body = res.data?.data ?? res.data ?? {};
      setAdjustments(body.content ?? (Array.isArray(body) ? body : []));
    } catch {
      setAdjustments([]);
    } finally {
      setAdjLoading(false);
    }
  }, [merchantId]);

  useEffect(() => { fetchMerchant(); }, [fetchMerchant]);
  useEffect(() => { fetchSummary();  }, [fetchSummary]);
  useEffect(() => { fetchBatches();  }, [fetchBatches]);
  useEffect(() => { fetchAdjustments(); }, [fetchAdjustments]);

  const handleAdjSaved = () => {
    setShowAdjModal(false);
    fetchAdjustments();
    fetchSummary();
  };

  const handleRunCompleted = () => {
    setShowRunModal(false);
    fetchBatches();
    fetchSummary();
  };

  const merchantName = merchant?.businessName ?? merchant?.legalName ?? null;

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex align-items-start mb-4 flex-wrap gap-2">
        <Link to="/settlement" className="btn btn-link text-muted text-decoration-none p-0 me-2 mt-1" title="Back">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div className="flex-grow-1">
          <h3 className="mb-1">
            <i className="bi bi-bank me-2"></i>
            {merchantName ? `Settlements — ${merchantName}` : `Settlements — Merchant #${merchantId}`}
          </h3>
          <Link to={`/merchants/${merchantId}`} className="small text-decoration-none text-muted">
            <i className="bi bi-people me-1"></i>View merchant profile
          </Link>
        </div>
        {canManage && (
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm" onClick={() => setShowAdjModal(true)}>
              <i className="bi bi-plus me-1"></i>Adjustment
            </button>
            <button className="btn btn-warning btn-sm" onClick={() => setShowRunModal(true)}>
              <i className="bi bi-play-circle me-1"></i>Run Settlement
            </button>
          </div>
        )}
      </div>

      <MerchantSettlementSummary summary={summary} loading={summaryLoading} />

      <div className="row g-3">
        {/* Batches */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold small">
                <i className="bi bi-list-ul me-2"></i>Batches
              </span>
              <span className="text-muted small">{batchTotalElements} total</span>
            </div>
            <div className="card-body p-0">
              {batchesLoading && batches.length === 0
                ? <div className="p-4 text-center"><LoadingSpinner text="Loading batches..." /></div>
                : <BatchTable batches={batches} loading={batchesLoading} />
              }
            </div>
            {batchTotalPages > 1 && (
              <div className="card-footer bg-white">
                <Pagination
                  page={batchPage}
                  totalPages={batchTotalPages}
                  totalElements={batchTotalElements}
                  pageSize={BATCH_PAGE_SIZE}
                  onPageChange={setBatchPage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Adjustments sidebar */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold small">
                <i className="bi bi-pencil-square me-2"></i>Recent Adjustments
              </span>
              <span className="text-muted small">{adjustments.length}</span>
            </div>
            <div className="card-body">
              <AdjustmentList adjustments={adjustments} loading={adjLoading} />
            </div>
          </div>
        </div>
      </div>

      <AdjustmentModal
        show={showAdjModal}
        defaultMerchantId={merchantId}
        onClose={() => setShowAdjModal(false)}
        onSaved={handleAdjSaved}
      />

      <RunSettlementModal
        show={showRunModal}
        merchantId={merchantId}
        merchantName={merchantName}
        onClose={() => setShowRunModal(false)}
        onCompleted={handleRunCompleted}
      />
    </div>
  );
}

export default MerchantSettlementsPage;
