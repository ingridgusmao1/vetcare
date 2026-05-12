// Run with: npx tsx scripts/generate-seed-hashes.ts
// Prints SQL UPDATE statements you can paste into seed.sql to fill in
// the placeholder hashes with real Argon2id ones.
import { hashPassword } from '../src/utils/password';

async function main() {
  const accounts = [
    { email: 'admin@vetcare.fr', password: 'Admin1234!' },
    { email: 'marie@vetcare.fr', password: 'Vet1234!' },
    { email: 'sofia@vetcare.fr', password: 'Asst1234!' },
  ];

  for (const a of accounts) {
    const hash = await hashPassword(a.password);
    console.log(
      `UPDATE users SET password_hash = '${hash}' WHERE email = '${a.email}';`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});