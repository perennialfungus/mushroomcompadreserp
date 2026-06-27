# Mushroom Compadres ERP - Architecture

## Executive Summary

Use a TypeScript monorepo with a React/Vite PWA frontend, Fastify API, background worker, Supabase Postgres/Auth/Storage in an EU region, Drizzle ORM, PowerSync for offline local SQLite sync, and Shopify Admin GraphQL integration through queued jobs. This stack keeps one codebase, supports offline-first operational workflows, is friendly to Codex agents, and avoids custom sync infrastructure while preserving a clear Postgres source of truth.

## Sources Checked

- PowerSync keeps backend databases in sync with in-app SQLite and supports JavaScript Web clients: https://docs.powersync.com/intro/powersync-overview
- PowerSync write/conflict docs and Supabase integration index: https://docs.powersync.com/llms.txt
- Shopify API limits, GraphQL cost limits, bulk operations, and rate-limit model: https://shopify.dev/docs/api/usage/limits#rate-limits
- Shopify webhooks require duplicate handling and reconciliation jobs: https://shopify.dev/docs/apps/build/webhooks
- Shopify `inventorySetQuantities` is intended for systems that are inventory source of truth and requires idempotency as of 2026-04: https://shopify.dev/docs/api/admin-graphql/latest/mutations/inventorySetQuantities
- Supabase Auth uses JWTs and integrates with Postgres/RLS: https://supabase.com/docs/guides/auth
- Supabase supports EU regions including Frankfurt/Ireland/Paris/Stockholm/Zurich: https://supabase.com/docs/guides/platform/regions
- MDN PWA docs confirm one codebase can be installable and work offline/background with service workers: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- MDN Barcode Detection API requires browser feature checks, so use a library fallback: https://developer.mozilla.org/en-US/docs/Web/API/Barcode_Detection_API

## Recommended Stack

### Monorepo

- Package manager: `pnpm`.
- Build orchestration: `turbo`.
- Language: TypeScript everywhere.
- Packages:
  - `apps/web`: React PWA.
  - `apps/api`: Fastify HTTP API.
  - `apps/worker`: background jobs and Shopify sync.
  - `packages/db`: Drizzle schema, migrations, typed repositories.
  - `packages/domain`: shared domain types, Zod schemas, state machines.
  - `packages/ui`: shared UI components.
  - `packages/i18n`: translation catalogs and helpers.
  - `packages/shopify`: Shopify client, mappers, idempotency helpers.

Tradeoff:
- A TypeScript monorepo reduces context switching for a small team and makes build prompts easier to execute. It is less rigid than a full enterprise framework, but the domain package and Zod schemas provide enough structure.

### Frontend

- React + Vite + TypeScript.
- TanStack Router for file/typed routing.
- TanStack Query for online/server operations that are not PowerSync-backed.
- PowerSync JavaScript Web SDK for local SQLite and live queries.
- Vite PWA/Workbox for service worker, app manifest, app shell caching, and update prompts.
- UI: Tailwind CSS, Radix UI primitives, lucide icons, custom Mushroom Compadres theme.
- Forms: React Hook Form + Zod.
- i18n: i18next or Lingui with locale-aware formatting through `Intl`.
- Testing: Vitest, Testing Library, Playwright.

Tradeoff:
- React/Vite keeps the client lightweight and PWA-friendly. Next.js is viable, but a pure SPA PWA plus API tier is simpler for offline operational screens and avoids server-rendering complexity where local SQLite is the primary read path.

### Backend

- Fastify + TypeScript.
- Zod request/response validation.
- OpenAPI generation from schemas.
- Drizzle ORM against Postgres.
- Worker process using BullMQ + Redis or a managed queue.
- API responsibilities:
  - Auth verification and RBAC enforcement.
  - PowerSync upload/write endpoint.
  - Shopify webhook ingestion.
  - Shopify OAuth/config if needed.
  - File upload signing.
  - Reconciliation/manual admin actions.
  - Conflict queue actions.

Tradeoff:
- Fastify is explicit, fast, and Codex-friendly. NestJS gives more structure but adds ceremony. For this product, domain complexity belongs in domain services and state machines, not a heavy HTTP framework.

### Database and Storage

- Supabase Postgres in an EU region, preferably Frankfurt or Ireland.
- Supabase Auth for users/sessions.
- Supabase Storage for COAs and attachments.
- Drizzle migrations committed to the repo.
- Row Level Security for direct Supabase access where used, but primary writes should go through the API/PowerSync backend.

Tradeoff:
- Supabase provides low-ops Postgres, Auth, Storage, backups, and EU regions. The risk is platform coupling; using Drizzle and a dedicated API limits lock-in.

### Offline and Sync

- PowerSync connects Postgres to in-app SQLite.
- Clients read operational data from local SQLite.
- Clients write locally first.
- PowerSync upload queue sends writes to the backend.
- Backend validates, authorizes, applies domain rules, writes to Postgres, and records conflicts when needed.
- Sync streams partition data by organization, role, location, and operational scope.

Conflict strategy:
- Inventory is append-only stock movements, not direct balance edits.
- Client-generated UUIDs and `client_transaction_id` make offline writes idempotent.
- Duplicate transactions are ignored.
- Mutable records use optimistic `version`.
- Regulated data conflicts are not silently overwritten.
- Notes/non-critical metadata may use last-write-wins with audit trail.
- Stock counts use count sessions and supervisor approval for overlapping conflicts.

Tradeoff:
- PowerSync removes the need to build custom replication, but it requires careful schema design and upload handling. This is worth it because offline production and fulfillment are hard requirements.

### Hosting

Recommended production hosting:
- Supabase project in EU region for Postgres/Auth/Storage.
- PowerSync Cloud if EU data processing/residency terms satisfy GDPR requirements; otherwise self-host PowerSync in Fly.io Frankfurt/Amsterdam.
- API and worker on Fly.io Machines in an EU region.
- Redis/queue on Upstash EU or Fly.io Redis-compatible service.
- Static PWA on Cloudflare Pages or Fly.io static service. Static hosting can be global because app assets are not personal data; API/data calls stay EU-hosted.
- Observability: Sentry EU, structured logs, uptime checks.

Tradeoff:
- This is managed/low-ops but still gives control over the API worker and sync service. Vercel is excellent for web apps, but long-running background sync/reconciliation jobs are cleaner on Fly.io/worker infrastructure.

### Auth and Authorization

- Supabase Auth with invited users only for staff.
- Email/password and magic link in MVP; optional Google/Microsoft SSO later.
- App tables define roles and location-scoped access.
- Supabase JWT identifies the user; API loads app roles from Postgres.
- Optional custom JWT claims for `organization_id` and coarse role once stable.
- Authorization checks live in domain services and database policies.

Tradeoff:
- Supabase Auth keeps auth low-friction and integrates with Postgres/RLS. Clerk/Auth0 are strong alternatives, but add another vendor and are less direct for a Supabase/Postgres-centered system.

### Shopify Integration

- Build a custom Shopify app integration.
- Prefer Shopify GraphQL Admin API.
- Use API version `2026-04` or newer at implementation time, pinned and upgraded on schedule.
- Webhooks:
  - `orders/create`
  - `orders/updated`
  - `orders/cancelled`
  - `customers/create`
  - `customers/update`
  - fulfillment/order topics as needed by current Shopify API
  - inventory-related topics for drift visibility, not authority
- Verify HMAC signatures.
- Dedupe with `X-Shopify-Webhook-Id`.
- Persist raw webhook payloads.
- Enqueue processing jobs; return quickly.
- Reconciliation jobs periodically fetch updated resources because Shopify does not guarantee webhook delivery/order.
- Push inventory with `inventorySetQuantities` using compare-and-set and required idempotency.
- Push fulfillment using Fulfillment Order APIs after local shipment records are committed.
- Use bulk operations for initial import and large reconciliations.
- Respect GraphQL cost-based rate limits and retry with backoff.

Tradeoff:
- Webhooks are low-latency but not sufficient alone. Webhook plus reconciliation is the robust pattern.

### Barcode, QR Scanning, and Label Printing

Decision: include in MVP.

Scanning:
- Use camera scanning in the PWA.
- Use a proven JS scanner library such as ZXing or html5-qrcode as the baseline.
- Feature-detect the native Barcode Detection API and use it only when available and reliable.
- Support manual code entry for accessibility and camera failure.
- Encode internal labels as QR codes or Data Matrix with compact payloads:
  - lot id or lot code
  - item sku
  - expiry date
  - optional URL-safe lookup token

Labels:
- Generate lot labels, finished goods labels, and location labels as PDF/PNG/SVG.
- Use browser printing/AirPrint for MVP.
- Add direct thermal printer integration in v1 after hardware is selected.

Tradeoff:
- Scanning and labeling are essential to offline fulfillment and traceability. Direct printer integration is hardware-specific, so MVP should produce reliable printable labels first.

## Architecture Diagram

```text
             Staff phones/tablets/desktops
        +--------------------------------------+
        | React/Vite PWA                       |
        | - App shell + service worker         |
        | - Camera scan + manual entry         |
        | - PowerSync local SQLite             |
        | - Offline upload queue               |
        +------------------+-------------------+
                           |
                           | sync streams + uploads
                           v
        +--------------------------------------+
        | PowerSync Service                    |
        | - Replicates Postgres to clients     |
        | - Partitions by org/role/location    |
        +------------------+-------------------+
                           |
                           | replication
                           v
        +--------------------------------------+
        | Supabase Postgres (EU)               |
        | - Source of truth                    |
        | - Inventory movement ledger          |
        | - Traceability graph                 |
        | - Auth-linked user records           |
        +-----+--------------------------+-----+
              |                          |
              | SQL/Drizzle              | files
              v                          v
 +--------------------------+    +----------------------+
 | Fastify API (EU)         |    | Supabase Storage     |
 | - RBAC/domain validation |    | - COAs/attachments   |
 | - PowerSync write API    |    +----------------------+
 | - Webhooks/admin APIs    |
 +-------------+------------+
               |
               | jobs
               v
 +--------------------------+          +----------------------+
 | Worker + Queue (EU)      | <------> | Shopify Admin API    |
 | - Webhook processing     |          | - Orders/customers   |
 | - Reconciliation         |          | - Inventory levels   |
 | - Inventory/fulfillment  |          | - Fulfillment orders |
 +--------------------------+          +----------------------+
```

## API Style

- JSON REST endpoints for operational commands and admin actions.
- OpenAPI generated from Zod schemas.
- Endpoint examples:
  - `POST /api/powersync/upload`
  - `POST /api/shopify/webhooks`
  - `POST /api/shopify/reconcile/orders`
  - `POST /api/shopify/reconcile/inventory`
  - `POST /api/inventory/resolve-conflict`
  - `POST /api/files/sign-upload`
  - `GET /api/reports/traceability/lot/:lotId`
- All mutating requests require:
  - auth
  - RBAC check
  - idempotency key or client transaction id
  - domain validation
  - audit event where relevant

## Data Integrity Patterns

- Inventory quantities are derived from `stock_movements`.
- Historical movements are never edited; corrections use reversals.
- Production consumes input lots and outputs new lots in one transaction.
- QC hold/release changes are audited and gate allocation.
- Shopify outbound writes are recorded before execution and updated after response.
- All external IDs are stored as opaque strings, usually Shopify GIDs.
- Every background job has an idempotency key and retry policy.

## Testing Strategy

- Unit tests:
  - domain state machines
  - inventory movement math
  - lot traceability graph construction
  - permission checks
  - Shopify mappers
- Integration tests:
  - Postgres migrations
  - API command endpoints
  - PowerSync upload handler behavior
  - webhook ingestion and dedupe
  - worker job retries
- E2E tests:
  - login and role routing
  - offline stock count and reconnect
  - production batch consumes inputs and creates finished lot
  - allocate lot to Shopify order and mark fulfilled
  - trace a shipped lot backward and forward
- Device tests:
  - iOS Safari PWA install and camera scanning
  - Android Chrome PWA install and camera scanning
  - tablet layouts

## Security and Compliance

- EU-host primary data stores and API/worker.
- Secrets only in managed environment variables.
- Webhook HMAC verification before processing.
- Strict CORS and CSP.
- Audit events for regulated data.
- COA attachment access through signed URLs with authorization.
- Least privilege Shopify scopes.
- Periodic backup/restore drills.
- GDPR export/delete workflows in v1.

## Operational Dashboards

- Sync health:
  - pending uploads per device/user
  - conflict queue
  - replication lag
- Shopify:
  - webhook failures
  - reconciliation status
  - inventory push failures
  - fulfillment push failures
- Inventory:
  - held stock
  - expired/expiring lots
  - negative balance alerts
  - unallocated open orders
- Production:
  - open production orders
  - batch yields
  - QC pending release

## Key Tradeoffs

- PowerSync vs custom sync:
  - Choose PowerSync. Custom sync is high-risk and distracts from ERP domain logic.
- Supabase Auth vs Clerk/Auth0:
  - Choose Supabase Auth. Good enough, integrated with Postgres, fewer vendors.
- React/Vite vs Next.js:
  - Choose React/Vite. Offline PWA/local SQLite is client-heavy; SSR is not central.
- Fastify vs NestJS:
  - Choose Fastify. Less ceremony, strong TypeScript support, easy for Codex agents.
- Browser label printing vs direct printer SDK:
  - Choose browser/PDF labels for MVP. Direct printer support waits for hardware facts.

