import { query, pool } from '../config/db';
import { Patient, AnimalSpecies } from '../types';

export interface CreatePatientInput {
  nom: string;
  espece: AnimalSpecies;
  veterinaire?: string | null;
  proprietaire_id: number;
}

export interface UpdatePatientInput {
  nom?: string;
  espece?: AnimalSpecies;
  veterinaire?: string | null;
  actif?: boolean;
  proprietaire_id?: number;
}

// Search filters carried as URL query strings on /api/patients.
export interface FindPatientsFilter {
  search?: string;        // matches name or owner name
  espece?: AnimalSpecies;
  actif?: boolean;
}

export class PatientModel {
  // ------------------------------------------------------------------------
  // findAll — supports filters from the search bar.
  // We build the WHERE clause dynamically. Each filter adds one $N param.
  // ------------------------------------------------------------------------
  static async findAll(filter: FindPatientsFilter = {}): Promise<Patient[]> {
    // Start with a hard-coded list of WHERE conditions.
    // 'TRUE' acts as a placeholder so we can always AND additional filters.
    const conditions: string[] = ['TRUE'];
    const params: unknown[] = [];

    // Search by patient or owner name — ILIKE is case-insensitive on Postgres.
    if (filter.search) {
      params.push(`%${filter.search}%`);
      conditions.push(`(p.nom ILIKE $${params.length}
                       OR pr.nom ILIKE $${params.length})`);
    }

    // Species filter — exact match against the ENUM.
    if (filter.espece) {
      params.push(filter.espece);
      conditions.push(`p.espece = $${params.length}`);
    }

    // Active flag — undefined means "don't filter", true/false applies.
    if (typeof filter.actif === 'boolean') {
      params.push(filter.actif);
      conditions.push(`p.actif = $${params.length}`);
    }

    // Join with proprietaires to allow searching by owner name.
    // We still SELECT only patient fields — the JOIN is just for the WHERE.
    const sql = `
      SELECT p.reference_patient, p.nom, p.espece, p.veterinaire, p.actif,
             p.proprietaire_id, p.created_at, p.updated_at
      FROM patients p
      JOIN proprietaires pr ON pr.reference_prop = p.proprietaire_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.nom ASC
    `;
    return query<Patient>(sql, params);
  }

  // findById — single patient, no filters needed.
  static async findById(id: number): Promise<Patient | null> {
    const sql = `
      SELECT reference_patient, nom, espece, veterinaire, actif,
             proprietaire_id, created_at, updated_at
      FROM patients
      WHERE reference_patient = $1
    `;
    const rows = await query<Patient>(sql, [id]);
    return rows[0] ?? null;
  }

  // ------------------------------------------------------------------------
  // create — atomic create + auto-create the dossier.
  // The cahier (US-04, US-14) says "dossier created automatically with the
  // patient (1,1 relation)". We use a transaction so that a failure in step 2
  // rolls back step 1 — no orphan patients without a dossier.
  // ------------------------------------------------------------------------
  static async create(data: CreatePatientInput): Promise<Patient> {
    // Get one connection from the pool — a transaction must run on the same
    // connection from BEGIN to COMMIT/ROLLBACK.
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertPatient = `
        INSERT INTO patients (nom, espece, veterinaire, proprietaire_id)
        VALUES ($1, $2, $3, $4)
        RETURNING reference_patient, nom, espece, veterinaire, actif,
                  proprietaire_id, created_at, updated_at
      `;
      const { rows: patientRows } = await client.query<Patient>(insertPatient, [
        data.nom,
        data.espece,
        data.veterinaire ?? null,
        data.proprietaire_id,
      ]);
      const patient = patientRows[0];

      // Empty dossier: the medical fields are filled in later via /api/dossiers.
      const insertDossier = `
        INSERT INTO dossier (patient_id) VALUES ($1)
      `;
      await client.query(insertDossier, [patient.reference_patient]);

      await client.query('COMMIT');
      return patient;
    } catch (err) {
      // ROLLBACK undoes BEGIN onwards. Required even if BEGIN itself failed
      // (no-op then). Without rollback, the connection is poisoned.
      await client.query('ROLLBACK');
      throw err;
    } finally {
      // Always release the connection back to the pool, success or failure.
      client.release();
    }
  }

  // Partial update.
  static async update(
    id: number,
    data: UpdatePatientInput
  ): Promise<Patient | null> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return this.findById(id);

    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v);

    const sql = `
      UPDATE patients
      SET ${setClause}
      WHERE reference_patient = $${entries.length + 1}
      RETURNING reference_patient, nom, espece, veterinaire, actif,
                proprietaire_id, created_at, updated_at
    `;
    const rows = await query<Patient>(sql, [...values, id]);
    return rows[0] ?? null;
  }

  // ------------------------------------------------------------------------
  // softDelete — sets actif=false. Cahier mandates this (US-08) so history
  // (consultations, dossier) stays accessible after the animal is "removed".
  // ------------------------------------------------------------------------
  static async softDelete(id: number): Promise<Patient | null> {
    const sql = `
      UPDATE patients
      SET actif = FALSE
      WHERE reference_patient = $1
      RETURNING reference_patient, nom, espece, veterinaire, actif,
                proprietaire_id, created_at, updated_at
    `;
    const rows = await query<Patient>(sql, [id]);
    return rows[0] ?? null;
  }

  // Hard delete kept for admin tools / cleanup. Triggers ON DELETE CASCADE.
  static async remove(id: number): Promise<boolean> {
    const sql = 'DELETE FROM patients WHERE reference_patient = $1';
    await query(sql, [id]);
    return true;
  }

  // ------------------------------------------------------------------------
  // countActive — used by the dashboard KPI "animaux suivis".
  // COUNT runs in PostgreSQL — much faster than fetching all rows just to
  // call rows.length in Node.
  // ------------------------------------------------------------------------
  static async countActive(): Promise<number> {
    const sql = 'SELECT COUNT(*)::int AS count FROM patients WHERE actif = TRUE';
    const rows = await query<{ count: number }>(sql);
    return rows[0].count;
  }
}