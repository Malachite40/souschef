# YesChef AI

AI-powered recipe discovery app. Chat with an AI assistant that searches the web for recipes, presents options, and lets you save favorites.

## Monorepo Structure

```
apps/web        — Next.js 15 frontend (React 19, App Router)
apps/scraper    — Python (FastAPI + uv) recipe scraper service
packages/db     — Drizzle ORM schema + migrations (PostgreSQL)
packages/trpc   — tRPC router definitions
packages/ui     — Shared UI components (shadcn/ui)
packages/typescript-config — Shared tsconfig
```

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19
- **API:** tRPC (packages/trpc → apps/web/trpc)
- **Database:** PostgreSQL via Drizzle ORM
- **Auth:** Better Auth (Google OAuth)
- **AI:** OpenRouter (ai SDK), default model `qwen/qwen3.5-plus-02-15`
- **State:** Zustand (stores in apps/web/stores/)
- **Mobile:** Capacitor (iOS)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Linting/Formatting:** Biome
- **Build:** Turborepo
- **Package Manager:** npm

## Dev Workflow

```bash
docker compose up          # Postgres + scraper service
npm run dev                # Turbo dev (web on port 3020)
npm run check              # Biome lint + format check
npm run check:fix           # Biome auto-fix
npm run db:generate        # Drizzle schema codegen
npm run db:migrate         # Run migrations
```

## Drizzle Kit (Database Migrations)

Schema lives in `packages/db/src/schema.ts`. Migrations output to `packages/db/drizzle/`. Config is in `packages/db/drizzle.config.ts` (reads `DATABASE_URL` from root `.env`).

### Workflow for schema changes

1. **Edit the schema** — modify `packages/db/src/schema.ts`
2. **Generate a migration** — run `npm run db:generate` (runs `drizzle-kit generate`)
3. **Review the generated SQL** — check the new file in `packages/db/drizzle/` before applying
4. **Apply the migration** — run `npm run db:migrate` (runs `drizzle-kit migrate`)
5. **Verify** — run `npm run db:generate` again to confirm no new migration is produced (ensures DB and journal are in sync)

### Rules

- **Never manually edit migration SQL files** in `packages/db/drizzle/` — always regenerate if something is wrong
- **Never edit or delete `drizzle/meta/` files** — these track migration state and are managed by drizzle-kit
- **Use `db:generate` + `db:migrate` for all schema changes** — this creates versioned migration files that get committed
- **Never use `db:push`** — it applies schema changes directly to the DB without creating migration files, which desynchronizes the migration journal from the actual DB state. A subsequent `db:generate` + `db:migrate` will then fail because the tables/columns already exist
- **Always run `db:generate` from the repo root** (via turborepo) or from `packages/db/` — the config expects `DATABASE_URL` from `../../.env`
- **Do not delete or rename existing migration files** — this will break the migration journal

## Environment Variables

Validated in `apps/web/env.ts` via `@t3-oss/env-nextjs`:

- `DATABASE_URL` — Postgres connection string
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` — Auth config
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — OAuth
- `OPENROUTER_API_KEY` — AI provider
- `SCRAPER_URL` — Recipe scraper (default `http://localhost:8001`)
- `NEXT_PUBLIC_BETTER_AUTH_URL` — Client-side auth URL

## Code Style (Biome)

- Single quotes, 4-space indent, trailing commas, semicolons
- Organize imports enabled
- `noUnusedImports: error`
- Ignored dirs: `.next`, `node_modules`, `dist`, `drizzle`, `public`

## Key Patterns

- **tRPC routers:** `packages/trpc/src/router/` — each domain (chat, recipes) has its own router
- **Stores:** `apps/web/stores/` — Zustand stores (chat-store, header-actions-store)
- **API routes:** `apps/web/app/api/` — Next.js route handlers (chat uses ai SDK streamText)
- **Components:** `apps/web/components/` — organized by feature (chat/, layout/, recipe/, ui/)
- **Hooks:** `apps/web/hooks/` — shared React hooks

## Design System

See [BRANDING.md](./BRANDING.md) for colors (terracotta/sage), typography (Inter + DM Serif Display for brand name only), iconography (lucide-react, ChefHatIcon as brand icon).
