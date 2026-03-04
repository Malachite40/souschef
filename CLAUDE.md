# SousChef

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
npm run db:push            # Push schema to DB
```

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
