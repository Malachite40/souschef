import { auth } from '@/auth';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ChefHatIcon } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const navItems = [
    { href: '/chat', label: 'Chat' },
    { href: '/explore', label: 'Explore' },
    { href: '/recipes', label: 'My Recipes' },
];

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/login');
    }

    return (
        <div className="flex h-dvh flex-col overflow-hidden">
            <DashboardHeader>
                <div className="flex h-14 items-center px-4 md:px-6">
                    <MobileNav
                        userName={session.user.name}
                        userEmail={session.user.email}
                        userImage={session.user.image}
                    />
                    <Link href="/chat" className="flex items-center gap-2">
                        <ChefHatIcon className="size-5 text-primary" />
                        <span className="font-serif text-xl text-primary">SousChef</span>
                    </Link>
                    <nav className="ml-8 hidden items-center gap-4 md:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm text-muted-foreground hover:text-primary"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="ml-auto hidden items-center gap-3 md:flex">
                        <span className="text-sm text-muted-foreground">
                            {session.user.name ?? session.user.email}
                        </span>
                        {session.user.image && (
                            <img
                                src={session.user.image}
                                alt=""
                                className="h-8 w-8 rounded-full"
                            />
                        )}
                    </div>
                </div>
            </DashboardHeader>
            <main className="flex-1 min-h-0">{children}</main>
        </div>
    );
}
