import { forwardRef } from 'react';

const FormTextarea = forwardRef(function FormTextarea(
  { label, id, error, hint, required, rows = 3, className = '', ...rest },
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
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...rest}
      />
      {error && <div className="invalid-feedback">{error}</div>}
      {hint && !error && (
        <div id={`${id}-hint`} className="form-text small">
          {hint}
        </div>
      )}
    </div>
  );
});

export default FormTextarea;
