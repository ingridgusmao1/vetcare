interface AvatarProps {
  // URL of the picture; if omitted we fall back to initials.
  src?: string | null;
  // Used as alt text and to compute initials when there's no image.
  name: string;
  size?: number;
}

// Compute initials from a full name: "Marie Lambert" → "ML".
// Limited to 2 chars to fit a small circle.
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function Avatar({ src, name, size = 40 }: AvatarProps) {
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: 'var(--color-accent-soft)',
    color: 'var(--color-accent)',
    fontWeight: 500,
    fontSize: size * 0.4,
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ ...baseStyle, objectFit: 'cover' }}
      />
    );
  }

  // Fallback: initials. aria-label gives screen readers the full name.
  return (
    <span style={baseStyle} aria-label={name} role="img">
      {getInitials(name)}
    </span>
  );
}