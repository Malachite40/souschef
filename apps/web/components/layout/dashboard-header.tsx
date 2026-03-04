'use client';

import { usePathname } from 'next/navigation';

export function DashboardHeader({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isChat = pathname === '/chat' || pathname.startsWith('/chat/');

    return (
        <header
            className={`shrink-0 border-b bg-background pt-[var(--safe-area-inset-top)] ${isChat ? 'hidden md:block' : ''}`}
        >
            {children}
        </header>
    );
}
