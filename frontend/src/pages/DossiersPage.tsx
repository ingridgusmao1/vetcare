import { useEffect, useState } from 'react';
import { dossiersApi, type Dossier } from '../api/dossiers';
import { Spinner } from '../components/atoms/Spinner';
import { Button } from '../components/atoms/Button';
import { FormField } from '../components/molecules/FormField';

// Editing happens inline: select a dossier, edit fields, save.
export function DossiersPage() {
  const [list, setList] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Dossier | null>(null);

  useEffect(() => {
    dossiersApi.list()
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (d: Dossier) => setEditing({ ...d });

  const saveEdit = async () => {
    if (!editing) return;
    const updated = await dossiersApi.update(editing.reference_dossier, {
      allergie: editing.allergie,
      intolerance: editing.intolerance,
      condition_physique: editing.condition_physique,
    });
    setList((prev) => prev.map((d) => d.reference_dossier === updated.reference_dossier ? updated : d));
    setEditing(null);
  };

  return (
    <>
      <h1 style={{ fontStyle: 'italic', fontSize: 'var(--fs-2xl)' }}>Dossiers médicaux</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
        Allergies, intolérances et conditions physiques de chaque patient.
      </p>

      {loading ? <Spinner /> : editing ? (
        <div style={{ maxWidth: 600 }}>
          <h2 style={{ fontStyle: 'italic', marginBottom: 'var(--space-4)' }}>
            Dossier #{editing.reference_dossier} — Patient #{editing.patient_id}
          </h2>
          <FormField
            label="Allergies"
            value={editing.allergie ?? ''}
            onChange={(e) => setEditing({ ...editing, allergie: e.target.value })}
          />
          <FormField
            label="Intolérances"
            value={editing.intolerance ?? ''}
            onChange={(e) => setEditing({ ...editing, intolerance: e.target.value })}
          />
          <FormField
            label="Condition physique"
            value={editing.condition_physique ?? ''}
            onChange={(e) => setEditing({ ...editing, condition_physique: e.target.value })}
          />
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button onClick={saveEdit}>Enregistrer</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>Annuler</Button>
          </div>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={th}>Patient</th>
              <th style={th}>Allergies</th>
              <th style={th}>Intolérances</th>
              <th style={th}>Condition physique</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((d) => (
              <tr key={d.reference_dossier} style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
                <td style={td}>#{d.patient_id}</td>
                <td style={td}>{d.allergie ?? '—'}</td>
                <td style={td}>{d.intolerance ?? '—'}</td>
                <td style={td}>{d.condition_physique ?? '—'}</td>
                <td style={td}>
                  <Button size="sm" variant="secondary" onClick={() => startEdit(d)}>
                    Modifier
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

const th: React.CSSProperties = {
  padding: 'var(--space-3) var(--space-2)',
  fontSize: 'var(--fs-xs)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  fontWeight: 500,
};
const td: React.CSSProperties = { padding: 'var(--space-4) var(--space-2)' };