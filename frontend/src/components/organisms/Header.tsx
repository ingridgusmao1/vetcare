import { Link } from 'react-router-dom';
import { Button } from '../atoms/Button';

export function Header() {
  // Public site navigation — links to anchor sections + login/dashboard CTA.
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--color-cream)',
        borderBottom: '1px solid var(--color-border-soft)',
        height: 'var(--header-height)',
      }}
    >
      <div
        className="container"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo: "VET" in dark + "CARE" in green, matching the mockup. */}
        <Link
          to="/"
          aria-label="Accueil VetCare"
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 'var(--fs-lg)',
            letterSpacing: '0.15em',
            color: 'var(--color-ink)',
            textDecoration: 'none',
          }}
        >
          VET<span style={{ color: 'var(--color-accent)' }}>CARE</span>
        </Link>

        {/* Anchor nav. Hidden on mobile — for clinic staff use, desktop is fine. */}
        <nav
          aria-label="Navigation principale"
          style={{
            display: 'flex',
            gap: 'var(--space-6)',
            fontSize: 'var(--fs-sm)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <a href="#services" style={{ color: 'var(--color-text)' }}>Services</a>
          <a href="#clinique" style={{ color: 'var(--color-text)' }}>La Clinique</a>
          <a href="#equipe" style={{ color: 'var(--color-text)' }}>Équipe</a>
          <a href="#dossiers" style={{ color: 'var(--color-text)' }}>Dossiers</a>
        </nav>

        <Link to="/login">
          <Button variant="primary" size="sm">Espace pro</Button>
        </Link>
      </div>
    </header>
  );
}