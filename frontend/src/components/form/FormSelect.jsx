import { forwardRef } from 'react';

const FormSelect = forwardRef(function FormSelect(
  { label, id, error, hint, required, options = [], className = '', style, ...rest },
  ref
) {
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`form-select ${error ? 'is-invalid' : ''} ${className}`}
        style={style}
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...rest}
      >
        {options.map(({ value, label: optLabel }) => (
          <option key={value} value={value}>
            {optLabel}
          </option>
        ))}
      </select>
      {error && <div className="invalid-feedback">{error}</div>}
      {hint && !error && (
        <div id={`${id}-hint`} className="form-text small">
          {hint}
        </div>
      )}
    </div>
  );
});

export default FormSelect;
