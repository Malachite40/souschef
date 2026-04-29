'use client';

import { env } from '@/env';
import { authClient } from '@/lib/auth-client';
import { getPlatform, isNativeApp } from '@/lib/utils/platform';
import { Button } from '@yeschefai/ui/components/button';
import { ChefHatIcon } from 'lucide-react';

async function handleGoogleSignIn() {
    if (isNativeApp() && getPlatform() === 'ios') {
        const { GoogleSignIn } = await import(
            '@capawesome/capacitor-google-sign-in'
        );
        await GoogleSignIn.initialize({
            clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });
        const result = await GoogleSignIn.signIn();
        if (!result.idToken) {
            alert('Google sign-in error: missing ID token');
            return;
        }
        const res = await authClient.signIn.social({
            provider: 'google',
            idToken: {
                token: result.idToken,
                accessToken: result.accessToken ?? undefined,
            },
            callbackURL: '/',
        });
        if (res.error) {
            alert(
                `Google sign-in error: ${res.error.message ?? JSON.stringify(res.error)}`,
            );
            return;
        }
        window.location.href = '/';
        return;
    }

    const res = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
    });
    if (res.error) {
        alert(
            `Google sign-in error: ${res.error.message ?? JSON.stringify(res.error)}`,
        );
    }
}

export default function LoginPage() {
    return (
        <div className="flex h-dvh items-center justify-center px-4 pt-[var(--safe-area-inset-top)] pb-[var(--safe-area-inset-bottom)]">
            <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8">
                <div className="text-center">
                    <ChefHatIcon className="mx-auto mb-3 size-10 text-primary" />
                    <h1 className="font-serif text-3xl text-primary">
                        YesChef AI
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        AI-powered recipe assistant
                    </p>
                </div>
                <Button className="w-full" onClick={handleGoogleSignIn}>
                    Sign in with Google
                </Button>
            </div>
        </div>
    );
}
