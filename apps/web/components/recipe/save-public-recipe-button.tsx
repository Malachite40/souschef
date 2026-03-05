'use client';

import { authClient } from '@/lib/auth-client';
import { api } from '@/trpc/react';
import { Button } from '@yeschefai/ui/components/button';
import { BookmarkIcon, CheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import type { RecipeData } from './recipe-detail';

interface SavePublicRecipeButtonProps {
    recipe: RecipeData;
}

export function SavePublicRecipeButton({
    recipe,
}: SavePublicRecipeButtonProps) {
    const { data: session } = authClient.useSession();
    const utils = api.useUtils();

    const savedList = api.recipes.list.useQuery(undefined, {
        staleTime: Number.POSITIVE_INFINITY,
        enabled: !!session?.user,
    });

    const savedEntry = useMemo(
        () => savedList.data?.find((r) => r.title === recipe.title) ?? null,
        [savedList.data, recipe.title],
    );

    const saveRecipe = api.recipes.save.useMutation({
        onSuccess: () => {
            deleteRecipe.reset();
            utils.recipes.list.invalidate();
        },
    });

    const deleteRecipe = api.recipes.delete.useMutation({
        onSuccess: () => {
            saveRecipe.reset();
            utils.recipes.list.invalidate();
        },
    });

    const saved =
        (!!savedEntry && !deleteRecipe.isSuccess) || saveRecipe.isSuccess;

    const handleToggleSave = useCallback(() => {
        if (saveRecipe.isPending || deleteRecipe.isPending) return;
        if (saved && savedEntry) {
            deleteRecipe.mutate({ id: savedEntry.id });
        } else if (!saved) {
            saveRecipe.mutate({
                title: recipe.title,
                description: recipe.description ?? undefined,
                imageUrl: recipe.imageUrl ?? undefined,
                servings: recipe.servings ?? undefined,
                prepTime: recipe.prepTime ?? undefined,
                cookTime: recipe.cookTime ?? undefined,
                caloriesPerServing: recipe.caloriesPerServing ?? undefined,
                ingredients: (recipe.ingredients ?? []) as Array<{
                    item: string;
                    quantity: string;
                    unit: string;
                    amazonQuery: string;
                    estimatedPrice?: number;
                }>,
                instructions: (recipe.instructions ?? []) as Array<{
                    step: string;
                    text: string;
                    time?: string;
                    ingredients?: string[];
                }>,
                sources: (recipe.sources ?? []) as Array<{
                    title: string;
                    url: string;
                }>,
            });
        }
    }, [recipe, saved, savedEntry, saveRecipe, deleteRecipe]);

    if (!session?.user) {
        return (
            <Button
                asChild
                size="icon"
                variant="secondary"
                className="shrink-0 rounded-full"
            >
                <Link href="/login">
                    <BookmarkIcon className="size-4" />
                </Link>
            </Button>
        );
    }

    return (
        <Button
            size="icon"
            variant="secondary"
            disabled={saveRecipe.isPending || deleteRecipe.isPending}
            className="shrink-0 rounded-full"
            onClick={handleToggleSave}
        >
            {saved ? (
                <CheckIcon className="size-4" />
            ) : (
                <BookmarkIcon className="size-4" />
            )}
        </Button>
    );
}
