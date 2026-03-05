import { estimateTotalCost } from '@/lib/utils/cost-estimator';
import { parseTimeToMinutes } from '@/lib/utils/time-parser';

import type {
    CostFilter,
    RatingFilter,
    SortBy,
    TimeFilter,
} from '@/stores/recipes-store';

interface Ingredient {
    item: string;
    quantity: string;
    unit: string;
    estimatedPrice?: number;
}

interface RecipeBase {
    id: string;
    title: string;
    prepTime: string | null;
    cookTime: string | null;
    ingredients: unknown;
    rating: number | null;
    createdAt: Date;
}

function getTotalTime(recipe: RecipeBase): number {
    return (
        parseTimeToMinutes(recipe.prepTime) +
        parseTimeToMinutes(recipe.cookTime)
    );
}

function getTotalCost(recipe: RecipeBase): number {
    return estimateTotalCost((recipe.ingredients ?? []) as Ingredient[]);
}

export function filterRecipes<T extends RecipeBase>(
    recipes: T[],
    {
        searchQuery,
        timeFilter,
        costFilter,
        ratingFilter,
    }: {
        searchQuery: string;
        timeFilter: TimeFilter;
        costFilter: CostFilter;
        ratingFilter: RatingFilter;
    },
): T[] {
    return recipes.filter((recipe) => {
        // Search
        if (
            searchQuery &&
            !recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return false;
        }

        // Time filter
        if (timeFilter !== 'all') {
            const minutes = getTotalTime(recipe);
            if (minutes <= 0) return false;
            if (timeFilter === 'under-15' && minutes > 15) return false;
            if (timeFilter === 'under-30' && minutes > 30) return false;
            if (timeFilter === 'under-60' && minutes > 60) return false;
        }

        // Cost filter
        if (costFilter !== 'all') {
            const cost = getTotalCost(recipe);
            if (cost <= 0) return false;
            if (costFilter === 'under-10' && cost > 10) return false;
            if (costFilter === 'under-20' && cost > 20) return false;
            if (costFilter === 'under-30' && cost > 30) return false;
        }

        // Rating filter
        if (ratingFilter !== 'all') {
            if (ratingFilter === 'rated' && !recipe.rating) return false;
            if (ratingFilter === 'unrated' && recipe.rating) return false;
            if (
                ratingFilter === '4-plus' &&
                (!recipe.rating || recipe.rating < 4)
            )
                return false;
            if (ratingFilter === '5-only' && recipe.rating !== 5) return false;
        }

        return true;
    });
}

export function sortRecipes<T extends RecipeBase>(
    recipes: T[],
    sortBy: SortBy,
): T[] {
    const sorted = [...recipes];

    switch (sortBy) {
        case 'newest':
            sorted.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            );
            break;
        case 'oldest':
            sorted.sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime(),
            );
            break;
        case 'alphabetical':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'highest-rated':
            sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
            break;
        case 'quickest':
            sorted.sort((a, b) => {
                const aTime = getTotalTime(a);
                const bTime = getTotalTime(b);
                // Push recipes with no time to the end
                if (aTime === 0 && bTime === 0) return 0;
                if (aTime === 0) return 1;
                if (bTime === 0) return -1;
                return aTime - bTime;
            });
            break;
        case 'cheapest':
            sorted.sort((a, b) => {
                const aCost = getTotalCost(a);
                const bCost = getTotalCost(b);
                if (aCost === 0 && bCost === 0) return 0;
                if (aCost === 0) return 1;
                if (bCost === 0) return -1;
                return aCost - bCost;
            });
            break;
    }

    return sorted;
}
