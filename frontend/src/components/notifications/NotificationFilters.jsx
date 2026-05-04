import DateRangePicker from '../common/DateRangePicker';

const CATEGORIES = ['', 'BATCH', 'SETTLEMENT', 'DISPUTE', 'RISK', 'RECON', 'SYSTEM'];
const STATUSES   = ['', 'UNREAD', 'READ', 'DISMISSED'];

function NotificationFilters({ filters, onChange }) {
  const set = (k, v) => onChange({ ...filters, [k]: v });

  return (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label small mb-1">Search</label>
            <input
              className="form-control form-control-sm"
              placeholder="Search messages..."
              value={filters.messageContains || ''}
              onChange={e => set('messageContains', e.target.value)}
            />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label small mb-1">Category</label>
            <select
              className="form-select form-select-sm"
              value={filters.category || ''}
              onChange={e => set('category', e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c || 'All Categories'}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label small mb-1">Status</label>
            <select
              className="form-select form-select-sm"
              value={filters.status || ''}
              onChange={e => set('status', e.target.value)}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s || 'All Statuses'}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <DateRangePicker
              label="Date Range"
              fromDate={filters.fromDate || ''}
              toDate={filters.toDate || ''}
              onChange={({ fromDate, toDate }) => onChange({ ...filters, fromDate, toDate })}
            />
          </div>
          <div className="col-12 col-md-1">
            <button
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => onChange({ messageContains: '', category: '', status: '', fromDate: '', toDate: '' })}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationFilters;
