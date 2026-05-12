import { query } from '../config/db';
import { Consultation, ConsultationStatus } from '../types';

export interface CreateConsultationInput {
  patient_id: number;
  veterinaire_id: number;
  date: Date | string;     // accepts ISO string from JSON or Date object
  status?: ConsultationStatus;
  motif?: string | null;
}

export interface UpdateConsultationInput {
  patient_id?: number;
  veterinaire_id?: number;
  date?: Date | string;
  status?: ConsultationStatus;
  motif?: string | null;
}

// Filters from the dashboard / consultations page.
export interface FindConsultationsFilter {
  patient_id?: number;
  veterinaire_id?: number;
  status?: ConsultationStatus;
  // Date range to drive the weekly KPI / calendar view.
  date_from?: Date | string;
  date_to?: Date | string;
}

export class ConsultationModel {
  // ------------------------------------------------------------------------
  // findAll — paginated would be the next iteration; for the demo we return
  // them all but ordered so the most recent appear first.
  // ------------------------------------------------------------------------
  static async findAll(
    filter: FindConsultationsFilter = {}
  ): Promise<Consultation[]> {
    const conditions: string[] = ['TRUE'];
    const params: unknown[] = [];

    if (filter.patient_id) {
      params.push(filter.patient_id);
      conditions.push(`patient_id = $${params.length}`);
    }
    if (filter.veterinaire_id) {
      params.push(filter.veterinaire_id);
      conditions.push(`veterinaire_id = $${params.length}`);
    }
    if (filter.status) {
      params.push(filter.status);
      conditions.push(`status = $${params.length}`);
    }
    if (filter.date_from) {
      params.push(filter.date_from);
      conditions.push(`date >= $${params.length}`);
    }
    if (filter.date_to) {
      params.push(filter.date_to);
      conditions.push(`date <= $${params.length}`);
    }

    const sql = `
      SELECT reference_consultation, patient_id, veterinaire_id, date,
             status, motif, created_at, updated_at
      FROM consultations
      WHERE ${conditions.join(' AND ')}
      ORDER BY date DESC
    `;
    return query<Consultation>(sql, params);
  }

  // Single consultation by id.
  static async findById(id: number): Promise<Consultation | null> {
    const sql = `
      SELECT reference_consultation, patient_id, veterinaire_id, date,
             status, motif, created_at, updated_at
      FROM consultations
      WHERE reference_consultation = $1
    `;
    const rows = await query<Consultation>(sql, [id]);
    return rows[0] ?? null;
  }

  // ------------------------------------------------------------------------
  // findByPatient — every consultation for a given animal, newest first.
  // Drives the "historique" panel on the patient detail page.
  // ------------------------------------------------------------------------
  static async findByPatient(patientId: number): Promise<Consultation[]> {
    const sql = `
      SELECT reference_consultation, patient_id, veterinaire_id, date,
             status, motif, created_at, updated_at
      FROM consultations
      WHERE patient_id = $1
      ORDER BY date DESC
    `;
    return query<Consultation>(sql, [patientId]);
  }

  // create — straightforward INSERT, status defaults to 'prevue' in the SQL.
  static async create(data: CreateConsultationInput): Promise<Consultation> {
    const sql = `
      INSERT INTO consultations (patient_id, veterinaire_id, date, status, motif)
      VALUES ($1, $2, $3, COALESCE($4, 'prevue'), $5)
      RETURNING reference_consultation, patient_id, veterinaire_id, date,
                status, motif, created_at, updated_at
    `;
    // COALESCE($4, 'prevue') uses the supplied status or falls back. We could
    // do this in JS too but doing it in SQL keeps both call paths consistent.
    const rows = await query<Consultation>(sql, [
      data.patient_id,
      data.veterinaire_id,
      data.date,
      data.status ?? null,
      data.motif ?? null,
    ]);
    return rows[0];
  }

  // Partial update.
  static async update(
    id: number,
    data: UpdateConsultationInput
  ): Promise<Consultation | null> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return this.findById(id);

    const setClause = entries.map(([k], i) => `${k} = $${i + 1}`).join(', ');
    const values = entries.map(([, v]) => v);

    const sql = `
      UPDATE consultations
      SET ${setClause}
      WHERE reference_consultation = $${entries.length + 1}
      RETURNING reference_consultation, patient_id, veterinaire_id, date,
                status, motif, created_at, updated_at
    `;
    const rows = await query<Consultation>(sql, [...values, id]);
    return rows[0] ?? null;
  }

  // ------------------------------------------------------------------------
  // updateStatus — convenience method for the most common update.
  // Maps directly to US-12 (vet changes Prévue → Terminée / Annulée).
  // ------------------------------------------------------------------------
  static async updateStatus(
    id: number,
    status: ConsultationStatus
  ): Promise<Consultation | null> {
    const sql = `
      UPDATE consultations
      SET status = $1
      WHERE reference_consultation = $2
      RETURNING reference_consultation, patient_id, veterinaire_id, date,
                status, motif, created_at, updated_at
    `;
    const rows = await query<Consultation>(sql, [status, id]);
    return rows[0] ?? null;
  }

  // Hard delete (used by tests; UI uses softer cancellation via status).
  static async remove(id: number): Promise<boolean> {
    const sql = 'DELETE FROM consultations WHERE reference_consultation = $1';
    await query(sql, [id]);
    return true;
  }

  // ------------------------------------------------------------------------
  // countThisWeek — dashboard KPI "consultations de la semaine".
  // date_trunc('week', ...) returns the Monday 00:00 of the same ISO week.
  // ------------------------------------------------------------------------
  static async countThisWeek(): Promise<number> {
    const sql = `
      SELECT COUNT(*)::int AS count
      FROM consultations
      WHERE date >= date_trunc('week', NOW())
        AND date <  date_trunc('week', NOW()) + INTERVAL '7 days'
    `;
    const rows = await query<{ count: number }>(sql);
    return rows[0].count;
  }
}