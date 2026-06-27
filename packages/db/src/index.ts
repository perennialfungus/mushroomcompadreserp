export const databasePackage = {
  name: "db",
  service: "mushroom-compadres-erp"
} as const;

export * from "./db.js";
export * from "./migrate.js";
export * from "./schema.js";
export * from "./seed.js";
