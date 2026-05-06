import DateRangePicker from '../common/DateRangePicker';

function ReconFileFilters({ filters, onChange }) {
  const set = (field, value) => onChange({ ...filters, [field]: value });

  const hasFilters = !!(filters.source || filters.fileStatus || filters.fromDate || filters.toDate);

  return (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="row g-2 align-items-end">
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.source}
              onChange={e => set('source', e.target.value)}
            >
              <option value="">All Sources</option>
              <option value="SWITCH">SWITCH</option>
              <option value="NETWORK">NETWORK</option>
              <option value="BANK">BANK</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.fileStatus}
              onChange={e => set('fileStatus', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="LOADED">Loaded</option>
              <option value="PROCESSED">Processed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="col-12 col-md-6">
            <DateRangePicker
              fromDate={filters.fromDate}
              toDate={filters.toDate}
              onChange={({ fromDate, toDate }) => onChange({ ...filters, fromDate, toDate })}
            />
          </div>

          {hasFilters && (
            <div className="col-auto">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => onChange({ source: '', fileStatus: '', fromDate: '', toDate: '' })}
              >
                <i className="bi bi-x-circle me-1"></i>Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReconFileFilters;
