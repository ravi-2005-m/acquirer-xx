import { formatDateTime } from '../../utils/formatters';

const ICON_MAP = {
  pdf:  'bi-file-earmark-pdf text-danger',
  jpg:  'bi-file-earmark-image text-info',
  jpeg: 'bi-file-earmark-image text-info',
  png:  'bi-file-earmark-image text-info',
  doc:  'bi-file-earmark-word text-primary',
  docx: 'bi-file-earmark-word text-primary',
  xls:  'bi-file-earmark-excel text-success',
  xlsx: 'bi-file-earmark-excel text-success',
};

function fileIcon(filename = '') {
  const ext = filename.split('.').pop().toLowerCase();
  return ICON_MAP[ext] ?? 'bi-file-earmark text-muted';
}

function EvidenceList({ evidence = [], canDelete = false, onDelete, deleting = null }) {
  if (evidence.length === 0) {
    return <p className="text-muted small mb-0">No evidence uploaded yet.</p>;
  }

  return (
    <ul className="list-group list-group-flush">
      {evidence.map(ev => (
        <li key={ev.evidenceId ?? ev.id} className="list-group-item px-0 py-2">
          <div className="d-flex align-items-start gap-2">
            <i className={`bi ${fileIcon(ev.fileName ?? ev.filename)} fs-5 mt-1 flex-shrink-0`}></i>
            <div className="flex-grow-1 min-width-0">
              <div className="small fw-semibold text-truncate">{ev.fileName ?? ev.filename}</div>
              {ev.description && <div className="text-muted small">{ev.description}</div>}
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                {ev.uploadedBy || 'system'} · {formatDateTime(ev.uploadedAt ?? ev.createdAt)}
                {ev.fileSizeBytes && <> · {(ev.fileSizeBytes / 1024).toFixed(1)} KB</>}
              </div>
            </div>
            {canDelete && onDelete && (
              <button
                className="btn btn-sm btn-link text-danger p-0 flex-shrink-0"
                onClick={() => onDelete(ev.evidenceId ?? ev.id)}
                disabled={deleting === (ev.evidenceId ?? ev.id)}
                title="Remove evidence"
              >
                {deleting === (ev.evidenceId ?? ev.id)
                  ? <span className="spinner-border spinner-border-sm" role="status"></span>
                  : <i className="bi bi-trash3"></i>
                }
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default EvidenceList;
