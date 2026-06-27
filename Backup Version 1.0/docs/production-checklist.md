# Production Checklist

## Launch Gates

- Accessibility: Playwright accessibility smoke suite passes for dashboard, scan fallback, stock counts, Shopify, and health diagnostics.
- Performance: mobile routes in `apps/web/performance-budgets.json` meet LCP, INP, TBT, and JavaScript budget thresholds on the agreed Android profile.
- Observability: `OBSERVABILITY_ENDPOINT` or `SENTRY_DSN` is configured for API and `VITE_OBSERVABILITY_ENDPOINT` is configured for the PWA.
- Logs: API logs include `requestId`, route, status code, user ID, organization ID, and role context. Shopify webhook responses include `requestId` and `eventId`; queued jobs include `jobId`.
- Health checks: `/health/ready` and `/api/admin/health` show API, worker, database, Redis, PowerSync, and Shopify as `ok` or have an assigned owner for any `degraded` item.
- Shopify trace: a test order can be followed from webhook delivery to `shopify_sync_events`, queued job, sales order, allocation, shipment, and fulfillment push log.
- Backups: the restore drill in `docs/runbooks/backup-restore.md` has been completed within the last 30 days.
- Security: production secrets are stored in managed environment variables; no production credentials are committed.
- Offline: stock count, scanning fallback, harvest logging, and production completion work with the network disabled and sync after reconnect.
- Localization: user-facing empty, loading, and error states are understandable in English and Portuguese for primary workflows.

## Release Day

- Freeze schema changes after the final restore drill.
- Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm test:e2e`.
- Confirm Shopify webhook HMAC validation with a real delivery from the production shop.
- Confirm PowerSync replication lag is within the operational target for each staff role/location partition.
- Confirm Redis queue depth drains to zero after a reconciliation job.
- Confirm API and worker logs are visible in the production log sink and searchable by `requestId`, `jobId`, and Shopify webhook ID.
- Pin the deployed API, worker, and web artifact versions in the release notes.
