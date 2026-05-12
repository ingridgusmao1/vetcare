import type { ReactNode } from 'react';

interface KpiCardProps {
  // Big number shown at the top — uses the display serif.
  value: number | string;
  // Small uppercase label below.
  label: string;
  // Optional helper or trend indicator (e.g. "+8%").
  hint?: ReactNode;
}

export function KpiCard({ value, label, hint }: KpiCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-cream)',
        border: '1px solid var(--color-border-soft)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-5)',
        // Accent on the left edge to match the mockup's framed cards.
        borderLeft: '3px solid var(--color-accent)',
        minHeight: 120,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--fs-2xl)',
          fontWeight: 500,
          color: 'var(--color-text)',
          lineHeight: 1,
          marginBottom: 'var(--space-2)',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 'var(--fs-xs)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
        }}
      >
        {label}
      </div>
      {hint && (
        <div
          style={{
            marginTop: 'var(--space-2)',
            fontSize: 'var(--fs-xs)',
            color: 'var(--color-accent)',
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}