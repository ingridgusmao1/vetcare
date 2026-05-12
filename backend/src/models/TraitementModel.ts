import { query, pool } from '../config/db';
import { Traitement, TreatmentStatus } from '../types';

// Creating a treatment goes hand-in-hand with attaching it to a patient
// (and optionally a dossier). The model accepts the link inputs and runs
// everything inside a single transaction.
export interface CreateTraitementInput {
  medicament: string;
  status?: TreatmentStatus;

  // Required link to the patient (the n:m junction table row).
  patient_id: number;

  // Optional link to a dossier (the consister n:m junction).
  dossier_id?: number | null;
}

export interface UpdateTraitementInput {
  medicament?: string;
  status?: TreatmentStatus;
}

export interface FindTraitementsFilter {
  status?: TreatmentStatus;
  patient_id?: number;
  dossier_id?: number;
}

export class TraitementModel {
  // ------------------------------------------------------------------------
  // findAll — supports filtering by status, patient, or dossier.
  // We need joins because patient_id and dossier_id live in junction tables.
  // ------------------------------------------------------------------------
  static async findAll(
    filter: FindTraitementsFilter = {}
  ): Promise<Traitement[]> {
    const conditions: string[] = ['TRUE'];
    const params: unknown[] = [];

    // The base query selects from traitements; joins are added conditionally
    // so we don't pay the cost when the caller doesn't filter on links.
    let joins = '';

    if (filter.status) {
      params.push(filter.status);
      conditions.push(`t.status = $${params.length}`);
    }

    if (filter.patient_id) {
      joins += ' JOIN patients_traitements pt ON pt.traitement_id = t.reference_traitement';
      params.push(filter.patient_id);
      conditions.push(`pt.patient_id = $${params.length}`);
    }

    if (filter.dossier_id) {
      joins += ' JOIN dossier_traitements dt ON dt.traitement_id = t.reference_traitement';
      params.push(filter.dossier_id);
      conditions.push(`dt.dossier_id = $${params.length}`);
    }

    // DISTINCT prevents duplicate rows when both joins match the same treatment
    // for the same animal (would happen rarely but the query is safer for it).
    const sql = `
      SELECT DISTINCT t.reference_traitement, t.medicament, t.status,
             t.created_at, t.updated_at
      FROM traitements t
      ${joins}
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.created_at DESC
    `;
    return query<Traitement>(sql, params);
  }

  // findById — single treatment.
  static async findById(id: number): Promise<Traitement | null> {
    const sql = `
      SELECT reference_traitement, medicament, status, created_at, updated_at
      FROM traitements
      WHERE reference_traitement = $1
    `;
    const rows = await query<Traitement>(sql, [id]);
    return rows[0] ?? null;
  }

  // ------------------------------------------------------------------------
  // findActiveByPatient — used by the patient detail page to show ongoing
  // treatments only. Maps to US-16.
  // ------------------------------------------------------------------------
  static async findActiveByPatient(patientId: number): Promise<Traitement[]> {
    const sql = `
      SELECT t.reference_traitement, t.medicament, t.status,
             t.created_at, t.updated_at
      FROM traitements t
      JOIN patients_traitements pt ON pt.traitement_id = t.reference_traitement
      WHERE pt.patient_id = $1
        AND t.status = 'en_cours'
      ORDER BY t.created_at DESC
    `;
    return query<Traitement>(sql, [patientId]);
  }

  // ------------------------------------------------------------------------
  // create — atomic insert + link-up in junctions, all in one transaction.
  // If linking the patient fails, the treatment row is rolled back too.
  // ------------------------------------------------------------------------
  static async create(data: CreateTraitementInput): Promise<Traitement> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert the treatment itself.
      const insertTreatment = `
        INSERT INTO traitements (medicament, status)
        VALUES ($1, COALESCE($2, 'en_cours'))
        RETURNING reference_traitement, medicament, status, created_at, updated_at
      `;
      const { rows: tRows } = await client.query<Traitement>(insertTreatment, [
        data.medicament,
        data.status ?? null,
      ]);
      const treatment = tRows[0];

      // Link to patient (mandatory).
      const linkPatient = `
        INSERT INTO patients_traitements (patient_id, traitement_id)
        VALUES ($1, $2)
      `;
      await client.query(linkPatient, [
        data.patient_id,
        treatment.reference_traitement,
      ]);

      // Link to dossier (optional).
      if (data.dossier_id) {
        const linkDossier = `
          INSERT INTO dossier_traitements (dossier_id, traitement_id)
          VALUES ($1, $2)
        `;
        await client.query(linkDossier, [
          data.dossier_id,
          treatment.reference_traitement,
        ]);
      }

      await client.query('COMMIT');
      return treatment;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Partial update of medicament/status.
  static async update(
    id: number,
    data: UpdateTraitementInput
  ): Promise<Traitement | null> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return this.findById(id);

    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v);

    const sql = `
      UPDATE traitements
      SET ${setClause}
      WHERE reference_traitement = $${entries.length + 1}
      RETURNING reference_traitement, medicament, status, created_at, updated_at
    `;
    const rows = await query<Traitement>(sql, [...values, id]);
    return rows[0] ?? null;
  }

  // ------------------------------------------------------------------------
  // setStatus — convenience for the most common update.
  // ------------------------------------------------------------------------
  static async setStatus(
    id: number,
    status: TreatmentStatus
  ): Promise<Traitement | null> {
    const sql = `
      UPDATE traitements
      SET status = $1
      WHERE reference_traitement = $2
      RETURNING reference_traitement, medicament, status, created_at, updated_at
    `;
    const rows = await query<Traitement>(sql, [status, id]);
    return rows[0] ?? null;
  }

  // Hard delete — cascade removes junction rows automatically.
  static async remove(id: number): Promise<boolean> {
    const sql = 'DELETE FROM traitements WHERE reference_traitement = $1';
    await query(sql, [id]);
    return true;
  }

  // ------------------------------------------------------------------------
  // countActive — dashboard KPI "traitements en cours".
  // ------------------------------------------------------------------------
  static async countActive(): Promise<number> {
    const sql = `
      SELECT COUNT(*)::int AS count
      FROM traitements
      WHERE status = 'en_cours'
    `;
    const rows = await query<{ count: number }>(sql);
    return rows[0].count;
  }
}