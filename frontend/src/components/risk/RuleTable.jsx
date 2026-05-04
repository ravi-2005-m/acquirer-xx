import { formatDateTime } from '../../utils/formatters';

const CONDITION_LABELS = {
  AMOUNT_GT:        'Amount >',
  AMOUNT_LT:        'Amount <',
  VELOCITY_COUNT:   'Velocity Count',
  BLACKLISTED_PAN:  'Blacklisted PAN',
  COUNTRY_BLOCK:    'Country Block',
  MCC_BLOCK:        'MCC Block',
};

function RuleTable({ rules, loading, canManage, onDeactivate }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <div className="text-muted small mt-2">Loading rules...</div>
      </div>
    );
  }

  if (!rules || rules.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-list-check fs-2 d-block mb-2 opacity-25"></i>
        No rules configured.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Rule ID</th>
            <th>Name</th>
            <th>Condition</th>
            <th>Threshold</th>
            <th>Action</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created</th>
            {canManage && <th style={{ width: '90px' }}></th>}
          </tr>
        </thead>
        <tbody>
          {rules.map(r => (
            <tr key={r.ruleId}>
              <td className="small font-monospace text-muted">#{r.ruleId}</td>
              <td className="small fw-semibold">{r.name || '—'}</td>
              <td className="small">
                <span className="badge bg-light text-dark border">
                  {CONDITION_LABELS[r.conditionType] || r.conditionType || '—'}
                </span>
              </td>
              <td className="small font-monospace">{r.threshold ?? '—'}</td>
              <td>
                <span className={`badge ${
                  r.action === 'BLOCK'  ? 'bg-danger' :
                  r.action === 'REVIEW' ? 'bg-warning text-dark' :
                  'bg-success'
                }`}>{r.action || '—'}</span>
              </td>
              <td className="small text-center">{r.priority ?? '—'}</td>
              <td>
                <span className={`badge ${r.active || r.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                  {r.active || r.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="small text-muted text-nowrap">{formatDateTime(r.createdAt)}</td>
              {canManage && (
                <td>
                  {(r.active || r.status === 'ACTIVE') && (
                    <button
                      className="btn btn-sm btn-outline-danger py-0 px-2"
                      onClick={() => onDeactivate(r)}
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RuleTable;
