import request from 'supertest';
import { buildApp } from '../../src/app';
import { pool } from '../../src/config/db';

const app = buildApp();

// Cleanup before each test to keep them isolated.
beforeEach(async () => {
  await pool.query('TRUNCATE users RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  // Close the pool so Jest can exit cleanly.
  await pool.end();
});

describe('POST /api/auth/login', () => {
  it('returns 401 for unknown user (generic message)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever1234' });

    expect(res.status).toBe(401);
    // SECURITY: the message is generic — no "user not found" leakage.
    expect(res.body.message).toBe('Identifiants invalides');
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'whatever1234' });

    // Validation error from zod, not a 401.
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveProperty('email');
  });

  it('logs in successfully with valid credentials and sets a cookie', async () => {
    // Seed one user with a known password.
    const { hashPassword } = await import('../../src/utils/password');
    const hash = await hashPassword('Admin1234!');
    await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)`,
      ['admin@vetcare.fr', hash, 'administrateur']
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@vetcare.fr', password: 'Admin1234!' });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('admin@vetcare.fr');
    // Cookie header should be present and contain "token=" + httpOnly.
    const setCookie = res.headers['set-cookie'][0];
    expect(setCookie).toContain('token=');
    expect(setCookie).toContain('HttpOnly');
  });
});