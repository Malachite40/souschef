import { chatConversations, savedRecipes } from '@yeschefai/db/schema';
import { and, count, desc, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { authenticatedProcedure, createTRPCRouter } from '../trpc';

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

    save: authenticatedProcedure
        .input(
            z.object({
                conversationId: z.string().optional(),
                title: z.string(),
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

            const [recipe] = await ctx.db
                .insert(savedRecipes)
                .values({
                    userId: ctx.userId,
                    conversationId: input.conversationId,
                    title: input.title,
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
                    .where(eq(savedRecipes.conversationId, input.conversationId));

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
});
