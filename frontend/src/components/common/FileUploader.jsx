import { useState, useRef } from 'react';

function FileUploader({ onUpload, accept = '*', maxSizeMB = 10, uploading = false }) {
  const [dragging, setDragging]     = useState(false);
  const [description, setDescription] = useState('');
  const [pending, setPending]       = useState(null);
  const [error, setError]           = useState(null);
  const inputRef                    = useRef(null);

  const maxBytes = maxSizeMB * 1024 * 1024;

  const pickFile = (file) => {
    setError(null);
    if (!file) return;
    if (file.size > maxBytes) {
      setError(`File exceeds ${maxSizeMB} MB limit`);
      return;
    }
    setPending(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const handleConfirm = async () => {
    if (!pending) return;
    try {
      await onUpload(pending, description.trim() || null);
      setPending(null);
      setDescription('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed');
    }
  };

  const handleCancel = () => {
    setPending(null);
    setDescription('');
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      {!pending ? (
        <div
          className={`border rounded p-4 text-center ${dragging ? 'border-primary bg-light' : 'border-dashed'}`}
          style={{ cursor: 'pointer', borderStyle: 'dashed' }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <i className="bi bi-cloud-arrow-up fs-3 text-muted d-block mb-2"></i>
          <div className="small text-muted">
            Drag & drop a file here, or <span className="text-primary">browse</span>
          </div>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Max {maxSizeMB} MB</div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="d-none"
            onChange={e => pickFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="border rounded p-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-file-earmark text-primary"></i>
            <span className="small fw-semibold flex-grow-1 text-truncate">{pending.name}</span>
            <span className="text-muted small">{(pending.size / 1024).toFixed(1)} KB</span>
            <button className="btn btn-sm btn-link text-danger p-0" onClick={handleCancel} disabled={uploading}>
              <i className="bi bi-x-circle"></i>
            </button>
          </div>
          <input
            type="text"
            className="form-control form-control-sm mb-2"
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={uploading}
          />
          <button
            className="btn btn-primary btn-sm w-100"
            onClick={handleConfirm}
            disabled={uploading}
          >
            {uploading
              ? <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Uploading...</>
              : <><i className="bi bi-upload me-1"></i>Upload</>
            }
          </button>
        </div>
      )}

      {error && <div className="text-danger small mt-2"><i className="bi bi-exclamation-triangle me-1"></i>{error}</div>}
    </div>
  );
}

export default FileUploader;
