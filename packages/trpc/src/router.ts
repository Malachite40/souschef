import { authRouter } from './routers/auth';
import { chatRouter } from './routers/chat';
import { recipesRouter } from './routers/recipes';
import { createCallerFactory, createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
    auth: authRouter,
    chat: chatRouter,
    recipes: recipesRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
