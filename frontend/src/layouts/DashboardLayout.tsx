import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/organisms/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/atoms/Button';

// Internal layout — sidebar + top bar + content area.
export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar: shows current user + logout. */}
        <header
          style={{
            height: 'var(--header-height)',
            borderBottom: '1px solid var(--color-border-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 var(--space-6)',
            background: 'var(--color-cream)',
          }}
        >
          <span
            style={{
              marginRight: 'var(--space-4)',
              fontSize: 'var(--fs-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            {user?.email} <span style={{ marginLeft: 8, fontStyle: 'italic' }}>({user?.role})</span>
          </span>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Déconnexion
          </Button>
        </header>

        <main
          id="main-content"
          style={{
            flex: 1,
            padding: 'var(--space-6)',
            background: 'var(--color-cream)',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}