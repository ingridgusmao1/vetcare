import { useEffect, useState } from 'react';
import { proprietairesApi, type Proprietaire } from '../api/proprietaires';
import { Spinner } from '../components/atoms/Spinner';

export function ProprietairesPage() {
  const [owners, setOwners] = useState<Proprietaire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    proprietairesApi.list()
      .then(setOwners)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h1 style={{ fontStyle: 'italic', fontSize: 'var(--fs-2xl)' }}>Propriétaires</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
        Liste des propriétaires enregistrés.
      </p>

      {loading ? <Spinner /> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={th}>Nom</th>
              <th style={th}>Email</th>
              <th style={th}>Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((o) => (
              <tr key={o.reference_prop} style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
                <td style={td}>{o.nom}</td>
                <td style={td}>{o.email}</td>
                <td style={td}>{o.telephone ?? '—'}</td>
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