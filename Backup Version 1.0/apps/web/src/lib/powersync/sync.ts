import type { InventoryMovementInput } from "../../types";
import { toPowerSyncStockMovementRow } from "./client";

export type SyncConflict = {
  id: string;
  table: string;
  clientTransactionId: string;
  message: string;
  code?: string;
  details?: unknown;
  area?: string;
  action?: string;
  createdAt: string;
};

export type SyncStatusSnapshot = {
  online: boolean;
  pendingUploads: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  conflicts: SyncConflict[];
};

type QueuedInventoryMovement = {
  id: string;
  token: string;
  table: "stock_movements";
  movementType: "adjustment" | "transfer";
  input: InventoryMovementInput;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  status: "pending" | "uploading" | "uploaded" | "conflict" | "error";
  lastError: string | null;
};

type QueuedOfflineCommand = {
  id: string;
  token: string;
  table:
    | "harvests"
    | "drying_runs"
    | "processing_batches"
    | "batch_inputs"
    | "batch_outputs"
    | "stock_count_sessions"
    | "order_allocations"
    | "shipments";
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  status: "pending" | "uploading" | "uploaded" | "conflict" | "error";
  lastError: string | null;
};

type QueuedUpload = QueuedInventoryMovement | QueuedOfflineCommand;

const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
const queueKey = "mc:powersync:upload-queue:v1";
const statusKey = "mc:powersync:status:v1";
const conflictKey = "mc:powersync:conflicts:v1";
const listeners = new Set<() => void>();
let cachedStatusSignature: string | null = null;
let cachedStatusSnapshot: SyncStatusSnapshot | null = null;

function storageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!storageAvailable()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!storageAvailable()) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readQueue(): QueuedUpload[] {
  return readJson<QueuedUpload[]>(queueKey, []);
}

function writeQueue(queue: QueuedUpload[]): void {
  writeJson(queueKey, queue);
  emit();
}

function readConflicts(): SyncConflict[] {
  return readJson<SyncConflict[]>(conflictKey, []);
}

function writeConflicts(conflicts: SyncConflict[]): void {
  writeJson(conflictKey, conflicts);
  emit();
}

function readStoredStatus(): Pick<SyncStatusSnapshot, "lastSyncedAt" | "lastError"> {
  return readJson(statusKey, { lastSyncedAt: null, lastError: null });
}

function writeStoredStatus(status: Pick<SyncStatusSnapshot, "lastSyncedAt" | "lastError">): void {
  writeJson(statusKey, status);
  emit();
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeToSyncStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSyncStatusSnapshot(): SyncStatusSnapshot {
  const queue = readQueue();
  const stored = readStoredStatus();
  const conflicts = readConflicts();
  const snapshot = {
    online: typeof navigator === "undefined" ? true : navigator.onLine,
    pendingUploads: queue.filter((entry) => entry.status === "pending" || entry.status === "uploading").length,
    lastSyncedAt: stored.lastSyncedAt,
    lastError: stored.lastError,
    conflicts
  };
  const signature = JSON.stringify(snapshot);
  if (cachedStatusSnapshot && cachedStatusSignature === signature) {
    return cachedStatusSnapshot;
  }

  cachedStatusSignature = signature;
  cachedStatusSnapshot = snapshot;
  return snapshot;
}

export function canUseOfflineInventoryQueue(token: string): boolean {
  return (
    token === "test-owner" ||
    token === "test-staff" ||
    (import.meta.env.VITE_POWERSYNC_OFFLINE_WRITES as string | undefined) === "true"
  );
}

export function enqueuePowerSyncInventoryMovement(
  token: string,
  movementType: "adjustment" | "transfer",
  input: InventoryMovementInput
): void {
  const now = new Date().toISOString();
  const queue = readQueue();
  if (queue.some((entry) => entry.id === input.clientTransactionId)) {
    return;
  }

  writeQueue([
    ...queue,
    {
      id: input.clientTransactionId,
      token,
      table: "stock_movements",
      movementType,
      input,
      createdAt: now,
      updatedAt: now,
      attempts: 0,
      status: "pending",
      lastError: null
    }
  ]);
}

export function enqueueOfflineCommand(
  token: string,
  table: QueuedOfflineCommand["table"],
  id: string,
  data: Record<string, unknown>
): void {
  const now = new Date().toISOString();
  const queue = readQueue();
  if (queue.some((entry) => entry.id === id)) {
    return;
  }

  writeQueue([
    ...queue,
    {
      id,
      token,
      table,
      data,
      createdAt: now,
      updatedAt: now,
      attempts: 0,
      status: "pending",
      lastError: null
    }
  ]);
}

export function listPendingOfflineCommands(): QueuedUpload[] {
  return readQueue().filter((entry) => entry.status === "pending" || entry.status === "uploading" || entry.status === "error");
}

export async function flushPowerSyncUploads(token: string): Promise<void> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    emit();
    return;
  }

  const queue = readQueue();
  const pending = queue.filter(
    (entry) => entry.token === token && (entry.status === "pending" || entry.status === "error")
  );
  if (pending.length === 0) {
    writeStoredStatus({ ...readStoredStatus(), lastError: null });
    return;
  }

  writeQueue(
    queue.map((entry) =>
      pending.some((candidate) => candidate.id === entry.id)
        ? { ...entry, status: "uploading", attempts: entry.attempts + 1, updatedAt: new Date().toISOString() }
        : entry
    )
  );

  if (token === "test-owner" || token === "test-staff") {
    writeQueue(readQueue().filter((entry) => !pending.some((candidate) => candidate.id === entry.id)));
    writeStoredStatus({ lastSyncedAt: new Date().toISOString(), lastError: null });
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/powersync/upload`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        operations: pending.map((entry) =>
          entry.table === "stock_movements"
            ? {
                id: entry.id,
                table: "stock_movements",
                op: "PUT",
                data: toPowerSyncStockMovementRow(entry.input, entry.movementType)
              }
            : {
                id: entry.id,
                table: entry.table,
                op: "PUT",
                data: entry.data
              }
        )
      })
    });

    if (!response.ok) {
      throw new Error(`Upload failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      results?: Array<{
        id: string;
        table: string;
        status: "applied" | "conflict" | "rejected";
        message?: string;
        code?: string;
        details?: unknown;
      }>;
    };
    const results = payload.results ?? [];
    const conflicts = results.filter((result) => result.status === "conflict" || result.status === "rejected");

    if (conflicts.length > 0) {
      writeConflicts([
        ...readConflicts(),
        ...conflicts.map((conflict) => {
          const syncConflict: SyncConflict = {
            id: conflict.id,
            table: conflict.table,
            clientTransactionId: conflict.id,
            message: conflict.message ?? "Upload command was rejected.",
            details: conflict.details,
            createdAt: new Date().toISOString()
          };
          if (conflict.code) {
            syncConflict.code = conflict.code;
          }
          if (conflict.details && typeof conflict.details === "object" && "area" in conflict.details) {
            syncConflict.area = String((conflict.details as { area?: unknown }).area);
          }
          if (conflict.details && typeof conflict.details === "object" && "action" in conflict.details) {
            syncConflict.action = String((conflict.details as { action?: unknown }).action);
          }
          return syncConflict;
        })
      ]);
    }

    writeQueue(readQueue().filter((entry) => !pending.some((candidate) => candidate.id === entry.id)));
    writeStoredStatus({
      lastSyncedAt: new Date().toISOString(),
      lastError: conflicts[0]?.message ?? null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    writeQueue(
      readQueue().map((entry) =>
        pending.some((candidate) => candidate.id === entry.id)
          ? { ...entry, status: "error", lastError: message, updatedAt: new Date().toISOString() }
          : entry
      )
    );
    writeStoredStatus({ ...readStoredStatus(), lastError: message });
  }
}

export function clearSyncConflict(id: string): void {
  writeConflicts(readConflicts().filter((conflict) => conflict.id !== id));
}

export function retrySyncConflict(id: string): void {
  clearSyncConflict(id);
  emit();
}

export function notifyOnlineStatusChanged(): void {
  emit();
}
