import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { settlementApi } from '../../api/settlementApi';
import { toBackendDateTime } from '../../utils/formatters';
import BatchFilters from '../../components/settlements/BatchFilters';
import BatchTable from '../../components/settlements/BatchTable';
import AdjustmentModal from '../../components/settlements/AdjustmentModal';
import Pagination from '../../components/Pagination';

const INIT_FILTERS = {
  status: '', merchantId: '', minNetAmount: '', maxNetAmount: '', minTxnCount: '',
  fromDate: '', toDate: '',
};

const PAGE_SIZE = 10;

function SettlementPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'RECON' || user?.role === 'ADMIN';

  const [filters, setFilters]           = useState(INIT_FILTERS);
  const [page, setPage]                 = useState(0);
  const [batches, setBatches]           = useState([]);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [showAdjModal, setShowAdjModal] = useState(false);

  const buildSearch = useCallback(() => {
    const s = {};
    if (filters.status)        s.status        = filters.status;
    if (filters.merchantId)    s.merchantId    = parseInt(filters.merchantId, 10);
    if (filters.minNetAmount)  s.minNetAmount  = parseFloat(filters.minNetAmount);
    if (filters.maxNetAmount)  s.maxNetAmount  = parseFloat(filters.maxNetAmount);
    if (filters.minTxnCount)   s.minTxnCount   = parseInt(filters.minTxnCount, 10);
    if (filters.fromDate)      s.fromDate      = toBackendDateTime(filters.fromDate, false);
    if (filters.toDate)        s.toDate        = toBackendDateTime(filters.toDate,   true);
    return s;
  }, [filters]);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const searchFilters = buildSearch();
      const pagination    = { page, size: PAGE_SIZE };
      const hasFilters    = Object.keys(searchFilters).length > 0;

      const res  = hasFilters
        ? await settlementApi.searchBatches(searchFilters, pagination)
        : await settlementApi.getBatches(pagination);

      const body = res.data?.data ?? res.data ?? {};
      setBatches(body.content ?? []);
      setTotalPages(body.totalPages ?? 0);
      setTotalElements(body.totalElements ?? 0);
    } catch {
      setBatches([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [buildSearch, page]);

  useEffect(() => {
    const t = setTimeout(fetchBatches, 300);
    return () => clearTimeout(t);
  }, [fetchBatches]);

  const handleFiltersChange = (f) => {
    setFilters(f);
    setPage(0);
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="mb-1"><i className="bi bi-bank me-2"></i>Settlements</h3>
          <p className="text-muted small mb-0">Daily settlement batches and payout status</p>
        </div>
        {canManage && (
          <button className="btn btn-outline-primary btn-sm" onClick={() => setShowAdjModal(true)}>
            <i className="bi bi-plus me-1"></i>New Adjustment
          </button>
        )}
      </div>

      <BatchFilters filters={filters} onChange={handleFiltersChange} />

      <div className="card">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-semibold small">
            <i className="bi bi-list-ul me-2"></i>Batches
          </span>
          <span className="text-muted small">{totalElements} total</span>
        </div>
        <div className="card-body p-0">
          <BatchTable batches={batches} loading={loading} />
        </div>
        {totalPages > 1 && (
          <div className="card-footer bg-white">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <AdjustmentModal
        show={showAdjModal}
        onClose={() => setShowAdjModal(false)}
        onSaved={() => { setShowAdjModal(false); fetchBatches(); }}
      />
    </div>
  );
}

export default SettlementPage;
