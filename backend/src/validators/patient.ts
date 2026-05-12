import { z } from 'zod';

// Same enum values as the SQL ENUM and the TS UserRole — must stay in sync.
const SPECIES = [
  'chien', 'chat', 'lapin', 'oiseau', 'reptile', 'rongeur', 'autre',
] as const;

export const createPatientSchema = z.object({
  nom: z.string().trim().min(1, 'Le nom est obligatoire').max(100),
  // SOLUÇÃO: Passar a string diretamente como segundo argumento
  espece: z.enum(SPECIES, 'Espèce invalide'),
  
  veterinaire: z.string().trim().max(100).nullable().optional(),

  // z.coerce.number() converts "5" (string from form data) to 5 (number).
  proprietaire_id: z.coerce.number().int().positive('Propriétaire requis'),
});

// Update accepts a subset; we also allow flipping the actif flag here.
export const updatePatientSchema = createPatientSchema.partial().extend({
  actif: z.boolean().optional(),
});

// Filters used as query string parameters on GET /api/patients.
export const findPatientsQuerySchema = z.object({
  search: z.string().trim().optional(),
  // Aplicando a mesma padronização aqui para evitar erros futuros
  espece: z.enum(SPECIES, 'Espèce invalide').optional(),
  
  actif: z
    .enum(['true', 'false'])
    .transform((s) => s === 'true')
    .optional(),
});

export type CreatePatientDTO = z.infer<typeof createPatientSchema>;
export type UpdatePatientDTO = z.infer<typeof updatePatientSchema>;
export type FindPatientsQueryDTO = z.infer<typeof findPatientsQuerySchema>;