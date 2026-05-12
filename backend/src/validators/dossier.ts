import { z } from 'zod';

// Dossier creation isn't exposed to the API — it happens automatically with
// the patient. We only validate update payloads.
//
// All fields are nullable because the cahier marks them optional medical info.
export const updateDossierSchema = z.object({
  allergie: z.string().trim().max(2000).nullable().optional(),
  intolerance: z.string().trim().max(2000).nullable().optional(),
  condition_physique: z.string().trim().max(5000).nullable().optional(),
});

export type UpdateDossierDTO = z.infer<typeof updateDossierSchema>;