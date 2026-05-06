import { useState, useRef, useEffect } from 'react';

const PRESETS = [
  { label: 'Today',       days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

function toInputValue(date) {
  if (!date) return '';
  // Defensive: ignore non-string/non-Date inputs (e.g. callers that
  // accidentally pass an object) so a bad prop can't crash render.
  if (typeof date !== 'string' && !(date instanceof Date)) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function DateRangePicker({ fromDate, toDate, onChange, label = 'Date Range' }) {
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const applyPreset = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    onChange({
      fromDate: from.toISOString().slice(0, 10),
      toDate: to.toISOString().slice(0, 10),
    });
    setOpen(false);
  };

  const clear = () => {
    onChange({ fromDate: '', toDate: '' });
    setOpen(false);
  };

  return (
    <div>
      {label && <label className="form-label small">{label}</label>}
      <div className="d-flex gap-1 align-items-center">
        <input
          type="date"
          className="form-control form-control-sm"
          value={toInputValue(fromDate)}
          onChange={e => onChange({ fromDate: e.target.value, toDate })}
        />
        <span className="text-muted small px-1">—</span>
        <input
          type="date"
          className="form-control form-control-sm"
          value={toInputValue(toDate)}
          onChange={e => onChange({ fromDate, toDate: e.target.value })}
        />
        <div className="position-relative" ref={dropRef}>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setOpen(v => !v)}
            title="Date presets"
          >
            <i className="bi bi-calendar3"></i>
          </button>
          {open && (
            <div
              className="card shadow position-absolute end-0 mt-1"
              style={{ zIndex: 1050, minWidth: '160px' }}
            >
              <div className="list-group list-group-flush">
                {PRESETS.map(p => (
                  <button
                    key={p.label}
                    className="list-group-item list-group-item-action small py-2"
                    onClick={() => applyPreset(p.days)}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  className="list-group-item list-group-item-action small py-2 text-muted"
                  onClick={clear}
                >
                  Clear dates
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DateRangePicker;
