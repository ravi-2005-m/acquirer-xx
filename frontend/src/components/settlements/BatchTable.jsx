import { useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../StatusBadge';
import { formatINR, formatDate, formatNumber } from '../../utils/formatters';

// Older settlement batches may have the Feign-fallback placeholder text
// stored as the merchant name. Treat anything matching that pattern as missing
// and fall back to "Merchant #<id>".
function displayMerchantName(name, merchantId) {
  if (!name) return `Merchant #${merchantId}`;
  const lower = name.toLowerCase();
  if (lower === 'unknown' || lower.includes('unavailable')) {
    return `Merchant #${merchantId}`;
  }
  return name;
}

function BatchTable({ batches, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <div className="text-muted small mt-2">Loading batches...</div>
      </div>
    );
  }

  if (!batches || batches.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-bank fs-2 d-block mb-2 opacity-25"></i>
        No settlement batches found.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Batch ID</th>
            <th>Period</th>
            <th>Merchant</th>
            <th className="text-end">Txns</th>
            <th className="text-end">Gross</th>
            <th className="text-end">Fees</th>
            <th className="text-end">Net</th>
            <th>Status</th>
            <th>Posted</th>
            <th style={{ width: '60px' }}></th>
          </tr>
        </thead>
        <tbody>
          {batches.map(b => (
            <tr
              key={b.settleBatchId}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/settlement/${b.settleBatchId}`, { state: { batch: b } })}
            >
              <td className="small font-monospace text-muted">#{b.settleBatchId}</td>
              <td className="small">
                {formatDate(b.periodStart)} → {formatDate(b.periodEnd)}
              </td>
              <td className="small">
                <Link
                  to={`/settlement/merchant/${b.merchantId}`}
                  className="text-decoration-none"
                  onClick={e => e.stopPropagation()}
                >
                  {displayMerchantName(b.merchantName, b.merchantId)}
                </Link>
              </td>
              <td className="text-end small">{formatNumber(b.txnCount)}</td>
              <td className="text-end small">{formatINR(b.grossAmount)}</td>
              <td className="text-end small text-muted">{formatINR(b.totalFees)}</td>
              <td className="text-end small fw-semibold">{formatINR(b.netAmount)}</td>
              <td><StatusBadge status={b.status} /></td>
              <td className="small text-muted">{b.postedDate ? formatDate(b.postedDate) : '—'}</td>
              <td onClick={e => e.stopPropagation()}>
                <Link
                  to={`/settlement/${b.settleBatchId}`}
                  state={{ batch: b }}
                  className="btn btn-sm btn-outline-primary py-0 px-2"
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BatchTable;
