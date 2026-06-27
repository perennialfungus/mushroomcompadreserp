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
