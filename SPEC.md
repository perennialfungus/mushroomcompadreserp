# Mushroom Compadres ERP - Product Specification

## Executive Summary

Build Mushroom Compadres as an offline-first, responsive ERP/PWA for cultivation, production, traceability, inventory, Shopify fulfillment, purchasing, MRP, wholesale, and CRM. The MVP should prioritize the hardest operational core first: batch/lot traceability, multi-location inventory, production workflows, and Shopify stock/order sync. The recommended approach is a TypeScript monorepo with a React PWA, Supabase Postgres/Auth/Storage in an EU region, PowerSync for local SQLite sync, and a dedicated API/worker tier for Shopify webhooks, reconciliation, and background jobs.

## Product Context

Mushroom Compadres is a functional-mushroom supplement business in Rogil, Portugal. The business grows and processes products in-house from spore to store, sells EU-wide through Shopify retail, and sells wholesale to resellers. Product families include tinctures, mushroom coffee and cacao, chocolate bars, capsules, powders, and merch.

The ERP must support EU food-supplement style traceability: every finished unit must be traceable backward through packaging or extraction batch, harvest, and grow batch, and forward to the orders that shipped a lot.

## Hard Requirements

- Responsive web app/PWA, one codebase for Apple and Android phones/tablets plus desktop browsers.
- Installable app shell with offline operation.
- Offline-first production, fulfillment, scanning, inventory counting, harvest logging, and batch logging.
- Reliable sync and explicit conflict resolution when devices reconnect.
- Shopify two-way sync:
  - Pull orders and customers.
  - Push inventory levels and fulfillment status.
  - Treat the ERP as authoritative for stock.
  - Handle webhooks, rate limits, idempotency, retries, and reconciliation.
- Full traceability:
  - Finished unit to lot.
  - Lot to packaging/extraction/blending batch.
  - Batch to harvest.
  - Harvest to grow batch.
  - Lot forward to shipment/order lines.
  - COA attachments, lot numbers, release state, holds, expiry dates.
- Multi-location inventory and production from day one.
- Multi-language and multi-currency throughout UI and data.
- Role-based access for owner/admin, production/farm staff, packing/fulfillment, sales/wholesale.
- Earthy, natural, warm UI that is fast and clean on mobile and accessible.
- Do not build in-app accounting/finance in MVP/v1. Design exportable financial records only.

## Assumptions

- Initial operating company is one organization with multiple physical/logical locations.
- Primary UI languages are English and Portuguese; architecture must support more.
- Primary currencies are EUR and GBP; architecture must support more.
- Shopify is the retail channel of record for retail orders and checkout, but not stock truth.
- Wholesale orders are created inside the ERP, not Shopify B2B, for MVP.
- The first warehouse/production locations are in Portugal, but EU-wide sales require multi-country addresses, tax metadata export, and localized customer communications later.
- Native mobile apps are not required for MVP; the PWA must be good enough for operational use.

## Users and Roles

- Owner/Admin:
  - Manage users, roles, settings, products, locations, integrations, QC release, reconciliation, and exports.
- Production/Farm Staff:
  - Create and update grow batches, harvests, drying records, processing batches, and production orders.
  - Scan lots and materials.
  - Work offline.
- Packing/Fulfillment:
  - Pick, pack, allocate lots, print labels, ship Shopify and wholesale orders.
  - Scan finished units and stock locations.
  - Work offline.
- Sales/Wholesale:
  - Manage resellers, price lists, quotes, wholesale orders, customer interactions, and lead notes.
- Read-only/Auditor, v1+:
  - View traceability, QC, and inventory records without mutation rights.

## Product Modules

### Cultivation

- Grow batches with strain/species, substrate recipe, inoculation date, fruiting transitions, room/rack location, status, expected yield, notes, and attachments.
- Harvest records linked to grow batches with wet weight, dry weight, harvest date/time, staff member, location, and QC observations.
- Drying records linked to harvests with start/end time, method, moisture target, actual dry weight, and loss percentage.

### Processing and Production

- Processing batches for extraction, blending, encapsulation, bottling, packaging, and chocolate/food production.
- Batch inputs consume lots/harvests/materials from inventory.
- Batch outputs create WIP or finished lots.
- Production orders reserve materials, guide staff through steps, and receive finished goods.
- Bill of materials and recipes support versioning.

### Inventory

- Multi-location inventory for raw materials, packaging, WIP, finished goods, and merch.
- Inventory is derived from an append-only `stock_movements` ledger.
- Stock movements include receipts, adjustments, transfers, consumption, production output, holds/releases, allocations, shipments, returns, and cycle count corrections.
- Inventory balances are projections, never the source of truth.
- Lot, expiry, and QC status are first-class dimensions of stock.

### Traceability

- Backward trace:
  - Sales/shipment unit -> order line allocation -> finished lot -> production/packaging batch -> processing inputs -> harvest -> grow batch.
- Forward trace:
  - Grow batch/harvest/material lot -> processing batches -> finished lots -> order lines/shipments/customers/resellers.
- COAs and QC records attach to grow batches, harvests, processing batches, and lots.
- Released/held/rejected states gate fulfillment.

### Shopify Sync

- Pull Shopify orders, customers, product/variant mappings, fulfillment orders, and relevant location/inventory identifiers.
- Push ERP inventory availability by mapped variant/location.
- Push fulfillment status and tracking.
- Use webhook ingestion plus scheduled reconciliation.
- Persist every external event, outbound request, idempotency key, response, and reconciliation result.

### Purchasing

- Suppliers, supplier SKUs, purchase orders, receiving, landed cost metadata for future export, and supplier lots/COAs.
- Receiving creates raw material or packaging lots and stock movements.

### MRP

- Demand sources:
  - Open production orders.
  - Shopify and wholesale sales demand.
  - Minimum stock targets.
  - Forecast rows, v1+.
- Supply sources:
  - On-hand released stock.
  - Purchase orders.
  - Planned production orders.
- Outputs:
  - Shortage report.
  - Suggested purchase orders.
  - Suggested production orders.

### Wholesale and CRM

- Reseller accounts, contacts, addresses, tax IDs, reseller status, payment terms metadata, and notes.
- B2B price lists by currency, product variant, customer/reseller group, and effective date.
- Quotes and wholesale orders.
- CRM leads, interactions, tasks, and follow-ups.
- No invoicing ledger, tax filing, or accounting UI in MVP/v1.

## Core Data Model

All tables use UUID primary keys, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` where soft delete is appropriate, and `version` for optimistic concurrency on mutable records.

### Organization and Access

`organizations`
- `id`, `name`, `default_currency`, `default_locale`, `timezone`, `settings_json`

`users`
- `id`, `auth_user_id`, `organization_id`, `email`, `display_name`, `status`, `locale`, `last_seen_at`

`roles`
- `id`, `organization_id`, `code`, `name`, `description`
- Initial codes: `owner_admin`, `production_farm`, `packing_fulfillment`, `sales_wholesale`, `auditor`

`user_roles`
- `id`, `user_id`, `role_id`, `location_id nullable`

### Locations

`locations`
- `id`, `organization_id`, `code`, `name`, `type`
- Types: `farm`, `drying`, `production`, `packing`, `warehouse`, `retail_shopify`, `supplier`, `customer`, `quarantine`, `virtual`
- Address fields, `shopify_location_gid nullable`, `is_active`

### Products and Materials

`products`
- `id`, `organization_id`, `name`, `category`, `description_i18n`, `status`, `brand`, `default_uom`

`product_variants`
- `id`, `product_id`, `sku`, `barcode`, `name_i18n`, `form`
- `track_lots`, `track_expiry`, `inventory_uom`, `sellable_uom`, `net_quantity`, `status`
- `shopify_variant_gid nullable`, `shopify_inventory_item_gid nullable`

`materials`
- `id`, `organization_id`, `name`, `category`, `uom`, `supplier_part_number nullable`, `track_lots`, `track_expiry`

`packaging_components`
- `id`, `organization_id`, `name`, `uom`, `sku`, `track_lots`

### Cultivation

`grow_batches`
- `id`, `organization_id`, `batch_code`, `species`, `strain`, `substrate_recipe_id nullable`
- `inoculated_at`, `fruiting_started_at`, `status`, `location_id`, `expected_harvest_date`, `notes`

`harvests`
- `id`, `organization_id`, `harvest_code`, `grow_batch_id`, `harvested_at`, `wet_weight`, `dry_weight nullable`
- `uom`, `location_id`, `performed_by`, `status`, `notes`

`drying_runs`
- `id`, `organization_id`, `drying_code`, `harvest_id`, `started_at`, `ended_at nullable`
- `method`, `input_weight`, `output_weight nullable`, `moisture_percent nullable`, `status`

### Production and Lots

`production_orders`
- `id`, `organization_id`, `order_number`, `type`, `status`, `planned_start_at`, `due_at`
- `location_id`, `product_variant_id nullable`, `planned_quantity`, `uom`, `priority`, `notes`

`bill_of_materials`
- `id`, `organization_id`, `product_variant_id`, `version_code`, `status`, `yield_quantity`, `yield_uom`, `effective_from`, `effective_to`

`bom_lines`
- `id`, `bom_id`, `component_type`, `component_id`, `quantity`, `uom`, `waste_percent`, `is_critical`

`processing_batches`
- `id`, `organization_id`, `batch_code`, `type`, `status`, `production_order_id nullable`
- `location_id`, `started_at`, `ended_at nullable`, `process_params_json`, `notes`

`batch_inputs`
- `id`, `processing_batch_id`, `input_type`, `source_lot_id`, `quantity`, `uom`

`batch_outputs`
- `id`, `processing_batch_id`, `lot_id`, `quantity`, `uom`

`lots`
- `id`, `organization_id`, `lot_code`, `item_type`, `item_id`
- `source_type`, `source_id`, `manufactured_at`, `received_at nullable`, `expires_at nullable`
- `qc_status`, `status`, `parent_lot_id nullable`, `metadata_json`
- `qc_status`: `pending`, `released`, `hold`, `rejected`, `expired`

### Inventory

`inventory_items`
- `id`, `organization_id`, `item_type`, `item_id`, `sku`, `name_snapshot`, `track_lots`, `track_expiry`, `uom`

`stock_movements`
- `id`, `organization_id`, `client_transaction_id`, `movement_number`
- `movement_type`, `item_type`, `item_id`, `lot_id nullable`
- `from_location_id nullable`, `to_location_id nullable`
- `quantity`, `uom`, `occurred_at`, `recorded_by`, `source_type`, `source_id`
- `reason_code`, `notes`, `metadata_json`, `reversal_of_movement_id nullable`
- Unique: `organization_id`, `client_transaction_id`

`inventory_balances`
- Projection table/materialized view.
- `organization_id`, `item_type`, `item_id`, `lot_id nullable`, `location_id`, `available_quantity`, `reserved_quantity`, `held_quantity`, `uom`

`stock_count_sessions`
- `id`, `organization_id`, `session_code`, `location_id`, `status`, `started_by`, `started_at`, `closed_at nullable`

`stock_count_lines`
- `id`, `session_id`, `item_type`, `item_id`, `lot_id nullable`, `expected_quantity`, `counted_quantity`, `variance_quantity`, `status`

### QC and Compliance

`qc_records`
- `id`, `organization_id`, `record_code`, `subject_type`, `subject_id`, `qc_type`, `status`
- `tested_at nullable`, `released_at nullable`, `released_by nullable`, `summary`, `metadata_json`

`coa_attachments`
- `id`, `organization_id`, `qc_record_id`, `lot_id nullable`, `file_path`, `file_name`, `content_type`, `uploaded_by`, `uploaded_at`

`audit_events`
- `id`, `organization_id`, `actor_user_id`, `event_type`, `subject_type`, `subject_id`, `before_json`, `after_json`, `occurred_at`, `request_id`

### Purchasing

`suppliers`
- `id`, `organization_id`, `name`, `status`, address/contact fields, `default_currency`, `notes`

`purchase_orders`
- `id`, `organization_id`, `po_number`, `supplier_id`, `status`, `currency`, `ordered_at`, `expected_at`, `notes`

`purchase_order_lines`
- `id`, `purchase_order_id`, `item_type`, `item_id`, `supplier_sku`, `quantity`, `uom`, `unit_cost`, `tax_code_export nullable`

`receipts`
- `id`, `organization_id`, `receipt_number`, `purchase_order_id nullable`, `supplier_id`, `received_at`, `location_id`, `status`

`receipt_lines`
- `id`, `receipt_id`, `purchase_order_line_id nullable`, `lot_id`, `quantity`, `uom`, `expiry_date nullable`

### Sales, Shopify, Wholesale, CRM

`customers`
- `id`, `organization_id`, `type`, `name`, `email`, `phone`, default address fields, `locale`, `currency`, `shopify_customer_gid nullable`

`resellers`
- `id`, `organization_id`, `customer_id`, `status`, `tax_id`, `price_list_id nullable`, `payment_terms`, `notes`

`b2b_price_lists`
- `id`, `organization_id`, `name`, `currency`, `status`, `effective_from`, `effective_to nullable`

`b2b_price_list_lines`
- `id`, `price_list_id`, `product_variant_id`, `unit_price`, `min_quantity`

`sales_orders`
- `id`, `organization_id`, `order_number`, `channel`, `status`, `customer_id`, `currency`
- `ordered_at`, `ship_to_json`, `shopify_order_gid nullable`, `external_order_number nullable`, `total_amount_export`

`sales_order_lines`
- `id`, `sales_order_id`, `product_variant_id`, `quantity`, `uom`, `unit_price`, `currency`, `status`

`order_allocations`
- `id`, `sales_order_line_id`, `lot_id`, `location_id`, `quantity`, `uom`, `allocated_at`, `picked_at nullable`, `shipped_at nullable`

`shipments`
- `id`, `organization_id`, `sales_order_id`, `shipment_number`, `status`, `carrier`, `tracking_number`, `shipped_at`

`shopify_sync_events`
- `id`, `organization_id`, `topic`, `shop_domain`, `webhook_id`, `payload_json`, `received_at`, `processed_at nullable`, `status`, `error`
- Unique: `shop_domain`, `webhook_id`

`shopify_sync_cursors`
- `id`, `organization_id`, `resource_type`, `cursor_value`, `last_success_at`, `last_error_at nullable`

`crm_interactions`
- `id`, `organization_id`, `customer_id nullable`, `reseller_id nullable`, `lead_id nullable`, `type`, `summary`, `occurred_at`, `owner_user_id`, `next_action_at nullable`

`leads`
- `id`, `organization_id`, `name`, `company`, `email`, `status`, `source`, `owner_user_id`, `notes`

### Localization and Currency

`localized_texts`
- Optional utility table for admin-managed translated strings where JSON fields are not enough.
- `id`, `organization_id`, `namespace`, `entity_type`, `entity_id`, `field_name`, `locale`, `value`

`exchange_rates`
- `id`, `base_currency`, `quote_currency`, `rate`, `rate_date`, `source`

Financial totals are stored as export metadata on commercial documents, but no accounting ledger is created in scope.

## Traceability Rules

- A finished lot cannot be released unless required QC records pass.
- A lot on hold cannot be allocated or shipped.
- Every movement that consumes or outputs a tracked item must include a lot.
- Production output lots must link to the processing batch or production order that created them.
- Processing inputs must link to source lots.
- Order allocations must persist the exact lot/location/quantity shipped.
- Deletions of regulated records are soft deletes plus audit events.
- Corrections are reversals and new movements, not mutation of historical stock movements.

## Offline and Conflict Rules

- Clients create UUIDs and `client_transaction_id` values locally.
- Offline stock changes append movements; clients do not edit balances directly.
- Backend accepts idempotent writes and ignores duplicate `client_transaction_id` values.
- Mutable operational records use optimistic `version`.
- Notes and non-regulated metadata may use last-write-wins with audit history.
- Regulated fields, QC state, lot release, stock counts, and production status conflicts go to a conflict queue for admin resolution.
- Stock count conflicts are handled by count sessions. If two sessions count the same item/lot/location in overlapping windows, the system flags the variance and requires supervisor approval before posting correction movements.

## Non-Functional Requirements

- PWA installable with app manifest, service worker, responsive layouts, and offline app shell.
- Accessibility: WCAG 2.2 AA target for color contrast, keyboard operation, forms, dialogs, and scanning alternatives.
- Performance: mobile first; primary operational screens usable on mid-range Android devices.
- Security: least privilege, RBAC, RLS where applicable, server-side authorization, encrypted transport, secure secrets, audit events.
- Privacy/GDPR: EU-hosted primary data stores, minimal customer data, deletion/export workflows v1+.
- Observability: structured logs, job queue dashboards, sync metrics, webhook/reconciliation dashboards.
- Backups: daily database backups and tested restore process before production launch.

## MVP Scope

MVP ships:
- Auth, roles, locations, products, variants, lots.
- Core inventory ledger, balances, adjustments, transfers, counts.
- Cultivation, harvests, drying, processing batches, production orders.
- QC records, COA uploads, release/hold gates.
- Traceability explorer backward and forward.
- Shopify order/customer pull, inventory push, fulfillment status push.
- Webhooks, reconciliation, idempotency, and rate-limit-safe worker queue.
- PWA/offline for scanning, stock movements, counts, harvest logging, and production steps.
- Basic purchasing/receiving if needed for raw materials.

MVP does not ship:
- Accounting ledger, invoices, tax filing.
- Advanced forecasting.
- Native mobile apps.
- Sophisticated reseller portal.
- Multi-entity corporate accounting.

## Phased Roadmap

### MVP - Operational Backbone

Goal: Safely run production, inventory, traceability, and Shopify fulfillment with offline capture.

Features:
- TypeScript monorepo foundation.
- Supabase Auth, roles, organization/location model.
- Products, variants, materials, lots.
- Inventory ledger and balances.
- Offline-capable scanning/counting/movements.
- Grow batches, harvests, drying, processing batches, production orders.
- QC records, COA attachments, hold/release.
- Traceability graph.
- Shopify order/customer sync, inventory push, fulfillment push.
- Reconciliation dashboards.
- Basic purchasing receiving.

### v1 - Planning and Commercial Operations

Goal: Improve planning, wholesale execution, data quality, and compliance operations.

Features:
- Full purchasing flow with supplier performance notes.
- MRP suggestions for purchase and production orders.
- BOM/recipe versioning and yield analytics.
- Wholesale price lists, quotes, bulk orders, reseller accounts.
- CRM interactions and follow-up tasks.
- GDPR export/delete workflows.
- More robust label templates.
- Advanced reports for expiry, stock aging, lot recall, margin export.

### v2 - Optimization and Scale

Goal: Optimize production planning, analytics, and reseller self-service.

Features:
- Demand forecasting and seasonal planning.
- Reseller portal or Shopify B2B integration if appropriate.
- Advanced QA workflows, sampling plans, environmental records.
- Accounting integrations/export connectors.
- BI warehouse exports.
- Native companion app only if PWA limitations become operationally painful.

## UI Direction

- Earthy, natural, warm palette: deep forest, moss, clay, cream, mushroom gray, warm amber accents.
- Keep operational surfaces dense, calm, and scannable.
- Mobile-first workflows:
  - Scan.
  - Confirm item/lot/location.
  - Enter quantity.
  - Save offline.
  - See sync status.
- Avoid marketing-page composition inside the ERP.
- Use accessible form controls, large tap targets, clear offline banners, and conflict badges.

## Risks and Open Questions

- Exact EU food supplement traceability requirements should be validated with Mushroom Compadres' compliance advisor.
- Shopify plan tier affects API throughput; build for standard limits first and monitor.
- PWA camera behavior on older iOS/Android devices should be tested early with real devices.
- PowerSync Cloud regional processing and contracts should be confirmed before production; self-host in the EU if needed.
- Label printer hardware is unknown. MVP should generate printable PDFs/PNGs and browser print labels; direct printer integrations can follow once hardware is selected.
- Wholesale tax/pricing details need business confirmation before v1 pricing workflows.
- Existing SKU, lot-number, and batch-number conventions need discovery before migrations/imports.

