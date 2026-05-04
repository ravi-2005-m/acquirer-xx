import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { reconApi } from '../../api/reconApi';

const SOURCES = [
  { value: 'SWITCH',  label: 'SWITCH — internal switch records' },
  { value: 'NETWORK', label: 'NETWORK — Visa/Mastercard/RuPay clearing file' },
  { value: 'BANK',    label: 'BANK — bank statement file' },
];

function LoadReconFileModal({ show, onClose, onLoaded }) {
  const [step, setStep]               = useState('details');
  const [source, setSource]           = useState('');
  const [fileDate, setFileDate]       = useState('');
  const [inputMode, setInputMode]     = useState('csv');
  const [items, setItems]             = useState([]);
  const [csvFile, setCsvFile]         = useState(null);
  const [jsonText, setJsonText]       = useState('');
  const [parseError, setParseError]   = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [serverError, setServerError] = useState(null);
  const fileInputRef                  = useRef(null);

  useEffect(() => {
    if (show) {
      setStep('details');
      setSource('');
      setFileDate(new Date().toISOString().slice(0, 10));
      setInputMode('csv');
      setItems([]);
      setCsvFile(null);
      setJsonText('');
      setParseError(null);
      setServerError(null);
    }
  }, [show]);

  if (!show) return null;

  const handleProceed = () => {
    if (!source)    { setParseError('Source is required'); return; }
    if (!fileDate)  { setParseError('File date is required'); return; }
    setParseError(null);
    setStep('items');
  };

  const handleCsvSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);
    setParseError(null);
    setItems([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim().toLowerCase(),
      complete: ({ data: rows, errors }) => {
        if (errors.length > 0) {
          setParseError(`CSV error: ${errors[0].message}`);
          return;
        }
        try {
          const parsed = rows.map((row, idx) => {
            const ref = row.reference ?? row.ref ?? row.id;
            const amt = row.amount ?? row.amt;
            if (!ref) throw new Error(`Row ${idx + 1}: missing 'reference' column`);
            if (amt === undefined || amt === '') throw new Error(`Row ${idx + 1}: missing 'amount' column`);
            const amount = parseFloat(amt);
            if (Number.isNaN(amount)) throw new Error(`Row ${idx + 1}: '${amt}' is not a number`);
            return { reference: String(ref).trim(), amount };
          });
          setItems(parsed);
        } catch (err) {
          setParseError(err.message);
          setItems([]);
        }
      },
      error: (err) => { setParseError(`Failed to read file: ${err.message}`); },
    });
  };

  const handleJsonChange = (text) => {
    setJsonText(text);
    if (!text.trim()) { setItems([]); setParseError(null); return; }
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('Must be a JSON array');
      parsed.forEach((it, idx) => {
        if (!it.reference)             throw new Error(`Item ${idx}: missing 'reference'`);
        if (typeof it.amount !== 'number') throw new Error(`Item ${idx}: 'amount' must be a number`);
      });
      setItems(parsed);
      setParseError(null);
    } catch (err) {
      setParseError(`JSON error: ${err.message}`);
      setItems([]);
    }
  };

  const handleSubmit = async () => {
    if (items.length === 0) { setParseError('No items to load'); return; }
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await reconApi.loadFile({ source, fileDate, items });
      onLoaded?.(res.data?.data ?? res.data);
      onClose();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Failed to load recon file');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
      <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-upload me-2"></i>
                Load Recon File — Step {step === 'details' ? '1' : '2'} of 2
              </h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={submitting}></button>
            </div>

            <div className="modal-body">
              {parseError  && <div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1"></i>{parseError}</div>}
              {serverError && <div className="alert alert-danger small"><i className="bi bi-exclamation-triangle me-1"></i>{serverError}</div>}

              {step === 'details' ? (
                <>
                  <div className="mb-3">
                    <label className="form-label small">Source <span className="text-danger">*</span></label>
                    <select className="form-select" value={source} onChange={e => setSource(e.target.value)}>
                      <option value="">Select source...</option>
                      {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small">File Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={fileDate}
                      onChange={e => setFileDate(e.target.value)}
                      max={new Date().toISOString().slice(0, 10)}
                    />
                    <div className="form-text">The business date the file covers</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="alert alert-info small mb-3">
                    <strong>{source}</strong> file for <strong>{fileDate}</strong>
                  </div>

                  <div className="btn-group w-100 mb-3" role="group">
                    <input type="radio" className="btn-check" id="mode-csv"  checked={inputMode === 'csv'}  onChange={() => { setInputMode('csv');  setItems([]); setParseError(null); }} />
                    <label className="btn btn-outline-primary btn-sm" htmlFor="mode-csv">
                      <i className="bi bi-filetype-csv me-1"></i>Upload CSV
                    </label>
                    <input type="radio" className="btn-check" id="mode-json" checked={inputMode === 'json'} onChange={() => { setInputMode('json'); setItems([]); setParseError(null); }} />
                    <label className="btn btn-outline-primary btn-sm" htmlFor="mode-json">
                      <i className="bi bi-braces me-1"></i>Paste JSON
                    </label>
                  </div>

                  {inputMode === 'csv' && (
                    <div>
                      <button
                        className="btn btn-outline-secondary w-100 py-3 mb-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <i className="bi bi-folder2-open me-2"></i>
                        {csvFile ? csvFile.name : 'Click to choose CSV file'}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,text/csv"
                        className="d-none"
                        onChange={handleCsvSelect}
                      />
                      <div className="form-text">
                        Required columns: <code>reference</code>, <code>amount</code>. Header row required.
                      </div>
                    </div>
                  )}

                  {inputMode === 'json' && (
                    <div>
                      <label className="form-label small">Items JSON <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control font-monospace"
                        rows={8}
                        value={jsonText}
                        onChange={e => handleJsonChange(e.target.value)}
                        placeholder={'[\n  { "reference": "TXN001", "amount": 1500.00 },\n  { "reference": "TXN002", "amount": 2300.50 }\n]'}
                        style={{ fontSize: '0.82rem' }}
                      />
                      <div className="form-text">Array of <code>{"{ reference, amount }"}</code> objects.</div>
                    </div>
                  )}

                  {items.length > 0 && (
                    <div className="alert alert-success small mt-3 mb-0">
                      <i className="bi bi-check-circle me-1"></i>
                      {items.length} items ready to load
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              {step === 'details' ? (
                <>
                  <button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleProceed}>
                    Next <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-link text-muted text-decoration-none" onClick={() => setStep('details')} disabled={submitting}>
                    <i className="bi bi-arrow-left me-1"></i>Back
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting || items.length === 0}
                  >
                    {submitting
                      ? <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Loading...</>
                      : <><i className="bi bi-cloud-upload me-1"></i>Load {items.length} item{items.length !== 1 ? 's' : ''}</>
                    }
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoadReconFileModal;
