import { TRPCError } from '@trpc/server';
import type { db as dbClient } from '@yeschefai/db';
import {
    chatConversations,
    recipeComments,
    recipeFolders,
    recipeRatings,
    savedRecipes,
    user,
} from '@yeschefai/db/schema';
import { and, avg, count, desc, eq, gt, like } from 'drizzle-orm';
import { z } from 'zod';
import {
    authenticatedProcedure,
    createTRPCRouter,
    publicProcedure,
} from '../trpc';
import { slugify } from '../utils/slugify';

async function generateUniqueSlug(
    db: typeof dbClient,
    title: string,
): Promise<string> {
    const baseSlug = slugify(title);
    if (!baseSlug) return crypto.randomUUID();

    const existing = await db
        .select({ slug: savedRecipes.slug })
        .from(savedRecipes)
        .where(like(savedRecipes.slug, `${baseSlug}%`));

    const existingSlugs = new Set(
        existing.map((r: { slug: string | null }) => r.slug),
    );

    if (!existingSlugs.has(baseSlug)) return baseSlug;

    let suffix = 2;
    while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
        suffix++;
    }
    return `${baseSlug}-${suffix}`;
}

export const recipesRouter = createTRPCRouter({
    list: authenticatedProcedure.query(async ({ ctx }) => {
        return ctx.db
            .select()
            .from(savedRecipes)
            .where(eq(savedRecipes.userId, ctx.userId))
            .orderBy(desc(savedRecipes.createdAt))
            .limit(100);
    }),

    getById: authenticatedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const [recipe] = await ctx.db
                .select()
                .from(savedRecipes)
                .where(
                    and(
                        eq(savedRecipes.id, input.id),
                        eq(savedRecipes.userId, ctx.userId),
                    ),
                )
                .limit(1);
            return recipe ?? null;
        }),

    getBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const [result] = await ctx.db
                .select({
                    recipe: savedRecipes,
                    authorName: user.name,
                    authorImage: user.image,
                })
                .from(savedRecipes)
                .innerJoin(user, eq(savedRecipes.userId, user.id))
                .where(eq(savedRecipes.slug, input.slug))
                .limit(1);

            if (!result) return null;

            const [ratingSummary] = await ctx.db
                .select({
                    average: avg(recipeRatings.rating),
                    count: count(),
                })
                .from(recipeRatings)
                .where(eq(recipeRatings.recipeId, result.recipe.id));

            return {
                ...result.recipe,
                authorName: result.authorName,
                authorImage: result.authorImage,
                ratingAverage: ratingSummary?.average
                    ? Number(ratingSummary.average)
                    : null,
                ratingCount: ratingSummary?.count ?? 0,
            };
        }),

    save: authenticatedProcedure
        .input(
            z.object({
                conversationId: z.string().optional(),
                title: z.string(),
                description: z.string().optional(),
                imageUrl: z.string().optional(),
                servings: z.number().optional(),
                prepTime: z.string().optional(),
                cookTime: z.string().optional(),
                caloriesPerServing: z.number().int().positive().nullish(),
                ingredients: z.array(
                    z.object({
                        item: z.string(),
                        quantity: z.string(),
                        unit: z.string(),
                        amazonQuery: z.string(),
                        estimatedPrice: z.number().optional(),
                    }),
                ),
                instructions: z.array(
                    z.object({
                        step: z.string(),
                        text: z.string(),
                        time: z.string().optional(),
                        ingredients: z.array(z.string()).optional(),
                    }),
                ),
                sources: z.array(
                    z.object({
                        title: z.string(),
                        url: z.string(),
                    }),
                ),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Prevent duplicate saves (same user + same title)
            const [existing] = await ctx.db
                .select({ id: savedRecipes.id })
                .from(savedRecipes)
                .where(
                    and(
                        eq(savedRecipes.userId, ctx.userId),
                        eq(savedRecipes.title, input.title),
                    ),
                )
                .limit(1);

            if (existing) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Recipe already saved',
                });
            }

            const slug = await generateUniqueSlug(ctx.db, input.title);

            // Auto-generate description if not provided
            const description =
                input.description ||
                `A delicious ${input.title} recipe with ${input.ingredients
                    .slice(0, 3)
                    .map((i) => i.item)
                    .join(
                        ', ',
                    )}${input.ingredients.length > 3 ? ' and more' : ''}.`;

            const [recipe] = await ctx.db
                .insert(savedRecipes)
                .values({
                    userId: ctx.userId,
                    conversationId: input.conversationId,
                    title: input.title,
                    slug,
                    description,
                    imageUrl: input.imageUrl,
                    servings: input.servings,
                    prepTime: input.prepTime,
                    cookTime: input.cookTime,
                    caloriesPerServing: input.caloriesPerServing,
                    ingredients: input.ingredients,
                    instructions: input.instructions,
                    sources: input.sources,
                })
                .returning();

            // Rename the chat to the first saved recipe's title
            if (input.conversationId) {
                const [{ count: recipeCount }] = await ctx.db
                    .select({ count: count() })
                    .from(savedRecipes)
                    .where(
                        eq(savedRecipes.conversationId, input.conversationId),
                    );

                if (Number(recipeCount) === 1) {
                    await ctx.db
                        .update(chatConversations)
                        .set({ title: input.title, updatedAt: new Date() })
                        .where(eq(chatConversations.id, input.conversationId));
                }
            }

            return recipe;
        }),

    review: authenticatedProcedure
        .input(
            z.object({
                id: z.string(),
                rating: z.number().int().min(1).max(5),
                notes: z.string().max(2000).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [updated] = await ctx.db
                .update(savedRecipes)
                .set({
                    rating: input.rating,
                    notes: input.notes ?? null,
                })
                .where(
                    and(
                        eq(savedRecipes.id, input.id),
                        eq(savedRecipes.userId, ctx.userId),
                    ),
                )
                .returning();
            return updated ?? null;
        }),

    delete: authenticatedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .delete(savedRecipes)
                .where(
                    and(
                        eq(savedRecipes.id, input.id),
                        eq(savedRecipes.userId, ctx.userId),
                    ),
                );
            return { success: true };
        }),

    move: authenticatedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                folderId: z.string().uuid().nullable(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            if (input.folderId) {
                const [folder] = await ctx.db
                    .select({ id: recipeFolders.id })
                    .from(recipeFolders)
                    .where(
                        and(
                            eq(recipeFolders.id, input.folderId),
                            eq(recipeFolders.userId, ctx.userId),
                        ),
                    )
                    .limit(1);
                if (!folder) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Folder not found',
                    });
                }
            }

            const [updated] = await ctx.db
                .update(savedRecipes)
                .set({ folderId: input.folderId })
                .where(
                    and(
                        eq(savedRecipes.id, input.id),
                        eq(savedRecipes.userId, ctx.userId),
                    ),
                )
                .returning();
            return updated ?? null;
        }),

    // ── Public Comments ─────────────────────────────

    getComments: publicProcedure
        .input(
            z.object({
                recipeId: z.string(),
                cursor: z.string().optional(),
                limit: z.number().min(1).max(50).default(20),
            }),
        )
        .query(async ({ ctx, input }) => {
            const conditions = [eq(recipeComments.recipeId, input.recipeId)];
            if (input.cursor) {
                conditions.push(gt(recipeComments.id, input.cursor));
            }

            const comments = await ctx.db
                .select({
                    id: recipeComments.id,
                    content: recipeComments.content,
                    createdAt: recipeComments.createdAt,
                    userId: recipeComments.userId,
                    userName: user.name,
                    userImage: user.image,
                })
                .from(recipeComments)
                .innerJoin(user, eq(recipeComments.userId, user.id))
                .where(and(...conditions))
                .orderBy(desc(recipeComments.createdAt))
                .limit(input.limit + 1);

            const hasMore = comments.length > input.limit;
            const items = hasMore ? comments.slice(0, input.limit) : comments;

            return {
                items,
                nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
            };
        }),

    addComment: authenticatedProcedure
        .input(
            z.object({
                recipeId: z.string(),
                content: z.string().min(1).max(2000),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [comment] = await ctx.db
                .insert(recipeComments)
                .values({
                    recipeId: input.recipeId,
                    userId: ctx.userId,
                    content: input.content,
                })
                .returning();
            return comment;
        }),

    deleteComment: authenticatedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .delete(recipeComments)
                .where(
                    and(
                        eq(recipeComments.id, input.id),
                        eq(recipeComments.userId, ctx.userId),
                    ),
                );
            return { success: true };
        }),

    // ── Public Ratings ──────────────────────────────

    getRatingSummary: publicProcedure
        .input(z.object({ recipeId: z.string() }))
        .query(async ({ ctx, input }) => {
            const [result] = await ctx.db
                .select({
                    average: avg(recipeRatings.rating),
                    count: count(),
                })
                .from(recipeRatings)
                .where(eq(recipeRatings.recipeId, input.recipeId));

            return {
                average: result?.average ? Number(result.average) : null,
                count: result?.count ?? 0,
            };
        }),

    getUserRating: authenticatedProcedure
        .input(z.object({ recipeId: z.string() }))
        .query(async ({ ctx, input }) => {
            const [result] = await ctx.db
                .select({ rating: recipeRatings.rating })
                .from(recipeRatings)
                .where(
                    and(
                        eq(recipeRatings.recipeId, input.recipeId),
                        eq(recipeRatings.userId, ctx.userId),
                    ),
                )
                .limit(1);
            return result?.rating ?? null;
        }),

    rateRecipe: authenticatedProcedure
        .input(
            z.object({
                recipeId: z.string(),
                rating: z.number().int().min(1).max(5),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .insert(recipeRatings)
                .values({
                    recipeId: input.recipeId,
                    userId: ctx.userId,
                    rating: input.rating,
                })
                .onConflictDoUpdate({
                    target: [recipeRatings.recipeId, recipeRatings.userId],
                    set: { rating: input.rating },
                });
            return { success: true };
        }),
});
