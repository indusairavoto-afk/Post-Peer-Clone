# PostMVP

PostMVP is a first-party social media publishing dashboard for composing, scheduling, and managing posts across connected platforms.

## Run & Operate

- `pnpm install --frozen-lockfile` — install the pnpm workspace dependencies
- `pnpm --filter @workspace/postpeer-clone run dev` — run the web app (managed workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (managed workflow)
- `pnpm --filter @workspace/mockup-sandbox run dev` — run the component preview server (managed workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required services: Replit-managed Clerk authentication and the provisioned PostgreSQL database (`DATABASE_URL`)
- Clerk keys are provisioned as `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `VITE_CLERK_PUBLISHABLE_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/postpeer-clone` — React + Vite web application
- `artifacts/api-server` — Express API and Clerk middleware
- `artifacts/mockup-sandbox` — isolated component preview server
- `lib/db/src/schema` — Drizzle database schema
- `lib/api-spec` — OpenAPI source and code-generation configuration
- `lib/api-client-react` and `lib/api-zod` — generated/shared API client packages
- `artifacts/*/.replit-artifact/artifact.toml` — artifact routing and managed workflow configuration

## Architecture decisions

- The existing pnpm workspace and artifact boundaries are preserved; no migration or restructuring was performed.
- The web app is served at `/`, the API at `/api`, and the mockup server at `/__mockup`.
- Browser authentication uses Clerk session cookies through the API proxy.
- Platform connections are stored in PostMVP's own PostgreSQL database.
- Publishing and scheduling are handled by PostMVP's own API and database; provider adapters can be added independently later.

## Product

- Public landing and pricing pages
- Clerk sign-in and sign-up
- Authenticated dashboard with post composition, post management, connected platforms, API keys, and settings

## User preferences

No additional preferences recorded.

## Gotchas

- Do not run a root-level `pnpm dev`; use the managed artifact workflows or package-specific commands.
- The Vite app requires `PORT` and `BASE_PATH`, which the managed workflow supplies.
- The API requires `PORT`; database-backed routes also require the provisioned `DATABASE_URL`.
- Do not add browser Bearer-token handling; web auth is cookie-based.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
