# Master Replication Prompt - Mushroom Compadres ERP

You are an expert full-stack TypeScript engineer. Recreate the Mushroom Compadres ERP as an offline-first monorepo for a mushroom farm, processing, inventory, quality, and commercial operations business. Build it as production-leaning software, not a demo.

## Product Goal

Create an approachable ERP for Mushroom Compadres that supports cultivation, processing, inventory, traceability, purchasing, QC, MRP, wholesale, CRM, Shopify operations, documents, reporting, dashboards, and operational training. The app should be useful for non-technical operations staff, work well on desktop and mobile, and support offline-first workflows for production and warehouse use.

## Required Stack

- TypeScript monorepo managed with `pnpm`
- React 19 + Vite PWA frontend in `apps/web`
- Fastify API in `apps/api`
- Background worker foundation in `apps/worker`
- Shared domain logic in `packages/domain`
- Drizzle/Postgres schema and migrations in `packages/db`
- Shared React UI primitives in `packages/ui`
- Shared i18n/catalog helpers in `packages/i18n`
- Shopify integration boundary in `packages/shopify`
- Vitest for unit/API tests
- Playwright for e2e tests
- Supabase-compatible auth boundary and PowerSync-style offline sync boundary
- Lucide icons where interface icons are needed

## Repository Shape

Create this structure:

```text
apps/
  api/
  web/
  worker/
packages/
  db/
  domain/
  i18n/
  shopify/
  ui/
docs/
  import-templates/
  research/
  runbooks/
```

Root files should include `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `tsconfig.base.json`, `eslint.config.mjs`, `prettier.config.cjs`, `turbo.json`, `vitest.workspace.ts`, `playwright.config.ts`, `.env.example`, `README.md`, `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md`.

## Functional Scope

Implement these modules end to end with domain logic, API routes, frontend screens, and focused tests:

- Authentication, user context, RBAC, permission sets, and audit-oriented boundaries
- Products, variants, materials, SKUs, locations, labels, barcode/QR support, and item classes
- Inventory ledger, balances, stock counts, adjustments, quarantine, release, and receiving
- Lots, traceability explorer, mock recalls, COA generation, release packets, and recall reports
- Cultivation, harvest, drying, farm tasks, and mobile harvest workflows
- Processing batches, production orders, electronic batch records, e-signatures, deviations, CAPA, holds, and quality events
- QC specifications, test libraries, incoming inspection, supplier quality, approved vendor lists, and controlled documents
- BOMs, formulas, formulation vault, revision control, engineering change control, routings, work centers, labor, and shop floor kiosk flows
- Standard cost rollups, batch actual costing, MRP, APS-style planning, capable-to-promise, purchasing, purchase receiving, and production planning
- Shopify configuration, webhook ingestion, order/customer sync, inventory push, fulfillment, reconciliation, and dashboard surfaces
- Wholesale accounts, reseller price lists, B2B quotes, CRM leads, interactions, and timeline views
- Import center with templates and validation for SKUs, BOMs, inputs, suppliers, price lists, formula lines, packaging, locations, labels, and QC specs
- Operational dashboards, management-by-exception alerts, reports, exports, beta feedback intake, roadmap automation, guided workflow diagrams, and clickthrough training
- Offline production and fulfillment hardening, conflict handling, sync upload boundaries, service worker, update prompt, manifest, and offline fallback page

## UX Direction

Design as a quiet, practical operations tool. Avoid marketing-style pages. The first screen should be the usable app shell, with dense but readable navigation, clear status surfaces, strong scanability, and ergonomic repeated workflows. Use restrained colors, compact panels, stable layout dimensions, and mobile-friendly task flows. Include Portuguese/i18n support hooks and approachable labels for ERP concepts.

## Important Domain Rules

- Inventory movement must be ledger-based and traceable.
- Lot genealogy must connect inputs, production, QC, releases, sales, and recalls.
- Offline workflows must queue changes and surface conflicts clearly.
- Quality gates must prevent inappropriate release or fulfillment.
- Permission checks must be explicit enough for API and UI tests.
- Import validation must return actionable row-level errors.
- Shopify integration must be idempotent and auditable.
- Costing, MRP, routings, and BOM/formula revision logic must remain in shared domain modules rather than being duplicated in UI components.

## Implementation Expectations

1. Start with the monorepo, TypeScript configs, workspace packages, lint/test/build scripts, and README.
2. Define shared domain types, zod-style validation, units, state machines, conflicts, permissions, and module-specific pure functions in `packages/domain`.
3. Add database schema and migrations in `packages/db` matching the domain model.
4. Build Fastify routes in `apps/api/src/routes` for each functional area, with tests against an in-memory datastore where useful.
5. Build React screens in `apps/web/src` for each module with routing, app shell navigation, status cards, tables, forms, scanners, labels, and offline indicators.
6. Add shared UI primitives in `packages/ui` and keep styling centralized in `apps/web/src/styles.css`.
7. Add PWA assets and service worker files under `apps/web/public`.
8. Add import template CSVs under `docs/import-templates`.
9. Add runbooks and production/beta checklists under `docs`.
10. Keep tests close to the code. Include Vitest unit tests for domain/API/UI logic and Playwright e2e specs for critical workflows.

## Verification Commands

The rebuilt project should support:

```sh
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm --filter @mushroom-compadres/web dev
pnpm --filter @mushroom-compadres/web preview
pnpm test:e2e
```

## Source-of-Truth Documents

When recreating from the backup, use these files as the source of truth:

- `SPEC.md` for product scope, roles, data model, traceability rules, offline rules, MVP, and roadmap
- `ARCHITECTURE.md` for stack, data integrity patterns, API style, testing, security, and tradeoffs
- `BUILD_PROMPTS.md` for incremental build prompts from monorepo foundation through advanced ERP modules
- `docs/runbooks/backup-restore.md` and `docs/production-checklist.md` for operational readiness expectations

## Success Criteria

The finished build should feel like the same Mushroom Compadres ERP: an offline-first, TypeScript, React/Fastify, pnpm monorepo with broad operational ERP coverage, rich domain modules, tested API routes, practical frontend screens, import templates, migrations, PWA/offline support, Shopify boundaries, PowerSync/Supabase-style integration points, and clear documentation.

