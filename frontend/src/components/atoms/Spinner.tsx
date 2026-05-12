// Pure CSS spinner — no external library needed.
// We define the keyframes inline because this component is self-contained.
export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <>
      <span
        // role="status" + aria-live tells screen readers "loading" even
        // though there's no visible text. WCAG-compliant loading indicator.
        role="status"
        aria-live="polite"
        aria-label="Chargement"
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          border: '2px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)',
          borderRadius: '50%',
          animation: 'vetcare-spin 0.8s linear infinite',
        }}
      />
      {/* Inject the keyframes once — no need for a CSS file just for this. */}
      <style>
        {`@keyframes vetcare-spin {
            to { transform: rotate(360deg); }
          }`}
      </style>
    </>
  );
}