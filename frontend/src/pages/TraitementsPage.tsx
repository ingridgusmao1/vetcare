import { useEffect, useState } from 'react';
import { traitementsApi, type Traitement } from '../api/traitements';
import { Badge } from '../components/atoms/Badge';
import { Button } from '../components/atoms/Button';
import { Spinner } from '../components/atoms/Spinner';

const STATUS_BADGE: Record<Traitement['status'], 'success' | 'warning' | 'neutral'> = {
  en_cours: 'success',
  termine:  'neutral',
  suspendu: 'warning',
};

export function TraitementsPage() {
  const [list, setList] = useState<Traitement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    traitementsApi.list()
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  const setStatus = async (t: Traitement, status: Traitement['status']) => {
    const updated = await traitementsApi.update(t.reference_traitement, { status });
    setList((prev) => prev.map((x) => x.reference_traitement === updated.reference_traitement ? updated : x));
  };

  return (
    <>
      <h1 style={{ fontStyle: 'italic', fontSize: 'var(--fs-2xl)' }}>Traitements</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
        Liste des traitements prescrits par la clinique.
      </p>

      {loading ? <Spinner /> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={th}>Médicament</th>
              <th style={th}>Statut</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.reference_traitement} style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
                <td style={td}>{t.medicament}</td>
                <td style={td}><Badge variant={STATUS_BADGE[t.status]}>{t.status}</Badge></td>
                <td style={td}>
                  {t.status === 'en_cours' && (
                    <Button size="sm" onClick={() => setStatus(t, 'termine')}>
                      Marquer terminé
                    </Button>
                  )}
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