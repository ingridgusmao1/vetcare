import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { Input } from '../atoms/Input';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  // Visible label; required for accessibility (3.3.2 from WCAG).
  label: string;
  // If set, displayed in red below the input. Comes from RHF errors.
  error?: string;
  // Hint shown below the field in muted text. Optional.
  helper?: ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helper, id, ...inputProps }, ref) => {
    // Generate an id if the caller didn't provide one — needed to link
    // <label htmlFor> to <input id>.
    const fieldId = id ?? `field-${label.replace(/\s/g, '-').toLowerCase()}`;
    // Pair label + error/helper IDs so screen readers read them together.
    const errorId = error ? `${fieldId}-error` : undefined;
    const helperId = helper ? `${fieldId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <label
          htmlFor={fieldId}
          style={{
            display: 'block',
            fontSize: 'var(--fs-xs)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {label}
          {/* Asterisk for required fields per WCAG 3.3.2.
              aria-hidden because the asterisk is purely visual — the
              `required` attr on the input handles the semantic side. */}
          {inputProps.required && (
            <span aria-hidden="true" style={{ color: 'var(--color-danger)', marginLeft: 4 }}>*</span>
          )}
        </label>

        <Input
          id={fieldId}
          ref={ref}
          hasError={!!error}
          aria-describedby={describedBy}
          {...inputProps}
        />

        {helper && !error && (
          <p
            id={helperId}
            style={{
              fontSize: 'var(--fs-xs)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-1)',
            }}
          >
            {helper}
          </p>
        )}

        {error && (
          // role="alert" makes screen readers announce the error immediately
          // when it appears. Critical for forms (WCAG 3.3.1).
          <p
            id={errorId}
            role="alert"
            style={{
              fontSize: 'var(--fs-xs)',
              color: 'var(--color-danger)',
              marginTop: 'var(--space-1)',
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';