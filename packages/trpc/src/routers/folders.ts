import { TRPCError } from '@trpc/server';
import { recipeFolders, savedRecipes } from '@yeschefai/db/schema';
import { and, asc, count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { authenticatedProcedure, createTRPCRouter } from '../trpc';

const folderNameSchema = z.string().trim().min(1).max(40);

function isUniqueViolation(err: unknown): boolean {
    return (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: unknown }).code === '23505'
    );
}

export const foldersRouter = createTRPCRouter({
    list: authenticatedProcedure.query(async ({ ctx }) => {
        const rows = await ctx.db
            .select({
                id: recipeFolders.id,
                name: recipeFolders.name,
                createdAt: recipeFolders.createdAt,
                recipeCount: count(savedRecipes.id),
            })
            .from(recipeFolders)
            .leftJoin(
                savedRecipes,
                eq(savedRecipes.folderId, recipeFolders.id),
            )
            .where(eq(recipeFolders.userId, ctx.userId))
            .groupBy(recipeFolders.id)
            .orderBy(asc(recipeFolders.createdAt));

        return rows.map((r) => ({
            ...r,
            recipeCount: Number(r.recipeCount),
        }));
    }),

    create: authenticatedProcedure
        .input(z.object({ name: folderNameSchema }))
        .mutation(async ({ ctx, input }) => {
            try {
                const [folder] = await ctx.db
                    .insert(recipeFolders)
                    .values({ userId: ctx.userId, name: input.name })
                    .returning();
                return folder;
            } catch (err) {
                if (isUniqueViolation(err)) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: `A folder named "${input.name}" already exists.`,
                    });
                }
                throw err;
            }
        }),

    rename: authenticatedProcedure
        .input(z.object({ id: z.string().uuid(), name: folderNameSchema }))
        .mutation(async ({ ctx, input }) => {
            try {
                const [folder] = await ctx.db
                    .update(recipeFolders)
                    .set({ name: input.name })
                    .where(
                        and(
                            eq(recipeFolders.id, input.id),
                            eq(recipeFolders.userId, ctx.userId),
                        ),
                    )
                    .returning();
                if (!folder) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Folder not found',
                    });
                }
                return folder;
            } catch (err) {
                if (isUniqueViolation(err)) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: `A folder named "${input.name}" already exists.`,
                    });
                }
                throw err;
            }
        }),

    delete: authenticatedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .delete(recipeFolders)
                .where(
                    and(
                        eq(recipeFolders.id, input.id),
                        eq(recipeFolders.userId, ctx.userId),
                    ),
                );
            return { success: true };
        }),
});
