import { useEffect, useState } from 'react';
import { patientsApi, type Patient } from '../api/patients';
import { proprietairesApi, type Proprietaire } from '../api/proprietaires';
import { PatientsTable } from '../components/organisms/PatientsTable';
import { SearchBar } from '../components/molecules/SearchBar';
import { Spinner } from '../components/atoms/Spinner';

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [owners, setOwners] = useState<Proprietaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Reload patients when the search term changes.
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    patientsApi.list({ search: search || undefined })
      .then((data) => { if (!cancelled) setPatients(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search]);

  // Owners are loaded once — the table needs the name lookup.
  useEffect(() => {
    proprietairesApi.list().then(setOwners);
  }, []);

  // Build a fast lookup table once owners are loaded.
  const ownersById: Record<number, string> = {};
  for (const o of owners) ownersById[o.reference_prop] = o.nom;

  const handleSoftDelete = async (p: Patient) => {
    if (!window.confirm(`Désactiver le dossier de ${p.nom} ? L'historique sera conservé.`)) return;
    const updated = await patientsApi.softDelete(p.reference_patient);
    // Replace the patient in-place so the UI updates instantly.
    setPatients((prev) => prev.map((x) => x.reference_patient === updated.reference_patient ? updated : x));
  };

  return (
    <>
      <h1 style={{ fontStyle: 'italic', fontSize: 'var(--fs-2xl)' }}>Patients</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>
        Liste de tous les animaux suivis par la clinique.
      </p>

      <div style={{ marginBottom: 'var(--space-5)', maxWidth: 480 }}>
        <SearchBar
          placeholder="Rechercher un animal ou un propriétaire…"
          onSearch={setSearch}
        />
      </div>

      {loading ? <Spinner /> : (
        <PatientsTable
          patients={patients}
          ownersById={ownersById}
          onSoftDelete={handleSoftDelete}
        />
      )}
    </>
  );
}