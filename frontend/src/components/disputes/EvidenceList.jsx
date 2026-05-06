import { formatDateTime } from '../../utils/formatters';

const TYPE_ICON = {
  RECEIPT:        'bi-receipt text-primary',
  INVOICE:        'bi-file-earmark-text text-info',
  DELIVERY_PROOF: 'bi-truck text-success',
  COMMUNICATION:  'bi-chat-dots text-secondary',
};

const TYPE_LABEL = {
  RECEIPT:        'Receipt',
  INVOICE:        'Invoice',
  DELIVERY_PROOF: 'Delivery Proof',
  COMMUNICATION:  'Communication',
};

function DocumentList({ documents = [] }) {
  if (documents.length === 0) {
    return <p className="text-muted small mb-0">No documents linked yet.</p>;
  }

  return (
    <ul className="list-group list-group-flush">
      {documents.map(doc => (
        <li key={doc.docId} className="list-group-item px-0 py-2">
          <div className="d-flex align-items-start gap-2">
            <i className={`bi ${TYPE_ICON[doc.docType] || 'bi-file-earmark text-muted'} fs-5 mt-1 flex-shrink-0`}></i>
            <div className="flex-grow-1 min-width-0">
              <div className="small fw-semibold">{TYPE_LABEL[doc.docType] || doc.docType}</div>
              <a
                href={doc.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-truncate d-block small font-monospace text-decoration-none"
              >
                {doc.uri}
              </a>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                Linked {formatDateTime(doc.uploadedDate)}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default DocumentList;
