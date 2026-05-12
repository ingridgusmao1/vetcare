// pg is the official PostgreSQL client for Node. Pool manages multiple
// concurrent connections so requests don't queue up serialized.
import { Pool } from 'pg';
import { env } from './env';

// Create the pool once for the whole app lifetime.
// Default pool size is 10 — fine for a clinic-scale workload.
export const pool = new Pool({
  // PRIORIDADE: Se houver DATABASE_URL no processo, usamos ela.
  // Caso contrário, usamos os campos individuais que funcionam no seu Mac.
  connectionString: process.env.DATABASE_URL || env.DATABASE_URL,
  user: 'ingrid',
  password: '123',
  host: 'localhost',
  database: 'vetcare',
  port: 5432,

  // Close idle connections after 30s instead of holding them forever.
  idleTimeoutMillis: 30_000,

  // Time out a single connection attempt instead of hanging forever.
  connectionTimeoutMillis: 5_000,
});

// pg emits 'error' on pool-level errors (e.g. DB restarted). Without a listener,
// Node would crash. We just log and let the next request reconnect.
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

// Convenience helper: run a query and return only the rows.
// Using parameter placeholders ($1, $2, ...) is the ONLY safe way — pg
// escapes the values, preventing SQL injection.
//
//   query<User>('SELECT * FROM users WHERE id = $1', [42])
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(text, params);
  // The cast is a developer promise: "I know the shape of the rows here".
  return result.rows as T[];
}