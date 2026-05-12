import { type InputHTMLAttributes, forwardRef } from 'react';

// forwardRef is critical: react-hook-form's `register()` returns a `ref`
// that must be attached to the underlying <input>. Without forwardRef the
// ref would attach to nothing and validation wouldn't run.
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // hasError lets us show invalid styling without an error message inside the
  // atom — the FormField molecule decides where the message lives.
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, style, ...rest }, ref) => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-base)',
      padding: 'var(--space-3) var(--space-4)',
      background: 'transparent',
      // Single bottom border matches the contact form mockup ("VOTRE NOM",
      // "EMAIL"). Uses the brand sand color for a calm look.
      border: 'none',
      borderBottom: hasError
        ? '1px solid var(--color-danger)'
        : '1px solid var(--color-border)',
      transition: 'border-color 0.2s',
      // Removes the default rounded corners on iOS Safari date inputs.
      borderRadius: 0,
      color: 'var(--color-text)',
    };

    return (
      <input
        ref={ref}
        {...rest}
        style={{ ...baseStyle, ...style }}

        // aria-invalid is the WCAG 3.3.1 attribute screen readers announce
        // when a field has an error. We toggle it via hasError.
        aria-invalid={hasError ? 'true' : 'false'}
      />
    );
  }
);
// React DevTools displays a name only when set explicitly on forwardRef.
Input.displayName = 'Input';