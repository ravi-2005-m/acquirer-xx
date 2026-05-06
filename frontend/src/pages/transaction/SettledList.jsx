import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionApi } from '../../api/transactionApi';
import { merchantApi } from '../../api/merchantApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import EntitySelect from '../../components/common/EntitySelect';
import DateRangePicker from '../../components/common/DateRangePicker';
import TransactionSummary from '../../components/transactions/TransactionSummary';
import { formatDateTime, formatCurrency, toBackendDateTime } from '../../utils/formatters';

const fetchMerchantsOptions = ({ search }) =>
  (search
    ? merchantApi.search({ legalName: search }, { size: 20 })
    : merchantApi.getAll({ size: 20 })
  ).then(res => {
    const body = res.data?.data ?? res.data ?? {};
    return { content: body.content ?? (Array.isArray(body) ? body : []) };
  });

function SettledList() {
  const navigate = useNavigate();

  const [items, setItems]               = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [page, setPage]                 = useState(0);
  const [pageSize, setPageSize]         = useState(10);

  const [statusFilter, setStatusFilter]   = useState('');
  const [settledFilter, setSettledFilter] = useState('');
  const [merchantFilter, setMerchantFilter] = useState('');
  const [fromDate, setFromDate]           = useState('');
  const [toDate, setToDate]               = useState('');
  const [minAmount, setMinAmount]         = useState('');
  const [maxAmount, setMaxAmount]         = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => { setPage(0); }, [statusFilter, settledFilter, merchantFilter, fromDate, toDate, minAmount, maxAmount]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pagination = { page, size: pageSize, sortBy: 'txnDate', sortDir: 'DESC' };
      const hasFilters = statusFilter || settledFilter !== '' || merchantFilter || fromDate || toDate || minAmount || maxAmount;

      const response = hasFilters
        ? await transactionApi.searchTxns(
            {
              ...(statusFilter   && { status: statusFilter }),
              ...(settledFilter !== '' && { settled: settledFilter === 'true' }),
              ...(merchantFilter && { merchantId: merchantFilter }),
              ...(fromDate       && { fromDate: toBackendDateTime(fromDate, false) }),
              ...(toDate         && { toDate:   toBackendDateTime(toDate,   true)  }),
              ...(minAmount      && { minAmount: parseFloat(minAmount) }),
              ...(maxAmount      && { maxAmount: parseFloat(maxAmount) }),
            },
            pagination
          )
        : await transactionApi.getTxns(pagination);

      const body = response.data?.data ?? {};
      setItems(body.content ?? []);
      setTotalElements(body.totalElements ?? 0);
      setTotalPages(body.totalPages ?? 0);
      setSummary(s => ({ ...s, count: body.totalElements ?? 0 }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, settledFilter, merchantFilter, fromDate, toDate, minAmount, maxAmount]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await transactionApi.getStats();
      const data = res.data?.data ?? res.data ?? {};
      setSummary(s => ({ ...s, totalAmount: data.totalAmount ?? data.totalNetAmount }));
    } catch {
      // Stats optional
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchSummary();
  }, [fetchItems, fetchSummary]);

  const clearFilters = () => {
    setStatusFilter('');
    setSettledFilter('');
    setMerchantFilter('');
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
    setPage(0);
  };

  const hasActiveFilters = statusFilter || settledFilter !== '' || merchantFilter || fromDate || toDate || minAmount || maxAmount;

  return (
    <div className="container-fluid p-4">
      <div className="mb-3">
        <h3 className="mb-1">
          <i className="bi bi-cash-coin me-2"></i>Settled Transactions
        </h3>
        <p className="text-muted small mb-0">Post-authorization records with fee calculations</p>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2 mb-2">
            <div className="col-md-4">
              <label className="form-label small">Merchant</label>
              <EntitySelect
                value={merchantFilter}
                onChange={id => setMerchantFilter(id)}
                fetchOptions={fetchMerchantsOptions}
                getOptionLabel={m => m.legalName}
                getOptionId={m => m.merchantId}
                placeholder="All merchants"
              />
            </div>
            <div className="col-md-4">
              <DateRangePicker
                fromDate={fromDate}
                toDate={toDate}
                onChange={({ fromDate: f, toDate: t }) => { setFromDate(f); setToDate(t); }}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small">Min Amount</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={minAmount}
                onChange={e => { setMinAmount(e.target.value); setPage(0); }}
                step="0.01" min="0" placeholder="0"
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small">Max Amount</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={maxAmount}
                onChange={e => { setMaxAmount(e.target.value); setPage(0); }}
                step="0.01" min="0" placeholder="∞"
              />
            </div>
          </div>
          <div className="row g-2 align-items-end">
            <div className="col-md-2">
              <label className="form-label small">Status</label>
              <select className="form-select form-select-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
                <option value="">All</option>
                <option value="APPROVED">Approved</option>
                <option value="DECLINED">Declined</option>
                <option value="REVERSED">Reversed</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small">Settled</label>
              <select className="form-select form-select-sm" value={settledFilter} onChange={e => { setSettledFilter(e.target.value); setPage(0); }}>
                <option value="">All</option>
                <option value="true">Settled</option>
                <option value="false">Unsettled</option>
              </select>
            </div>
            <div className="col-md-8 d-flex justify-content-end align-items-end">
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-sm btn-outline-secondary">
                  <i className="bi bi-x-circle me-1"></i>Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <TransactionSummary
        count={summary?.count}
        totalAmount={summary?.totalAmount}
        loading={false}
      />

      <div className="card">
        <div className="card-body p-0">
          {loading && <div className="p-3"><LoadingSpinner text="Loading settled transactions..." /></div>}

          {!loading && error && (
            <div className="p-3">
              <ErrorAlert error={error} title="Failed to load settled transactions" onRetry={fetchItems} />
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <EmptyState
              icon="bi-cash-coin"
              title={hasActiveFilters ? 'No transactions match your filters' : 'No settled transactions yet'}
              message={hasActiveFilters ? 'Try clearing filters.' : 'Approved auth messages get converted to settled transactions.'}
            />
          )}

          {!loading && !error && items.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '70px' }}>Txn ID</th>
                    <th>Merchant</th>
                    <th className="text-end">Amount</th>
                    <th className="text-end">Total Fee</th>
                    <th className="text-end">Net</th>
                    <th style={{ width: '110px' }}>Status</th>
                    <th style={{ width: '90px' }}>Settled</th>
                    <th>Terminal</th>
                    <th>Date</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(t => (
                    <tr
                      key={t.txnId}
                      onClick={() => navigate(`/transactions/settled/${t.txnId}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="text-muted small">{t.txnId}</td>
                      <td className="small">
                        {t.merchantName || <span className="text-muted">ID: {t.merchantId ?? '—'}</span>}
                      </td>
                      <td className="text-end fw-semibold small">{formatCurrency(t.amount, t.currency || 'INR')}</td>
                      <td className="text-end small text-muted">{formatCurrency(t.totalFee, t.currency || 'INR')}</td>
                      <td className="text-end fw-semibold small">{formatCurrency(t.netMerchantAmount, t.currency || 'INR')}</td>
                      <td><StatusBadge status={t.status} size="sm" /></td>
                      <td>
                        {t.settled
                          ? <span className="badge bg-success small"><i className="bi bi-check-circle me-1"></i>Yes</span>
                          : <span className="badge bg-warning small"><i className="bi bi-clock me-1"></i>No</span>}
                      </td>
                      <td className="small text-muted">{t.tid ? <code>{t.tid}</code> : '—'}</td>
                      <td className="small text-muted">{formatDateTime(t.txnDate)}</td>
                      <td className="text-end"><i className="bi bi-chevron-right text-muted"></i></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && !error && items.length > 0 && (
          <div className="card-footer bg-white">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={s => { setPageSize(s); setPage(0); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SettledList;
