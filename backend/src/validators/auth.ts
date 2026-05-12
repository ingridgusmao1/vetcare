import { z } from 'zod';

// ---------------------------------------------------------------------------
// loginSchema — runs against POST /api/auth/login body.
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  // .email() rejects malformed addresses with a friendly message.
  // .toLowerCase() normalizes so "Marie@VetCare.fr" matches "marie@vetcare.fr".
  email: z
    .string({ message: 'L’email est obligatoire' })
    .email('Format email invalide')
    .toLowerCase(),

  // 8 chars is the cahier minimum (US-01). We don't enforce complexity here:
  // it would just make demos painful. Production projects can add it later.
  password: z
    .string({ message: 'Le mot de passe est obligatoire' })
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

// Inferred type — single source of truth, no manual type to keep in sync.
export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// registerSchema — admin-only endpoint to create new staff accounts (US-03).
// ---------------------------------------------------------------------------
export const registerSchema = z.object({
  email: z.string().email('Format email invalide').toLowerCase(),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  // .enum([...]) ensures the role string is one of the allowed values.
  role: z.enum(['administrateur', 'veterinaire', 'assistant'], {
    message: 'Rôle invalide',
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;