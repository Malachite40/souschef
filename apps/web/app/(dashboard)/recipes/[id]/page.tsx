'use client';

import {
    AmazonFreshLink,
    CopyShoppingListButton,
    OpenAllAmazonFreshButton,
} from '@/components/recipe/amazon-fresh-links';
import { IngredientImage } from '@/components/recipe/ingredient-image';
import {
    type InstructionStep,
    InstructionSteps,
} from '@/components/recipe/recipe-card';
import { ReviewDialog } from '@/components/recipe/review-dialog';
import { ServingSelector } from '@/components/recipe/serving-selector';
import {
    estimateIngredientPrice,
    estimateTotalCost,
    formatPrice,
} from '@/lib/utils/cost-estimator';
import { scaleQuantity } from '@/lib/utils/scale-quantity';
import { api } from '@/trpc/react';
import { Badge } from '@yeschefai/ui/components/badge';
import { Button } from '@yeschefai/ui/components/button';
import { Separator } from '@yeschefai/ui/components/separator';
import { Skeleton } from '@yeschefai/ui/components/skeleton';
import { StarRating } from '@yeschefai/ui/components/star-rating';
import {
    ArrowLeftIcon,
    ClockIcon,
    DollarSignIcon,
    ExternalLinkIcon,
    FlameIcon,
    StarIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

function RecipeImage({ src, alt }: { src: string; alt: string }) {
    const [hidden, setHidden] = useState(false);

    if (hidden) return null;

    return (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
            <img
                src={src}
                alt={alt}
                className="h-full w-full object-cover"
                onError={() => setHidden(true)}
            />
        </div>
    );
}

interface Ingredient {
    item: string;
    quantity: string;
    unit: string;
    amazonQuery: string;
    estimatedPrice?: number;
}

export default function RecipeDetailPage() {
    const params = useParams();
    const { data: recipe, isLoading } = api.recipes.getById.useQuery({
        id: params.id as string,
    });
    const [reviewOpen, setReviewOpen] = useState(false);
    const [selectedServings, setSelectedServings] = useState<number | null>(
        null,
    );

    if (isLoading) {
        return (
            <div className="h-full overflow-auto p-4 pb-[calc(1rem+var(--safe-area-inset-bottom))] md:p-6 md:pb-[calc(1.5rem+var(--safe-area-inset-bottom))]">
                <div className="mx-auto max-w-2xl">
                    <Skeleton className="mb-4 h-8 w-3/4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="mt-6 h-64 w-full" />
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="h-full overflow-auto p-4 pb-[calc(1rem+var(--safe-area-inset-bottom))] md:p-6 md:pb-[calc(1.5rem+var(--safe-area-inset-bottom))]">
                <div className="flex flex-col items-center justify-center py-16">
                    <p className="mb-2 font-medium">Recipe not found</p>
                    <Link href="/recipes">
                        <Button variant="outline" size="sm">
                            Back to recipes
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const ingredients = (recipe.ingredients ?? []) as Ingredient[];
    const instructions = (recipe.instructions ?? []) as (
        | string
        | InstructionStep
    )[];
    const sources = (recipe.sources ?? []) as Array<{
        title: string;
        url: string;
    }>;

    const servings = selectedServings ?? recipe.servings ?? 4;
    const scaleFactor =
        recipe.servings && recipe.servings > 0 ? servings / recipe.servings : 1;
    const totalCost = estimateTotalCost(ingredients) * scaleFactor;
    const costPerServing =
        servings && servings > 0 ? totalCost / servings : null;

    return (
        <div className="h-full overflow-auto p-4 pb-[calc(1rem+var(--safe-area-inset-bottom))] md:p-6 md:pb-[calc(1.5rem+var(--safe-area-inset-bottom))]">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/recipes"
                    className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeftIcon className="size-4" />
                    Back to recipes
                </Link>

                {recipe.imageUrl && (
                    <RecipeImage src={recipe.imageUrl} alt={recipe.title} />
                )}

                <h1 className="mb-3 text-2xl font-bold">{recipe.title}</h1>

                <div className="mb-6 flex flex-wrap gap-2">
                    {recipe.servings && (
                        <ServingSelector
                            originalServings={recipe.servings}
                            selectedServings={servings}
                            onServingsChange={setSelectedServings}
                        />
                    )}
                    {recipe.prepTime && (
                        <Badge variant="secondary" className="gap-1">
                            <ClockIcon className="size-3" />
                            Prep: {recipe.prepTime}
                        </Badge>
                    )}
                    {recipe.cookTime && (
                        <Badge variant="secondary" className="gap-1">
                            <ClockIcon className="size-3" />
                            Cook: {recipe.cookTime}
                        </Badge>
                    )}
                    {totalCost > 0 && (
                        <Badge
                            variant="secondary"
                            className="gap-1 bg-green-500/10 text-green-700 dark:text-green-400"
                        >
                            <DollarSignIcon className="size-3" />
                            Est. {formatPrice(totalCost)}
                        </Badge>
                    )}
                    {recipe.caloriesPerServing && (
                        <Badge
                            variant="secondary"
                            className="gap-1 bg-orange-500/10 text-orange-700 dark:text-orange-400"
                        >
                            <FlameIcon className="size-3" />
                            {recipe.caloriesPerServing} cal/serving
                        </Badge>
                    )}
                </div>

                {recipe.rating ? (
                    <div className="mb-6 rounded-lg border bg-amber-500/5 border-amber-500/20 p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <StarRating value={recipe.rating} size="md" />
                                <span className="text-sm font-medium">
                                    {recipe.rating}/5
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={() => setReviewOpen(true)}
                            >
                                <StarIcon className="size-3.5" />
                                Edit Review
                            </Button>
                        </div>
                        {recipe.notes && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {recipe.notes}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="mb-6">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setReviewOpen(true)}
                        >
                            <StarIcon className="size-4" />
                            Rate & Review
                        </Button>
                    </div>
                )}

                <section className="mb-6">
                    <h2 className="mb-3 text-lg font-semibold">Ingredients</h2>
                    <ul className="space-y-2">
                        {ingredients.map((ingredient, i) => {
                            const price =
                                estimateIngredientPrice(ingredient) *
                                scaleFactor;
                            return (
                                <li
                                    key={i}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <IngredientImage
                                        name={ingredient.item}
                                        size={32}
                                    />
                                    <span className="flex-1">
                                        <span className="font-medium">
                                            {scaleQuantity(
                                                ingredient.quantity,
                                                scaleFactor,
                                            )}{' '}
                                            {ingredient.unit}
                                        </span>{' '}
                                        {ingredient.item}
                                    </span>
                                    <span className="shrink-0 text-sm text-muted-foreground">
                                        {formatPrice(price)}
                                    </span>
                                    <AmazonFreshLink ingredient={ingredient} />
                                </li>
                            );
                        })}
                    </ul>

                    {totalCost > 0 && (
                        <div className="mt-4 rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-green-700 dark:text-green-400">
                                    Estimated Total
                                </span>
                                <span className="font-bold text-green-700 dark:text-green-400">
                                    {formatPrice(totalCost)}
                                </span>
                            </div>
                            {costPerServing != null && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {formatPrice(costPerServing)} per serving
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                        <OpenAllAmazonFreshButton ingredients={ingredients} />
                        <CopyShoppingListButton ingredients={ingredients} />
                    </div>
                </section>

                <Separator />

                <section className="my-6">
                    <h2 className="mb-3 text-lg font-semibold">Instructions</h2>
                    <InstructionSteps instructions={instructions} />
                </section>

                {sources.length > 0 && (
                    <>
                        <Separator />
                        <section className="mt-6">
                            <h2 className="mb-3 text-lg font-semibold">
                                Sources
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {sources.map((source, i) => (
                                    <Button
                                        key={i}
                                        asChild
                                        variant="ghost"
                                        size="sm"
                                        className="bg-muted"
                                    >
                                        <a
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLinkIcon className="size-3.5" />
                                            {source.title}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                <ReviewDialog
                    open={reviewOpen}
                    onOpenChange={setReviewOpen}
                    recipeId={recipe.id}
                    recipeTitle={recipe.title}
                    initialRating={recipe.rating}
                    initialNotes={recipe.notes}
                />
            </div>
        </div>
    );
}
