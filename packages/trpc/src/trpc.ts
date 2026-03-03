import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { BaseContext } from './context';

const t = initTRPC.context<BaseContext>().create({
    transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const authenticatedProcedure = t.procedure.use(async ({ ctx, next }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in',
        });
    }
    return next({
        ctx: {
            ...ctx,
            userId,
        },
    });
});
