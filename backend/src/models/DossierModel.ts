import { query } from '../config/db';
import { Dossier } from '../types';

// Dossier is auto-created with the patient. We don't expose a `create` to
// API consumers — only update + read. patient_id is part of the URL, not the
// body, so the input shape is just the medical content.
export interface UpdateDossierInput {
  allergie?: string | null;
  intolerance?: string | null;
  condition_physique?: string | null;
}

export class DossierModel {
  // ------------------------------------------------------------------------
  // findAll — list every dossier. Mostly for admin overview / reports.
  // ------------------------------------------------------------------------
  static async findAll(): Promise<Dossier[]> {
    const sql = `
      SELECT reference_dossier, patient_id, allergie, intolerance,
             condition_physique, created_at, updated_at
      FROM dossier
      ORDER BY updated_at DESC
    `;
    return query<Dossier>(sql);
  }

  // Single dossier by its own id.
  static async findById(id: number): Promise<Dossier | null> {
    const sql = `
      SELECT reference_dossier, patient_id, allergie, intolerance,
             condition_physique, created_at, updated_at
      FROM dossier
      WHERE reference_dossier = $1
    `;
    const rows = await query<Dossier>(sql, [id]);
    return rows[0] ?? null;
  }

  // ------------------------------------------------------------------------
  // findByPatient — the way the frontend usually finds a dossier.
  // Goes from patient page → "voir dossier" button → /api/dossiers/by-patient/:id
  // ------------------------------------------------------------------------
  static async findByPatient(patientId: number): Promise<Dossier | null> {
    const sql = `
      SELECT reference_dossier, patient_id, allergie, intolerance,
             condition_physique, created_at, updated_at
      FROM dossier
      WHERE patient_id = $1
    `;
    const rows = await query<Dossier>(sql, [patientId]);
    return rows[0] ?? null;
  }

  // ------------------------------------------------------------------------
  // create — kept for completeness / tests. Production flow uses the
  // PatientModel.create transaction which inserts the dossier itself.
  // The UNIQUE constraint on patient_id will block duplicates regardless.
  // ------------------------------------------------------------------------
  static async create(patientId: number): Promise<Dossier> {
    const sql = `
      INSERT INTO dossier (patient_id)
      VALUES ($1)
      RETURNING reference_dossier, patient_id, allergie, intolerance,
                condition_physique, created_at, updated_at
    `;
    const rows = await query<Dossier>(sql, [patientId]);
    return rows[0];
  }

  // Partial update of the medical fields.
  static async update(
    id: number,
    data: UpdateDossierInput
  ): Promise<Dossier | null> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return this.findById(id);

    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v);

    const sql = `
      UPDATE dossier
      SET ${setClause}
      WHERE reference_dossier = $${entries.length + 1}
      RETURNING reference_dossier, patient_id, allergie, intolerance,
                condition_physique, created_at, updated_at
    `;
    const rows = await query<Dossier>(sql, [...values, id]);
    return rows[0] ?? null;
  }

  // remove — hard delete. The patient ON DELETE CASCADE removes its dossier
  // automatically, so this is mostly for tests.
  static async remove(id: number): Promise<boolean> {
    const sql = 'DELETE FROM dossier WHERE reference_dossier = $1';
    await query(sql, [id]);
    return true;
  }
}