import { formatINR, formatNumber } from '../../utils/formatters';

function TransactionSummary({ count, totalAmount, byType, loading }) {
  if (loading) {
    return (
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="d-flex align-items-center gap-2">
            <span className="spinner-border spinner-border-sm text-secondary" role="status"></span>
            <span className="text-muted small">Calculating summary...</span>
          </div>
        </div>
      </div>
    );
  }

  if (count == null && totalAmount == null) return null;

  return (
    <div className="card mb-3">
      <div className="card-body py-3">
        <div className="row g-0 text-center">
          <div className="col">
            <div className="text-muted small mb-1">Count</div>
            <div className="fw-bold fs-5">{formatNumber(count ?? 0)}</div>
          </div>
          {totalAmount != null && (
            <div className="col border-start">
              <div className="text-muted small mb-1">Total Amount</div>
              <div className="fw-bold fs-5 text-success">{formatINR(totalAmount)}</div>
            </div>
          )}
          {byType?.SALE != null && (
            <div className="col border-start">
              <div className="text-muted small mb-1">Sales</div>
              <div className="fw-semibold">{formatINR(byType.SALE, { compact: true })}</div>
            </div>
          )}
          {byType?.REFUND != null && (
            <div className="col border-start">
              <div className="text-muted small mb-1">Refunds</div>
              <div className="fw-semibold text-warning">{formatINR(byType.REFUND, { compact: true })}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionSummary;
