'use client';

import { Skeleton } from '@yeschefai/ui/components/skeleton';
import dynamic from 'next/dynamic';

const GlobeScene = dynamic(() => import('./globe-scene'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center">
            <div className="space-y-4 text-center">
                <Skeleton className="mx-auto h-64 w-64 rounded-full" />
                <p className="text-sm text-muted-foreground">
                    Loading globe...
                </p>
            </div>
        </div>
    ),
});

export function GlobeContainer() {
    return (
        <div className="relative h-full w-full">
            <div className="pointer-events-none absolute inset-x-0 top-6 z-10 text-center">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Explore World Cuisines
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    <span className="hidden md:inline">Hover over a region to discover local recipes</span>
                    <span className="md:hidden">Tap a region to discover local recipes</span>
                </p>
            </div>
            <GlobeScene />
        </div>
    );
}
