import { buildApp } from './app';
import { env } from './config/env';
import { pool } from './config/db';

// Build the app once.
const app = buildApp();

// Start listening. The callback runs once the port is bound.
const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🐾 VetCare API running on http://localhost:${env.PORT}`);
});

// Graceful shutdown: when Docker sends SIGTERM, finish in-flight requests
// then close the DB pool before exiting. Without this, Postgres connections
// can leak across container restarts.
function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received, shutting down...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));