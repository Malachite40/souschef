'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from '@souschef/ui/components/button';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@souschef/ui/components/sheet';
import {
    ChefHatIcon,
    LogOutIcon,
    MenuIcon,
    MessageSquareIcon,
    GlobeIcon,
    BookOpenIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
    { href: '/chat', label: 'Chat', icon: MessageSquareIcon },
    { href: '/explore', label: 'Explore', icon: GlobeIcon },
    { href: '/recipes', label: 'My Recipes', icon: BookOpenIcon },
];

interface MobileNavProps {
    userName?: string | null;
    userEmail?: string | null;
    userImage?: string | null;
}

export function MobileNav({ userName, userEmail, userImage }: MobileNavProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon-xs" className="md:hidden">
                    <MenuIcon className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-full flex-col">
                    {/* User info */}
                    <div className="border-b p-4 pt-[calc(1rem+var(--safe-area-inset-top))]">
                        <div className="flex items-center gap-3">
                            {userImage ? (
                                <img
                                    src={userImage}
                                    alt=""
                                    className="h-10 w-10 rounded-full"
                                />
                            ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <ChefHatIcon className="size-5 text-primary" />
                                </div>
                            )}
                            <div className="min-w-0">
                                {userName && (
                                    <p className="truncate text-sm font-medium">
                                        {userName}
                                    </p>
                                )}
                                {userEmail && (
                                    <p className="truncate text-xs text-muted-foreground">
                                        {userEmail}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Nav links */}
                    <nav className="flex-1 p-2">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                                        isActive
                                            ? 'bg-accent text-accent-foreground font-medium'
                                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                                    }`}
                                >
                                    <item.icon className="size-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sign out */}
                    <div className="border-t p-2 pb-[calc(0.5rem+var(--safe-area-inset-bottom))]">
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                authClient.signOut();
                            }}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                        >
                            <LogOutIcon className="size-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
