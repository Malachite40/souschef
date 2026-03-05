'use client';

import { StarIcon } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@yeschefai/ui/lib/utils';

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    size?: 'sm' | 'md';
    className?: string;
}

const sizeClasses = {
    sm: 'size-3.5',
    md: 'size-5',
};

function StarRating({
    value,
    onChange,
    size = 'sm',
    className,
}: StarRatingProps) {
    const [hovered, setHovered] = useState(0);
    const interactive = !!onChange;
    const displayValue = hovered || value;

    return (
        <div
            className={cn('flex gap-0.5', className)}
            onMouseLeave={interactive ? () => setHovered(0) : undefined}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    className={cn(
                        'transition-colors disabled:cursor-default',
                        interactive &&
                            'cursor-pointer hover:scale-110 transition-transform',
                    )}
                    onMouseEnter={
                        interactive ? () => setHovered(star) : undefined
                    }
                    onClick={interactive ? () => onChange(star) : undefined}
                >
                    <StarIcon
                        className={cn(
                            sizeClasses[size],
                            star <= displayValue
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-none text-muted-foreground/40',
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

export { StarRating };
export type { StarRatingProps };
