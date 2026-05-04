import { formatNumber } from '../../utils/formatters';

function Stat({ label, value, color = '' }) {
  return (
    <div className="col">
      <div className="text-muted small">{label}</div>
      <div className={`fw-bold ${color}`}>{value ?? '—'}</div>
    </div>
  );
}

function ReconSummaryPanel({ summary, loading }) {
  if (loading) {
    return (
      <div className="card mb-3">
        <div className="card-body py-2 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
          <span className="text-muted small">Loading summary...</span>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const matchRate = summary.matchRate != null
    ? (summary.matchRate < 1 ? summary.matchRate * 100 : summary.matchRate)
    : null;

  return (
    <div className="card mb-3">
      <div className="card-body py-3">
        <div className="row text-center g-2 mb-2">
          <Stat label="Total Files"   value={formatNumber(summary.totalFiles)} />
          <Stat label="Loaded"        value={formatNumber(summary.loadedFiles)}     color="text-primary" />
          <Stat label="Processed"     value={formatNumber(summary.processedFiles)}  color="text-success" />
          <Stat label="Failed"        value={formatNumber(summary.failedFiles)}     color="text-danger" />
          <Stat label="Loaded Today"  value={formatNumber(summary.filesLoadedToday)} color="text-info" />
        </div>

        <hr className="my-2" />

        <div className="row text-center g-2 mb-2">
          <Stat label="Total Items"  value={formatNumber(summary.totalItems)} />
          <Stat label="Matched"      value={formatNumber(summary.matchedItems)}     color="text-success" />
          <Stat label="Mismatched"   value={formatNumber(summary.mismatchedItems)}  color="text-warning" />
          <Stat label="Unmatched"    value={formatNumber(summary.unmatchedItems)}   color="text-danger" />
          <div className="col">
            <div className="text-muted small">Match Rate</div>
            <div className={`fw-bold ${
              matchRate == null ? '' :
              matchRate > 95 ? 'text-success' :
              matchRate > 80 ? 'text-warning' : 'text-danger'
            }`}>
              {matchRate != null ? `${matchRate.toFixed(1)}%` : '—'}
            </div>
          </div>
        </div>

        <hr className="my-2" />

        <div className="row text-center g-2">
          <Stat label="Total Exceptions" value={formatNumber(summary.totalExceptions)} />
          <Stat label="Open"             value={formatNumber(summary.openExceptions)}        color="text-warning" />
          <Stat label="Resolved"         value={formatNumber(summary.resolvedExceptions)}    color="text-success" />
          <Stat label="Written Off"      value={formatNumber(summary.writtenOffExceptions)}  color="text-muted" />
          <Stat label="New Today"        value={formatNumber(summary.exceptionsCreatedToday)} color="text-info" />
        </div>
      </div>
    </div>
  );
}

export default ReconSummaryPanel;
