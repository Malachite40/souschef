'use client';

import { authClient } from '@/lib/auth-client';
import { isNativeApp } from '@/lib/utils/platform';
import { Button } from '@souschef/ui/components/button';
import { ChefHatIcon } from 'lucide-react';

async function handleNativeSignIn() {
    const { Browser } = await import('@capacitor/browser');

    const exchange = crypto.randomUUID();

    const response = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `/api/auth/native-callback?exchange=${exchange}`,
        disableRedirect: true,
    }, {
        throw: true,
    });

    if (response.url) {
        Browser.addListener('browserFinished', async () => {
            const res = await fetch(`/api/auth/claim-session?exchange=${exchange}`);
            if (res.ok) {
                const { token } = await res.json();
                document.cookie = `better-auth.session_token=${token}; path=/; max-age=604800`;
                window.location.href = '/';
            }
        });

        await Browser.open({ url: response.url });
    }
}

export default function LoginPage() {
    const handleSignIn = () => {
        if (isNativeApp()) {
            handleNativeSignIn();
        } else {
            authClient.signIn.social({
                provider: 'google',
                callbackURL: '/',
            });
        }
    };

    return (
        <div className="flex h-dvh items-center justify-center px-4 pt-[var(--safe-area-inset-top)] pb-[var(--safe-area-inset-bottom)]">
            <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8">
                <div className="text-center">
                    <ChefHatIcon className="mx-auto mb-3 size-10 text-primary" />
                    <h1 className="font-serif text-3xl text-primary">SousChef</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        AI-powered recipe assistant
                    </p>
                </div>
                <Button className="w-full" onClick={handleSignIn}>
                    Sign in with Google
                </Button>
            </div>
        </div>
    );
}
