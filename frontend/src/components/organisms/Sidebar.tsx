import { NavLink } from 'react-router-dom';

// Each nav entry maps to a route. The label matches the mockup verbatim
// (UPPERCASE in French — "TABLEAU DE BORD", "PATIENTS"...).
const NAV_ITEMS = [
  { to: '/dashboard',     label: 'Tableau de bord' },
  { to: '/patients',      label: 'Patients' },
  { to: '/proprietaires', label: 'Propriétaires' },
  { to: '/consultations', label: 'Consultations' },
  { to: '/dossiers',      label: 'Dossiers médicaux' },
  { to: '/traitements',   label: 'Traitements' },
];

export function Sidebar() {
  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--color-ink)',
        color: 'var(--color-text-on-ink)',
        padding: 'var(--space-6) var(--space-4)',
        position: 'sticky',
        top: 0,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 'var(--fs-base)',
          letterSpacing: '0.2em',
          marginBottom: 'var(--space-8)',
          paddingLeft: 'var(--space-3)',
        }}
      >
        VET<span style={{ color: 'var(--color-accent-light)' }}>CARE</span>
      </div>

      <div
        style={{
          fontSize: 'var(--fs-xs)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-accent-light)',
          marginBottom: 'var(--space-3)',
          paddingLeft: 'var(--space-3)',
        }}
      >
        Navigation
      </div>

      <nav aria-label="Navigation interne">
        <ul style={{ listStyle: 'none' }}>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              {/* NavLink applies an "active" class when the URL matches —
                  we use the render-prop form to inline the styles. */}
              <NavLink
                to={item.to}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: 'var(--space-3)',
                  fontSize: 'var(--fs-sm)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: isActive
                    ? 'var(--color-accent-light)'
                    : 'var(--color-text-on-ink)',
                  borderLeft: isActive
                    ? '2px solid var(--color-accent-light)'
                    : '2px solid transparent',
                  textDecoration: 'none',
                  marginBottom: 'var(--space-1)',
                })}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}