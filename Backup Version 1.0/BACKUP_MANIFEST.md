# Backup Version 1.0

Created: 2026-06-27

This folder is a source snapshot of the Mushroom Compadres ERP workspace at the time the backup was created.

## Included

- Monorepo source code for `apps`, `packages`, and `docs`
- Root project configuration, lockfile, workspace files, and setup docs
- Product specification, architecture notes, and build prompt library
- Web brand assets, import templates, migrations, tests, and e2e specs
- `MASTER_REPLICATION_PROMPT.md`, a standalone prompt intended to help another AI coding agent reproduce the build

## Intentionally Excluded

- `.git` repository internals
- `.codex-push` staging clone
- `node_modules`
- `.pnpm-store`
- `test-results`
- `dist` and `build` outputs
- transient `.codex-*.log` files

Those exclusions keep the backup portable and prevent recursive or dependency-heavy copies. Restore by copying this folder's contents into a fresh working directory, then running `pnpm install`.

