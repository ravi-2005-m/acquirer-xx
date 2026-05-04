import { forwardRef } from 'react';

const FormInput = forwardRef(function FormInput(
  { label, id, error, hint, required, className = '', ...rest },
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
      <input
        ref={ref}
        id={id}
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

export default FormInput;
