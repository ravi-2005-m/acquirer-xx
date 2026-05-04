const CHIPS = [
  { key: '',           label: 'All',         color: 'secondary' },
  { key: 'MATCHED',    label: 'Matched',     color: 'success' },
  { key: 'MISMATCHED', label: 'Mismatched',  color: 'warning' },
  { key: 'UNMATCHED',  label: 'Unmatched',   color: 'danger' },
];

function ReconItemFilters({ filters, onChange, fileScope = false }) {
  const set = (field, value) => onChange({ ...filters, [field]: value });

  return (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="d-flex flex-wrap gap-2 mb-2">
          {CHIPS.map(chip => {
            const active = (filters.matchStatus ?? '') === chip.key;
            return (
              <button
                key={chip.key}
                className={`btn btn-sm ${active ? `btn-${chip.color}` : `btn-outline-${chip.color}`}`}
                onClick={() => set('matchStatus', chip.key)}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {!fileScope && (
          <div className="row g-2">
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={filters.source ?? ''}
                onChange={e => set('source', e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="SWITCH">SWITCH</option>
                <option value="NETWORK">NETWORK</option>
                <option value="BANK">BANK</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <input
                type="number"
                className="form-control form-control-sm"
                value={filters.reconFileId ?? ''}
                onChange={e => set('reconFileId', e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder="Filter by File ID"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReconItemFilters;
