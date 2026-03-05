'use client';

import { RecipeDetail } from '@/components/recipe/recipe-detail';
import { api } from '@/trpc/react';
import { Button } from '@yeschefai/ui/components/button';
import { Skeleton } from '@yeschefai/ui/components/skeleton';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function RecipeDetailPage() {
    const params = useParams();
    const { data: recipe, isLoading } = api.recipes.getById.useQuery({
        id: params.id as string,
    });

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

                <RecipeDetail
                    recipe={recipe}
                    interactive={{
                        servingSelector: true,
                        costEstimates: true,
                        amazonLinks: true,
                        ingredientImages: true,
                        reviewDialog: true,
                    }}
                />
            </div>
        </div>
    );
}
