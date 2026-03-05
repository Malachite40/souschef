'use client';

import {
    getIngredientEmoji,
    getIngredientImageUrl,
} from '@/lib/utils/ingredient-image';
import { useEffect, useRef, useState } from 'react';

interface IngredientImageProps {
    name: string;
    size?: number;
}

export function IngredientImage({ name, size = 24 }: IngredientImageProps) {
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const emoji = getIngredientEmoji(name);

    // Catch images that errored before React hydration attached onError
    useEffect(() => {
        const img = imgRef.current;
        if (img && img.complete && img.naturalWidth === 0) {
            setHasError(true);
        }
    }, []);

    if (hasError) {
        return (
            <span
                className="flex shrink-0 items-center justify-center rounded-full bg-muted"
                style={{ width: size, height: size, fontSize: size * 0.55 }}
                role="img"
                aria-label={name}
            >
                {emoji}
            </span>
        );
    }

    return (
        <img
            ref={imgRef}
            src={getIngredientImageUrl(name)}
            alt={name}
            width={size}
            height={size}
            loading="lazy"
            className="shrink-0 rounded-full bg-muted object-cover"
            onError={() => setHasError(true)}
        />
    );
}
