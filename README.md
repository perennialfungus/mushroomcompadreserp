# Mushroom Compadres ERP

Offline-first TypeScript monorepo for the Mushroom Compadres ERP.

## Repo Structure

- `apps/web` - React/Vite PWA shell.
- `apps/api` - Fastify API foundation.
- `apps/worker` - Background worker foundation.
- `packages/db` - Database package boundary for Drizzle schema, migrations, and repositories.
- `packages/domain` - Shared domain types, schemas, and state machines.
- `packages/ui` - Shared React UI components.
- `packages/i18n` - Locale helpers and catalogs.
- `packages/shopify` - Shopify client, mapper, and idempotency helper boundary.

## Local Setup

```sh
pnpm install
cp .env.example .env
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Common Commands

```sh
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm format
```

Turbo is installed and configured in `turbo.json`; `turbo:*` scripts are available for CI or environments where Turbo's native binary shims are available.
