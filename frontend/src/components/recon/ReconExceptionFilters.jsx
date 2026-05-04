function ReconExceptionFilters({ filters, onChange }) {
  const set = (field, value) => onChange({ ...filters, [field]: value });

  const hasFilters = !!(filters.exceptionStatus || filters.category);

  return (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="row g-2 align-items-end">
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={filters.exceptionStatus}
              onChange={e => set('exceptionStatus', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="RESOLVED">Resolved</option>
              <option value="WRITTEN_OFF">Written Off</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Filter by category"
              value={filters.category}
              onChange={e => set('category', e.target.value)}
            />
          </div>

          {hasFilters && (
            <div className="col-auto">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => onChange({ exceptionStatus: '', category: '' })}
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

export default ReconExceptionFilters;
