import { auth } from '@/auth';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ChefHatIcon } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return (
        <div className="flex h-dvh flex-col overflow-hidden">
            <DashboardHeader>
                <div className="flex h-14 items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <ChefHatIcon className="size-5 text-primary" />
                        <span className="font-serif text-xl leading-none text-primary">
                            YesChef AI
                        </span>
                    </Link>
                    {session?.user ? (
                        <Link
                            href="/chat"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                        >
                            <span>
                                {session.user.name ?? session.user.email}
                            </span>
                            <UserAvatar
                                name={session.user.name}
                                image={session.user.image}
                                size="md"
                            />
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="text-sm text-muted-foreground hover:text-primary"
                        >
                            Sign in
                        </Link>
                    )}
                </div>
            </DashboardHeader>
            <main className="flex-1 overflow-auto pb-[var(--safe-area-inset-bottom)]">
                {children}
            </main>
        </div>
    );
}
