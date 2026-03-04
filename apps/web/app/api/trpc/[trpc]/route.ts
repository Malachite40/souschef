import { auth } from '@/auth';
import { env } from '@/env';
import { appRouter, createNextTRPCContext } from '@yeschefai/trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { NextRequest } from 'next/server';

const handler = (req: NextRequest) =>
    fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: async () => {
            const session = await auth.api.getSession({
                headers: req.headers,
            });
            return createNextTRPCContext({
                headers: req.headers,
                session: session
                    ? {
                          user: {
                              id: session.user.id,
                              name: session.user.name,
                              email: session.user.email,
                              image: session.user.image,
                          },
                      }
                    : null,
            });
        },
        onError:
            env.NODE_ENV === 'development'
                ? ({ path, error }) => {
                      console.error(
                          `tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
                      );
                  }
                : undefined,
    });

export { handler as GET, handler as POST };
