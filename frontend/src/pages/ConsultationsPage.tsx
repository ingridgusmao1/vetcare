import { useEffect, useState } from 'react';
import { consultationsApi, type Consultation } from '../api/consultations';
import { Badge } from '../components/atoms/Badge';
import { Button } from '../components/atoms/Button';
import { Spinner } from '../components/atoms/Spinner';

// Status → badge variant mapping for visual consistency.
const STATUS_BADGE: Record<Consultation['status'], 'success' | 'warning' | 'danger'> = {
  prevue:   'warning',
  terminee: 'success',
  annulee:  'danger',
};

export function ConsultationsPage() {
  const [list, setList] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    consultationsApi.list()
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  // Update consultation status (US-12).
  const handleStatusChange = async (c: Consultation, status: Consultation['status']) => {
    const updated = await consultationsApi.updateStatus(c.reference_consultation, status);
    setList((prev) =>
      prev.map((x) => x.reference_consultation === updated.reference_consultation ? updated : x)
    );
  };

  return (
    <>
      <h1 style={{ fontStyle: 'italic', fontSize: 'var(--fs-2xl)' }}>Consultations</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
        Planning et historique des consultations.
      </p>

      {loading ? <Spinner /> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              <th style={th}>Date</th>
              <th style={th}>Patient #</th>
              <th style={th}>Statut</th>
              <th style={th}>Motif</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.reference_consultation} style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
                <td style={td}>{new Date(c.date).toLocaleString('fr-FR')}</td>
                <td style={td}>#{c.patient_id}</td>
                <td style={td}><Badge variant={STATUS_BADGE[c.status]}>{c.status}</Badge></td>
                <td style={td}>{c.motif ?? '—'}</td>
                <td style={td}>
                  {c.status === 'prevue' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(c, 'terminee')}
                        style={{ marginRight: 8 }}
                      >
                        Terminer
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange(c, 'annulee')}
                      >
                        Annuler
                      </Button>
                    </>
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