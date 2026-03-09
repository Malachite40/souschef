"use client";

import {
  AmazonFreshLink,
  CopyShoppingListButton,
  OpenAllAmazonFreshButton,
} from "@/components/recipe/amazon-fresh-links";
import { IngredientImage } from "@/components/recipe/ingredient-image";
import { PublicComments } from "@/components/recipe/public-comments";
import { PublicRating } from "@/components/recipe/public-rating";
import {
  type InstructionStep,
  InstructionSteps,
} from "@/components/recipe/recipe-card";
import { ReviewDialog } from "@/components/recipe/review-dialog";
import { ServingSelector } from "@/components/recipe/serving-selector";
import { ShareButton } from "@/components/recipe/share-button";
import {
  estimateIngredientPrice,
  estimateTotalCost,
  formatPrice,
} from "@/lib/utils/cost-estimator";
import { scaleQuantity } from "@/lib/utils/scale-quantity";
import { Badge } from "@yeschefai/ui/components/badge";
import { Button } from "@yeschefai/ui/components/button";
import { Separator } from "@yeschefai/ui/components/separator";
import { StarRating } from "@yeschefai/ui/components/star-rating";
import {
  ClockIcon,
  DollarSignIcon,
  ExternalLinkIcon,
  FlameIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

interface Ingredient {
  item: string;
  quantity: string;
  unit: string;
  amazonQuery: string;
  estimatedPrice?: number;
}

interface RecipeData {
  id: string;
  title: string;
  imageUrl?: string | null;
  slug?: string | null;
  description?: string | null;
  servings?: number | null;
  prepTime?: string | null;
  cookTime?: string | null;
  caloriesPerServing?: number | null;
  ingredients?: Ingredient[] | null;
  instructions?: (string | InstructionStep)[] | null;
  sources?: Array<{ title: string; url: string }> | null;
  rating?: number | null;
  notes?: string | null;
  ratingAverage?: number | null;
  ratingCount?: number;
  authorName?: string | null;
  authorImage?: string | null;
}

interface InteractiveFeatures {
  servingSelector?: boolean;
  costEstimates?: boolean;
  amazonLinks?: boolean;
  ingredientImages?: boolean;
  reviewDialog?: boolean;
  publicRating?: boolean;
  publicComments?: boolean;
}

interface RecipeDetailProps {
  recipe: RecipeData;
  interactive?: InteractiveFeatures;
  actionButtons?: React.ReactNode;
  afterTitle?: React.ReactNode;
  afterBadges?: React.ReactNode;
  afterSources?: React.ReactNode;
}

function RecipeImage({ src, alt }: { src: string; alt: string }) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setHidden(true)}
      />
    </div>
  );
}

export function RecipeDetail({
  recipe,
  interactive = {},
  actionButtons,
  afterTitle,
  afterBadges,
  afterSources,
}: RecipeDetailProps) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedServings, setSelectedServings] = useState<number | null>(null);

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

  const showCosts = interactive.costEstimates ?? false;
  const totalCost = showCosts
    ? estimateTotalCost(ingredients) * scaleFactor
    : 0;
  const costPerServing =
    showCosts && servings && servings > 0 ? totalCost / servings : null;

  return (
    <div>
      {recipe.imageUrl ? (
        <div className="relative">
          <RecipeImage src={recipe.imageUrl} alt={recipe.title} />
          {(recipe.slug || actionButtons) && (
            <div className="absolute top-3 right-3 flex gap-2">
              {actionButtons}
              {recipe.slug && (
                <ShareButton
                  title={recipe.title}
                  description={recipe.description ?? ""}
                  slug={recipe.slug}
                />
              )}
            </div>
          )}
        </div>
      ) : recipe.slug || actionButtons ? (
        <div className="mb-3 flex justify-end gap-2">
          {actionButtons}
          {recipe.slug && (
            <ShareButton
              title={recipe.title}
              description={recipe.description ?? ""}
              slug={recipe.slug}
            />
          )}
        </div>
      ) : null}

      <div className="mb-3">
        <h1 className="text-2xl font-bold">{recipe.title}</h1>
      </div>

      {afterTitle}

      <div className="mb-6 flex flex-wrap gap-2">
        {recipe.servings &&
          (interactive.servingSelector ? (
            <ServingSelector
              originalServings={recipe.servings}
              selectedServings={servings}
              onServingsChange={setSelectedServings}
            />
          ) : (
            <Badge variant="secondary" className="gap-1">
              <UsersIcon className="size-3" />
              {recipe.servings} servings
            </Badge>
          ))}
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
        {showCosts && totalCost > 0 && (
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

      {interactive.reviewDialog &&
        (recipe.rating ? (
          <div className="mb-6 rounded-lg border bg-amber-500/5 border-amber-500/20 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarRating value={recipe.rating} size="md" />
                <span className="text-sm font-medium">{recipe.rating}/5</span>
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
        ))}

      {afterBadges}

      {interactive.publicRating && (
        <div>
          <PublicRating
            recipeId={recipe.id}
            initialAverage={recipe.ratingAverage ?? null}
            initialCount={recipe.ratingCount ?? 0}
          />
          {recipe.authorName && (
            <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              {recipe.authorImage && (
                <img
                  src={recipe.authorImage}
                  alt={recipe.authorName}
                  className="size-6 rounded-full"
                />
              )}
              <span>by {recipe.authorName}</span>
            </div>
          )}
        </div>
      )}

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold">Ingredients</h2>
        <ul
          className={interactive.ingredientImages ? "space-y-2" : "space-y-1.5"}
        >
          {ingredients.map((ingredient, i) => {
            const price = showCosts
              ? estimateIngredientPrice(ingredient) * scaleFactor
              : 0;
            return (
              <li
                key={i}
                className={
                  interactive.ingredientImages
                    ? "flex items-center gap-3 text-sm rounded-md px-2 py-1 -mx-2 transition-colors hover:bg-muted/50"
                    : "text-sm rounded-md px-2 py-1 -mx-2 transition-colors hover:bg-muted/50"
                }
              >
                {interactive.ingredientImages && (
                  <IngredientImage name={ingredient.item} size={32} />
                )}
                <span
                  className={
                    interactive.ingredientImages ? "flex-1" : undefined
                  }
                >
                  <span className="font-medium">
                    {interactive.servingSelector
                      ? scaleQuantity(ingredient.quantity, scaleFactor)
                      : ingredient.quantity}{" "}
                    {ingredient.unit}
                  </span>{" "}
                  {ingredient.item}
                </span>
                {showCosts && (
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {formatPrice(price)}
                  </span>
                )}
                {interactive.amazonLinks && (
                  <AmazonFreshLink ingredient={ingredient} />
                )}
              </li>
            );
          })}
        </ul>

        {showCosts && totalCost > 0 && (
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

        {interactive.amazonLinks && (
          <div className="mt-4 flex flex-wrap gap-2">
            <OpenAllAmazonFreshButton ingredients={ingredients} />
            <CopyShoppingListButton ingredients={ingredients} />
          </div>
        )}
      </section>

      <Separator />

      <section className="my-6">
        <h2 className="mb-3 text-lg font-semibold">Instructions</h2>
        <InstructionSteps instructions={instructions} />
      </section>

      {sources.length > 0 && (
        <div>
          <Separator />
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">Sources</h2>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, i) => (
                <Button
                  key={i}
                  asChild
                  variant="ghost"
                  size="sm"
                  className="bg-muted h-auto max-w-[80dvw] whitespace-normal text-left"
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLinkIcon className="size-3.5" />
                    {source.title}{" "}
                  </a>
                </Button>
              ))}
            </div>
          </section>
        </div>
      )}

      {afterSources}

      {interactive.publicComments && <PublicComments recipeId={recipe.id} />}

      {interactive.reviewDialog && (
        <ReviewDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          recipeId={recipe.id}
          recipeTitle={recipe.title}
          initialRating={recipe.rating}
          initialNotes={recipe.notes}
        />
      )}
    </div>
  );
}

export type { RecipeDetailProps, RecipeData, InteractiveFeatures };
