import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
// Force the test env BEFORE any module reads process.env.
process.env.NODE_ENV = 'test';

// Reuse a tiny JWT secret in tests so the values are stable.
process.env.JWT_SECRET = 'test_secret_at_least_32_chars_long_xxx';
process.env.DATABASE_URL = 'postgres://ingrid:123@localhost:5432/vetcare';  'postgres://postgres:postgres@localhost:5432/vetcare';
process.env.CORS_ORIGIN = 'http://localhost:5173';