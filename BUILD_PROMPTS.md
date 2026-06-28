# Mushroom Compadres ERP - Build Prompt Library

Use these prompts in order. Each prompt assumes a Codex coding agent working in a Git repository. Every prompt should load `SPEC.md` and `ARCHITECTURE.md` before coding.

## Build Prompt 1 - Monorepo Foundation

**Goal:** Create the TypeScript monorepo foundation for the ERP.

**Depends on:** None

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Initialize a `pnpm` workspace with `turbo`.
- Create `apps/web`, `apps/api`, `apps/worker`, `packages/db`, `packages/domain`, `packages/ui`, `packages/i18n`, and `packages/shopify`.
- Add shared TypeScript, ESLint, Prettier, Vitest, and Playwright configuration.
- Add `.env.example` with required variables for Supabase, PowerSync, Shopify, Redis, and app URLs.
- Add basic CI scripts: typecheck, lint, test, build.
- Add README with local setup commands.

**Data/Models touched:** None

**APIs/Integrations:** None

**UI/Screens:** None

**Acceptance criteria:**
- `pnpm install`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` run successfully.
- Each package has a minimal exported entry point.
- README documents repo structure and local commands.

**Tests to write:** Minimal smoke tests for package imports.

**Out of scope:** Product UI, database schema, auth, Shopify integration.

## Build Prompt 2 - Database Schema and Migrations

**Goal:** Implement the initial Postgres schema and migration workflow.

**Depends on:** 1

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Configure Drizzle ORM in `packages/db`.
- Add schema tables for organizations, users, roles, locations, products, variants, materials, grow batches, harvests, drying runs, production orders, BOMs, processing batches, lots, inventory items, stock movements, inventory balances projection table, QC records, COA attachments, suppliers, purchase orders, receipts, customers, resellers, price lists, sales orders, order allocations, shipments, Shopify sync events/cursors, CRM interactions, leads, audit events.
- Add enum definitions and constraints aligned with `SPEC.md`.
- Add migration generation and apply scripts.
- Add seed script for one organization, roles, locations, and sample product categories.

**Data/Models touched:** All core MVP entities.

**APIs/Integrations:** Supabase/Postgres connection only.

**UI/Screens:** None

**Acceptance criteria:**
- Migrations create all tables with UUID primary keys, timestamps, and foreign keys.
- Unique constraints exist for lot codes, SKUs where appropriate, Shopify webhook IDs, and client transaction IDs.
- Seed script is idempotent.
- Schema exports typed table objects.

**Tests to write:** Migration integration test against local test Postgres; schema constraint tests for duplicate stock transaction and duplicate webhook ID.

**Out of scope:** API endpoints, UI, sync rules.

## Build Prompt 3 - Domain Schemas and State Machines

**Goal:** Add shared domain validation and lifecycle rules.

**Depends on:** 2

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add Zod schemas for core commands: create lot, create stock movement, transfer stock, start stock count, create grow batch, record harvest, create processing batch, release/hold lot, allocate order line.
- Implement state machines for grow batch, production order, processing batch, QC record, lot, sales order, and shipment.
- Add shared error types for validation, authorization, conflict, idempotency, and external integration errors.
- Add unit conversion helpers for supported units.

**Data/Models touched:** Domain package types for all MVP entities.

**APIs/Integrations:** None

**UI/Screens:** None

**Acceptance criteria:**
- Invalid lifecycle transitions are rejected with typed errors.
- Regulated transitions require actor and reason metadata.
- Zod schemas are exported for API and frontend use.

**Tests to write:** Unit tests for each state machine, command schema, and unit conversion helper.

**Out of scope:** Persistence, API handlers, UI.

## Build Prompt 4 - API Skeleton, Auth Verification, and RBAC

**Goal:** Build the Fastify API shell with Supabase Auth verification and role-based authorization.

**Depends on:** 1, 2, 3

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Create `apps/api` Fastify server with health check and structured logging.
- Verify Supabase JWTs.
- Load the app user, organization, roles, and location-scoped permissions.
- Implement RBAC helpers and route guards.
- Add OpenAPI generation.
- Add audit event helper.

**Data/Models touched:** users, roles, user_roles, organizations, audit_events.

**APIs/Integrations:** Supabase Auth JWT verification.

**UI/Screens:** None

**Acceptance criteria:**
- Authenticated requests expose `request.userContext`.
- Unauthorized, unauthenticated, and wrong-role requests return correct status codes.
- OpenAPI docs include health and sample protected route.
- Audit helper can write events inside a transaction.

**Tests to write:** API integration tests for auth success/failure, role failure, and audit event creation.

**Out of scope:** Login UI, product screens, PowerSync, Shopify.

## Build Prompt 5 - Web App Shell, Theme, Routing, and i18n

**Goal:** Create the installable PWA app shell and base UI system.

**Depends on:** 1

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Build React/Vite app with TanStack Router.
- Add PWA manifest, service worker, offline fallback, and update prompt.
- Add Mushroom Compadres theme tokens with earthy/warm palette and accessible contrast.
- Add responsive layout: mobile bottom navigation, desktop sidebar, top sync/status area.
- Add i18n setup for English and Portuguese with locale-aware dates, numbers, and currency.
- Add shared UI components for buttons, inputs, dialogs, tables, toasts, badges, tabs, and empty states.

**Data/Models touched:** None

**APIs/Integrations:** None, except placeholder auth state.

**UI/Screens:** Login placeholder, dashboard placeholder, offline page, settings locale switch.

**Acceptance criteria:**
- App is installable as a PWA in supported browsers.
- Mobile and desktop layouts are usable.
- Locale switch changes UI strings and number/date formatting.
- Offline fallback appears when app shell is loaded without network.

**Tests to write:** Component tests for UI primitives; Playwright smoke tests for routing, mobile viewport, desktop viewport, and locale switch.

**Out of scope:** Real auth, real data, scanning, inventory workflows.

## Build Prompt 6 - Supabase Auth UI and User Administration

**Goal:** Implement staff login and basic user/role administration.

**Depends on:** 4, 5

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add Supabase Auth client to web app.
- Implement login, logout, session restore, and protected routes.
- Add user profile menu with locale preference.
- Add admin screens for users, roles, and location-scoped role assignment.
- Add API endpoints for listing/updating app users and roles.
- Enforce owner/admin-only access to user administration.

**Data/Models touched:** users, roles, user_roles, locations.

**APIs/Integrations:** Supabase Auth.

**UI/Screens:** Login, user list, user detail/edit roles, profile menu.

**Acceptance criteria:**
- Staff can sign in and sign out.
- Protected routes redirect unauthenticated users.
- Owner/admin can assign roles and location scopes.
- Non-admin users cannot access admin screens or APIs.

**Tests to write:** API authorization tests; UI tests for login flow with mocked Supabase session; Playwright role-access test.

**Out of scope:** Invite emails, SSO, password policy customization.

## Build Prompt 7 - Products, Variants, Materials, and Locations

**Goal:** Build master data management for products, variants, materials, packaging, and locations.

**Depends on:** 2, 4, 5, 6

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add CRUD APIs and UI screens for products, variants, materials, packaging components, and locations.
- Support SKU, barcode, lot tracking, expiry tracking, unit of measure, Shopify mapping fields, localized names/descriptions.
- Add import-ready CSV export format for master data.
- Add validation for duplicate SKUs/barcodes within organization.

**Data/Models touched:** locations, products, product_variants, materials, packaging_components, localized_texts.

**APIs/Integrations:** None external.

**UI/Screens:** Product list/detail, variant editor, material list/detail, location list/detail.

**Acceptance criteria:**
- Admin can create and edit all master data.
- Production/fulfillment users can view but not edit master data unless permitted.
- Variant detail clearly shows lot/expiry tracking and Shopify mapping status.
- Forms work on mobile and desktop.

**Tests to write:** API CRUD tests; validation tests; Playwright master-data create/edit tests.

**Out of scope:** Inventory balances, Shopify product import.

## Build Prompt 8 - Inventory Ledger and Balances

**Goal:** Implement append-only stock movements and derived inventory balances.

**Depends on:** 2, 3, 4, 7

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Implement domain service for stock movements: receipt, adjustment, transfer, consume, produce, allocate, ship, return, hold, release, count correction.
- Maintain `inventory_balances` transactionally from `stock_movements`.
- Add idempotency via `client_transaction_id`.
- Prevent negative available stock unless an admin override reason is provided.
- Add API endpoints for balances, movements, adjustments, transfers, and movement history.
- Add audit events for corrections and overrides.

**Data/Models touched:** inventory_items, lots, stock_movements, inventory_balances, audit_events.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Inventory balance list, item/lot balance detail, movement history, adjustment form, transfer form.

**Acceptance criteria:**
- Balances match movement sums.
- Duplicate `client_transaction_id` does not double-post.
- Transfers create paired from/to effects through one movement transaction.
- Held/rejected lots cannot become available by ordinary adjustment.

**Tests to write:** Unit tests for inventory math; integration tests for movement posting and idempotency; Playwright tests for adjustment and transfer.

**Out of scope:** Offline sync, scanning, production consumption.

## Build Prompt 9 - Lot Management, QC Records, and COA Attachments

**Goal:** Add lot lifecycle, QC release/hold, and COA file handling.

**Depends on:** 4, 5, 7, 8

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add lot create/edit/detail APIs and UI.
- Add QC records linked to lots, grow batches, harvests, and processing batches.
- Add COA upload flow using signed URLs or Supabase Storage client with server authorization.
- Enforce lot release/hold/reject rules.
- Prevent allocation/shipping of held, rejected, expired, or unreleased tracked lots.

**Data/Models touched:** lots, qc_records, coa_attachments, stock_movements, inventory_balances, audit_events.

**APIs/Integrations:** Supabase Storage.

**UI/Screens:** Lot list/detail, QC record panel, COA attachment upload/download, release/hold dialog.

**Acceptance criteria:**
- COAs can be uploaded, listed, opened, and access-controlled.
- QC release changes lot status and writes audit events.
- Held lots appear in inventory but are not available for allocation.
- Expiry date is visible anywhere lot stock is shown.

**Tests to write:** API tests for QC transitions; storage mocking tests; Playwright lot release and COA upload test.

**Out of scope:** Traceability explorer, Shopify sync.

## Build Prompt 10 - Cultivation, Harvest, and Drying Workflows

**Goal:** Build farm production workflows from grow batch through dried harvest lot.

**Depends on:** 3, 4, 5, 8, 9

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add grow batch CRUD and status transitions.
- Add harvest recording linked to grow batches.
- Add drying run recording linked to harvests.
- Create or update lots and stock movements when dried harvest output is accepted.
- Add mobile-first forms optimized for farm staff.
- Add notes and attachments metadata fields, without implementing general attachment UI beyond COAs.

**Data/Models touched:** grow_batches, harvests, drying_runs, lots, stock_movements, inventory_balances.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Grow batch list/detail, harvest form, drying run form, mobile farm dashboard.

**Acceptance criteria:**
- A grow batch can move through planned/inoculated/fruiting/harvested/closed states.
- Harvest and drying outputs create traceable lots and stock movements.
- Yield/loss calculations are displayed.
- Farm staff role can use workflows but cannot release QC unless permitted.

**Tests to write:** State machine unit tests; API integration tests for harvest/drying output; Playwright mobile harvest flow.

**Out of scope:** Extraction/packaging production, offline sync.

## Build Prompt 11 - Processing Batches and Production Orders

**Goal:** Build processing and production workflows that consume input lots and create output lots.

**Depends on:** 3, 4, 7, 8, 9, 10

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add production orders with planned product/quantity/date/location/status.
- Add BOM and BOM line CRUD with versioning.
- Add processing batch workflow for extraction, blending, bottling, packaging, encapsulation, chocolate/food, and powder.
- Consume input lots through stock movements.
- Create output lots through stock movements.
- Record process parameters as structured JSON per batch type.
- Enforce lot and QC rules on inputs.

**Data/Models touched:** production_orders, bill_of_materials, bom_lines, processing_batches, batch_inputs, batch_outputs, lots, stock_movements, inventory_balances.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Production order board/detail, BOM editor, processing batch wizard, input lot picker, output lot creation.

**Acceptance criteria:**
- Production cannot consume unavailable/held/rejected/expired lots.
- Completing a batch atomically consumes inputs and creates outputs.
- Output lots link to the processing batch and production order.
- Yield variance is visible.

**Tests to write:** Unit tests for production state transitions; integration tests for atomic input/output movements; Playwright processing batch wizard test.

**Out of scope:** MRP suggestions, Shopify fulfillment.

## Build Prompt 12 - Traceability Explorer and Recall Reports

**Goal:** Implement backward and forward lot traceability.

**Depends on:** 8, 9, 10, 11

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add traceability query service.
- Backward trace from shipped order line or finished lot to production batch, input lots, harvests, and grow batches.
- Forward trace from grow batch, harvest, material lot, or processing batch to finished lots, allocations, shipments, customers, and resellers.
- Add exportable recall report CSV/PDF-ready JSON.
- Add UI graph/list view that works on mobile and desktop.

**Data/Models touched:** lots, batch_inputs, batch_outputs, grow_batches, harvests, processing_batches, order_allocations, shipments, sales_orders, customers, resellers.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Traceability search, lot graph/detail, recall report view.

**Acceptance criteria:**
- User can search by lot code, SKU, order number, grow batch, or Shopify order number.
- Backward trace shows every required relationship.
- Forward trace shows affected orders/customers for a selected lot/source.
- Held/recalled lots are visually distinct.

**Tests to write:** Unit tests for graph traversal; integration tests with seeded multi-step trace; Playwright trace search test.

**Out of scope:** Actual customer notification workflow.

## Build Prompt 13 - PowerSync Offline Foundation

**Goal:** Add PowerSync local SQLite sync and offline write upload handling.

**Depends on:** 2, 3, 4, 5, 8

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Configure PowerSync client in `apps/web`.
- Configure backend upload endpoint in `apps/api`.
- Define initial sync streams for organization, role, and location-scoped operational data.
- Add local SQLite schema mapping for key operational tables.
- Add sync status UI showing online/offline, pending uploads, last synced, and errors.
- Route offline-capable inventory movement writes through local writes and upload queue.
- Add conflict result handling and display.

**Data/Models touched:** users, roles, locations, products, variants, lots, stock_movements, inventory_balances, conflict records if added.

**APIs/Integrations:** PowerSync service and upload endpoint.

**UI/Screens:** Sync status panel, offline inventory adjustment/transfer forms.

**Acceptance criteria:**
- App loads synced data from local SQLite.
- Inventory movement can be created offline and uploaded on reconnect.
- Duplicate offline upload does not double-post.
- Sync errors are visible to the user and logged server-side.

**Tests to write:** Unit tests for upload command mapping; integration tests for upload endpoint; Playwright offline/reconnect test using browser network controls.

**Out of scope:** Offline production workflows and scanning.

## Build Prompt 14 - Scanning, Labels, and Offline Stock Counts

**Goal:** Add mobile scanning, printable labels, and offline stock count sessions.

**Depends on:** 8, 9, 13

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add scanner component using a reliable JS barcode/QR library with native BarcodeDetector feature detection.
- Add manual code entry fallback.
- Add QR/Data Matrix/Code128 generation for lot, item, and location labels.
- Add printable label templates as PDF or browser-printable HTML.
- Add stock count sessions and lines.
- Support offline count entry and reconnect posting.
- Add conflict handling for overlapping count sessions.

**Data/Models touched:** stock_count_sessions, stock_count_lines, lots, locations, product_variants, inventory_balances, stock_movements.

**APIs/Integrations:** Camera APIs, browser print.

**UI/Screens:** Scan screen, label print screen, stock count session list/detail, mobile count entry.

**Acceptance criteria:**
- Scanning works with QR codes generated by the app.
- Manual entry can complete the same workflow.
- Labels include item, lot, expiry, and human-readable fallback.
- Count sessions can be started offline and synced later.
- Overlapping count conflict is flagged before correction movement posts.

**Tests to write:** Unit tests for label payload encoding/decoding; API tests for count posting; Playwright tests for manual scan fallback and count workflow.

**Out of scope:** Direct thermal printer SDK integration.

## Build Prompt 15 - Shopify App Configuration and Webhook Ingestion

**Goal:** Build the Shopify integration foundation with webhook ingestion and raw event persistence.

**Depends on:** 2, 4, 7

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add Shopify configuration model and environment variables.
- Implement Shopify HMAC verification.
- Implement `POST /api/shopify/webhooks`.
- Persist raw webhook payloads with topic, shop domain, webhook ID, triggered timestamp, status.
- Dedupe by `X-Shopify-Webhook-Id`.
- Enqueue webhook processing jobs.
- Add admin screen for Shopify connection status and recent webhook deliveries.

**Data/Models touched:** shopify_sync_events, shopify_sync_cursors, products, product_variants, locations.

**APIs/Integrations:** Shopify webhooks.

**UI/Screens:** Shopify integration status, webhook event log.

**Acceptance criteria:**
- Invalid HMAC webhook is rejected.
- Duplicate webhook ID is accepted but not processed twice.
- Webhook endpoint responds quickly and processing happens in worker.
- Admin can see recent webhook status and errors.

**Tests to write:** HMAC unit tests; API tests for webhook dedupe; worker enqueue integration test.

**Out of scope:** Order import, inventory push, fulfillment push.

## Build Prompt 16 - Shopify Orders, Customers, and Reconciliation

**Goal:** Pull Shopify orders/customers reliably and map them to ERP sales records.

**Depends on:** 7, 15

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Implement Shopify GraphQL client with cost-aware throttling and retries.
- Implement order/customer mappers into `customers`, `sales_orders`, and `sales_order_lines`.
- Process order/customer webhooks.
- Add scheduled reconciliation by `updated_at` cursor.
- Add manual reconciliation button in admin UI.
- Persist cursor and job results.
- Detect unmapped Shopify variants/locations and surface mapping errors.

**Data/Models touched:** customers, sales_orders, sales_order_lines, shopify_sync_events, shopify_sync_cursors, product_variants, locations.

**APIs/Integrations:** Shopify Admin GraphQL orders/customers queries and bulk operations for initial import.

**UI/Screens:** Shopify order sync dashboard, unmapped items panel, sales order list/detail.

**Acceptance criteria:**
- Shopify order webhook creates or updates a sales order idempotently.
- Reconciliation catches missed/failed webhooks.
- Unmapped variants do not create bad stock allocations; they appear as actionable errors.
- API rate-limit responses are retried safely.

**Tests to write:** Mapper unit tests with Shopify fixtures; worker integration tests; API tests for manual reconciliation; Playwright dashboard test.

**Out of scope:** Inventory push and fulfillment push.

## Build Prompt 17 - Shopify Inventory Push and Fulfillment

**Goal:** Push ERP stock availability and fulfillment status back to Shopify.

**Depends on:** 8, 9, 12, 16

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Compute Shopify-available quantity from released, unexpired, unheld ERP stock by mapped variant/location.
- Push inventory via Shopify `inventorySetQuantities` using compare quantity where available and required idempotency keys.
- Add outbound sync log table if needed.
- Add pick/pack/ship workflow for Shopify sales orders.
- Allocate specific lots to order lines.
- Create shipment record and push fulfillment/tracking to Shopify Fulfillment Order APIs.
- Add reconciliation for Shopify inventory drift.

**Data/Models touched:** inventory_balances, stock_movements, lots, sales_orders, sales_order_lines, order_allocations, shipments, product_variants, locations.

**APIs/Integrations:** Shopify Admin GraphQL inventory and fulfillment APIs.

**UI/Screens:** Shopify fulfillment queue, order pick/pack screen, inventory push status, drift dashboard.

**Acceptance criteria:**
- ERP pushes stock changes to Shopify idempotently.
- Held/unreleased/expired lots are excluded from available quantity.
- Pick/pack flow records lot allocations before fulfillment push.
- Fulfillment push updates local status and handles retries safely.
- Drift dashboard shows Shopify vs ERP quantity differences.

**Tests to write:** Inventory availability unit tests; Shopify client mutation tests with fixtures; worker integration tests; Playwright pick/pack/fulfill flow.

**Out of scope:** Carrier rate shopping, shipping label purchase.

## Build Prompt 18 - Purchasing and Receiving

**Goal:** Add supplier purchase orders and receiving into lot-tracked inventory.

**Depends on:** 7, 8, 9

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add supplier CRUD.
- Add purchase order CRUD with lines for materials, packaging, and variants.
- Add receiving workflow that creates supplier/raw-material lots and receipt stock movements.
- Support supplier lot numbers, expiry dates, COA attachments, and received quantities.
- Add PO status transitions: draft, ordered, partially received, received, cancelled.

**Data/Models touched:** suppliers, purchase_orders, purchase_order_lines, receipts, receipt_lines, lots, stock_movements, inventory_balances, qc_records, coa_attachments.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Supplier list/detail, PO list/detail, receiving screen.

**Acceptance criteria:**
- Receiving a PO line creates lot-tracked inventory.
- Partial receipts are supported.
- Supplier COA can attach to received lot.
- Receipt corrections use movement reversals or adjustments, not history edits.

**Tests to write:** PO state unit tests; receiving integration tests; Playwright receiving flow.

**Out of scope:** Supplier portal, accounting payable, invoice matching.

## Build Prompt 19 - MRP and Production Planning

**Goal:** Add material requirements planning from demand, stock, POs, and production orders.

**Depends on:** 11, 16, 18

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add MRP calculation service.
- Demand sources: open sales orders, open production orders, minimum stock targets.
- Supply sources: released on-hand stock, open purchase orders, planned production orders.
- Explode BOMs into component requirements.
- Generate shortage report.
- Generate suggested purchase orders and production orders as drafts.
- Add planning horizon and location filters.

**Data/Models touched:** bill_of_materials, bom_lines, production_orders, purchase_orders, inventory_balances, sales_orders, sales_order_lines.

**APIs/Integrations:** Internal API only.

**UI/Screens:** MRP dashboard, shortage table, suggested PO/production order review.

**Acceptance criteria:**
- MRP correctly calculates shortages for multi-level BOM inputs in scope.
- User can convert suggestions to draft POs or production orders.
- Held/unreleased/expired stock is excluded from usable supply.
- Results are explainable with demand/supply drilldown.

**Tests to write:** Unit tests for MRP calculations; integration tests with seeded demand/supply/BOMs; Playwright MRP review flow.

**Out of scope:** Forecasting algorithms, automatic supplier ordering.

## Build Prompt 20 - Wholesale, Resellers, B2B Price Lists, and Quotes

**Goal:** Build the wholesale sales foundation without accounting UI.

**Depends on:** 7, 8, 9

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add reseller account CRUD linked to customers.
- Add contacts, addresses, tax ID metadata, payment terms metadata, and status.
- Add B2B price lists and effective-dated price lines.
- Add quote creation and conversion to wholesale sales order.
- Add wholesale order creation with lot allocation and stock reservation.
- Keep invoice/accounting out of scope; store export-ready totals only.

**Data/Models touched:** customers, resellers, b2b_price_lists, b2b_price_list_lines, sales_orders, sales_order_lines, order_allocations, stock_movements.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Reseller list/detail, price list editor, quote editor, wholesale order screen.

**Acceptance criteria:**
- Sales users can create reseller quotes with correct currency/price list.
- Quote conversion creates wholesale sales order.
- Wholesale orders reserve stock and allocate lots using same traceability model as Shopify orders.
- No accounting ledger or invoice UI is created.

**Tests to write:** Price resolution unit tests; API tests for quote conversion; Playwright reseller quote-to-order flow.

**Out of scope:** Payments, invoices, tax filing, reseller portal.

## Build Prompt 21 - CRM Leads and Interactions

**Goal:** Add lightweight CRM for leads, reseller/customer interactions, and follow-ups.

**Depends on:** 6, 20

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add leads CRUD.
- Add CRM interactions linked to leads, customers, or resellers.
- Add follow-up dates and owner assignment.
- Add sales dashboard for upcoming follow-ups and recent interactions.
- Add filters by owner, status, source, and next action date.

**Data/Models touched:** leads, crm_interactions, customers, resellers, users.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Leads list/detail, interaction timeline, sales follow-up dashboard.

**Acceptance criteria:**
- Sales users can log interactions and follow-ups.
- Interactions appear on reseller/customer timelines.
- Follow-up dashboard is role-filtered and date-filterable.
- Non-sales users cannot mutate CRM unless admin.

**Tests to write:** API authorization tests; integration tests for interaction links; Playwright CRM timeline test.

**Out of scope:** Email sync, marketing automation.

## Build Prompt 22 - Offline Production and Fulfillment Hardening

**Goal:** Extend offline support to production, scanning, stock counts, and fulfillment workflows.

**Depends on:** 11, 13, 14, 17

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Make harvest, drying, processing batch step capture, lot scanning, stock count, and pick/pack operations local-first.
- Add local draft handling and upload mapping for each command.
- Add conflict queue UI for production and fulfillment conflicts.
- Add device/user sync diagnostics.
- Add retry/resolution actions.
- Add offline-first E2E coverage.

**Data/Models touched:** grow_batches, harvests, drying_runs, processing_batches, batch_inputs, batch_outputs, stock_movements, stock_count_sessions, order_allocations, shipments, conflict records.

**APIs/Integrations:** PowerSync upload endpoint.

**UI/Screens:** Offline banners, conflict queue, sync diagnostics, offline-capable production/fulfillment screens.

**Acceptance criteria:**
- Core production and fulfillment workflows remain usable with browser network disabled.
- Reconnect uploads pending changes and updates local state.
- Conflicts are visible, actionable, and audited.
- Users are never told stock is synced when uploads are pending.

**Tests to write:** Playwright offline/reconnect tests for harvest, processing, count, and pick/pack; unit tests for conflict classification.

**Out of scope:** Native background sync beyond PWA/browser capabilities.

## Build Prompt 23 - Reporting, Exports, and Compliance Views

**Goal:** Add operational reports and export-ready data without building accounting.

**Depends on:** 12, 17, 18, 19, 20

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Add reports for inventory valuation export, stock aging, expiring lots, held lots, QC pending, production yield, recall trace, Shopify sync health, and wholesale sales export.
- Export CSV and JSON for accounting/BI tools.
- Add filters by date, location, product, lot status, and channel.
- Add saved report presets per user.

**Data/Models touched:** stock_movements, inventory_balances, lots, qc_records, processing_batches, sales_orders, shipments, customers, resellers, shopify_sync_events.

**APIs/Integrations:** CSV/JSON export endpoints.

**UI/Screens:** Reports index, report filters, export actions.

**Acceptance criteria:**
- Reports load within acceptable time on realistic seed data.
- Exports include stable column names and metadata.
- Accounting export includes sales and purchase metadata but no ledger UI.
- Recall report matches traceability explorer results.

**Tests to write:** Report query unit/integration tests; snapshot tests for export schemas; Playwright report filter/export test.

**Out of scope:** General ledger, tax filing, invoice generation.

## Build Prompt 24 - Accessibility, Performance, Observability, and Production Readiness

**Goal:** Polish the ERP for production use and operational reliability.

**Depends on:** 1-23

**Context to load:** Read `SPEC.md` and `ARCHITECTURE.md` in the repo before coding.

**Scope (build this):**
- Run full accessibility pass on forms, dialogs, navigation, tables, scanner fallback, and color contrast.
- Add performance budgets and optimize mobile screens.
- Add structured logs, request IDs, job IDs, and user/action context.
- Add Sentry or equivalent error reporting.
- Add health checks for API, worker, database, Redis, PowerSync, and Shopify connectivity.
- Add backup/restore runbook and production checklist.
- Add user-facing empty/error/loading states across primary workflows.

**Data/Models touched:** audit_events, shopify_sync_events, optional operational health tables.

**APIs/Integrations:** Observability provider, uptime checks.

**UI/Screens:** Global error boundary, sync/error states, health/admin diagnostics.

**Acceptance criteria:**
- Automated accessibility tests pass for primary flows.
- Core mobile workflows meet agreed performance budgets.
- Production checklist exists and is actionable.
- Logs allow tracing a Shopify order from webhook through shipment push.
- Error states are understandable and localized.

**Tests to write:** Axe/accessibility checks; Playwright smoke suite; worker health tests; synthetic Shopify sync trace test.

**Out of scope:** New product modules.

## Post-MVP Expansion Prompts

Prompts 25 onward extend the MVP into a deeper manufacturing/QC ERP inspired by Mar-Kov-style batch manufacturing, electronic batch record, QC, and traceability capabilities, combined with Acumatica-style BOM, routing, engineering change, planning, and product definition workflows. These prompts should be used after Prompts 1-24 are complete and the team has an MVP they can use.

## Build Prompt 25 - Beta Launch, Team Feedback, and Build Intake

**Goal:** Launch the MVP internally and create a structured feedback loop for future builds.

**Depends on:** 1-24

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add an internal beta launch checklist inside the repo and admin UI.
- Add feedback capture in the app for staff: screen, workflow, severity, role, device, optional screenshot, and notes.
- Add feedback triage statuses: new, acknowledged, planned, in progress, done, declined.
- Add feedback categories: bug, missing data, confusing workflow, speed/performance, offline/sync, Shopify, QC, production, inventory, wholesale, reporting.
- Add admin feedback dashboard with filters by role, module, status, priority, and date.
- Add export of feedback to CSV/JSON for planning.
- Add release notes screen visible to logged-in users.

**Data/Models touched:** feedback_items, feedback_attachments, release_notes, users, roles, audit_events.

**APIs/Integrations:** File upload for screenshots; optional Sentry issue linking if observability is already configured.

**UI/Screens:** Feedback button on all primary screens, feedback modal, admin feedback dashboard, release notes screen.

**Acceptance criteria:**
- Any logged-in user can submit feedback from the current screen.
- Admins can triage, prioritize, assign, and close feedback.
- Feedback records include enough context to reproduce issues.
- Release notes can be published per version.

**Tests to write:** API tests for feedback CRUD and permissions; Playwright feedback submission and admin triage tests.

**Out of scope:** Public customer support portal, email ticketing integration.

## Build Prompt 26 - Advanced QC Specifications and Test Libraries

**Goal:** Build a reusable QC specification system for ingredients, WIP, finished goods, suppliers, and production stages.

**Depends on:** 9, 10, 11, 24

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add QC test library with test methods, units, expected ranges, pass/fail rules, and evidence requirements.
- Add QC specification templates by item, product variant, supplier, production stage, and lot type.
- Add versioned QC specs with effective dates and approval status.
- Add automatic QC task generation when lots, harvests, receipts, or production outputs are created.
- Add QC result entry with attachments, comments, retest support, and reviewer approval.
- Add lot release gating based on required QC tests.

**Data/Models touched:** qc_test_methods, qc_specifications, qc_spec_lines, qc_tasks, qc_results, qc_records, lots, suppliers, product_variants, materials.

**APIs/Integrations:** Internal API only.

**UI/Screens:** QC test library, QC spec editor, QC task queue, QC result entry, lot release checklist.

**Acceptance criteria:**
- Admins can define versioned QC specs and required test methods.
- Creating a relevant lot or receipt generates required QC tasks.
- A lot cannot be released until all required tests pass or an authorized override is recorded.
- QC history is auditable by lot, supplier, product, and batch.

**Tests to write:** Unit tests for QC pass/fail rules; integration tests for task generation and release gating; Playwright QC task completion test.

**Out of scope:** Direct lab instrument integration, automated COA generation.

## Build Prompt 27 - Electronic Batch Records and E-Signatures

**Goal:** Add electronic batch records with step-by-step execution, sign-offs, and tamper-evident audit history.

**Depends on:** 11, 22, 26

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add electronic batch record templates linked to BOMs, processing batch types, and production orders.
- Support step types: instruction, scan material, weigh material, enter value, attach evidence, QC check, supervisor sign-off, and conditional branch.
- Add execution records for each production batch.
- Require operator acknowledgement and timestamp for each critical step.
- Add e-signature prompts for critical steps using re-authentication or secure confirmation.
- Lock completed batch records from editing; corrections require deviation or amendment.
- Add printable/exportable batch record packet.

**Data/Models touched:** ebr_templates, ebr_template_steps, ebr_executions, ebr_step_results, e_signatures, processing_batches, production_orders, batch_inputs, batch_outputs, audit_events.

**APIs/Integrations:** Auth re-verification for signatures; file/PDF export if PDF tooling exists.

**UI/Screens:** EBR template builder, batch execution screen, mobile shop-floor stepper, batch record review/export.

**Acceptance criteria:**
- Operators can execute a batch record step by step on mobile/tablet.
- Required scans, values, evidence, and signatures block progression until completed.
- Completed records are immutable except through controlled amendments.
- Exported batch packet includes steps, users, timestamps, inputs, outputs, QC checks, and deviations.

**Tests to write:** Unit tests for EBR step validation; integration tests for locked/amended records; Playwright mobile EBR execution flow.

**Out of scope:** 21 CFR Part 11 legal certification, PLC/scale integrations.

## Build Prompt 28 - Deviations, CAPA, Holds, and Quality Events

**Goal:** Add formal quality event management for deviations, investigations, CAPA, and controlled holds/releases.

**Depends on:** 9, 26, 27

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add quality event records for deviations, nonconformances, complaints, out-of-spec results, environmental issues, and recall investigations.
- Add CAPA records with root cause, corrective actions, preventive actions, owners, due dates, effectiveness checks, and closure approval.
- Link quality events to lots, batches, suppliers, customers, equipment, orders, and QC results.
- Add automatic lot hold workflows from failed QC, deviation severity, or complaint investigation.
- Add approval workflow for hold, release, reject, rework, and dispose decisions.
- Add quality event dashboard.

**Data/Models touched:** quality_events, capa_records, capa_actions, lot_holds, qc_results, lots, processing_batches, suppliers, customers, audit_events.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Quality event list/detail, CAPA board, hold/release approval screen, quality dashboard.

**Acceptance criteria:**
- Failed required QC can automatically create a quality event and hold affected stock.
- CAPA actions have owners, due dates, status, and closure approval.
- Held lots remain blocked from allocation and shipment.
- All decisions are audited with actor, timestamp, reason, and evidence.

**Tests to write:** Unit tests for hold/release rules; integration tests for QC failure to quality event; Playwright CAPA lifecycle test.

**Out of scope:** Customer-facing complaint portal, regulatory submission workflows.

## Build Prompt 29 - Automated Mock Recall and Traceability Audit Packets

**Goal:** Build a fast mock recall workflow with forward/backward trace, impact scope, and audit-ready exports.

**Depends on:** 12, 17, 23, 28

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add mock recall runs with scope, initiating reason, target lot/batch/material, owner, and status.
- Generate affected finished lots, orders, customers, resellers, locations, open stock, shipped stock, and related QC/COA records.
- Add timed recall drill mode that records start, completion, user actions, and gaps.
- Add contact/export list for affected customers and resellers.
- Add audit packet export including trace graph, stock status, shipments, QC, COAs, deviations, and decisions.
- Add recall dashboard with open actions and unresolved stock.

**Data/Models touched:** mock_recall_runs, mock_recall_findings, recall_actions, lots, stock_movements, order_allocations, shipments, customers, resellers, qc_records, coa_attachments, quality_events.

**APIs/Integrations:** CSV/JSON/PDF export.

**UI/Screens:** Mock recall launcher, recall run dashboard, trace impact map, audit packet export.

**Acceptance criteria:**
- A user can run a mock recall from any lot, grow batch, harvest, material lot, or processing batch.
- The system identifies affected shipped and unshipped inventory.
- Exported packet is complete enough for internal audit review.
- Drill mode records elapsed time and unresolved gaps.

**Tests to write:** Graph traversal tests for multi-generation lots; integration tests for recall packet data; Playwright mock recall run test.

**Out of scope:** Automatic customer notification sending, legal recall management.

## Build Prompt 30 - Formulation Vault, Advanced BOMs, and Revision Control

**Goal:** Upgrade BOMs into a controlled formulation vault with revisions, alternates, yield targets, and approvals.

**Depends on:** 11, 19, 26

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add formula/BOM families with multiple approved, draft, obsolete, and experimental revisions.
- Add component line types: ingredient, extract, WIP, packaging, labor placeholder, overhead placeholder, instruction, and yield loss.
- Add alternate components with substitution rules, allergen/dietary flags, and approval requirements.
- Add formula scaling by target output quantity and unit conversions.
- Add potency/active compound target fields where relevant for mushroom formulations.
- Add approval workflow for formula release.
- Add compare view between revisions.

**Data/Models touched:** formula_families, formula_revisions, formula_lines, formula_alternates, formula_approvals, bill_of_materials, bom_lines, materials, product_variants, audit_events.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Formulation vault, formula editor, revision compare, approval workflow, scale calculator.

**Acceptance criteria:**
- Users can create draft revisions without changing the active production formula.
- Only approved formula revisions can be used for production orders.
- Formula scaling produces correct component quantities and expected yield.
- Revision compare clearly shows added, removed, and changed lines.

**Tests to write:** Unit tests for scaling/substitution logic; integration tests for approval gates; Playwright formula revision and approval flow.

**Out of scope:** CAD/PLM connectors, accounting cost posting.

## Build Prompt 31 - Engineering Change Control for Formulas and Production Definitions

**Goal:** Add controlled change requests for formulas, BOMs, routings, QC specs, labels, and product master data.

**Depends on:** 26, 30

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add change request records with type, reason, affected entities, risk level, proposed effective date, owner, reviewers, and status.
- Support approval workflow with required reviewers by category.
- Add impact analysis: open production orders, open POs, existing lots, labels, QC specs, Shopify SKUs, and pending wholesale quotes.
- Apply approved changes atomically to create new revisions or update allowed master data.
- Prevent production use of unapproved changes.
- Add change history and audit trail.

**Data/Models touched:** change_requests, change_request_items, change_approvals, formula_revisions, qc_specifications, product_variants, labels, production_orders, audit_events.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Change request list/detail, impact analysis view, approval screen, change history timeline.

**Acceptance criteria:**
- A formula or QC spec change can be proposed, reviewed, approved, and applied.
- Impact analysis shows affected active work before approval.
- Rejected changes do not alter production definitions.
- All approval decisions are audited.

**Tests to write:** State machine tests for change requests; integration tests for applying approved changes; Playwright change approval test.

**Out of scope:** External e-signature providers, PLM integrations.

## Build Prompt 32 - Routings, Work Centers, Labor, and Shop Floor Kiosk

**Goal:** Add Acumatica-style routings and shop-floor execution visibility for production operations.

**Depends on:** 11, 22, 27, 30

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add work centers, equipment resources, labor roles, and operation codes.
- Add routing templates with ordered operations, setup time, run time, queue time, move time, labor role, equipment requirement, and linked EBR steps.
- Attach routings to formula revisions/product variants.
- Add shop floor kiosk view for operators to start, pause, complete, and record output/scrap/rework for operations.
- Capture labor time and machine time.
- Add production progress dashboard by work center.

**Data/Models touched:** work_centers, equipment, labor_roles, routing_templates, routing_operations, production_operation_runs, labor_time_entries, machine_time_entries, production_orders, ebr_executions.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Work center admin, routing editor, shop floor kiosk, production progress dashboard.

**Acceptance criteria:**
- Production orders can include routings with scheduled operations.
- Operators can record operation start/stop and output from a kiosk-friendly screen.
- Labor and machine time are captured for actual costing and throughput analysis.
- Routing progress updates production order status.

**Tests to write:** Unit tests for operation status transitions; integration tests for time capture; Playwright kiosk operation flow.

**Out of scope:** Advanced finite scheduling, payroll integration.

## Build Prompt 33 - Product Configurator, SKU Builder, and Label Rule Engine

**Goal:** Add a controlled product/SKU creation workflow for variants, bundles, packaging formats, and labels.

**Depends on:** 7, 14, 20, 30, 31

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add SKU builder rules for product family, mushroom species/blend, format, strength, size, pack count, market, language, and channel.
- Add configurable product templates that generate product variants, default formulas, label requirements, QC specs, and Shopify mapping placeholders.
- Add product configurator wizard for new tinctures, capsules, powders, coffee/cacao, chocolate bars, bundles, and merch.
- Add label rule engine for required label fields by market/language/channel.
- Add validation against duplicate SKUs, missing BOMs, missing QC specs, missing label data, and missing Shopify fields.

**Data/Models touched:** sku_rules, product_templates, product_configurations, product_variants, formula_revisions, qc_specifications, labels, shopify mapping fields.

**APIs/Integrations:** Optional Shopify draft product/export later; internal only for this prompt.

**UI/Screens:** SKU rule settings, product configurator wizard, generated variant review, label rule checklist.

**Acceptance criteria:**
- Admin can generate a complete draft product variant package from a template.
- SKU codes are deterministic, unique, and editable only with admin override.
- Generated variants show readiness gaps before launch.
- Label requirements are locale/market aware.

**Tests to write:** Unit tests for SKU generation and duplicate detection; integration tests for product template generation; Playwright configurator flow.

**Out of scope:** Automatic Shopify product creation, legal label approval.

## Build Prompt 34 - Standard Cost Rollups and Batch Actual Costing

**Goal:** Add manufacturing cost visibility without building a general ledger.

**Depends on:** 18, 19, 30, 32

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add standard cost records for materials, packaging, labor rates, machine rates, overhead placeholders, and freight/landed cost metadata.
- Add formula/BOM cost rollup by revision.
- Add production order estimated cost.
- Add batch actual cost from consumed lots, labor time, machine time, scrap, rework, and output quantity.
- Add variance report: standard vs estimated vs actual.
- Add margin simulator using B2B/retail price lists and batch cost.
- Export cost data for external accounting tools.

**Data/Models touched:** standard_costs, cost_rollups, production_order_costs, batch_actual_costs, cost_variances, formula_revisions, stock_movements, purchase_order_lines, production_operation_runs.

**APIs/Integrations:** CSV/JSON export only.

**UI/Screens:** Cost settings, formula cost rollup, production cost detail, variance report, margin simulator.

**Acceptance criteria:**
- Formula revision shows standard cost rollup by component/category.
- Completed batch shows actual cost per output unit.
- Variance report explains material, labor, machine, yield, and scrap variance.
- No general ledger, journal entries, invoices, or tax filing UI is created.

**Tests to write:** Unit tests for cost rollups and variance math; integration tests for batch actual costing; Playwright cost report flow.

**Out of scope:** Accounting postings, inventory valuation ledger, tax.

## Build Prompt 35 - Advanced MRP, APS, and Capable-to-Promise

**Goal:** Improve planning with time-phased supply/demand, capacity constraints, and order promise dates.

**Depends on:** 19, 32, 34

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add time-phased MRP buckets by day/week and location.
- Add lead times for suppliers, materials, production operations, transfers, and QC release.
- Add capacity calendars for work centers and equipment.
- Add finite-capacity planning suggestions for production order operations.
- Add capable-to-promise calculation for sales/wholesale orders based on stock, production plans, PO receipts, QC gates, and capacity.
- Add expedite/late risk alerts.
- Add planning scenario snapshots.

**Data/Models touched:** planning_calendars, work_center_capacity, supplier_lead_times, item_lead_times, mrp_snapshots, mrp_bucket_lines, production_orders, purchase_orders, sales_orders.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Planning calendar, MRP time-phased view, capacity load chart, capable-to-promise panel, scenario comparison.

**Acceptance criteria:**
- Planner can see shortages by date, not only total quantity.
- Capacity constraints flag overloaded work centers.
- Sales/wholesale order detail can show a promise date explanation.
- Scenario snapshots can be compared without altering live orders.

**Tests to write:** Unit tests for time-phased MRP and CTP; integration tests with capacity constraints; Playwright planning scenario flow.

**Out of scope:** Fully automated scheduling optimizer, accounting commitments.

## Build Prompt 36 - Equipment, Calibration, Maintenance, and Scale Readiness

**Goal:** Add equipment management and prepare for future scale/device integrations.

**Depends on:** 27, 32

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add equipment records for scales, dehydrators, extraction equipment, bottling tools, packaging tools, refrigerators/freezers, and printers.
- Add calibration schedules, maintenance schedules, service records, and equipment status.
- Block use of equipment in EBR/routings if calibration is expired or status is unavailable.
- Add manual weigh capture fields with tolerance checks.
- Add integration abstraction for future scale connections, but implement only manual/mock adapter now.
- Add equipment dashboard and due/overdue alerts.

**Data/Models touched:** equipment, equipment_calibrations, equipment_maintenance, equipment_events, ebr_step_results, routing_operations, quality_events.

**APIs/Integrations:** Mock/manual scale adapter only.

**UI/Screens:** Equipment list/detail, calibration calendar, maintenance log, weigh step capture, equipment alerts.

**Acceptance criteria:**
- Equipment can be assigned to routing operations and EBR steps.
- Expired calibration blocks critical weigh/production steps unless admin override is recorded.
- Manual weigh entry validates target, tolerance, unit, actor, and timestamp.
- Future hardware adapters can be added without changing EBR domain logic.

**Tests to write:** Unit tests for calibration gating and tolerance checks; integration tests for blocked EBR step; Playwright equipment calibration flow.

**Out of scope:** Real scale, PLC, or printer hardware integration.

## Build Prompt 37 - Supplier Quality, Approved Vendor Lists, and Incoming Inspection

**Goal:** Add supplier qualification and incoming quality controls for raw materials and packaging.

**Depends on:** 18, 26, 28

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add approved vendor list records by material/component and supplier.
- Add supplier qualification statuses, documents, expiry dates, and review cadence.
- Add incoming inspection plans linked to supplier, material, and risk level.
- Add supplier scorecard metrics: on-time delivery, QC pass rate, deviations, responsiveness, and document completeness.
- Gate purchase order approval and receiving release based on supplier/material approval status.
- Add supplier quality dashboard.

**Data/Models touched:** supplier_approvals, supplier_documents, incoming_inspection_plans, supplier_scorecards, suppliers, materials, purchase_orders, receipts, qc_tasks, quality_events.

**APIs/Integrations:** File upload for supplier documents.

**UI/Screens:** Approved vendor list, supplier qualification detail, incoming inspection queue, supplier scorecard.

**Acceptance criteria:**
- Unapproved suppliers/material combinations are flagged before purchasing.
- Receiving can generate incoming QC tasks based on risk/spec rules.
- Supplier documents show expiry and renewal alerts.
- Supplier scorecard updates from receipts and QC outcomes.

**Tests to write:** Unit tests for supplier approval gates; integration tests for receipt inspection generation; Playwright supplier qualification flow.

**Out of scope:** Supplier portal, EDI purchasing.

## Build Prompt 38 - COA Generation, Finished Lot Release Packets, and Customer Documents

**Goal:** Generate controlled customer-ready quality documents from approved QC and batch data.

**Depends on:** 26, 27, 29

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add COA template builder for finished goods and raw materials.
- Generate COAs from approved QC results, lot metadata, product data, manufacturing date, expiry, and authorized signer.
- Add finished lot release packet that includes COA, batch record summary, deviations, and traceability summary.
- Add document versioning, approval, and watermarking for draft/final/void.
- Add customer document download from sales order/fulfillment views.
- Add audit trail for document generation and download.

**Data/Models touched:** document_templates, generated_documents, document_approvals, qc_results, qc_records, lots, ebr_executions, sales_orders, shipments, audit_events.

**APIs/Integrations:** PDF generation, file storage.

**UI/Screens:** COA template builder, generated document list, lot release packet, sales order documents panel.

**Acceptance criteria:**
- Final COAs can only be generated from approved QC data.
- Voiding or regenerating a document preserves history.
- Lot release packet is exportable and linked from the lot.
- Customer-facing documents do not expose internal-only notes unless explicitly configured.

**Tests to write:** Template rendering tests; integration tests for approval gates; Playwright COA generation and download test.

**Out of scope:** Direct email sending to customers, legal certification of document templates.

## Build Prompt 39 - Master Data Onboarding: SKUs, BOMs, Inputs, and Import Validation

**Goal:** Build the tools needed to create and validate all real Mushroom Compadres SKUs, BOMs, formulas, suppliers, and production inputs.

**Depends on:** 30, 31, 33, 37

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and any provided Mushroom Compadres product/input spreadsheets before coding.

**Scope (build this):**
- Add import templates for products, variants/SKUs, formulas/BOMs, materials, packaging components, suppliers, QC specs, price lists, locations, and Shopify mappings.
- Add import preview with validation errors, warnings, duplicate detection, unit normalization, and missing relationship checks.
- Add staged import batches with approve/apply/rollback lifecycle.
- Add readiness dashboard for each SKU: product data, formula, routing, QC spec, label data, supplier/material links, Shopify mapping, price list, and inventory status.
- Add admin tools for bulk editing common fields.
- Add sample import files in `/docs/import-templates`.

**Data/Models touched:** product_variants, products, formula_revisions, formula_lines, materials, packaging_components, suppliers, supplier_approvals, qc_specifications, labels, b2b_price_lists, shopify mapping fields, import_batches.

**APIs/Integrations:** CSV/XLSX import parsing; no live external integrations.

**UI/Screens:** Import center, import preview, validation issue list, staged import detail, SKU readiness dashboard, bulk edit tools.

**Acceptance criteria:**
- Admin can upload a spreadsheet and preview changes before applying.
- Invalid rows do not partially corrupt master data.
- Applied imports are auditable and can be rolled back when safe.
- SKU readiness dashboard shows what is missing before launch.
- Templates cover the data needed for Codex/user-assisted SKU and BOM creation.

**Tests to write:** Parser unit tests; validation integration tests; rollback tests; Playwright import preview/apply flow.

**Out of scope:** Automatically inventing real SKUs/BOMs without user-provided product facts.

## Build Prompt 40 - Operational Dashboards and Management-by-Exception Alerts

**Goal:** Add role-based dashboards and alerts that surface exceptions instead of forcing users to search.

**Depends on:** 23, 25, 28, 35, 37, 39

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, and `BUILD_PROMPTS.md` in the repo before coding.

**Scope (build this):**
- Add dashboard widgets by role: owner/admin, production, QC, packing/fulfillment, sales/wholesale, purchasing.
- Add alert rules for late production, QC overdue, expiring lots, blocked Shopify sync, low stock, supplier document expiry, open CAPA due, overloaded work center, and SKU readiness gaps.
- Add user-configurable alert subscriptions and digest preferences.
- Add alert acknowledgement and snooze.
- Add drill-down links from alerts to source records.
- Add dashboard performance caching.

**Data/Models touched:** dashboard_widgets, alert_rules, alert_events, alert_subscriptions, users, feedback_items, production_orders, qc_tasks, lots, shopify_sync_events, mrp_snapshots.

**APIs/Integrations:** Optional email notification provider later; in-app alerts only for this prompt.

**UI/Screens:** Role dashboards, alert center, alert rule settings, dashboard widget settings.

**Acceptance criteria:**
- Each role lands on a dashboard relevant to their work.
- Alerts link directly to the record needing action.
- Users can acknowledge and snooze alerts.
- Alert generation is tested and does not create duplicates.

**Tests to write:** Unit tests for alert rules; integration tests for alert dedupe; Playwright dashboard and alert workflow.

**Out of scope:** SMS/email/push notification delivery.

## Build Prompt 41 - Team Feedback to Roadmap Automation

**Goal:** Turn internal feedback into a prioritized build roadmap for continuous improvement after launch.

**Depends on:** 25, 40

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current feedback records before coding.

**Scope (build this):**
- Add feedback clustering by module, workflow, role, and severity.
- Add product backlog records linked to feedback items.
- Add scoring fields: user impact, frequency, compliance risk, revenue impact, effort estimate, dependency, and priority.
- Add roadmap views by now/next/later and module.
- Add release planning board that links backlog items to release notes.
- Add export for Codex build planning prompts.

**Data/Models touched:** feedback_items, backlog_items, backlog_feedback_links, roadmap_releases, release_notes, users.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Feedback insights dashboard, backlog board, roadmap view, release planning screen, Codex prompt export.

**Acceptance criteria:**
- Admins can convert feedback into backlog items.
- Multiple feedback items can link to one backlog item.
- Roadmap priority is visible and explainable.
- Release notes can be generated from completed backlog items.

**Tests to write:** Unit tests for scoring calculations; API tests for feedback-to-backlog links; Playwright roadmap planning flow.

**Out of scope:** Full project management suite, external Jira/Linear integration.

## Build Prompt 42 - Acumatica-Style Access Rights and Permission Sets

**Goal:** Replace simple role-code checks with a robust ERP-grade permission system that controls what every user can see, use, manage, approve, export, and override.

**Depends on:** 6, 25, 31, 37, 40

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and `docs/research/acumatica-mar-kov-bom-notes.md` before coding.

**Scope (build this):**
- Add a permission catalog with modules, screens, records, actions, field groups, and controlled workflow actions.
- Add permission sets that can be assigned to roles and users, with deny/view/use/manage/approve/export/admin levels.
- Support row/location scoping like the current role assignments, plus record scoping for supplier, work center, product family, item class, and document category where useful.
- Add field-level controls for sensitive fields such as costs, supplier terms, Shopify settings, formula percentages, QC disposition notes, customer pricing, and admin override reasons.
- Add route guards and domain authorization helpers that check permission codes, location scope, and action severity before writes.
- Add an admin Permission Matrix screen inspired by ERP access rights screens: module tree, role/user columns, effective access preview, search/filter, changed-only view, and permission conflict warnings.
- Add a User Access Preview that explains why a user can or cannot perform a selected action.
- Audit permission changes and high-risk permission use.

**Data/Models touched:** users, roles, user_roles, locations, audit_events, plus new permission_catalog, permission_sets, role_permission_sets, user_permission_overrides, field_permission_rules, access_scope_rules.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Permission matrix, user access preview, role permission editor, permission change history, denied-action explanation modal.

**Acceptance criteria:**
- A non-admin user cannot open routes, call APIs, or perform writes outside assigned permissions and location scope.
- A permission denial returns a clear machine-readable code and a plain-language reason for the UI.
- Owner/admin can preview effective permissions for any user before saving changes.
- Field-level hidden/read-only behavior is enforced in UI and API serialization, not only CSS.
- All permission changes and controlled approvals are audited with before/after JSON.

**Tests to write:** Unit tests for permission resolution; API tests for each access level; integration tests for field-level redaction; Playwright tests for permission matrix editing and denied-action explanations.

**Out of scope:** External identity provider admin consoles, paid SSO, payroll permissions, or accounting ledger permissions.

## Build Prompt 43 - Approachable ERP Workspace, Color Coding, and Pinning

**Goal:** Keep the platform powerful like Acumatica and Mar-Kov while making day-to-day screens easier to read, personalize, and navigate.

**Depends on:** 5, 25, 40, 42

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and `docs/research/acumatica-mar-kov-bom-notes.md` before coding.

**Scope (build this):**
- Add user preferences for pinned screens, pinned records, favorite reports, saved filters, dashboard widget order, compact/comfortable density, and color coding.
- Add role-aware navigation that hides inaccessible modules but allows admins to preview another role's workspace.
- Add color tags for lots, suppliers, purchase orders, production orders, QC tasks, alerts, item classes, and workflow statuses.
- Add saved views for high-use grids with filters, columns, sorting, grouping, and color rules.
- Add quick actions from pinned cards: receive PO, create BOM, create supplier, run MRP, start QC task, generate production order, and open traceability.
- Add UI affordances that stay approachable: concise page titles, consistent tabs, compact tables, clear empty states, no marketing-style hero screens in app workflows.
- Add accessibility checks for contrast and keyboard navigation across custom color rules.

**Data/Models touched:** user_preferences, pinned_items, saved_views, saved_view_columns, color_rules, dashboard_widgets, alert_subscriptions, audit_events.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Preference panel, pinned workspace, saved view editor, color rule editor, role workspace preview.

**Acceptance criteria:**
- Users can pin/unpin modules, records, and reports without affecting other users.
- Color rules are visible on list rows and detail headers while maintaining accessible contrast.
- Saved views preserve filters and columns per user and can be shared by admins with selected roles.
- Navigation only shows actions the current user can access unless admin preview is enabled.
- Mobile and desktop layouts remain readable with long item names, lot numbers, and supplier names.

**Tests to write:** Unit tests for preference merging and color contrast helpers; API tests for saved views and pins; Playwright tests for pinning, saved views, color rules, and role workspace preview.

**Out of scope:** Full no-code page builder, custom SQL reports, or external BI embedding.

## Build Prompt 44 - Guided Workflow Diagrams and Clickthrough Training

**Goal:** Create workflow diagrams and guided clickthroughs that show users exactly how to complete common ERP tasks from start to finish.

**Depends on:** 7, 11, 18, 30, 32, 37, 42, 43

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current route/component files for BOM, suppliers, purchasing, production, receiving, QC, and MRP before coding.

**Scope (build this):**
- Add a workflow guide model with workflow id, role targets, prerequisites, steps, route targets, UI selectors, screenshots/diagram nodes, expected result, and failure/help text.
- Add guided clickthroughs for creating a new BOM, creating a supplier, creating a supplier approval, creating a purchase order, receiving materials, quarantining materials, completing incoming QC, releasing received inventory, creating a production order, and completing production.
- Add diagram rendering for each workflow with nodes for user actions, system validations, approvals, QC gates, inventory movements, and audit records.
- Add "show me" mode that highlights the next UI element without modifying data until the user confirms.
- Add "practice mode" seeded with demo data and safe transaction rollback.
- Add exports for workflow diagrams as Mermaid markdown and PDF-ready JSON.
- Gate guide availability by permissions so users only see workflows they can perform or learn.

**Data/Models touched:** workflow_guides, workflow_steps, workflow_runs, workflow_run_events, pinned_items, audit_events.

**APIs/Integrations:** Internal API only; optional PDF export through existing document/PDF tooling if present.

**UI/Screens:** Workflow library, workflow diagram viewer, guided overlay, practice-mode banner, workflow run history.

**Acceptance criteria:**
- A user can follow a guided clickthrough to create a BOM, supplier, PO, receipt, QC release, and production order.
- Diagrams show the exact route/action sequence plus system checks and approval gates.
- Practice mode never changes live records.
- Guides respect permissions and show a clear reason when a step requires a different role.
- Mermaid export renders valid diagrams for at least the major workflows.

**Tests to write:** Unit tests for guide validation and Mermaid generation; API tests for workflow run lifecycle; Playwright tests for guided BOM, supplier, PO, receiving/quarantine, and production-order clickthroughs.

**Out of scope:** Screen-recording video generation, LMS integrations, or AI-generated guides from arbitrary clicks.

## Build Prompt 45 - Receiving, Quarantine, Incoming QC, and Inventory Release

**Goal:** Build a complete material receiving workflow where purchase order receipts can be accepted directly or quarantined until QA/QC releases them into available inventory.

**Depends on:** 8, 9, 18, 26, 37, 42

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, `docs/research/acumatica-mar-kov-bom-notes.md`, and the current purchasing, inventory, QC, quality, and supplier quality modules before coding.

**Scope (build this):**
- Add receipt header fields for bill of lading/shipping number, carrier, packing slip number, received-by user, receiving notes, and supplier document references.
- Add receipt line fields for supplier lot number, internal lot number, expiry date, manufacture date if known, container count, received quantity, damaged quantity, accepted quantity, quarantined quantity, rejected quantity, and disposition reason.
- Allow each line to be marked as accepted, quarantine pending QC, rejected at dock, or partial accept/partial quarantine.
- For accepted quantities, create lot records and receipt stock movements into available inventory only when supplier/material gates allow it.
- For quarantined quantities, create lot records, hold movements, active lot holds, and incoming QC tasks; do not increase available inventory until QC release.
- Require QC users or approved approvers to release, reject, rework, or dispose quarantined materials, with evidence and reason captured.
- Link receipt, PO, supplier, supplier lot, BOL/shipping number, QC tasks, COA, stock movements, inventory balance, and audit records for traceability.
- Add receiving labels that include item, lot, supplier lot, expiry, PO, receipt, and quarantine/release status.
- Add dashboard alerts for overdue incoming QC, quarantined stock aging, missing COA, missing expiry, and receipt quantity mismatch.

**Data/Models touched:** receipts, receipt_lines, lots, lot_holds, stock_movements, inventory_balances, purchase_orders, purchase_order_lines, qc_tasks, qc_results, coa_attachments, supplier_approvals, supplier_documents, quality_events, audit_events, labels.

**APIs/Integrations:** Internal API only; file upload for COAs and supplier documents.

**UI/Screens:** Receiving workspace, receipt detail, quarantine queue, incoming QC task detail, material release dialog, receiving labels, receipt correction/audit panel.

**Acceptance criteria:**
- Receiving can capture expiration dates, lot numbers, supplier name, BOL/shipping number, and PO number.
- Accepted material increases available inventory; quarantined material increases held inventory only.
- QC release moves held quantity to available inventory and records the approver, evidence, and reason.
- Rejected/disposed material never becomes available inventory and remains traceable to the PO and receipt.
- Partial receipts and partial quarantine are supported without exceeding ordered quantity.
- All controlled transitions are permission checked and audited.

**Tests to write:** Domain tests for receipt disposition math; API tests for accepted/quarantined/rejected receiving; inventory balance tests for held-to-available release; QC release/reject tests; Playwright tests for receiving a PO, quarantining a food item, completing QC, and verifying inventory updates.

**Out of scope:** EDI ASN import, barcode scale hardware, accounting voucher creation, supplier portal acknowledgements.

## Build Prompt 46 - ERP Configuration Framework, Document Types, and Numbering

**Goal:** Add an Acumatica-style configuration layer so the platform can define document types, numbering, reason codes, attributes, entry defaults, and required fields without hardcoding every workflow variation.

**Depends on:** 42, 43, 45

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and `docs/research/acumatica-mar-kov-bom-notes.md` before coding.

**Scope (build this):**
- Add configurable document/entry types for purchase orders, receipts, production orders, processing batches, QC tasks, quality events, stock movements, change requests, and sales/wholesale orders.
- Add numbering sequences by organization, document type, year/month, location, and optional prefix.
- Add reason code catalogs for receipt dispositions, inventory adjustments, holds, releases, rejects, rework, scrap, returns, cycle counts, and admin overrides.
- Add dynamic attributes/custom fields by item class, supplier class, product family, lot type, document type, and QC spec.
- Add field behavior rules: visible, hidden, read-only, required, default value, validation expression, and permission-gated visibility.
- Add admin screens for document types, numbering sequences, reason codes, attribute sets, and required-field rules.
- Add validation helpers that operational forms can call before save.

**Data/Models touched:** document_types, numbering_sequences, reason_codes, attribute_definitions, attribute_sets, attribute_values, field_behavior_rules, audit_events.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Configuration dashboard, document type editor, numbering sequence editor, reason code editor, attribute set editor, field behavior preview.

**Acceptance criteria:**
- Admin can configure a new receipt type or production order type without code changes.
- Generated document numbers are unique, predictable, and scoped by configured sequence.
- Required attributes are enforced by API and UI.
- Field behavior rules can make fields required or read-only by workflow state and permission.
- All configuration changes are audited.

**Tests to write:** Unit tests for numbering generation and field-rule resolution; API tests for configuration CRUD and validation; Playwright tests for creating a document type, assigning attributes, and using the configured defaults in an operational form.

**Out of scope:** Full low-code app builder, custom SQL execution, or arbitrary user-authored JavaScript rules.

## Build Prompt 47 - Workflow Engine, States, Actions, Dialogs, and Approval Maps

**Goal:** Add a reusable workflow engine inspired by Acumatica workflows so records can define allowed states, actions, transitions, approvals, dialogs, and field behavior.

**Depends on:** 31, 42, 46

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and the current state-machine modules before coding.

**Scope (build this):**
- Add workflow definitions for document types and controlled records.
- Support states, actions, transitions, guard conditions, entry actions, exit actions, and transition side effects.
- Add action dialogs that collect required reason/evidence fields before a transition.
- Add approval maps by role, permission, supplier risk, item class, amount threshold, QC severity, change type, and location.
- Add escalation rules for overdue approvals and blocked controlled actions.
- Add workflow visualization with state/action diagrams.
- Migrate existing hardcoded state transitions to workflow definitions where practical while preserving domain safety checks.

**Data/Models touched:** workflow_definitions, workflow_states, workflow_actions, workflow_transitions, workflow_conditions, workflow_action_dialogs, approval_maps, approval_steps, approval_requests, audit_events.

**APIs/Integrations:** Internal API only; in-app alert integration for overdue approvals.

**UI/Screens:** Workflow designer, approval map editor, approval inbox, state diagram viewer, transition audit timeline.

**Acceptance criteria:**
- Production orders, receipts, QC tasks, holds, change requests, and supplier approvals can be driven by workflow definitions.
- Users only see actions that are valid for the current state and their permissions.
- Required action dialogs collect reason/evidence before controlled transitions.
- Approval requests are created, approved/rejected, escalated, and audited.
- Workflow diagrams match the configured states and transitions.

**Tests to write:** Unit tests for workflow resolution and transition guards; integration tests for approval-map routing; Playwright tests for approval inbox and state/action availability.

**Out of scope:** BPMN import/export, external approval systems, legal e-signature certification.

## Build Prompt 48 - Advanced BOM Operations, Phantom Assemblies, By-Products, Backflushing, and Effectivity

**Goal:** Deepen BOMs to match Acumatica-style manufacturing definitions where operations, materials, tools, machines, overhead, by-products, scrap, and effectivity rules drive production planning and execution.

**Depends on:** 30, 31, 32, 34, 46, 47

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and `docs/research/acumatica-mar-kov-bom-notes.md` before coding.

**Scope (build this):**
- Add phantom assemblies and multi-level BOM explosion.
- Add alternate BOMs and planning BOMs.
- Add material effectivity dates, substitute components, alternate components, and approved replacement rules.
- Add operation-level by-products, co-products, scrap, yield loss, and rework outputs.
- Add material and labor backflush settings by operation.
- Add overhead, tool, machine, outside-processing, queue, move, finish, and setup costs at operation level.
- Add BOM compare, revision copy, and active-revision locking through change control.
- Add BOM readiness checks for routings, QC specs, equipment, item effectivity, and cost rollup.

**Data/Models touched:** bill_of_materials, bom_revisions, bom_operations, bom_operation_materials, bom_operation_outputs, bom_substitutes, bom_alternates, bom_overheads, bom_tools, bom_effectivity_rules, change_requests, cost_rollups.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Multi-level BOM explorer, operation-level BOM editor, BOM compare, effectivity timeline, cost and readiness panel.

**Acceptance criteria:**
- MRP and production can explode multi-level and phantom BOMs correctly.
- Backflushed material/labor posts only at configured control points.
- By-products and scrap create traceable inventory or loss records.
- Expired or not-yet-effective components are blocked or warned before production.
- BOM revisions cannot be changed directly once active unless change control permits it.

**Tests to write:** Unit tests for BOM explosion, effectivity, phantom assemblies, by-products, and backflush posting; integration tests for production order generation; Playwright tests for multi-level BOM editing and revision compare.

**Out of scope:** CAD/PLM integration, automated supplier substitution decisions, or accounting GL posting.

## Build Prompt 49 - Product Configurator Rules, Supplemental Items, Pricing, and Cost Effects

**Goal:** Add an Acumatica-style product configurator that can generate configured SKUs, BOMs, routing choices, supplemental items, labels, prices, and expected costs from rule-driven options.

**Depends on:** 33, 34, 46, 48

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and existing product configurator modules before coding.

**Scope (build this):**
- Add configurable option groups, option values, dependencies, incompatibilities, required selections, and default choices.
- Add rules that alter SKU segments, formula/BOM components, routing operations, labels, QC requirements, packaging, price, cost, and Shopify mapping readiness.
- Add supplemental items for packaging inserts, bundles, accessories, samples, or required add-ons.
- Add configurator quote preview showing price, margin, expected cost, missing data, and generated production definition.
- Add rule test fixtures so admins can validate option combinations before activation.
- Add change-control approval for active configurator templates and rules.

**Data/Models touched:** product_templates, product_configurations, configurator_option_groups, configurator_options, configurator_rules, configurator_rule_tests, bom_revisions, formula_revisions, labels, price_lists, cost_rollups.

**APIs/Integrations:** Optional Shopify draft export only if existing Shopify module supports it; otherwise internal only.

**UI/Screens:** Configurator template designer, option/rule editor, configuration preview, rule test runner, generated package review.

**Acceptance criteria:**
- Admin can define option rules without code changes.
- Invalid option combinations are blocked with clear explanations.
- Configured products generate SKU, BOM/formula draft, label requirements, QC requirements, price impact, and cost preview.
- Active configurator rules require approval through change control.
- Generated records remain auditable and traceable to the template/rule version.

**Tests to write:** Unit tests for rule resolution, invalid combinations, price/cost effects, and generated package contents; Playwright tests for creating and testing a configurator template.

**Out of scope:** Public customer-facing configurator, automatic legal label approval, or live Shopify product publication.

## Build Prompt 50 - Advanced WMS Scan Modes, Containers, Put-Away, and Pick Paths

**Goal:** Add warehouse execution depth inspired by Acumatica WMS and Mar-Kov warehouse management, with scan-driven receive, put-away, transfer, issue, count, pick, pack, and ship flows.

**Depends on:** 8, 14, 23, 28, 42, 45, 46

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current inventory, purchasing, operations, and Shopify fulfillment modules before coding.

**Scope (build this):**
- Add scan modes: receive, put away, transfer, issue, count, pick, pack, ship, storage lookup, item lookup, and container lookup.
- Add containers, pallets, cartons, totes, bins, license plates, and mixed-lot container contents.
- Add directed put-away rules by item class, lot status, temperature/storage zone, quarantine status, expiry, and location capacity.
- Add pick path optimization, staging locations, wave picking, tote assignment, and pack verification.
- Add FEFO/FIFO picking suggestions and override reasons.
- Add mobile scan command handling similar to WMS service commands.
- Add printable container, pallet, bin, and staging labels.

**Data/Models touched:** containers, container_lines, warehouse_zones, storage_rules, putaway_tasks, pick_tasks, pack_sessions, wave_batches, staging_locations, stock_movements, inventory_balances, labels.

**APIs/Integrations:** Barcode scanner/camera APIs; browser print/PDF labels.

**UI/Screens:** Scan command center, container detail, put-away queue, wave pick board, pack verification, storage lookup, mobile WMS mode screens.

**Acceptance criteria:**
- Users can complete receive-to-put-away, transfer, count, pick, pack, and ship using scan-first flows.
- Mixed-lot containers remain traceable at container-line level.
- Quarantined material cannot be put away into available storage unless released.
- FEFO/FIFO suggestions are visible and override reasons are audited.
- Scan flows work on mobile with manual entry fallback.

**Tests to write:** Domain tests for container inventory and FEFO/FIFO suggestions; API tests for scan commands; Playwright mobile tests for receive/put-away, pick/pack, transfer, and count.

**Out of scope:** Robotic warehouse automation, carrier label purchase, or direct handheld scanner SDK integration beyond browser-compatible input.

## Build Prompt 51 - Inventory Item Classes, Matrix Items, Subitems, Cross-References, and Cycle Count Programs

**Goal:** Add Acumatica-style inventory framework features that make item setup, lot tracking, purchasing, selling, barcode aliases, and cycle counting easier to administer.

**Depends on:** 7, 8, 14, 39, 46, 50

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current inventory-item-class and import modules before coding.

**Scope (build this):**
- Add hierarchical item classes with inherited defaults for lot tracking, expiry tracking, UOM, storage rules, QC requirements, valuation metadata, label template, and color rules.
- Add subitems/variant dimensions for size, strength, mushroom species/blend, packaging format, market, language, channel, and storage condition.
- Add matrix item generation for families of related SKUs.
- Add item cross-references for supplier SKUs, customer SKUs, Shopify SKUs, barcode aliases, GS1 codes, and legacy codes.
- Add ABC ranking and cycle count frequencies by item class, velocity, value, risk, and expiry sensitivity.
- Add cycle count calendar and count program suggestions.

**Data/Models touched:** inventory_item_classes, item_class_defaults, subitem_dimensions, matrix_item_templates, item_cross_references, abc_rankings, cycle_count_programs, stock_count_sessions, product_variants, materials, packaging_components.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Item class hierarchy, matrix item generator, cross-reference editor, ABC/cycle count settings, count calendar.

**Acceptance criteria:**
- New items inherit defaults from item class hierarchy.
- Matrix item generation creates related SKUs with predictable attributes and readiness checks.
- Barcode/supplier/customer cross-references resolve to the correct item in scan and receiving flows.
- Cycle count suggestions prioritize high-risk, high-value, high-velocity, and expiring inventory.
- Changes to inherited defaults show impact before save.

**Tests to write:** Unit tests for inheritance, matrix generation, cross-reference lookup, and ABC count scoring; Playwright tests for item class editing and matrix generation.

**Out of scope:** Accounting valuation ledger, tariff classification automation, or external PIM integration.

## Build Prompt 52 - APS, Finite Scheduling, Rough-Cut Capacity, Dispatch Boards, and Capable-to-Promise

**Goal:** Expand planning from MRP suggestions into Acumatica-style advanced planning and scheduling with finite capacity, material constraints, dispatch priorities, and capable-to-promise explanations.

**Depends on:** 32, 35, 40, 46, 48

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current MRP, routing, equipment, costing, and production modules before coding.

**Scope (build this):**
- Add finite-capacity calendars by work center, equipment, labor role, shift, holiday, maintenance window, and cleaning/changeover constraint.
- Add dispatch priorities, constraint dates, scheduling block sizes, and schedule regeneration.
- Add rough-cut capacity planning for planned and open production orders.
- Add material availability constraints from inventory, POs, transfers, and production supply.
- Add operation-level schedule board with drag/resequence controls and constraint warnings.
- Add capable-to-promise calculations for sales/wholesale orders using stock, production, purchasing, QC lead time, and capacity.
- Add promise-date explanation panels.

**Data/Models touched:** capacity_calendars, work_center_capacity_blocks, equipment_capacity_blocks, labor_capacity_blocks, schedule_runs, schedule_operations, production_operation_runs, mrp_snapshots, purchase_orders, sales_orders.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Finite schedule board, rough-cut capacity view, dispatch board, work center utilization, CTP panel on sales/wholesale orders, schedule run history.

**Acceptance criteria:**
- Planner can regenerate a finite schedule and see capacity overloads.
- Material shortages constrain production starts.
- Dragging/resequencing operations recalculates dependent operations and warnings.
- CTP returns a promise date with a readable explanation.
- Schedule changes are audited and do not silently alter completed work.

**Tests to write:** Unit tests for capacity loading, constraint ordering, CTP, and schedule regeneration; integration tests with material and QC gates; Playwright tests for schedule board and CTP panel.

**Out of scope:** Fully automated optimizer, payroll integration, or external calendar synchronization.

## Build Prompt 53 - Production Control Points, Nonsequential Reporting, Labor, Scrap, Waste, and Rework

**Goal:** Add deeper shop-floor production controls from Acumatica and Mar-Kov: control points, operation reporting, labor capture, scrap/waste tracking, rework, and nonsequential quantity reporting.

**Depends on:** 11, 27, 32, 34, 42, 47, 48

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current production, routing, EBR, equipment, and costing modules before coding.

**Scope (build this):**
- Add operation control points that gate reporting, material issue, backflush, QC checks, and final completion.
- Allow nonsequential reporting when configured, with warnings for skipped required operations.
- Add labor clock-in/clock-out, crew reporting, indirect labor, downtime reason codes, and supervisor approval.
- Add scrap, waste, rework, return-to-stock, and return-to-vendor flows with disposition reason codes.
- Add production order WIP summary showing planned versus actual material, labor, machine, overhead, scrap, and yield.
- Add rework orders linked to the original lot, quality event, and production order.
- Add generated inventory transactions for issue, backflush, output, scrap, rework, and return movements.

**Data/Models touched:** production_orders, production_operation_runs, operation_control_points, labor_time_entries, crew_time_entries, downtime_events, scrap_events, rework_orders, stock_movements, cost_variances, quality_events.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Shop-floor operation reporting, labor capture, scrap/rework dialog, WIP summary, production variance view, supervisor approval queue.

**Acceptance criteria:**
- Required control points prevent premature completion.
- Configured nonsequential reporting works and remains auditable.
- Labor, downtime, scrap, waste, and rework affect actual cost and yield variance.
- Scrap/rework dispositions update inventory and traceability correctly.
- Supervisor approvals are required for high-risk exceptions.

**Tests to write:** Unit tests for control-point gating and transaction generation; API tests for labor/scrap/rework; Playwright tests for reporting operations and recording scrap.

**Out of scope:** Payroll export, GL WIP reconciliation, or automated machine downtime detection.

## Build Prompt 54 - LIMS, Sampling Plans, Retesting, Retained Samples, Stability, and Lab Results

**Goal:** Add Mar-Kov-style LIMS depth for incoming, in-process, finished goods, retained sample, retest, and stability testing.

**Depends on:** 9, 26, 37, 38, 45, 47

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current QC, quality, documents, supplier quality, and lot modules before coding.

**Scope (build this):**
- Add sample records linked to receipts, lots, batches, suppliers, stability studies, and retained sample inventory.
- Add sampling plans by supplier, item class, material, product, risk level, batch size, container count, and inspection type.
- Add test methods with instruments, units, expected ranges, pass/fail rules, retest rules, and evidence requirements.
- Add lab result entry, review, approval, retest, invalidation, and out-of-spec workflows.
- Add retained sample inventory with storage location, quantity, expiry, pull history, and disposal.
- Add stability study schedules, pull points, test panels, and trend charts.
- Add QC trend analytics by supplier, material, test, product, and batch.

**Data/Models touched:** samples, sample_tests, sampling_plans, test_methods, lab_results, lab_instruments, retained_samples, stability_studies, stability_pull_points, qc_tasks, qc_results, quality_events, lots.

**APIs/Integrations:** File upload for lab evidence; no direct lab instrument integration yet.

**UI/Screens:** LIMS dashboard, sample queue, sample detail, lab result entry, retest workflow, retained sample inventory, stability study planner, QC trend charts.

**Acceptance criteria:**
- Receiving and production can generate samples automatically from sampling plans.
- Failed or out-of-spec results trigger quality events and holds when configured.
- Retests preserve original results and require reason/evidence.
- Retained samples are traceable and visible in inventory-like views.
- Stability pull schedules generate alerts and tasks.

**Tests to write:** Unit tests for sampling plan selection, pass/fail/retest rules, and stability schedules; API tests for sample lifecycle; Playwright tests for sample result entry and retest.

**Out of scope:** Direct lab instrument integration, external LIMS synchronization, or legal lab accreditation validation.

## Build Prompt 55 - Weigh and Dispense, Scale Capture, Tolerance Checks, and Potency Adjustment

**Goal:** Add Mar-Kov-style weigh/dispense execution that validates material, lot, equipment, quantity, potency, and tolerance before allowing production steps to continue.

**Depends on:** 27, 30, 32, 36, 42, 48, 54

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current EBR, formula, equipment, inventory, and QC modules before coding.

**Scope (build this):**
- Add weigh/dispense steps generated from formula/BOM lines.
- Support target quantity, tolerance, unit conversion, minimum/maximum limits, scale tare, gross, net, and manual override.
- Add optional potency/assay adjustment for active ingredients based on lot-specific QC results.
- Validate barcode-scanned material, lot, location, container, expiry, release status, and quantity before weighing.
- Add scale adapter abstraction with manual/mock adapter now and a hardware integration boundary for future devices.
- Add dual verification for critical materials and out-of-tolerance overrides.
- Post dispense movements or reservations only after successful step completion.

**Data/Models touched:** ebr_steps, ebr_step_results, weigh_dispense_sessions, weigh_dispense_lines, equipment, equipment_calibrations, lots, qc_results, stock_movements, formula_lines, bom_operation_materials.

**APIs/Integrations:** Manual/mock scale adapter only; architecture boundary for real scales later.

**UI/Screens:** Weigh/dispense station, scale capture panel, tolerance exception dialog, dual verification dialog, dispense history.

**Acceptance criteria:**
- Critical materials cannot be dispensed from unreleased, expired, held, or wrong lots.
- Out-of-tolerance weights require permitted override, reason, and audit trail.
- Potency-adjusted target quantities calculate from approved QC results.
- Scale/manual readings are captured into EBR with actor, timestamp, equipment, and calibration status.
- Completed dispense posts correct inventory effects.

**Tests to write:** Unit tests for tolerance and potency calculations; API tests for lot/equipment gates and overrides; Playwright tests for weighing a material, rejecting wrong lots, and approving an exception.

**Out of scope:** Certified scale integration, PLC integration, or automated dispensing hardware control.

## Build Prompt 56 - Equipment Historian, PLC Readings, Cleaning, Maintenance, and Pre-Use Checks

**Goal:** Add Mar-Kov-style equipment data capture so production batches can record equipment readiness, cleaning, maintenance, downtime, and process readings in the EBR.

**Depends on:** 27, 32, 36, 53, 55

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current equipment, EBR, production, and routing modules before coding.

**Scope (build this):**
- Add equipment event streams for manual readings, mock PLC readings, downtime, cleaning, setup, inspection, maintenance, and calibration.
- Add pre-use check templates by equipment class and routing operation.
- Add cleaning logs and sanitation status that gate equipment assignment.
- Add process parameter capture for temperature, humidity, pressure, RPM, time, pH, brix, moisture, and custom readings.
- Add alarm/deviation rules when readings fall outside process limits.
- Add equipment history on EBR packets and batch release packets.
- Add adapter interface for future PLC/historian integrations.

**Data/Models touched:** equipment, equipment_events, equipment_readings, equipment_preuse_checks, equipment_cleaning_logs, equipment_maintenance, routing_operations, ebr_step_results, quality_events.

**APIs/Integrations:** Mock/manual equipment adapter only; integration boundary for PLC/historian later.

**UI/Screens:** Equipment historian, pre-use checklist, cleaning log, process readings panel, downtime board, equipment readiness dashboard.

**Acceptance criteria:**
- Required pre-use checks and cleaning status block critical operations until complete.
- Process readings are captured with equipment, actor/source, timestamp, unit, and limits.
- Out-of-limit readings can create deviations or quality events.
- Batch records include equipment history relevant to the run.
- Future adapters can be added without changing domain workflow rules.

**Tests to write:** Unit tests for readiness gates and reading limit evaluation; API tests for equipment event capture; Playwright tests for completing pre-use checks and recording process readings.

**Out of scope:** Real PLC communication, SCADA replacement, or predictive maintenance models.

## Build Prompt 57 - Compliance Packs, SDS, Allergen, HACCP, Sanitation, Training, and Audit Packets

**Goal:** Add Mar-Kov-style compliance automation around controlled documents, sanitation, allergen/HACCP checks, training readiness, and one-click audit packets.

**Depends on:** 27, 29, 31, 38, 42, 47, 54, 56

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current documents, quality, EBR, equipment, and release packet modules before coding.

**Scope (build this):**
- Add compliance document types for SDS, allergen statements, HACCP plans, sanitation SOPs, training records, supplier compliance documents, and internal audit checklists.
- Add sanitation and allergen control checks linked to equipment, room, product family, ingredient class, and production order.
- Add training requirements by role, equipment, workflow, SOP, and controlled action.
- Block controlled actions when required training, sanitation, or compliance documents are missing/expired.
- Add audit packet builder that gathers EBR, COA, SDS, supplier documents, lot genealogy, deviations, CAPA, equipment logs, approvals, and shipping history.
- Add controlled document renewal alerts and compliance readiness dashboards.

**Data/Models touched:** document_templates, controlled_documents, compliance_requirements, sanitation_checks, allergen_controls, training_requirements, training_records, audit_packets, generated_documents, ebr_executions, quality_events.

**APIs/Integrations:** PDF/document generation and file storage.

**UI/Screens:** Compliance dashboard, SDS/allergen/HACCP document library, sanitation checklist, training matrix, audit packet builder, compliance readiness panel.

**Acceptance criteria:**
- Controlled actions can require current training, sanitation, and compliance documents.
- Audit packets can be generated for a lot, batch, supplier, customer shipment, or recall.
- Expiring documents and training gaps create alerts.
- Customer-facing packets hide internal-only data unless configured.
- Compliance packet generation is audited.

**Tests to write:** Unit tests for compliance gate evaluation; API tests for audit packet generation; Playwright tests for training matrix, sanitation gate, and packet generation.

**Out of scope:** Legal certification of HACCP plans, external LMS integration, or automated regulatory submissions.

## Build Prompt 58 - Generic Inquiry, Report Builder, Pivots, Dashboards, and Scheduled Exports

**Goal:** Add Acumatica-style inquiry/report configurability so users can build saved operational views and exports without new code for every question.

**Depends on:** 25, 40, 42, 43, 46

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current reporting, dashboard, feedback, and roadmap modules before coding.

**Scope (build this):**
- Add a governed report dataset catalog with approved entities, fields, joins, filters, aggregations, and permission rules.
- Add generic inquiry builder with columns, filters, sorting, grouping, calculated fields, and saved parameters.
- Add pivot-style summaries and charts for inventory, production, QC, purchasing, sales, costing, and traceability.
- Add scheduled reports and exports to CSV/JSON/PDF-ready formats.
- Add role-shared and private report views.
- Add drill-down links from report rows to source records.
- Add export audit events for sensitive datasets.

**Data/Models touched:** report_datasets, generic_inquiries, inquiry_columns, inquiry_filters, inquiry_calculations, report_schedules, report_exports, saved_views, audit_events.

**APIs/Integrations:** Optional email provider later; in-app scheduled export records only for this prompt.

**UI/Screens:** Inquiry builder, report catalog, pivot summary view, chart builder, scheduled exports, report run history.

**Acceptance criteria:**
- Users can create saved inquiries from approved datasets without raw SQL.
- Permission and field redaction rules apply to inquiry results and exports.
- Reports can include drill-down links to source records.
- Scheduled exports are generated and auditable.
- Admin can publish reports to selected roles.

**Tests to write:** Unit tests for dataset permissions and calculated fields; API tests for inquiry execution and export logging; Playwright tests for building and running a saved inquiry.

**Out of scope:** Arbitrary SQL editor, external BI warehouse, or email delivery provider.

## Build Prompt 59 - Financial Bridge, Landed Cost Allocation, Inventory Valuation, and Period Close Pack

**Goal:** Add finance-ready exports and valuation controls without turning the platform into a general ledger.

**Depends on:** 18, 34, 37, 45, 46, 53

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current costing, purchasing, inventory, wholesale, and Shopify modules before coding.

**Scope (build this):**
- Add landed cost allocation across purchase receipts by freight, duty, handling, supplier fee, and manual allocation basis.
- Add inventory valuation snapshots by item, lot, location, status, and valuation method metadata.
- Add period close checks for unposted corrections, negative balances, unreleased receipts, open counts, unresolved holds, incomplete production, and missing cost records.
- Add AP/AR/export packets for purchases, receipts, sales, shipments, inventory adjustments, production variances, and landed costs.
- Add reconciliation reports for inventory ledger to balances, receipts to POs, shipments to orders, and production inputs/outputs.
- Add export mapping templates for accounting systems.

**Data/Models touched:** landed_costs, landed_cost_allocations, inventory_valuation_snapshots, period_close_runs, close_check_results, finance_export_batches, export_mapping_templates, stock_movements, purchase_orders, receipts, sales_orders, shipments.

**APIs/Integrations:** CSV/JSON export only; no live accounting connector.

**UI/Screens:** Landed cost allocation, valuation snapshot, period close checklist, finance export center, reconciliation reports.

**Acceptance criteria:**
- Landed cost can be allocated to receipt lines and included in cost analysis.
- Period close checklist identifies blockers before export.
- Finance exports are repeatable, versioned, and audited.
- Inventory valuation snapshots can be compared across periods.
- No GL journal posting or tax filing UI is introduced.

**Tests to write:** Unit tests for landed cost allocation and valuation snapshots; API tests for period close checks and export batches; Playwright tests for finance export flow.

**Out of scope:** General ledger, invoices, tax filing, payment processing, or direct accounting API sync.

## Build Prompt 60 - EDI, ASN, Supplier Portal, and Customer Document Portal Readiness

**Goal:** Prepare for larger trading partners by adding optional EDI/ASN intake, supplier collaboration, and customer document access without disrupting internal workflows.

**Depends on:** 37, 38, 42, 45, 50, 57, 58

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current purchasing, wholesale, documents, Shopify, and traceability modules before coding.

**Scope (build this):**
- Add inbound ASN/pre-receipt records that can be converted into purchase receipts.
- Add EDI document staging models for purchase orders, order acknowledgements, ASNs, invoices-as-export-metadata, shipment notices, and customer order imports.
- Add partner mapping configuration for item cross-references, units, locations, carriers, and document identifiers.
- Add supplier portal draft architecture for document upload, ASN submission, and supplier corrective-action responses.
- Add customer document portal draft architecture for COA, lot release packet, SDS, and shipment documents.
- Add import validation, quarantine staging, and approval before partner documents affect live records.

**Data/Models touched:** edi_partners, edi_document_batches, edi_documents, asn_headers, asn_lines, partner_item_mappings, supplier_portal_users, customer_portal_access, generated_documents, receipts, purchase_orders, shipments.

**APIs/Integrations:** File upload/import endpoints; no live EDI VAN/API provider in this prompt.

**UI/Screens:** EDI staging center, ASN review, partner mapping editor, supplier document intake, customer document access preview.

**Acceptance criteria:**
- ASN/pre-receipt data can be imported, validated, reviewed, and converted to receipt drafts.
- Partner item and unit mappings prevent accidental mismatches.
- Supplier/customer portal access is permission-scoped and auditable.
- Imported partner documents never mutate live records until approved.
- Customer documents expose only approved external-facing content.

**Tests to write:** Parser/validation tests for staged partner documents; API tests for ASN conversion and partner mapping; Playwright tests for importing ASN data and approving a receipt draft.

**Out of scope:** Live EDI provider integration, public portal deployment, payment/invoice settlement, or supplier self-service user provisioning automation.

## Build Prompt 61 - Forecasting, S&OP, Demand Planning, and Scenario Simulation

**Goal:** Extend planning beyond MRP into demand forecasts, supply scenarios, seasonal planning, and management review.

**Depends on:** 19, 35, 40, 52, 58, 59

**Context to load:** Read `SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`, and current MRP, sales, Shopify, wholesale, purchasing, production, and dashboard modules before coding.

**Scope (build this):**
- Add demand forecast records by SKU, product family, customer/reseller, Shopify channel, region, week/month, and scenario.
- Add forecast drivers for historical sales, open orders, minimum stock, promotions, seasonality, reseller commitments, and manual overrides.
- Add S&OP scenario snapshots that combine demand, inventory, purchase supply, production capacity, QC lead time, expiry/shelf life, and cash/cost metadata.
- Add scenario comparison for shortages, capacity overload, expiring stock, purchase spend, and service-level risk.
- Add forecast-to-MRP handoff with approval.
- Add management review dashboard for now/next/later decisions.

**Data/Models touched:** demand_forecasts, forecast_lines, forecast_drivers, planning_scenarios, scenario_supply_demand_lines, scenario_capacity_lines, scenario_risk_items, mrp_snapshots, sales_orders, purchase_orders, production_orders.

**APIs/Integrations:** Internal API only.

**UI/Screens:** Forecast editor, scenario planner, S&OP dashboard, forecast-to-MRP approval, scenario comparison report.

**Acceptance criteria:**
- Planner can create multiple scenarios without altering live orders.
- Forecasts can be approved into MRP demand.
- Scenario comparison shows shortages, capacity, expiry, purchasing, and service risks.
- Manual forecast overrides are audited with reason.
- Forecast views remain understandable for non-technical managers.

**Tests to write:** Unit tests for forecast aggregation and scenario risk scoring; API tests for forecast approval; Playwright tests for scenario creation and comparison.

**Out of scope:** Machine-learning forecasting service, automatic supplier ordering, or financial budgeting suite.
