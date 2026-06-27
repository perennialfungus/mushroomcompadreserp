export type PowerSyncColumnType = "text" | "integer" | "real";

export type PowerSyncTableSchema = {
  columns: Record<string, PowerSyncColumnType>;
  indexes?: Record<string, string[]>;
};

export const powerSyncLocalSchema = {
  users: {
    columns: {
      auth_user_id: "text",
      organization_id: "text",
      email: "text",
      display_name: "text",
      status: "text",
      locale: "text",
      updated_at: "text",
      version: "integer"
    },
    indexes: {
      organization: ["organization_id"],
      authUser: ["auth_user_id"]
    }
  },
  roles: {
    columns: {
      organization_id: "text",
      code: "text",
      name: "text",
      description: "text",
      updated_at: "text"
    },
    indexes: {
      organization: ["organization_id"],
      code: ["code"]
    }
  },
  locations: {
    columns: {
      organization_id: "text",
      code: "text",
      name: "text",
      type: "text",
      country_code: "text",
      shopify_location_gid: "text",
      is_active: "integer",
      updated_at: "text",
      version: "integer"
    },
    indexes: {
      organization: ["organization_id"],
      active: ["organization_id", "is_active"]
    }
  },
  products: {
    columns: {
      organization_id: "text",
      name: "text",
      category: "text",
      description_i18n: "text",
      status: "text",
      brand: "text",
      default_uom: "text",
      updated_at: "text",
      version: "integer"
    },
    indexes: {
      organization: ["organization_id"],
      status: ["organization_id", "status"]
    }
  },
  product_variants: {
    columns: {
      organization_id: "text",
      product_id: "text",
      sku: "text",
      barcode: "text",
      name_i18n: "text",
      form: "text",
      track_lots: "integer",
      track_expiry: "integer",
      inventory_uom: "text",
      sellable_uom: "text",
      net_quantity: "real",
      status: "text",
      shopify_variant_gid: "text",
      shopify_inventory_item_gid: "text",
      updated_at: "text",
      version: "integer"
    },
    indexes: {
      product: ["product_id"],
      sku: ["organization_id", "sku"],
      status: ["organization_id", "status"]
    }
  },
  lots: {
    columns: {
      organization_id: "text",
      lot_code: "text",
      item_type: "text",
      item_id: "text",
      item_name: "text",
      item_sku: "text",
      source_type: "text",
      source_id: "text",
      manufactured_at: "text",
      received_at: "text",
      expires_at: "text",
      qc_status: "text",
      status: "text",
      parent_lot_id: "text",
      metadata_json: "text",
      created_at: "text",
      updated_at: "text",
      version: "integer"
    },
    indexes: {
      item: ["organization_id", "item_type", "item_id"],
      lotCode: ["organization_id", "lot_code"],
      qc: ["organization_id", "qc_status"]
    }
  },
  stock_movements: {
    columns: {
      organization_id: "text",
      client_transaction_id: "text",
      movement_number: "text",
      movement_type: "text",
      item_type: "text",
      item_id: "text",
      lot_id: "text",
      from_location_id: "text",
      to_location_id: "text",
      quantity: "real",
      uom: "text",
      occurred_at: "text",
      recorded_by: "text",
      source_type: "text",
      source_id: "text",
      reason_code: "text",
      notes: "text",
      metadata_json: "text"
    },
    indexes: {
      transaction: ["organization_id", "client_transaction_id"],
      item: ["organization_id", "item_type", "item_id"],
      lot: ["lot_id"]
    }
  },
  inventory_balances: {
    columns: {
      organization_id: "text",
      item_type: "text",
      item_id: "text",
      lot_id: "text",
      location_id: "text",
      location_name: "text",
      location_code: "text",
      item_name: "text",
      item_sku: "text",
      lot_code: "text",
      expires_at: "text",
      available_quantity: "real",
      reserved_quantity: "real",
      held_quantity: "real",
      uom: "text"
    },
    indexes: {
      itemLocation: ["organization_id", "item_type", "item_id", "location_id"],
      lotLocation: ["lot_id", "location_id"]
    }
  },
  sync_conflicts: {
    columns: {
      organization_id: "text",
      client_transaction_id: "text",
      table_name: "text",
      status: "text",
      code: "text",
      message: "text",
      details_json: "text",
      created_at: "text",
      resolved_at: "text"
    },
    indexes: {
      organization: ["organization_id"],
      transaction: ["client_transaction_id"],
      status: ["organization_id", "status"]
    }
  }
} satisfies Record<string, PowerSyncTableSchema>;

export const localSQLiteSchemaSql = Object.entries(powerSyncLocalSchema).map(([tableName, table]) => {
  const columns = Object.entries(table.columns)
    .map(([columnName, columnType]) => `  ${columnName} ${columnType.toUpperCase()}`)
    .join(",\n");
  return `CREATE TABLE IF NOT EXISTS ${tableName} (\n  id TEXT PRIMARY KEY,\n${columns}\n);`;
});

export function createPowerSyncSdkSchema(sdk: {
  column: Record<PowerSyncColumnType, unknown>;
  Table: new (columns: Record<string, unknown>, options?: { indexes?: Record<string, string[]> }) => unknown;
  Schema: new (tables: Record<string, unknown>) => unknown;
}) {
  const tables = Object.fromEntries(
    Object.entries(powerSyncLocalSchema).map(([tableName, table]) => [
      tableName,
      new sdk.Table(
        Object.fromEntries(
          Object.entries(table.columns).map(([columnName, columnType]) => [
            columnName,
            sdk.column[columnType]
          ])
        ),
        table.indexes ? { indexes: table.indexes } : undefined
      )
    ])
  );

  return new sdk.Schema(tables);
}
