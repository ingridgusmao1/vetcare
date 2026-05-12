import { useEffect, useState } from 'react';

interface SearchBarProps {
  // Initial value if the search is controlled from outside (e.g., URL).
  initialValue?: string;
  // Called once the user has stopped typing for `delayMs` milliseconds.
  // We debounce here so the parent doesn't re-fetch on every keystroke.
  onSearch: (query: string) => void;
  delayMs?: number;
  placeholder?: string;
}

export function SearchBar({
  initialValue = '',
  onSearch,
  delayMs = 300,         // US-07 mandates 300ms debounce
  placeholder = 'Rechercher...',
}: SearchBarProps) {
  // Local state so the input is always responsive — typing feels instant.
  const [value, setValue] = useState(initialValue);

  // Whenever value changes, schedule a callback for 300ms later.
  // If value changes again before that, clearTimeout cancels the pending call.
  useEffect(() => {
    const timeoutId = setTimeout(() => onSearch(value), delayMs);
    return () => clearTimeout(timeoutId);
    // We deliberately exclude `onSearch` from deps — most callers pass a fresh
    // function on every render. Including it would cancel/re-schedule infinitely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delayMs]);

  return (
    <input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      aria-label="Rechercher"
      style={{
        width: '100%',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--color-warm)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--fs-base)',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text)',
      }}
    />
  );
}