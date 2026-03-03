'use client';

import {
    getIngredientEmoji,
    getIngredientImageUrl,
} from '@/lib/utils/ingredient-image';
import { useState } from 'react';

interface IngredientImageProps {
    name: string;
    size?: number;
}

export function IngredientImage({ name, size = 24 }: IngredientImageProps) {
    const [hasError, setHasError] = useState(false);
    const emoji = getIngredientEmoji(name);

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
