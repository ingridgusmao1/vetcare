// Load .env into process.env. Must be the very first line of the app.
// dotenv reads the file synchronously and merges it into process.env.
import dotenv from 'dotenv';
dotenv.config();

// Helper that reads a required env var and crashes early if it's missing.
// "Crashing at boot" is better than "running with a broken config" because the
// problem is visible the second the developer or CI starts the app.
function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    // Throwing here exits the process with code 1 — the deployment will be
    // marked as failed instead of running silently broken.
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Centralized config object. Everywhere else imports `env` from this file
// instead of reading process.env directly. Single source of truth.
export const env = {
  // Numeric env vars need parseInt; default to 4000 if undefined.
  PORT: parseInt(process.env.PORT ?? '4000', 10),

  // 'development' | 'production' | 'test' — used to gate log verbosity etc.
  NODE_ENV: process.env.NODE_ENV ?? 'development',

  // Required: the app cannot run without these.
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),

  // Sensible defaults if missing.
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '8h',

  // Comma-separated list → array. Trimming handles "a, b, c" with spaces.
  CORS_ORIGIN: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim()),

  // Convert string "true"/"false" to boolean. Default false (HTTP local dev).
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
};