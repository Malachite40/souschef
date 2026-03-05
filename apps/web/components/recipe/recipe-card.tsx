'use client';

import {
    AmazonFreshLink,
    CopyShoppingListButton,
    OpenAllAmazonFreshButton,
} from '@/components/recipe/amazon-fresh-links';
import { IngredientImage } from '@/components/recipe/ingredient-image';
import { ServingSelector } from '@/components/recipe/serving-selector';
import { estimateTotalCost, formatPrice } from '@/lib/utils/cost-estimator';
import { scaleQuantity } from '@/lib/utils/scale-quantity';
import { api } from '@/trpc/react';
import { Badge } from '@yeschefai/ui/components/badge';
import { Button } from '@yeschefai/ui/components/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@yeschefai/ui/components/card';
import { Separator } from '@yeschefai/ui/components/separator';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@yeschefai/ui/components/tabs';
import {
    BookmarkIcon,
    CheckIcon,
    ClockIcon,
    DollarSignIcon,
    ExternalLinkIcon,
    FlameIcon,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

export interface InstructionStep {
    step: string;
    text: string;
    time?: string;
    ingredients?: string[];
}

export interface RecipeData {
    title: string;
    description?: string;
    imageUrl?: string;
    servings: number;
    prepTime: string;
    cookTime: string;
    caloriesPerServing?: number;
    ingredients: Array<{
        item: string;
        quantity: string;
        unit: string;
        amazonQuery: string;
        estimatedPrice?: number;
    }>;
    instructions: InstructionStep[];
    sources: Array<{
        title: string;
        url: string;
    }>;
}

interface RecipeCardProps {
    recipe: RecipeData;
    conversationId?: string;
}

function RecipeImage({ src, alt }: { src: string; alt: string }) {
    const [hidden, setHidden] = useState(false);

    if (hidden) return null;

    return (
        <div className="h-40 w-full overflow-hidden rounded-t-lg">
            <img
                src={src}
                alt={alt}
                className="h-full w-full object-cover"
                onError={() => setHidden(true)}
            />
        </div>
    );
}

export function RecipeCard({ recipe, conversationId }: RecipeCardProps) {
    const [selectedServings, setSelectedServings] = useState(recipe.servings);
    const utils = api.useUtils();

    const savedList = api.recipes.list.useQuery(undefined, {
        staleTime: Number.POSITIVE_INFINITY,
    });
    const savedEntry = useMemo(
        () => savedList.data?.find((r) => r.title === recipe.title) ?? null,
        [savedList.data, recipe.title],
    );

    const saveRecipe = api.recipes.save.useMutation({
        onSuccess: () => {
            deleteRecipe.reset();
            utils.recipes.list.invalidate();
            utils.chat.listConversations.invalidate();
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
                conversationId,
                title: recipe.title,
                description: recipe.description,
                imageUrl: recipe.imageUrl,
                servings: recipe.servings,
                prepTime: recipe.prepTime,
                cookTime: recipe.cookTime,
                caloriesPerServing: recipe.caloriesPerServing,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions,
                sources: recipe.sources,
            });
        }
    }, [recipe, conversationId, saved, savedEntry, saveRecipe, deleteRecipe]);

    const scaleFactor =
        recipe.servings > 0 ? selectedServings / recipe.servings : 1;
    const totalCost = estimateTotalCost(recipe.ingredients) * scaleFactor;

    return (
        <Card className="my-3 w-full overflow-hidden">
            {recipe.imageUrl && (
                <RecipeImage src={recipe.imageUrl} alt={recipe.title} />
            )}
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{recipe.title}</CardTitle>
                    <Button
                        size="xs"
                        variant={saved ? 'secondary' : 'default'}
                        onClick={handleToggleSave}
                        disabled={
                            saveRecipe.isPending || deleteRecipe.isPending
                        }
                        className="shrink-0 gap-1"
                    >
                        {saved ? (
                            <CheckIcon className="size-3" />
                        ) : (
                            <BookmarkIcon className="size-3" />
                        )}
                        {saved ? 'Saved!' : 'Save Recipe'}
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ServingSelector
                        originalServings={recipe.servings}
                        selectedServings={selectedServings}
                        onServingsChange={setSelectedServings}
                    />
                    <Badge variant="secondary" className="gap-1">
                        <ClockIcon className="size-3" />
                        Prep: {recipe.prepTime}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                        <ClockIcon className="size-3" />
                        Cook: {recipe.cookTime}
                    </Badge>
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
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="ingredients">
                    <TabsList>
                        <TabsTrigger value="ingredients">
                            Ingredients
                        </TabsTrigger>
                        <TabsTrigger value="instructions">
                            Instructions
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ingredients">
                        <ul className="space-y-2">
                            {recipe.ingredients.map((ingredient, i) => (
                                <li
                                    key={i}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <IngredientImage
                                        name={ingredient.item}
                                        size={24}
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
                                    <AmazonFreshLink ingredient={ingredient} />
                                </li>
                            ))}
                        </ul>
                        <Separator className="my-3" />
                        <div className="flex flex-wrap gap-2">
                            <OpenAllAmazonFreshButton
                                ingredients={recipe.ingredients}
                            />
                            <CopyShoppingListButton
                                ingredients={recipe.ingredients}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="instructions">
                        <InstructionSteps instructions={recipe.instructions} />
                    </TabsContent>
                </Tabs>

                {recipe.sources.length > 0 && (
                    <>
                        <Separator className="my-3" />
                        <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">
                                Sources
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {recipe.sources.map((source, i) => (
                                    <Button
                                        key={i}
                                        asChild
                                        variant="ghost"
                                        size="xs"
                                        className="bg-muted"
                                    >
                                        <a
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLinkIcon className="size-3" />
                                            {source.title}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// ── Instruction Step Cards ─────────────────────────────

/** Normalize old string[] format to InstructionStep[] */
function normalizeInstructions(
    raw: (string | InstructionStep)[],
): InstructionStep[] {
    return raw.map((item, i) =>
        typeof item === 'string' ? { step: String(i + 1), text: item } : item,
    );
}

/** Extract the numeric prefix from a step label (e.g. "2a" → "2", "10b" → "10") */
function stepPrefix(step: string): string {
    const match = step.match(/^(\d+)/);
    return match ? match[1] : step;
}

/** Group steps: sequential steps are solo groups, parallel steps (same prefix) are grouped */
function groupSteps(steps: InstructionStep[]): InstructionStep[][] {
    const groups: InstructionStep[][] = [];
    let i = 0;
    while (i < steps.length) {
        const prefix = stepPrefix(steps[i].step);
        const isParallel = /^\d+[a-z]$/i.test(steps[i].step);
        if (!isParallel) {
            groups.push([steps[i]]);
            i++;
        } else {
            const group: InstructionStep[] = [];
            while (i < steps.length && stepPrefix(steps[i].step) === prefix) {
                group.push(steps[i]);
                i++;
            }
            groups.push(group);
        }
    }
    return groups;
}

export function InstructionSteps({
    instructions,
}: {
    instructions: (string | InstructionStep)[];
}) {
    const groups = useMemo(
        () => groupSteps(normalizeInstructions(instructions)),
        [instructions],
    );

    return (
        <div className="space-y-3">
            {groups.map((group, gi) =>
                group.length === 1 ? (
                    <StepCard key={gi} step={group[0]} />
                ) : (
                    <div key={gi} className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground px-1">
                            Can be done at the same time
                        </p>
                        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                            {group.map((step, si) => (
                                <StepCard key={si} step={step} />
                            ))}
                        </div>
                    </div>
                ),
            )}
        </div>
    );
}

function StepCard({ step }: { step: InstructionStep }) {
    return (
        <div className="rounded-lg border bg-muted/30 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
                <Badge variant="secondary" className="font-semibold text-xs">
                    Step {step.step}
                </Badge>
                {step.time && (
                    <Badge
                        variant="outline"
                        className="gap-1 text-xs text-muted-foreground"
                    >
                        <ClockIcon className="size-3" />
                        {step.time}
                    </Badge>
                )}
            </div>
            <p className="text-sm leading-relaxed">{step.text}</p>
            {step.ingredients && step.ingredients.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {step.ingredients.map((name) => (
                        <Badge
                            key={name}
                            variant="secondary"
                            className="gap-1 text-xs font-normal"
                        >
                            <IngredientImage name={name} size={14} />
                            {name}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
