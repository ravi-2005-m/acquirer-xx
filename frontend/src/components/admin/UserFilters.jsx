const ROLES = ['ADMIN', 'MERCHANT_OPS', 'POS_OPS', 'RISK', 'DISPUTES', 'RECON'];

export default function UserFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-4">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search by username…"
              value={filters.username}
              onChange={(e) => set('username', e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={filters.role}
              onChange={(e) => set('role', e.target.value)}
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={filters.status}
              onChange={(e) => set('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="col-12 col-md-2">
            <button
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => onChange({ username: '', role: '', status: '' })}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
