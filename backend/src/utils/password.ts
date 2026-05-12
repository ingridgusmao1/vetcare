// argon2 is a native module that calls into a C library — fast and safe.
// We use Argon2id (the recommended variant by OWASP since 2021).
import argon2 from 'argon2';

// Argon2id parameters — chosen per OWASP 2024 recommendations.
// Memory cost dominates security: an attacker needs 64 MB *per guess*.
// 3 iterations + 4 threads keep server-side cost <100ms on typical hardware.
const ARGON2_OPTIONS = {
  type: argon2.argon2id,    // hybrid mode (resists side-channel + GPU attacks)
  memoryCost: 65_536,        // 64 MB
  timeCost: 3,               // number of iterations
  parallelism: 4,            // threads
};

// Hash a plaintext password. The returned string is self-describing:
// "$argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>" — no separate salt to store.
export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

// Verify against a stored hash. Returns boolean; throws on malformed hash.
export function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}