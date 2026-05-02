"use client";

import { IngredientImage } from "@/components/recipe/ingredient-image";
import { RecipeToolbar } from "@/components/recipe/recipe-toolbar";
import { ReviewDialog } from "@/components/recipe/review-dialog";
import {
  estimateIngredientPrice,
  estimateTotalCost,
  formatPrice,
} from "@/lib/utils/cost-estimator";
import { filterRecipes, sortRecipes } from "@/lib/utils/recipe-filters";
import { useRecipesStore } from "@/stores/recipes-store";
import { api } from "@/trpc/react";
import { Badge } from "@yeschefai/ui/components/badge";
import { Button } from "@yeschefai/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@yeschefai/ui/components/card";
import { Separator } from "@yeschefai/ui/components/separator";
import { Skeleton } from "@yeschefai/ui/components/skeleton";
import { StarRating } from "@yeschefai/ui/components/star-rating";
import {
  ChefHatIcon,
  ClockIcon,
  DollarSignIcon,
  FlameIcon,
  MessageSquareIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { div } from "three/src/nodes/math/OperatorNode.js";

function RecipeImage({ src, alt }: { src: string; alt: string }) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="aspect-video w-full overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setHidden(true)}
      />
    </div>
  );
}

const MAX_VISIBLE_INGREDIENTS = 6;

interface Ingredient {
  item: string;
  quantity: string;
  unit: string;
  amazonQuery: string;
  estimatedPrice?: number;
}

export function SavedRecipesList() {
  const { data: recipes, isLoading } = api.recipes.list.useQuery();
  const utils = api.useUtils();

  const deleteRecipe = api.recipes.delete.useMutation({
    onSuccess: () => {
      utils.recipes.list.invalidate();
    },
  });

  const { sortBy, timeFilter, costFilter, ratingFilter, searchQuery } =
    useRecipesStore();

  const [reviewRecipe, setReviewRecipe] = useState<{
    id: string;
    title: string;
    rating: number | null;
    notes: string | null;
  } | null>(null);

  const filteredAndSorted = useMemo(() => {
    if (!recipes) return [];
    const filtered = filterRecipes(recipes, {
      searchQuery,
      timeFilter,
      costFilter,
      ratingFilter,
    });
    return sortRecipes(filtered, sortBy);
  }, [recipes, searchQuery, timeFilter, costFilter, ratingFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="hidden sm:block">
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="size-6 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                ))}
              </div>
              <Skeleton className="mt-3 h-4 w-1/3 ml-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ChefHatIcon className="mb-3 size-12 text-primary/40" />
        <p className="mb-1 font-medium">No saved recipes yet</p>
        <p className="mb-4 text-sm text-muted-foreground">
          Chat with YesChef AI and save recipes you like!
        </p>
        <Link href="/chat">
          <Button variant="outline" className="gap-1.5">
            <MessageSquareIcon className="size-4" />
            Start Chatting
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <RecipeToolbar />

      {filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <SearchIcon className="mb-3 size-12 text-primary/40" />
          <p className="mb-1 font-medium">No matching recipes</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((recipe) => {
            const ingredients = (recipe.ingredients ?? []) as Ingredient[];
            const totalCost = estimateTotalCost(ingredients);
            const visibleIngredients = ingredients.slice(
              0,
              MAX_VISIBLE_INGREDIENTS,
            );
            const hiddenCount = ingredients.length - MAX_VISIBLE_INGREDIENTS;

            const badges = (
              <div className="flex flex-wrap-reverse gap-1.5">
                {recipe.servings && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <UsersIcon className="size-3" />
                    {recipe.servings}
                  </Badge>
                )}
                {recipe.prepTime && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <ClockIcon className="size-3" />
                    {recipe.prepTime}
                  </Badge>
                )}
                {recipe.cookTime && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <ClockIcon className="size-3" />
                    {recipe.cookTime}
                  </Badge>
                )}
                {totalCost > 0 && (
                  <Badge className="gap-1 text-xs bg-green-600 text-white">
                    <DollarSignIcon className="size-3" />
                    {formatPrice(totalCost)}
                  </Badge>
                )}
                {recipe.caloriesPerServing && (
                  <Badge className="gap-1 text-xs bg-orange-500 text-white">
                    <FlameIcon className="size-3" />
                    {recipe.caloriesPerServing} cal
                  </Badge>
                )}
              </div>
            );

            return (
              <div id={`recipe-${recipe.id}`} className="relative">
                {recipe.rating && (
                  <Badge className="absolute -top-2 -right-1 z-1 border bg-background border-border shadow-md">
                    <StarRating value={recipe.rating} size="sm" />
                  </Badge>
                )}
                <Card
                  key={recipe.id}
                  className="group relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 z-10 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        deleteRecipe.mutate({
                          id: recipe.id,
                        })
                      }
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-amber-500"
                      onClick={() =>
                        setReviewRecipe({
                          id: recipe.id,
                          title: recipe.title,
                          rating: recipe.rating,
                          notes: recipe.notes,
                        })
                      }
                    >
                      <StarIcon className="size-4" />
                    </Button>
                  </div>
                  <Link href={`/recipes/${recipe.id}`}>
                    {recipe.imageUrl && (
                      <div className="relative">
                        <RecipeImage src={recipe.imageUrl} alt={recipe.title} />
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent sm:hidden" />
                        <div className="absolute gap-2 flex flex-col top-3 left-3 z-10 max-w-[calc(100%-5rem)] sm:hidden">
                          <h3 className="line-clamp-1 rounded-md bg-black/40 p-1.5 text-sm font-semibold leading-tight text-white backdrop-blur-sm">
                            {recipe.title}
                          </h3>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 sm:hidden">
                          {badges}
                        </div>
                      </div>
                    )}
                    <CardHeader
                      className={`p-3 ${recipe.imageUrl ? "hidden sm:flex" : ""}`}
                    >
                      <CardTitle className="text-base pr-14">
                        {recipe.title}
                      </CardTitle>
                      {badges}
                    </CardHeader>
                    <CardContent className="hidden pt-0 sm:block">
                      <ul className="space-y-1.5">
                        {visibleIngredients.map((ingredient, i) => {
                          const price = estimateIngredientPrice(ingredient);
                          return (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-sm"
                            >
                              <IngredientImage
                                name={ingredient.item}
                                size={24}
                              />
                              <span className="flex-1 truncate">
                                <span className="font-medium">
                                  {ingredient.quantity} {ingredient.unit}
                                </span>{" "}
                                {ingredient.item}
                              </span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {formatPrice(price)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      {hiddenCount > 0 && (
                        <p className="mt-1.5 pl-8 text-xs text-muted-foreground">
                          +{hiddenCount} more ingredient
                          {hiddenCount > 1 ? "s" : ""}
                        </p>
                      )}
                      {totalCost > 0 && (
                        <>
                          <Separator className="my-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Estimated Total
                            </span>
                            <span className="font-semibold text-green-700 dark:text-green-400">
                              {formatPrice(totalCost)}
                            </span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Link>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {reviewRecipe && (
        <ReviewDialog
          open={!!reviewRecipe}
          onOpenChange={(open) => {
            if (!open) setReviewRecipe(null);
          }}
          recipeId={reviewRecipe.id}
          recipeTitle={reviewRecipe.title}
          initialRating={reviewRecipe.rating}
          initialNotes={reviewRecipe.notes}
        />
      )}
    </>
  );
}
