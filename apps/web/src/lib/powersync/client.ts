import { createPowerSyncSdkSchema, powerSyncLocalSchema } from "./schema";
import type { InventoryMovementInput } from "../../types";

type PowerSyncCredentials = {
  endpoint: string;
  token: string;
};

type CrudEntry = {
  id: string;
  table: string;
  op: "PUT" | "PATCH" | "DELETE";
  opData?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

type CrudBatch = {
  crud: CrudEntry[];
  complete: () => Promise<void>;
};

type CrudDatabase = {
  getCrudBatch?: () => Promise<CrudBatch | null>;
};

const dynamicImport = new Function("specifier", "return import(specifier)") as (
  specifier: string
) => Promise<Record<string, unknown>>;

export const powerSyncConfig = {
  enabled: (import.meta.env.VITE_POWERSYNC_ENABLED as string | undefined) === "true",
  endpoint: import.meta.env.VITE_POWERSYNC_URL as string | undefined,
  databaseFilename: "mushroom-compadres.sqlite"
};

export class MushroomPowerSyncConnector {
  constructor(private readonly getAccessToken: () => string | null) {}

  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const token = this.getAccessToken();
    if (!token || !powerSyncConfig.endpoint) {
      throw new Error("PowerSync credentials are not configured");
    }

    return {
      endpoint: powerSyncConfig.endpoint,
      token
    };
  }

  async uploadData(database: CrudDatabase): Promise<void> {
    const batch = await database.getCrudBatch?.();
    if (!batch || batch.crud.length === 0) {
      return;
    }

    const token = this.getAccessToken();
    if (!token) {
      throw new Error("Missing API token for PowerSync upload");
    }

    const response = await fetch("/api/powersync/upload", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        operations: batch.crud.map((entry) => ({
          id: entry.id,
          table: entry.table,
          op: entry.op,
          data: entry.opData ?? entry.data ?? {}
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`PowerSync upload failed with ${response.status}`);
    }

    await batch.complete();
  }
}

export async function createConfiguredPowerSyncDatabase(getAccessToken: () => string | null) {
  if (!powerSyncConfig.enabled) {
    return null;
  }

  const sdk = await dynamicImport("@powersync/web");
  const schema = createPowerSyncSdkSchema(sdk as Parameters<typeof createPowerSyncSdkSchema>[0]);
  const PowerSyncDatabase = sdk.PowerSyncDatabase as new (options: unknown) => {
    connect: (connector: MushroomPowerSyncConnector, options?: unknown) => Promise<void> | void;
    execute: (sql: string, parameters?: unknown[]) => Promise<unknown>;
  };

  const db = new PowerSyncDatabase({
    schema,
    database: {
      dbFilename: powerSyncConfig.databaseFilename
    }
  });

  await db.connect(new MushroomPowerSyncConnector(getAccessToken), {
    crudUploadThrottleMs: 500
  });

  return db;
}

export function toPowerSyncStockMovementRow(
  input: InventoryMovementInput,
  movementType: "adjustment" | "transfer"
) {
  const now = new Date().toISOString();
  return {
    id: input.clientTransactionId,
    organization_id: "",
    client_transaction_id: input.clientTransactionId,
    movement_number: `LOCAL-${input.clientTransactionId}`,
    movement_type: movementType,
    item_type: input.itemType,
    item_id: input.itemId,
    lot_id: input.lotId ?? null,
    from_location_id: input.fromLocationId ?? null,
    to_location_id: input.toLocationId ?? null,
    quantity: input.quantity,
    uom: input.uom,
    occurred_at: now,
    recorded_by: "",
    source_type: null,
    source_id: null,
    reason_code: input.reasonCode ?? null,
    notes: input.notes ?? null,
    metadata_json: JSON.stringify({})
  };
}

export { powerSyncLocalSchema };
