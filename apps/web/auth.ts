import { env } from '@/env';
import { db } from '@yeschefai/db';
import * as schema from '@yeschefai/db/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { decodeProtectedHeader, importJWK, jwtVerify } from 'jose';

export const auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [
        'yeschefai://auth-callback',
        'yeschefai://',
        'capacitor://localhost',
    ],
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema,
    }),
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            // Accept idTokens issued to both web and iOS native client IDs.
            // The native Google Sign-In SDK uses the iOS client ID as audience.
            verifyIdToken: async (token) => {
                const validAudiences = [
                    env.GOOGLE_CLIENT_ID,
                    env.GOOGLE_IOS_CLIENT_ID,
                ].filter(Boolean) as string[];
                try {
                    const { kid, alg } = decodeProtectedHeader(token);
                    if (!kid || !alg) return false;
                    const res = await fetch(
                        'https://www.googleapis.com/oauth2/v3/certs',
                    );
                    const { keys } = (await res.json()) as {
                        keys: Array<{
                            kid: string;
                            alg: string;
                            kty: string;
                            n: string;
                            e: string;
                            use: string;
                        }>;
                    };
                    const jwk = keys.find((k) => k.kid === kid);
                    if (!jwk) return false;
                    const publicKey = await importJWK(jwk, jwk.alg);
                    await jwtVerify(token, publicKey, {
                        algorithms: [alg],
                        issuer: [
                            'https://accounts.google.com',
                            'accounts.google.com',
                        ],
                        audience: validAudiences,
                        maxTokenAge: '1h',
                    });
                    return true;
                } catch {
                    return false;
                }
            },
        },
    },
    account: {
        skipStateCookieCheck: true,
    },
    plugins: [nextCookies()],
});
