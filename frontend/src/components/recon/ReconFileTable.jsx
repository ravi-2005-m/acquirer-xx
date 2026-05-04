import { useNavigate } from 'react-router-dom';
import StatusBadge from '../StatusBadge';
import { formatDate, formatDateTime, formatNumber } from '../../utils/formatters';

const SOURCE_BADGE = {
  SWITCH:  'bg-primary',
  NETWORK: 'bg-info',
  BANK:    'bg-success',
};

function ReconFileTable({ files, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <div className="text-muted small mt-2">Loading files...</div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-file-earmark-text fs-2 d-block mb-2 opacity-25"></i>
        No recon files found.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>File ID</th>
            <th>Source</th>
            <th>File Date</th>
            <th className="text-end">Rows</th>
            <th>Status</th>
            <th>Loaded At</th>
            <th style={{ width: '60px' }}></th>
          </tr>
        </thead>
        <tbody>
          {files.map(f => (
            <tr
              key={f.reconFileId}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/reconciliation/${f.reconFileId}`, { state: { file: f } })}
            >
              <td className="small font-monospace text-muted">#{f.reconFileId}</td>
              <td>
                <span className={`badge ${SOURCE_BADGE[f.source] || 'bg-secondary'}`}>
                  {f.source}
                </span>
              </td>
              <td className="small">{formatDate(f.fileDate)}</td>
              <td className="text-end fw-semibold">{formatNumber(f.rowCount)}</td>
              <td><StatusBadge status={f.status} /></td>
              <td className="small text-muted">{formatDateTime(f.loadedAt)}</td>
              <td onClick={e => e.stopPropagation()}>
                <button
                  className="btn btn-sm btn-outline-primary py-0 px-2"
                  onClick={() => navigate(`/reconciliation/${f.reconFileId}`, { state: { file: f } })}
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReconFileTable;
