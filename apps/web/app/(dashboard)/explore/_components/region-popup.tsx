'use client';

import type { GlobeRegion } from '@/lib/data/globe-regions';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@souschef/ui/components/card';

const POPUP_WIDTH = 320;
const POPUP_HEIGHT = 350;
const OFFSET = 16;

export function RegionPopup({
    region,
    x,
    y,
    containerWidth,
    containerHeight,
}: {
    region: GlobeRegion;
    x: number;
    y: number;
    containerWidth: number;
    containerHeight: number;
}) {
    // Position popup near cursor, flipping when near edges
    let left = x + OFFSET;
    let top = y + OFFSET;

    if (left + POPUP_WIDTH > containerWidth) {
        left = x - POPUP_WIDTH - OFFSET;
    }
    if (top + POPUP_HEIGHT > containerHeight) {
        top = y - POPUP_HEIGHT - OFFSET;
    }

    left = Math.max(4, left);
    top = Math.max(4, top);

    return (
        <div
            className="pointer-events-none absolute z-10 w-80"
            style={{ left: `${left}px`, top: `${top}px` }}
        >
            <Card className="shadow-lg">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{region.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {region.recipes.map((recipe) => (
                        <div
                            key={recipe.chatQuery}
                            className="rounded-md border p-2.5"
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-lg leading-none">
                                    {recipe.flag}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium leading-tight">
                                        {recipe.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {recipe.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                        Click to explore {region.name} cuisine
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
