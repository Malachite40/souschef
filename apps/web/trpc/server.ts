import 'server-only';

import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { createCaller, createNextTRPCContext } from '@yeschefai/trpc/server';
import type { AppRouter } from '@yeschefai/trpc/server';
import { headers } from 'next/headers';
import { cache } from 'react';
import { createQueryClient } from './query-client';

const createContext = cache(async () => {
    const heads = new Headers(await headers());
    heads.set('x-trpc-source', 'rsc');
    return createNextTRPCContext({ headers: heads });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
    caller,
    getQueryClient,
);
