'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from '@souschef/ui/components/button';
import { ChefHatIcon } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8">
                <div className="text-center">
                    <ChefHatIcon className="mx-auto mb-3 size-10 text-primary" />
                    <h1 className="font-serif text-3xl text-primary">SousChef</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        AI-powered recipe assistant
                    </p>
                </div>
                <Button
                    className="w-full"
                    onClick={() =>
                        authClient.signIn.social({
                            provider: 'google',
                            callbackURL: '/',
                        })
                    }
                >
                    Sign in with Google
                </Button>
            </div>
        </div>
    );
}
