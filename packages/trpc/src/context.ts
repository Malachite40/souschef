import { db } from '@yeschefai/db';

export interface BaseContext {
    db: typeof db;
    session?: {
        user?: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    } | null;
    userId?: string;
}

export async function createNextTRPCContext(opts: {
    headers: Headers;
    session?: BaseContext['session'];
}): Promise<BaseContext> {
    const ctx: BaseContext = {
        db,
        session: opts.session,
    };

    if (opts.session?.user?.id) {
        ctx.userId = opts.session.user.id;
    }

    return ctx;
}

export function createContext(): BaseContext {
    return { db };
}
