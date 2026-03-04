import { env } from '@/env';
import { db } from '@yeschefai/db';
import * as schema from '@yeschefai/db/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: ['capacitor://localhost'],
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema,
    }),
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    account: {
        skipStateCookieCheck: true,
    },
    plugins: [nextCookies()],
});
