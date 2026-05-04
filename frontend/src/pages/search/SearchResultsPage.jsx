import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { ENTITY_CONFIG } from '../../api/globalSearchApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

function SearchResultsPage() {
  const [params]    = useSearchParams();
  const q           = params.get('q') || '';

  const [activeTab, setActiveTab] = useState(ENTITY_CONFIG[0].key);
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const activeConfig = ENTITY_CONFIG.find(c => c.key === activeTab) || ENTITY_CONFIG[0];

  useEffect(() => {
    if (!q || q.trim().length < 2) return;
    setLoading(true);
    setError(null);
    api
      .post(activeConfig.endpoint, { ...activeConfig.payload(q), size: 50 })
      .then((res) => {
        const body = res.data?.data ?? res.data ?? {};
        setData(Array.isArray(body) ? body : (body.content ?? []));
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [q, activeTab, activeConfig]);

  if (!q || q.trim().length < 2) {
    return (
      <div className="container-fluid p-4">
        <EmptyState icon="bi-search" title="No query" message="Enter a search term in the navbar to begin." />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="mb-3">
        <h3 className="mb-1">
          <i className="bi bi-search me-2"></i>
          Search results for "<span className="text-primary">{q}</span>"
        </h3>
        <p className="text-muted small mb-0">Showing up to 50 results per category</p>
      </div>

      <ul className="nav nav-tabs mb-3">
        {ENTITY_CONFIG.map(c => (
          <li key={c.key} className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeTab === c.key ? 'active' : ''}`}
              onClick={() => setActiveTab(c.key)}
            >
              <i className={`bi ${c.icon} me-1`}></i>{c.label}
            </button>
          </li>
        ))}
      </ul>

      {loading && <LoadingSpinner text={`Searching ${activeConfig.label}...`} />}

      {error && (
        <div className="alert alert-danger small">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <EmptyState
          icon="bi-emoji-frown"
          title="No results"
          message={`No ${activeConfig.label.toLowerCase()} match "${q}".`}
        />
      )}

      {!loading && !error && data.length > 0 && (
        <div className="card">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <span className="fw-semibold small">
              <i className={`bi ${activeConfig.icon} me-2`}></i>{activeConfig.label}
            </span>
            <span className="text-muted small">{data.length} results</span>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Primary</th>
                    <th>Secondary</th>
                    <th>Status</th>
                    <th style={{ width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => {
                    const id  = activeConfig.idField(item);
                    const url = `${activeConfig.route}/${id}`;
                    return (
                      <tr key={`${activeConfig.key}-${id ?? idx}`}>
                        <td className="small font-monospace text-muted">#{id ?? '—'}</td>
                        <td className="small fw-semibold">{primaryOf(activeConfig.key, item)}</td>
                        <td className="small text-muted">{secondaryOf(activeConfig.key, item)}</td>
                        <td>
                          {item.status && (
                            <span className="badge bg-secondary small">{item.status}</span>
                          )}
                        </td>
                        <td>
                          <Link to={url} className="btn btn-sm btn-outline-primary py-0">
                            Open
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function primaryOf(key, item) {
  if (key === 'merchants')   return item.legalName   || `#${item.merchantId   ?? item.id}`;
  if (key === 'terminals')   return item.tid          || `#${item.terminalId   ?? item.id}`;
  if (key === 'auths')       return item.panMasked    || `#${item.authId       ?? item.id}`;
  if (key === 'disputes')    return item.caseRef      || `#${item.disputeId ?? item.caseId ?? item.id}`;
  if (key === 'settlements') return item.batchRef     || `#${item.settleBatchId ?? item.batchId ?? item.id}`;
  if (key === 'reconFiles')  return item.fileName     || `#${item.reconFileId  ?? item.fileId ?? item.id}`;
  return '—';
}

function secondaryOf(key, item) {
  if (key === 'merchants')   return item.mid           || '';
  if (key === 'terminals')   return item.brandModel    || '';
  if (key === 'auths')       return item.amount != null ? `₹${item.amount}` : '';
  if (key === 'disputes')    return item.reasonCode    || '';
  if (key === 'settlements') return item.merchantName  || '';
  if (key === 'reconFiles')  return item.rowCount != null ? `${item.rowCount} rows` : '';
  return '';
}

export default SearchResultsPage;
