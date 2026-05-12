import { useEffect, useState } from 'react';
import { dashboardApi, type DashboardStats } from '../api/dashboard';
import { KpiCard } from '../components/molecules/KpiCard';
import { Spinner } from '../components/atoms/Spinner';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    dashboardApi.stats()
      .then((s) => { if (!cancelled) setStats(s); })
      .finally(() => { if (!cancelled) setLoading(false); });

    // Cleanup so a second render or unmount doesn't try to setState on a
    // dead component (avoids React warnings + race conditions).
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <h1 style={{ fontStyle: 'italic', fontSize: 'var(--fs-2xl)' }}>
        Tableau de bord
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>
        Vue d'ensemble en temps réel de l'activité de la clinique.
      </p>

      {loading ? (
        <Spinner />
      ) : stats ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-5)',
          }}
        >
          <KpiCard value={stats.animaux_suivis} label="Animaux suivis" />
          <KpiCard value={stats.consultations_semaine} label="Consultations cette semaine" />
          <KpiCard value={stats.traitements_en_cours} label="Traitements en cours" />
        </div>
      ) : (
        <p>Impossible de charger les statistiques.</p>
      )}
    </>
  );
}