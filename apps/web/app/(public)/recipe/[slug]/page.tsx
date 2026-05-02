import { OpenInAppButton } from '@/components/recipe/open-in-app-button';
import { RecipeDetail } from '@/components/recipe/recipe-detail';
import { SavePublicRecipeButton } from '@/components/recipe/save-public-recipe-button';
import { api } from '@/trpc/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const recipe = await api.recipes.getBySlug({ slug });

    if (!recipe) {
        return { title: 'Recipe Not Found | YesChef AI' };
    }

    return {
        title: `${recipe.title} | YesChef AI`,
        description:
            recipe.description ?? `A delicious ${recipe.title} recipe.`,
        openGraph: {
            title: recipe.title,
            description:
                recipe.description ?? `A delicious ${recipe.title} recipe.`,
            images: recipe.imageUrl ? [recipe.imageUrl] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: recipe.title,
            description:
                recipe.description ?? `A delicious ${recipe.title} recipe.`,
            images: recipe.imageUrl ? [recipe.imageUrl] : [],
        },
    };
}

function buildJsonLd(
    recipe: NonNullable<Awaited<ReturnType<typeof api.recipes.getBySlug>>>,
) {
    const jsonLd: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: recipe.title,
        description: recipe.description,
        image: recipe.imageUrl,
        prepTime: recipe.prepTime
            ? `PT${recipe.prepTime.replace(/\s/g, '').toUpperCase()}`
            : undefined,
        cookTime: recipe.cookTime
            ? `PT${recipe.cookTime.replace(/\s/g, '').toUpperCase()}`
            : undefined,
        recipeYield: recipe.servings
            ? `${recipe.servings} servings`
            : undefined,
        recipeIngredient: recipe.ingredients?.map(
            (i) => `${i.quantity} ${i.unit} ${i.item}`,
        ),
        recipeInstructions: recipe.instructions?.map((step) => ({
            '@type': 'HowToStep',
            text: step.text,
        })),
    };

    if (recipe.ratingCount > 0 && recipe.ratingAverage) {
        jsonLd.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: recipe.ratingAverage,
            ratingCount: recipe.ratingCount,
        };
    }

    return jsonLd;
}

export default async function PublicRecipePage({ params }: Props) {
    const { slug } = await params;
    const recipe = await api.recipes.getBySlug({ slug });

    if (!recipe) {
        notFound();
    }

    const jsonLd = buildJsonLd(recipe);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <article className="mx-auto max-w-3xl px-4 py-8 pb-[calc(2rem+var(--safe-area-inset-bottom))] md:px-6">
                <OpenInAppButton slug={slug} />
                <RecipeDetail
                    recipe={recipe}
                    interactive={{
                        servingSelector: true,
                        costEstimates: true,
                        amazonLinks: true,
                        ingredientImages: true,
                        reviewDialog: true,
                        publicRating: true,
                        publicComments: true,
                    }}
                    actionButtons={<SavePublicRecipeButton recipe={recipe} />}
                    afterTitle={
                        recipe.description ? (
                            <p className="mb-4 text-muted-foreground">
                                {recipe.description}
                            </p>
                        ) : null
                    }
                />
            </article>
        </>
    );
}
