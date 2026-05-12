import type { ButtonHTMLAttributes, ReactNode } from 'react';

// Extend the native HTML button props so we keep onClick, disabled, type, etc.
// for free. We only add visual variants on top.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // 'primary' = filled green CTA; 'secondary' = ghost; 'danger' = red.
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  // Children is the visible label — required so empty buttons can't render.
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  style,
  ...rest      // spread native props onto <button> (onClick, type, disabled...)
}: ButtonProps) {
  // Inline styles keep this single-file component portable.
  // For larger projects, extract to a CSS module — same idea, more files.
  const base: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.1s',
    fontSize: size === 'sm' ? 'var(--fs-xs)' : 'var(--fs-sm)',
    padding:
      size === 'sm'
        ? 'var(--space-2) var(--space-4)'
        : 'var(--space-3) var(--space-6)',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--color-ink)',
      color: 'var(--color-text-on-ink)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--color-ink)',
      border: '1px solid var(--color-ink)',
    },
    danger: {
      background: 'var(--color-danger)',
      color: 'var(--color-text-on-ink)',
    },
  };

  // The disabled visual is applied via inline opacity instead of CSS pseudo
  // because we override style anyway — pseudo wouldn't win the cascade.
  const disabledStyle: React.CSSProperties = rest.disabled
    ? { opacity: 0.5, cursor: 'not-allowed' }
    : {};

  return (
    <button
      {...rest}
      style={{ ...base, ...variants[variant], ...disabledStyle, ...style }}
    >
      {children}
    </button>
  );
}