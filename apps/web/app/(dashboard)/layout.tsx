import { auth } from '@/auth';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { HeaderActions } from '@/components/layout/header-actions';
import { MobileNav } from '@/components/layout/mobile-nav';
import { UserAvatar } from '@/components/ui/user-avatar';
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
                        <span className="font-serif text-xl leading-none text-primary">
                            YesChef AI
                        </span>
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
                    <div className="ml-auto flex items-center gap-3">
                        <HeaderActions />
                        <span className="hidden text-sm text-muted-foreground md:inline">
                            {session.user.name ?? session.user.email}
                        </span>
                        <div className="hidden md:block">
                            <UserAvatar
                                name={session.user.name}
                                image={session.user.image}
                                size="md"
                            />
                        </div>
                    </div>
                </div>
            </DashboardHeader>
            <div className="flex flex-1 min-h-0">
                <AppSidebar />
                <main className="flex-1 min-h-0">{children}</main>
            </div>
        </div>
    );
}
