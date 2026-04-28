// scripts/create-admin.ts — run with: npx tsx --env-file=.env.local scripts/create-admin.ts
// Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME as environment variables before running.
import { auth } from '../src/lib/auth';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? 'Admin';

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running.');
  process.exit(1);
}

async function main() {
  await auth.api.signUpEmail({ body: { email: email!, password: password!, name } });
  console.log(`Admin account created for ${email}`);
  process.exit(0);
}

main().catch(console.error);
