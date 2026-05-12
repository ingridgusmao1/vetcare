import { z } from 'zod';

const STATUSES = ['prevue', 'terminee', 'annulee'] as const;

export const createConsultationSchema = z.object({
  patient_id: z.coerce.number().int().positive('Patient requis'),
  veterinaire_id: z.coerce.number().int().positive('Vétérinaire requis'),

  // The frontend sends an ISO datetime string ("2026-04-15T14:30:00Z").

  date: z.preprocess(
  (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg),
  z.date({ message: 'Date invalide' })
),

  status: z.enum(STATUSES).optional(),
  motif: z.string().trim().max(2000).nullable().optional(),
});

export const updateConsultationSchema = createConsultationSchema.partial();

// Just for the dedicated PATCH /:id/status endpoint.
export const updateStatusSchema = z.object({
  status: z.enum(STATUSES, 'Statut invalide').optional(),
});

// No filtro também, se quiser a mensagem:
export const findConsultationsQuerySchema = z.object({
  patient_id: z.coerce.number().int().positive().optional(),
  veterinaire_id: z.coerce.number().int().positive().optional(),
  status: z.enum(STATUSES, 'Statut invalide').optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
});

export type CreateConsultationDTO = z.infer<typeof createConsultationSchema>;
export type UpdateConsultationDTO = z.infer<typeof updateConsultationSchema>;
export type UpdateStatusDTO = z.infer<typeof updateStatusSchema>;
export type FindConsultationsQueryDTO = z.infer<typeof findConsultationsQuerySchema>;