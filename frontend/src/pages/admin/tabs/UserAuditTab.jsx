import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../../../api/userApi';
import Pagination from '../../../components/Pagination';

const PAGE_SIZE = 20;

export default function UserAuditTab({ username }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate]     = useState('');
  const [page, setPage]         = useState(0);
  const [logs, setLogs]         = useState([]);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (fromDate) filters.fromDate = `${fromDate}T00:00:00`;
      if (toDate)   filters.toDate   = `${toDate}T23:59:59`;

      const res  = await userApi.getUserAuditLogs(username, filters, { page, size: PAGE_SIZE });
      const body = res.data?.data ?? res.data ?? {};
      setLogs(body.content ?? []);
      setTotalPages(body.totalPages ?? 0);
      setTotalElements(body.totalElements ?? 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [username, fromDate, toDate, page]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      {/* Date filter */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-end">
            <div className="col-auto">
              <label className="form-label small mb-1">From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
              />
            </div>
            <div className="col-auto">
              <label className="form-label small mb-1">To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(0); }}
              />
            </div>
            <div className="col-auto">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => { setFromDate(''); setToDate(''); setPage(0); }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-semibold small"><i className="bi bi-clock-history me-2"></i>Audit Log</span>
          <span className="text-muted small">{totalElements} entries</span>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
              <div className="text-muted small mt-2">Loading…</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-clock-history fs-2 d-block mb-2 opacity-25"></i>
              No audit log entries found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Target Type</th>
                    <th>Target ID</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.auditId}>
                      <td className="text-muted text-nowrap">
                        {log.performedAt ? new Date(log.performedAt).toLocaleString() : '—'}
                      </td>
                      <td>
                        <span className="badge bg-secondary fw-normal">{log.action}</span>
                      </td>
                      <td className="text-muted">{log.targetType || '—'}</td>
                      <td className="text-muted">{log.targetId || '—'}</td>
                      <td className="text-muted" style={{ maxWidth: 280 }}>
                        <span className="text-truncate d-block">{log.details || '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    </div>
  );
}
