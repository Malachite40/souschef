import { chatConversations, chatMessages } from '@souschef/db/schema';
import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { z } from 'zod';
import { authenticatedProcedure, createTRPCRouter } from '../trpc';

export const chatRouter = createTRPCRouter({
    listConversations: authenticatedProcedure.query(async ({ ctx }) => {
        return ctx.db
            .select()
            .from(chatConversations)
            .where(eq(chatConversations.userId, ctx.userId))
            .orderBy(desc(chatConversations.updatedAt))
            .limit(50);
    }),

    getConversation: authenticatedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const [conversation] = await ctx.db
                .select()
                .from(chatConversations)
                .where(
                    and(
                        eq(chatConversations.id, input.id),
                        eq(chatConversations.userId, ctx.userId),
                    ),
                )
                .limit(1);

            if (!conversation) return null;

            const messages = await ctx.db
                .select()
                .from(chatMessages)
                .where(eq(chatMessages.conversationId, input.id))
                .orderBy(chatMessages.createdAt);

            return { ...conversation, messages };
        }),

    createConversation: authenticatedProcedure
        .input(
            z.object({
                title: z.string(),
                model: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [conversation] = await ctx.db
                .insert(chatConversations)
                .values({
                    userId: ctx.userId,
                    title: input.title,
                    model: input.model,
                })
                .returning();
            return { id: conversation.id };
        }),

    deleteConversation: authenticatedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .delete(chatConversations)
                .where(
                    and(
                        eq(chatConversations.id, input.id),
                        eq(chatConversations.userId, ctx.userId),
                    ),
                );
            return { success: true };
        }),

    listConversationRecipes: authenticatedProcedure.query(async ({ ctx }) => {
        const rows = await ctx.db
            .select({
                conversationId: chatMessages.conversationId,
                metadata: chatMessages.metadata,
            })
            .from(chatMessages)
            .innerJoin(
                chatConversations,
                eq(chatMessages.conversationId, chatConversations.id),
            )
            .where(
                and(
                    eq(chatConversations.userId, ctx.userId),
                    isNotNull(chatMessages.metadata),
                ),
            );

        const result: Record<string, string[]> = {};
        for (const row of rows) {
            const meta = row.metadata as { recipeTitles?: string[] };
            if (meta?.recipeTitles?.length) {
                if (!result[row.conversationId]) {
                    result[row.conversationId] = [];
                }
                result[row.conversationId].push(...meta.recipeTitles);
            }
        }
        return result;
    }),

    updateTitle: authenticatedProcedure
        .input(
            z.object({
                id: z.string(),
                title: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [conversation] = await ctx.db
                .update(chatConversations)
                .set({ title: input.title, updatedAt: new Date() })
                .where(
                    and(
                        eq(chatConversations.id, input.id),
                        eq(chatConversations.userId, ctx.userId),
                    ),
                )
                .returning();
            return conversation;
        }),
});
