import { useState, useEffect, useRef } from 'react';

function EntitySelect({
  label,
  value,
  onChange,
  fetchOptions,
  getOptionLabel,
  getOptionId,
  placeholder = 'Select...',
  disabled = false,
  required = false,
  error,
}) {
  const [open, setOpen]               = useState(false);
  const [search, setSearch]           = useState('');
  const [options, setOptions]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const wrapperRef = useRef(null);
  const searchRef  = useRef(null);

  // Fetch options whenever dropdown is open or search changes
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchOptions({ search });
        const list = Array.isArray(res) ? res : (res.content || []);
        setOptions(list);
        // Resolve label for the current value if not yet known
        if (value && !selectedLabel) {
          const match = list.find(o => String(getOptionId(o)) === String(value));
          if (match) setSelectedLabel(getOptionLabel(match));
        }
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, open]); // eslint-disable-line

  // Clear label when value is cleared externally
  useEffect(() => {
    if (!value) setSelectedLabel('');
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setSearch('');
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const handleSelect = (option) => {
    const id  = String(getOptionId(option));
    const lbl = getOptionLabel(option);
    setSelectedLabel(lbl);
    onChange(id, option);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedLabel('');
    onChange('', null);
  };

  const displayValue = selectedLabel || (value ? String(value) : '');

  return (
    <div ref={wrapperRef} className="position-relative">
      {label && (
        <label className="form-label small">
          {label}{required && <span className="text-danger"> *</span>}
        </label>
      )}

      <div
        className={`form-control d-flex justify-content-between align-items-center ${error ? 'is-invalid' : ''} ${disabled ? 'bg-light text-muted' : ''}`}
        onClick={handleOpen}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', userSelect: 'none' }}
      >
        <span className={displayValue ? '' : 'text-muted small'}>
          {displayValue || placeholder}
        </span>
        <div className="d-flex align-items-center gap-1">
          {value && !disabled && (
            <span
              className="text-muted"
              onClick={handleClear}
              style={{ cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}
              title="Clear"
            >
              ×
            </span>
          )}
          <span className="text-muted small">▾</span>
        </div>
      </div>

      {open && (
        <div
          className="ax-entity-select-dropdown card shadow border"
          style={{
            position: 'absolute',
            top: 'calc(100% + 2px)',
            left: 0,
            right: 0,
            zIndex: 1055,
            maxHeight: '280px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="p-2 border-bottom flex-shrink-0">
            <input
              ref={searchRef}
              type="text"
              className="form-control form-control-sm"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
              </div>
            )}
            {!loading && options.length === 0 && (
              <div className="text-center text-muted small py-3">No results</div>
            )}
            {!loading && options.map(option => {
              const id = String(getOptionId(option));
              const isSelected = String(value) === id;
              return (
                <div
                  key={id}
                  className={`ax-entity-select-item px-3 py-2 small ${isSelected ? 'ax-entity-select-item--selected' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelect(option)}
                >
                  {getOptionLabel(option)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}

export default EntitySelect;
