'use client';

import { LinkIcon, XIcon } from 'lucide-react';

interface UrlPillProps {
    url: string;
    onImport: (url: string) => void;
    onDismiss: () => void;
}

function getHostname(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

export function UrlPill({ url, onImport, onDismiss }: UrlPillProps) {
    return (
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
            <LinkIcon className="size-3 text-muted-foreground" />
            <span className="max-w-[200px] truncate text-muted-foreground">
                {getHostname(url)}
            </span>
            <button
                type="button"
                className="rounded-full px-1.5 py-0.5 font-medium text-primary hover:bg-primary/10 transition-colors"
                onClick={() => onImport(url)}
            >
                Import recipe
            </button>
            <button
                type="button"
                className="rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                onClick={onDismiss}
            >
                <XIcon className="size-3" />
            </button>
        </div>
    );
}
