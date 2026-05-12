import type { Patient } from '../../api/patients';
import { Badge } from '../atoms/Badge';

interface PatientsTableProps {
  patients: Patient[];
  // Map from owner ID → owner name (passed from the parent that fetches both).
  ownersById: Record<number, string>;
  onSoftDelete?: (patient: Patient) => void;
}

// Convert ISO string to a French short date: "18 févr. 2026".
function formatDateFr(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function PatientsTable({
  patients,
  ownersById,
  onSoftDelete,
}: PatientsTableProps) {
  // Empty state — friendlier than a blank table.
  if (patients.length === 0) {
    return (
      <p
        style={{
          padding: 'var(--space-6)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
        }}
      >
        Aucun patient à afficher.
      </p>
    );
  }

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 'var(--fs-sm)',
      }}
    >
      <thead>
        <tr
          style={{
            borderBottom: '1px solid var(--color-border)',
            textAlign: 'left',
          }}
        >
          {/* Column titles match the mockup verbatim. */}
          <th style={th}>Animal</th>
          <th style={th}>Espèce / Race</th>
          <th style={th}>Propriétaire</th>
          <th style={th}>Dernière consultation</th>
          <th style={th}>Vaccin</th>
          <th style={th}><span className="visually-hidden">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        {patients.map((p) => (
          <tr
            key={p.reference_patient}
            style={{
              borderBottom: '1px solid var(--color-border-soft)',
              opacity: p.actif ? 1 : 0.5,         // visually fade soft-deleted
            }}
          >
            <td style={td}>{p.nom}</td>
            <td style={td}>{p.espece}</td>
            <td style={td}>{ownersById[p.proprietaire_id] ?? '—'}</td>
            <td style={td}>{formatDateFr(p.updated_at)}</td>
            <td style={td}>
              {/* The mockup shows a green "À JOUR" pill — Badge handles it. */}
              <Badge variant="success">À jour</Badge>
            </td>
            <td style={td}>
              {p.actif && onSoftDelete && (
                <button
                  onClick={() => onSoftDelete(p)}
                  style={{
                    background: 'transparent',
                    color: 'var(--color-danger)',
                    fontSize: 'var(--fs-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Désactiver
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Shared cell styles — defined once and reused on every <th>/<td>.
const th: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-2)',
  fontSize: 'var(--fs-xs)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  fontWeight: 500,
};

const td: React.CSSProperties = {
  padding: 'var(--space-4) var(--space-2)',
  color: 'var(--color-text)',
};