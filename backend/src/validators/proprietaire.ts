import { z } from 'zod';

// French phone numbers come in many formats: "0612345678", "+33 6 12...", etc.
// We accept anything 8-20 chars, leaving deeper validation to the front-end UX.
const PHONE_REGEX = /^[\d\s+\-().]{8,20}$/;

export const createProprietaireSchema = z.object({
  // .trim() strips leading/trailing whitespace from copy-paste mistakes.
  nom: z
    .string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long (100 caractères max)'),

  email: z.string().trim().toLowerCase().email('Format email invalide'),

  // .nullable().optional() = three valid forms: "12345...", null, omitted.
  telephone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, 'Format de téléphone invalide')
    .nullable()
    .optional(),
});

// Update reuses the create shape but every field is optional.
// .partial() walks the schema and marks every field optional automatically.
export const updateProprietaireSchema = createProprietaireSchema.partial();

export type CreateProprietaireDTO = z.infer<typeof createProprietaireSchema>;
export type UpdateProprietaireDTO = z.infer<typeof updateProprietaireSchema>;