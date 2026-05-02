'use client';

import { isNativeApp } from '@/lib/utils/platform';
import { Button } from '@yeschefai/ui/components/button';
import { ChefHatIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OpenInAppButtonProps {
    slug: string;
}

export function OpenInAppButton({ slug }: OpenInAppButtonProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isNativeApp()) return;
        if (!/iPhone|iPad|iPod/.test(navigator.userAgent)) return;
        setShow(true);
    }, []);

    if (!show) return null;

    return (
        <div className="mb-4 flex justify-center">
            <Button asChild variant="outline" size="sm">
                <a href={`yeschefai://recipe/${slug}`}>
                    <ChefHatIcon className="size-4" />
                    Open in YesChef app
                </a>
            </Button>
        </div>
    );
}
