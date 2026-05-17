import DateRangePicker from '../common/DateRangePicker';

const RESULTS = ['', 'ALLOW', 'REVIEW', 'BLOCK'];

function EventFilters({ filters, onChange }) {
  const set = (k, v) => onChange({ ...filters, [k]: v });

  return (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label small mb-1">PAN / Token</label>
            <input
              className="form-control form-control-sm font-monospace"
              placeholder="Search by PAN..."
              value={filters.pan || ''}
              onChange={e => set('pan', e.target.value)}
            />
          </div>
          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label small mb-1">Result</label>
            <select
              className="form-select form-select-sm"
              value={filters.result || ''}
              onChange={e => set('result', e.target.value)}
            >
              {RESULTS.map(d => (
                <option key={d} value={d}>{d || 'All Results'}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <label className="form-label small mb-1">Date Range</label>
            <DateRangePicker
              fromDate={filters.fromDate || ''}
              toDate={filters.toDate || ''}
              onChange={({ fromDate, toDate }) => onChange({ ...filters, fromDate, toDate })}
            />
          </div>
          <div className="col-12 col-md-1">
            <button
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => onChange({ pan: '', result: '', fromDate: '', toDate: '' })}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventFilters;
