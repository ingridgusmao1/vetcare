// ---------------------------------------------------------------------------
// Domain types. These mirror the database schema 1:1.
// They are the contract between models, controllers, and the frontend.
// ---------------------------------------------------------------------------

// Use a string union type so it maps cleanly to the SQL ENUM.
export type UserRole = 'administrateur' | 'veterinaire' | 'assistant';

export type AnimalSpecies =
  | 'chien' | 'chat' | 'lapin' | 'oiseau' | 'reptile' | 'rongeur' | 'autre';

export type ConsultationStatus = 'prevue' | 'terminee' | 'annulee';

export type TreatmentStatus = 'en_cours' | 'termine' | 'suspendu';

// User as stored in the DB. Note password_hash is here — never send it back!
export interface User {
  reference_user: number;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// User as we return it to the client (password hash stripped).
// Picking properties keeps the contract explicit; if a field is removed from
// User, this stops compiling — TypeScript guards us.
export type PublicUser = Omit<User, 'password_hash'>;

export interface Proprietaire {
  reference_prop: number;
  nom: string;
  email: string;
  telephone: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Patient {
  reference_patient: number;
  nom: string;
  espece: AnimalSpecies;
  veterinaire: string | null;
  actif: boolean;
  proprietaire_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Dossier {
  reference_dossier: number;
  patient_id: number;
  allergie: string | null;
  intolerance: string | null;
  condition_physique: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Consultation {
  reference_consultation: number;
  patient_id: number;
  veterinaire_id: number;
  date: Date;
  status: ConsultationStatus;
  motif: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Traitement {
  reference_traitement: number;
  medicament: string;
  status: TreatmentStatus;
  created_at: Date;
  updated_at: Date;
}

// JWT payload signed inside the cookie token.
// Keep it minimal — only what middlewares need to authorize requests.
export interface TokenPayload {
  sub: number;        // standard JWT field: subject == user reference_user
  email: string;
  role: UserRole;
}

// ---------------------------------------------------------------------------
// Express type augmentation: lets us write `req.user` after authentication.
// Without this, TS would complain that `user` is not a property of `Request`.
// ---------------------------------------------------------------------------
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}