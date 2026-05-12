import { z } from 'zod';

const TREATMENT_STATUSES = ['en_cours', 'termine', 'suspendu'] as const;

export const createTraitementSchema = z.object({
  medicament: z
    .string()
    .trim()
    .min(2, 'Le médicament est obligatoire')
    .max(200, 'Nom du médicament trop long'),

  status: z.enum(TREATMENT_STATUSES).optional(),

  // Required link to a patient.
  patient_id: z.coerce.number().int().positive('Patient requis'),

  // Optional link to a dossier — null means "don't link".
  dossier_id: z.coerce.number().int().positive().nullable().optional(),
});

export const updateTraitementSchema = z.object({
  medicament: z.string().trim().min(2).max(200).optional(),
  status: z.enum(TREATMENT_STATUSES).optional(),
});

export const findTraitementsQuerySchema = z.object({
  status: z.enum(TREATMENT_STATUSES).optional(),
  patient_id: z.coerce.number().int().positive().optional(),
  dossier_id: z.coerce.number().int().positive().optional(),
});

export type CreateTraitementDTO = z.infer<typeof createTraitementSchema>;
export type UpdateTraitementDTO = z.infer<typeof updateTraitementSchema>;
export type FindTraitementsQueryDTO = z.infer<typeof findTraitementsQuerySchema>;