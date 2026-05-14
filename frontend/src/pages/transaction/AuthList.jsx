import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { transactionApi } from '../../api/transactionApi';
import { merchantApi } from '../../api/merchantApi';
import { storeApi } from '../../api/storeApi';
import { terminalApi } from '../../api/terminalApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import TxnTypeBadge from '../../components/TxnTypeBadge';
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

const fetchStoresOptions = (merchantId) => ({ search }) =>
  storeApi.search(
    { storeName: search || undefined, merchantId: merchantId ? Number(merchantId) : undefined },
    { size: 20 }
  ).then(res => {
    const body = res.data?.data ?? res.data ?? {};
    return { content: body.content ?? (Array.isArray(body) ? body : []) };
  });

// Filtering by storeId already implies the merchant (a store belongs to
// exactly one merchant), so we deliberately omit merchantId from the
// terminal search payload. This keeps the dropdown working even when
// older terminal records have merchantId = NULL in the database.
const fetchTerminalsOptions = (storeId) => ({ search }) =>
  terminalApi.search(
    { tid: search || undefined, storeId: storeId || undefined },
    { size: 20 }
  ).then(res => {
    const body = res.data?.data ?? res.data ?? {};
    return { content: body.content ?? (Array.isArray(body) ? body : []) };
  });

function AuthList() {
  const navigate = useNavigate();

  const [items, setItems]               = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [page, setPage]                 = useState(0);
  const [pageSize, setPageSize]         = useState(10);

  const [statusFilter, setStatusFilter]   = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState('');
  const [merchantFilter, setMerchantFilter] = useState('');
  const [storeFilter, setStoreFilter]     = useState('');
  const [terminalFilter, setTerminalFilter] = useState('');
  const [fromDate, setFromDate]           = useState('');
  const [toDate, setToDate]               = useState('');
  const [searchInput, setSearchInput]     = useState('');
  const [searchTerm, setSearchTerm]       = useState('');

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [summary, setSummary]   = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearchTerm(searchInput.trim()); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(0); }, [statusFilter, txnTypeFilter, merchantFilter, storeFilter, terminalFilter, fromDate, toDate]);

  const buildFilters = useCallback(() => ({
    ...(searchTerm    && { authCode: searchTerm }),
    ...(statusFilter  && { status: statusFilter }),
    ...(txnTypeFilter && { txnType: txnTypeFilter }),
    ...(merchantFilter && { merchantId: merchantFilter }),
    ...(storeFilter   && { storeId: storeFilter }),
    ...(terminalFilter && { terminalId: terminalFilter }),
    ...(fromDate      && { fromDate: toBackendDateTime(fromDate, false) }),
    ...(toDate        && { toDate:   toBackendDateTime(toDate,   true)  }),
  }), [searchTerm, statusFilter, txnTypeFilter, merchantFilter, storeFilter, terminalFilter, fromDate, toDate]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pagination = { page, size: pageSize, sortBy: 'txnTime', sortDir: 'DESC' };
      const filters = buildFilters();
      const hasFilters = Object.keys(filters).length > 0;

      const response = hasFilters
        ? await transactionApi.searchAuths(filters, pagination)
        : await transactionApi.getAuths(pagination);

      const body = response.data?.data ?? {};
      setItems(body.content ?? []);
      setTotalElements(body.totalElements ?? 0);
      setTotalPages(body.totalPages ?? 0);
      setSummary(prev => ({ ...prev, count: body.totalElements ?? 0 }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, buildFilters]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const filters = buildFilters();
      const res = await transactionApi.getAuthStats(filters);
      const data = res.data?.data ?? res.data ?? {};
      setSummary(s => ({ ...s, totalAmount: data.totalAmount, byType: data.byType }));
    } catch {
      // Stats endpoint may not exist — count still shown from pagination
    } finally {
      setSummaryLoading(false);
    }
  }, [buildFilters]);

  useEffect(() => {
    fetchItems();
    fetchSummary();
  }, [fetchItems, fetchSummary]);

  const handleMerchantChange = (id) => { setMerchantFilter(id); setStoreFilter(''); setTerminalFilter(''); };
  const handleStoreChange    = (id) => { setStoreFilter(id); setTerminalFilter(''); };

  const clearFilters = () => {
    setSearchInput('');
    setStatusFilter('');
    setTxnTypeFilter('');
    setMerchantFilter('');
    setStoreFilter('');
    setTerminalFilter('');
    setFromDate('');
    setToDate('');
    setPage(0);
  };

  const hasActiveFilters = searchInput || statusFilter || txnTypeFilter || merchantFilter || storeFilter || terminalFilter || fromDate || toDate;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div>
          <h3 className="mb-1">
            <i className="bi bi-receipt me-2"></i>Transactions
          </h3>
          <p className="text-muted small mb-0">Authorization messages — every card swipe processed</p>
        </div>
        <Link to="/transactions/new" className="btn btn-primary btn-sm">
          <i className="bi bi-plus-lg me-1"></i>New Transaction
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2 mb-2">
            {/* Chain: Merchant → Store → Terminal */}
            <div className="col-md-4">
              <label className="form-label small">Merchant</label>
              <EntitySelect
                value={merchantFilter}
                onChange={handleMerchantChange}
                fetchOptions={fetchMerchantsOptions}
                getOptionLabel={m => m.legalName}
                getOptionId={m => m.merchantId}
                placeholder="All merchants"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small">Store</label>
              <EntitySelect
                value={storeFilter}
                onChange={handleStoreChange}
                fetchOptions={fetchStoresOptions(merchantFilter)}
                getOptionLabel={s => s.storeName}
                getOptionId={s => s.storeId}
                placeholder={merchantFilter ? 'All stores' : 'Select merchant first'}
                disabled={!merchantFilter}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small">Terminal</label>
              <EntitySelect
                value={terminalFilter}
                onChange={id => setTerminalFilter(id)}
                fetchOptions={fetchTerminalsOptions(storeFilter)}
                getOptionLabel={t => t.tid || String(t.terminalId)}
                getOptionId={t => t.terminalId}
                placeholder={storeFilter ? 'All terminals' : 'Select store first'}
                disabled={!storeFilter}
              />
            </div>
          </div>
          <div className="row g-2 align-items-end">
            <div className="col-md-5">
              <DateRangePicker
                fromDate={fromDate}
                toDate={toDate}
                onChange={({ fromDate: f, toDate: t }) => { setFromDate(f); setToDate(t); }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small">Search (Auth Code / PAN)</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text border-0 bg-transparent ps-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 ps-0"
                  placeholder="Search..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button className="btn btn-outline-secondary border-0 btn-sm" onClick={() => setSearchInput('')}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label small">Status</label>
              <select className="form-select form-select-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
                <option value="">All</option>
                <option value="APPROVED">Approved</option>
                <option value="DECLINED">Declined</option>
                <option value="REVERSED">Reversed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small">Type</label>
              <select className="form-select form-select-sm" value={txnTypeFilter} onChange={e => { setTxnTypeFilter(e.target.value); setPage(0); }}>
                <option value="">All</option>
                <option value="SALE">Sale</option>
                <option value="REFUND">Refund</option>
                <option value="VOID">Void</option>
                <option value="REVERSAL">Reversal</option>
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="d-flex justify-content-end mt-2">
              <button onClick={clearFilters} className="btn btn-sm btn-outline-secondary">
                <i className="bi bi-x-circle me-1"></i>Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <TransactionSummary
        count={summary?.count}
        totalAmount={summary?.totalAmount}
        byType={summary?.byType}
        loading={summaryLoading && !summary}
      />

      <div className="card">
        <div className="card-body p-0">
          {loading && <div className="p-3"><LoadingSpinner text="Loading transactions..." /></div>}

          {!loading && error && (
            <div className="p-3">
              <ErrorAlert error={error} title="Failed to load transactions" onRetry={fetchItems} />
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <EmptyState
              icon="bi-receipt"
              title={hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
              message={hasActiveFilters ? 'Try clearing filters.' : 'Transactions appear here as cards are processed.'}
            />
          )}

          {!loading && !error && items.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '70px' }}>Auth ID</th>
                    <th style={{ width: '90px' }}>Type</th>
                    <th>PAN</th>
                    <th>Network</th>
                    <th className="text-end">Amount</th>
                    <th>Auth Code</th>
                    <th>Resp</th>
                    <th style={{ width: '110px' }}>Status</th>
                    <th>Terminal</th>
                    <th>Time</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(a => (
                    <tr
                      key={a.authId}
                      onClick={() => navigate(`/transactions/${a.authId}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="text-muted small">{a.authId}</td>
                      <td><TxnTypeBadge type={a.txnType} size="sm" /></td>
                      <td className="small font-monospace">{a.panMasked || '—'}</td>
                      <td className="small">
                        <span className="badge bg-light text-dark border">{a.network || '—'}</span>
                      </td>
                      <td className="text-end fw-semibold small">
                        {formatCurrency(a.amount, a.currency || 'INR')}
                      </td>
                      <td className="small"><code>{a.authCode || '—'}</code></td>
                      <td className="small text-muted">{a.responseCode || '—'}</td>
                      <td><StatusBadge status={a.status} size="sm" /></td>
                      <td className="small text-muted">
                        {a.tid ? <code>{a.tid}</code> : '—'}
                      </td>
                      <td className="small text-muted">{formatDateTime(a.txnTime)}</td>
                      <td className="text-end">
                        <i className="bi bi-chevron-right text-muted"></i>
                      </td>
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

export default AuthList;
