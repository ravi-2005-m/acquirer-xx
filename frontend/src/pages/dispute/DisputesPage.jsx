import { useState, useEffect, useCallback } from 'react';
import { disputeApi } from '../../api/disputeApi';
import { toBackendDateTime } from '../../utils/formatters';
import MetricCard from '../../components/common/MetricCard';
import DisputeFilters from '../../components/disputes/DisputeFilters';
import DisputeTable from '../../components/disputes/DisputeTable';
import Pagination from '../../components/Pagination';

const INIT_FILTERS = {
  stage: '', status: '', reasonCode: '', merchantId: '', fromDate: '', toDate: '', deadlineExpired: false,
};

function DisputesPage() {
  const [filters, setFilters]         = useState(INIT_FILTERS);
  const [page, setPage]               = useState(0);
  const [pageSize]                    = useState(20);

  const [disputes, setDisputes]       = useState([]);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);

  const [summary, setSummary]         = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const buildSearch = useCallback(() => ({
    ...(filters.stage           && { stage: filters.stage }),
    ...(filters.status          && { status: filters.status }),
    ...(filters.reasonCode      && { reasonCode: filters.reasonCode }),
    ...(filters.merchantId      && { merchantId: filters.merchantId }),
    ...(filters.fromDate        && { fromDate: toBackendDateTime(filters.fromDate, false) }),
    ...(filters.toDate          && { toDate:   toBackendDateTime(filters.toDate,   true)  }),
    ...(filters.deadlineExpired && { deadlineExpired: true }),
  }), [filters]);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const searchFilters = buildSearch();
      const pagination    = { page, size: pageSize };
      const hasFilters    = Object.keys(searchFilters).length > 0;

      const res  = hasFilters
        ? await disputeApi.searchDisputes(searchFilters, pagination)
        : await disputeApi.getDisputes(pagination);

      const body = res.data?.data ?? res.data ?? {};
      setDisputes(body.content ?? []);
      setTotalPages(body.totalPages ?? 0);
      setTotalElements(body.totalElements ?? 0);
    } catch {
      setDisputes([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [buildSearch, page, pageSize]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await disputeApi.getSummary(buildSearch());
      setSummary(res.data?.data ?? res.data ?? null);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [buildSearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchDisputes();
      fetchSummary();
    }, 300);
    return () => clearTimeout(t);
  }, [fetchDisputes, fetchSummary]);

  const handleFiltersChange = (f) => {
    setFilters(f);
    setPage(0);
  };

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <h3 className="mb-1">
          <i className="bi bi-chat-left-text me-2"></i>Disputes
        </h3>
        <p className="text-muted small mb-0">Manage chargebacks and dispute resolution workflows</p>
      </div>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <MetricCard
            title="Open Disputes"
            value={summary?.openDisputes ?? (loading ? null : disputes.filter(d => d.status === 'OPEN').length)}
            format="number"
            icon="📋"
            color="danger"
            loading={summaryLoading}
          />
        </div>
        <div className="col-6 col-md-3">
          <MetricCard
            title="Closed Disputes"
            value={summary?.closedDisputes}
            format="number"
            icon="✅"
            color="success"
            loading={summaryLoading}
          />
        </div>
        <div className="col-6 col-md-3">
          <MetricCard
            title="Expired Deadlines"
            value={summary?.expiredDeadlines}
            format="number"
            icon="⏰"
            color="warning"
            loading={summaryLoading}
          />
        </div>
        <div className="col-6 col-md-3">
          <MetricCard
            title="Total Disputes"
            value={summary?.totalDisputes ?? totalElements}
            format="number"
            icon="📦"
            color="primary"
            loading={summaryLoading}
          />
        </div>
      </div>

      <DisputeFilters filters={filters} onChange={handleFiltersChange} />

      <div className="card">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-semibold small">
            <i className="bi bi-list-ul me-2"></i>Disputes
          </span>
          <span className="text-muted small">{totalElements} total</span>
        </div>
        <div className="card-body p-0">
          <DisputeTable disputes={disputes} loading={loading} />
        </div>
        {!loading && totalPages > 1 && (
          <div className="card-footer bg-white">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default DisputesPage;
