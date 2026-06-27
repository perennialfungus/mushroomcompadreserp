# Backup and Restore Runbook

## Scope

This runbook covers Supabase Postgres, Supabase Storage COA attachments, Redis queue state, PowerSync configuration, and Shopify sync replay metadata for Mushroom Compadres ERP.

## Backup Policy

- Postgres: enable daily Supabase managed backups before launch and retain at least 14 days.
- Storage: export COA and attachment buckets daily to an EU-hosted object store with versioning enabled.
- Redis: persist BullMQ/queue data if using a managed Redis provider that supports snapshots; otherwise treat Redis as replayable and rely on `shopify_sync_events`, outbound sync logs, and reconciliation jobs.
- PowerSync: version sync rules in the repo and export production service settings after every change.
- Shopify: keep `shopify_sync_events`, cursors, outbound request logs, idempotency keys, and reconciliation job results in Postgres so sync can be replayed after restore.

## Restore Drill

1. Create an isolated restore environment in the same EU region as production.
2. Restore the latest Postgres backup.
3. Restore attachment buckets and verify at least one COA download from a restored lot.
4. Apply the current app migrations if the restored backup predates the deployed schema.
5. Start API and worker with restore-environment secrets.
6. Point PowerSync to the restored database and confirm replication starts without rule errors.
7. Run `/health/ready` and confirm API, worker, database, Redis, PowerSync, and Shopify states are understood.
8. Run Shopify order reconciliation in dry-run or restore mode before enabling outbound writes.
9. Trace one Shopify order from webhook event through sales order and shipment records.
10. Record restore start time, finish time, data timestamp, errors, and operator initials.

## Recovery Targets

- RPO: 24 hours for database and attachments until business signs off on a tighter target.
- RTO: 4 hours for API and PWA availability after a regional service failure.
- Shopify reconciliation: all missed webhooks since the restored cursor must be replayed before fulfillment resumes.

## Production Restore Notes

- Disable Shopify outbound inventory and fulfillment pushes until restored stock balances and open shipments are verified.
- Keep the old environment read-only until the restored environment passes health checks and order trace verification.
- After cutover, run reconciliation for Shopify orders, inventory, and fulfillment status.
- Archive the restore report with the release notes.
