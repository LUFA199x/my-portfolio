// scripts/create-admin.ts — run with: npx tsx scripts/create-admin.ts
import { auth } from '../src/lib/auth';

async function main() {
  await auth.api.signUpEmail({
    body: {
      email: 'alufasola2@gmail.com',
      password: 'adefinewine@Canon',
      name: 'Adegheosa',
    },
  });
  console.log('Admin created successfully');
  process.exit(0);
}

main().catch(console.error);