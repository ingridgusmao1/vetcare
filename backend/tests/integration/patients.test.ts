import request from 'supertest';
import { buildApp } from '../../src/app';
import { pool } from '../../src/config/db';
import { hashPassword } from '../../src/utils/password';

const app = buildApp();

// Helper: log in as admin and return the cookie for subsequent requests.
async function loginAsAdmin(): Promise<string> {
  const hash = await hashPassword('Admin1234!');
  await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    ['admin@vetcare.fr', hash, 'administrateur']
  );
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@vetcare.fr', password: 'Admin1234!' });
  return res.headers['set-cookie'][0];
}

beforeEach(async () => {
  await pool.query('TRUNCATE patients, dossier, proprietaires, users RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});

describe('GET /api/patients', () => {
  it('returns 401 without authentication', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.status).toBe(401);
  });

  it('returns an empty list for a fresh database', async () => {
    const cookie = await loginAsAdmin();
    const res = await request(app).get('/api/patients').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/patients', () => {
  it('creates a patient and auto-creates the dossier', async () => {
    const cookie = await loginAsAdmin();

    // Need an owner first.
    await pool.query(
      `INSERT INTO proprietaires (nom, email) VALUES ($1, $2)`,
      ['Jean Dupont', 'jean@example.com']
    );

    const res = await request(app)
      .post('/api/patients')
      .set('Cookie', cookie)
      .send({ nom: 'Milo', espece: 'chien', proprietaire_id: 1 });

    expect(res.status).toBe(201);
    expect(res.body.nom).toBe('Milo');

    // The dossier must have been created in the same transaction.
    const dossier = await pool.query(
      'SELECT * FROM dossier WHERE patient_id = $1',
      [res.body.reference_patient]
    );
    expect(dossier.rows).toHaveLength(1);
  });

  it('rejects creation with an unknown proprietaire_id', async () => {
    const cookie = await loginAsAdmin();
    const res = await request(app)
      .post('/api/patients')
      .set('Cookie', cookie)
      .send({ nom: 'Milo', espece: 'chien', proprietaire_id: 9999 });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Propriétaire');
  });
});