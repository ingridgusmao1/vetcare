import { hashPassword, verifyPassword } from '../../src/utils/password';

describe('password utilities', () => {
  it('hashes and verifies a password successfully', async () => {
    const plain = 'Secret1234!';
    const hash = await hashPassword(plain);

    // Sanity: hash is not the plaintext, and starts with the Argon2id marker.
    expect(hash).not.toEqual(plain);
    expect(hash.startsWith('$argon2id$')).toBe(true);

    // verify returns true for the right password...
    await expect(verifyPassword(hash, plain)).resolves.toBe(true);

    // ...and false for the wrong one.
    await expect(verifyPassword(hash, 'WrongPass')).resolves.toBe(false);
  });

  it('produces different hashes for the same password (random salt)', async () => {
    const a = await hashPassword('same');
    const b = await hashPassword('same');
    // Argon2id includes a random salt, so two hashes of the same input differ.
    // This is critical to defeat rainbow-table attacks.
    expect(a).not.toEqual(b);
  });
});