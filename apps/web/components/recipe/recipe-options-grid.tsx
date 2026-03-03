"use client";

import { useState } from "react";
import { Badge } from "@souschef/ui/components/badge";
import { Button } from "@souschef/ui/components/button";
import { Card, CardContent, CardHeader } from "@souschef/ui/components/card";
import { Skeleton } from "@souschef/ui/components/skeleton";
import {
  ChefHatIcon,
  ClockIcon,
  FlameIcon,
  GaugeIcon,
  SearchIcon,
} from "lucide-react";

export interface RecipeOptionData {
  title: string;
  description: string;
  imageUrl?: string;
  sourceUrl?: string;
  prepTime: string;
  cookTime: string;
  caloriesPerServing?: number;
  difficulty: string;
  tags: string[];
}

interface RecipeOptionsGridProps {
  options: RecipeOptionData[];
  onSelect: (option: RecipeOptionData) => void;
  onFindMore?: () => void;
}

function RecipeOptionImage({ src, alt }: { src: string; alt: string }) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setHidden(true)}
      />
    </div>
  );
}

export function RecipeOptionsGrid({
  options,
  onSelect,
  onFindMore,
}: RecipeOptionsGridProps) {
  return (
    <div className="my-3 w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <Card
            key={option.title}
            className="cursor-pointer overflow-hidden transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.98]"
            onClick={() => onSelect(option)}
          >
            {option.imageUrl && (
              <RecipeOptionImage src={option.imageUrl} alt={option.title} />
            )}
            <CardHeader className="pb-2">
              <h3 className="text-sm font-semibold leading-tight">
                {option.title}
              </h3>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {option.description}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10px] font-normal"
                >
                  <ClockIcon className="size-3" />
                  {option.prepTime} prep
                </Badge>
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10px] font-normal"
                >
                  <ClockIcon className="size-3" />
                  {option.cookTime} cook
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-1 text-[10px] font-normal"
                >
                  <GaugeIcon className="size-3" />
                  {option.difficulty}
                </Badge>
                {option.caloriesPerServing && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-[10px] font-normal bg-orange-500/10 text-orange-700 dark:text-orange-400"
                  >
                    <FlameIcon className="size-3" />
                    {option.caloriesPerServing} cal
                  </Badge>
                )}
              </div>
              {option.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {option.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {onFindMore && (
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onFindMore}
          >
            <SearchIcon className="size-3.5" />
            Find More
          </Button>
        </div>
      )}
    </div>
  );
}

export function RecipeOptionsGridSkeleton() {
  return (
    <div className="my-3 w-full">
      <div className="mb-3 flex items-center gap-2">
        <ChefHatIcon className="size-4 animate-pulse text-primary" />
        <span className="text-sm text-muted-foreground">
          Finding recipe options...
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video w-full rounded-none" />
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-1 h-3 w-full" />
              <Skeleton className="mt-0.5 h-3 w-full" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
