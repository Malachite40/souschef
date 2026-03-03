'use client';

import { usePathname } from 'next/navigation';

export function DashboardHeader({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isChat = pathname === '/chat' || pathname.startsWith('/chat/');

    return (
        <header
            className={`border-b bg-background ${isChat ? 'hidden md:block' : ''}`}
        >
            {children}
        </header>
    );
}
