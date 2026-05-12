import type { ReactNode } from 'react';

// The "À JOUR" pill in the dashboard mockup is a Badge with the success tone.
interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
  children: ReactNode;
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  // The success pastel matches --color-accent-soft from tokens.
  const colors: Record<string, { bg: string; fg: string }> = {
    success: { bg: 'var(--color-accent-soft)', fg: 'var(--color-accent)' },
    warning: { bg: '#F4E5C2', fg: '#8A6E1B' },
    danger:  { bg: '#F5D2CE', fg: 'var(--color-danger)' },
    neutral: { bg: 'var(--color-warm)', fg: 'var(--color-text-muted)' },
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: 'var(--space-1) var(--space-3)',
        background: colors[variant].bg,
        color: colors[variant].fg,
        fontSize: 'var(--fs-xs)',
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      {children}
    </span>
  );
}