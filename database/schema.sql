-- ============================================================================
-- VetCare — Database Schema
-- PostgreSQL 15+
-- ============================================================================
-- This script creates the entire database from scratch.
-- It is idempotent (drops first) so it can be re-run without errors.
-- Order of statements matters: types before tables, parent tables before
-- children with foreign keys.
-- ============================================================================

-- Drop everything in reverse dependency order (children first).
-- Using CASCADE removes anything that depends on these objects.
-- IF EXISTS prevents errors on the very first run when nothing exists yet.
DROP TABLE IF EXISTS patients_traitements CASCADE;
DROP TABLE IF EXISTS dossier_traitements  CASCADE;
DROP TABLE IF EXISTS traitements          CASCADE;
DROP TABLE IF EXISTS consultations        CASCADE;
DROP TABLE IF EXISTS dossier              CASCADE;
DROP TABLE IF EXISTS patients             CASCADE;
DROP TABLE IF EXISTS proprietaires        CASCADE;
DROP TABLE IF EXISTS users                CASCADE;

-- Drop custom enum types (must come after the tables that used them).
DROP TYPE IF EXISTS user_role             CASCADE;
DROP TYPE IF EXISTS animal_species        CASCADE;
DROP TYPE IF EXISTS consultation_status   CASCADE;
DROP TYPE IF EXISTS treatment_status      CASCADE;

-- ----------------------------------------------------------------------------
-- ENUM types
-- ----------------------------------------------------------------------------
-- Why ENUMs and not free-text columns?
-- 1. Database-level integrity: 'cien' (typo) is rejected before reaching us.
-- 2. Smaller storage: 1 byte vs. variable-length strings.
-- 3. They map cleanly to TypeScript union types on the API side.
-- ----------------------------------------------------------------------------

-- 3 staff roles, hierarchical: admin > veterinaire > assistant.
CREATE TYPE user_role AS ENUM (
  'administrateur',
  'veterinaire',
  'assistant'
);

-- Species supported by the clinic. 'autre' is an escape hatch.
CREATE TYPE animal_species AS ENUM (
  'chien',
  'chat',
  'lapin',
  'oiseau',
  'reptile',
  'rongeur',
  'autre'
);

-- Consultation lifecycle (states an appointment can be in).
CREATE TYPE consultation_status AS ENUM (
  'prevue',
  'terminee',
  'annulee'
);

-- Treatment lifecycle.
CREATE TYPE treatment_status AS ENUM (
  'en_cours',
  'termine',
  'suspendu'
);

-- ----------------------------------------------------------------------------
-- Generic trigger function: keep updated_at in sync automatically
-- ----------------------------------------------------------------------------
-- Why a trigger and not application code?
-- The DB enforces it even if a developer forgets in the model layer.
-- "Trust no human" — defense in depth.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- NEW is the row about to be written. We mutate it before the write happens.
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Table: users (clinic staff)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  -- SERIAL = INT auto-increment. Easier to read in URLs than UUID.
  reference_user   SERIAL          PRIMARY KEY,

  -- 255 chars covers RFC 5321 limit (320), but practically nobody uses more.
  -- UNIQUE prevents duplicate accounts at DB level (no race conditions).
  email            VARCHAR(255)    UNIQUE NOT NULL,

  -- Argon2id hashes are ~96 chars but TEXT removes any size guesswork.
  -- We store ONLY the hash, never the plaintext password.
  password_hash    TEXT            NOT NULL,

  -- ENUM ensures a typo cannot create an unknown role.
  role             user_role       NOT NULL,

  -- Soft disable an account without deleting (audit trail preserved).
  is_active        BOOLEAN         NOT NULL DEFAULT TRUE,

  -- DB writes the timestamp itself; clock cannot be spoofed by the client.
  created_at       TIMESTAMP       NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Trigger: bump updated_at on every UPDATE.
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- Table: proprietaires (animal owners)
-- ----------------------------------------------------------------------------
CREATE TABLE proprietaires (
  reference_prop   SERIAL          PRIMARY KEY,
  nom              VARCHAR(100)    NOT NULL,

  -- UNIQUE so the same person cannot be registered twice with the same email.
  email            VARCHAR(255)    UNIQUE NOT NULL,

  -- 20 chars covers international formats (+33 6 12 34 56 78 + spaces).
  telephone        VARCHAR(20),
  created_at       TIMESTAMP       NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TRIGGER proprietaires_set_updated_at
  BEFORE UPDATE ON proprietaires
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- Table: patients (animals)
-- ----------------------------------------------------------------------------
CREATE TABLE patients (
  reference_patient SERIAL         PRIMARY KEY,
  nom               VARCHAR(100)   NOT NULL,
  espece            animal_species NOT NULL,

  -- Free-text vet name shown on the patient card. The actual logged-in vet
  -- doing a consultation is tracked separately in consultations.veterinaire_id.
  veterinaire       VARCHAR(100),

  -- Soft delete: animal "removed" from active list but history kept.
  -- The cahier explicitly bans physical deletion (US-08).
  actif             BOOLEAN        NOT NULL DEFAULT TRUE,

  -- Owner is mandatory. ON DELETE CASCADE: deleting an owner removes pets.
  -- This matches real life (no orphan animals) and the cahier.
  proprietaire_id   INT            NOT NULL
                    REFERENCES proprietaires(reference_prop)
                    ON DELETE CASCADE,

  created_at        TIMESTAMP      NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- Index: most queries go "find pets for owner X" or "list all active pets".
-- An index on proprietaire_id turns O(n) scans into O(log n) lookups.
CREATE INDEX idx_patients_proprietaire ON patients(proprietaire_id);
CREATE INDEX idx_patients_actif        ON patients(actif);

CREATE TRIGGER patients_set_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- Table: dossier (one medical file per animal — exact 1:1)
-- ----------------------------------------------------------------------------
CREATE TABLE dossier (
  reference_dossier   SERIAL       PRIMARY KEY,

  -- UNIQUE on patient_id is what enforces the 1:1 relationship at DB level.
  -- Without UNIQUE, two dossiers could exist for the same animal.
  patient_id          INT          UNIQUE NOT NULL
                      REFERENCES patients(reference_patient)
                      ON DELETE CASCADE,

  -- All medical fields are nullable: the dossier exists from day 1 (created
  -- by the API at patient insert) but content is filled in over time.
  allergie            TEXT,
  intolerance         TEXT,
  condition_physique  TEXT,

  created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER dossier_set_updated_at
  BEFORE UPDATE ON dossier
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- Table: consultations
-- ----------------------------------------------------------------------------
CREATE TABLE consultations (
  reference_consultation SERIAL              PRIMARY KEY,

  -- Which animal the consultation is about.
  patient_id             INT                 NOT NULL
                         REFERENCES patients(reference_patient)
                         ON DELETE CASCADE,

  -- Which staff member performs the consultation.
  -- ON DELETE RESTRICT: cannot delete a vet who has consultations attached.
  -- This forces an admin to reassign first — protects audit trail.
  veterinaire_id         INT                 NOT NULL
                         REFERENCES users(reference_user)
                         ON DELETE RESTRICT,

  date                   TIMESTAMP           NOT NULL,
  status                 consultation_status NOT NULL DEFAULT 'prevue',

  -- Reason given by owner ("limps on left paw") — free-form.
  motif                  TEXT,

  created_at             TIMESTAMP           NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- Indexes on the columns most often used in WHERE/ORDER BY clauses.
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_vet     ON consultations(veterinaire_id);
CREATE INDEX idx_consultations_date    ON consultations(date);
CREATE INDEX idx_consultations_status  ON consultations(status);

CREATE TRIGGER consultations_set_updated_at
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- Table: traitements
-- ----------------------------------------------------------------------------
CREATE TABLE traitements (
  reference_traitement SERIAL           PRIMARY KEY,

  -- Drug name as prescribed (free text — no drug DB in this MVP).
  medicament           VARCHAR(200)     NOT NULL,
  status               treatment_status NOT NULL DEFAULT 'en_cours',

  created_at           TIMESTAMP        NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMP        NOT NULL DEFAULT NOW()
);

CREATE TRIGGER traitements_set_updated_at
  BEFORE UPDATE ON traitements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ----------------------------------------------------------------------------
-- Junction tables for the n:m relations of the MCD
-- ----------------------------------------------------------------------------
-- "consister" : DOSSIER 1,n ─ TRAITEMENTS 1,n
-- A dossier groups N treatments; one treatment can theoretically apply to
-- several dossiers (template / protocol).
-- ----------------------------------------------------------------------------
CREATE TABLE dossier_traitements (
  dossier_id    INT NOT NULL
                REFERENCES dossier(reference_dossier)
                ON DELETE CASCADE,
  traitement_id INT NOT NULL
                REFERENCES traitements(reference_traitement)
                ON DELETE CASCADE,

  -- Composite primary key: the same pair cannot exist twice.
  PRIMARY KEY (dossier_id, traitement_id)
);

-- ----------------------------------------------------------------------------
-- "suivre" : PATIENTS 1,n ─ TRAITEMENTS 1,n
-- An animal can follow several treatments; one treatment can be assigned to
-- multiple animals (e.g. group antiparasitic).
-- ----------------------------------------------------------------------------
CREATE TABLE patients_traitements (
  patient_id    INT NOT NULL
                REFERENCES patients(reference_patient)
                ON DELETE CASCADE,
  traitement_id INT NOT NULL
                REFERENCES traitements(reference_traitement)
                ON DELETE CASCADE,
  date_debut    DATE NOT NULL DEFAULT CURRENT_DATE,
  date_fin      DATE,

  PRIMARY KEY (patient_id, traitement_id)
);

CREATE INDEX idx_pt_patient    ON patients_traitements(patient_id);
CREATE INDEX idx_pt_traitement ON patients_traitements(traitement_id);