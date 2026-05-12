import { Link } from 'react-router-dom';
import { Button } from '../components/atoms/Button';

export function NotFoundPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--color-cream)',
        textAlign: 'center',
      }}
    >
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '6rem' }}>404</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
          Cette page n'existe pas.
        </p>
        <Link to="/">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    </main>
  );
}