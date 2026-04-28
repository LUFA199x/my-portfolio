import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',

  // Use a raw Postgres connection — Better Auth manages its own tables
  database: new Pool({
    connectionString: process.env.DATABASE_URL!, // Direct Postgres URL from Supabase
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Toggle on in production
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // Refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 min client-side cache
    },
  },

  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ],
});

export type Session = typeof auth.$Infer.Session;