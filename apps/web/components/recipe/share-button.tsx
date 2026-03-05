'use client';

import { isNativeApp } from '@/lib/utils/platform';
import { Button } from '@yeschefai/ui/components/button';
import { CheckIcon, ShareIcon } from 'lucide-react';
import { useCallback, useState } from 'react';

interface ShareButtonProps {
    title: string;
    description: string;
    slug: string;
}

export function ShareButton({ title, description, slug }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = useCallback(async () => {
        const url = `${window.location.origin}/recipe/${slug}`;

        if (isNativeApp()) {
            try {
                const { Share } = await import('@capacitor/share');
                await Share.share({ title, text: description, url });
                return;
            } catch {
                // fall through to web share
            }
        }

        if (navigator.share) {
            try {
                await navigator.share({ title, text: description, url });
                return;
            } catch {
                // user cancelled or unsupported, fall through to clipboard
            }
        }

        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [title, description, slug]);

    return (
        <Button
            size="icon"
            variant="secondary"
            onClick={handleShare}
            className="shrink-0 rounded-full"
        >
            {copied ? (
                <CheckIcon className="size-4" />
            ) : (
                <ShareIcon className="size-4" />
            )}
        </Button>
    );
}
