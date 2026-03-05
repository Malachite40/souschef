'use client';

import { authClient } from '@/lib/auth-client';
import { api } from '@/trpc/react';
import { StarRating } from '@yeschefai/ui/components/star-rating';
import Link from 'next/link';

interface PublicRatingProps {
    recipeId: string;
    initialAverage: number | null;
    initialCount: number;
}

export function PublicRating({
    recipeId,
    initialAverage,
    initialCount,
}: PublicRatingProps) {
    const { data: session } = authClient.useSession();
    const utils = api.useUtils();

    const { data: ratingSummary } = api.recipes.getRatingSummary.useQuery(
        { recipeId },
        { initialData: { average: initialAverage, count: initialCount } },
    );

    const { data: userRating } = api.recipes.getUserRating.useQuery(
        { recipeId },
        { enabled: !!session?.user },
    );

    const rateRecipe = api.recipes.rateRecipe.useMutation({
        onSuccess: () => {
            utils.recipes.getRatingSummary.invalidate({ recipeId });
            utils.recipes.getUserRating.invalidate({ recipeId });
        },
    });

    const average = ratingSummary?.average ?? initialAverage;
    const count = ratingSummary?.count ?? initialCount;

    return (
        <div className="mb-4 flex items-center gap-3">
            {session?.user ? (
                <StarRating
                    value={userRating ?? 0}
                    onChange={(value) =>
                        rateRecipe.mutate({ recipeId, rating: value })
                    }
                    size="md"
                />
            ) : (
                <StarRating value={Math.round(average ?? 0)} size="md" />
            )}
            <span className="text-sm text-muted-foreground">
                {average ? `${average.toFixed(1)}/5` : 'No ratings'}
                {count > 0 &&
                    ` (${count} ${count === 1 ? 'rating' : 'ratings'})`}
            </span>
            {!session?.user && (
                <Link
                    href="/login"
                    className="text-sm text-primary hover:underline"
                >
                    Sign in to rate
                </Link>
            )}
        </div>
    );
}
