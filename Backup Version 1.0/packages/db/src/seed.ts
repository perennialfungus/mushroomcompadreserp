import { createDb, createPool } from "./db.js";
import { locations, organizations, products, roles } from "./schema.js";

const organizationId = "00000000-0000-4000-8000-000000000001";

const seedRoles = [
  ["00000000-0000-4000-8000-000000000101", "owner_admin", "Owner/Admin", "Full operational and administrative access"],
  ["00000000-0000-4000-8000-000000000102", "production_farm", "Production/Farm", "Cultivation, harvest, drying, and batch work"],
  ["00000000-0000-4000-8000-000000000103", "packing_fulfillment", "Packing/Fulfillment", "Picking, packing, allocation, and shipment work"],
  ["00000000-0000-4000-8000-000000000104", "sales_wholesale", "Sales/Wholesale", "Wholesale sales, resellers, and CRM work"],
  ["00000000-0000-4000-8000-000000000105", "auditor", "Auditor", "Read-only compliance and traceability access"]
] as const;

const seedLocations = [
  ["00000000-0000-4000-8000-000000000201", "FARM", "Rogil Farm", "farm"],
  ["00000000-0000-4000-8000-000000000202", "DRY", "Drying Room", "drying"],
  ["00000000-0000-4000-8000-000000000203", "PROD", "Production Kitchen", "production"],
  ["00000000-0000-4000-8000-000000000204", "PACK", "Packing Bench", "packing"],
  ["00000000-0000-4000-8000-000000000205", "WH", "Finished Goods Warehouse", "warehouse"],
  ["00000000-0000-4000-8000-000000000206", "SHOPIFY", "Shopify Virtual Stock", "retail_shopify"],
  ["00000000-0000-4000-8000-000000000207", "QUAR", "Quarantine Hold", "quarantine"]
] as const;

const seedProducts = [
  ["00000000-0000-4000-8000-000000000301", "Tinctures", "tincture", "unit"],
  ["00000000-0000-4000-8000-000000000302", "Mushroom Coffee and Cacao", "coffee_cacao", "unit"],
  ["00000000-0000-4000-8000-000000000303", "Chocolate Bars", "chocolate", "unit"],
  ["00000000-0000-4000-8000-000000000304", "Capsules", "capsule", "unit"],
  ["00000000-0000-4000-8000-000000000305", "Powders", "powder", "g"],
  ["00000000-0000-4000-8000-000000000306", "Merch", "merch", "unit"]
] as const;

export async function seedDatabase(connectionString = process.env.DATABASE_URL) {
  const pool = createPool(connectionString);
  const db = createDb(pool);

  try {
    await db.insert(organizations).values({
      id: organizationId,
      name: "Mushroom Compadres",
      defaultCurrency: "EUR",
      defaultLocale: "en",
      timezone: "Europe/Lisbon",
      settingsJson: {
        supportedLocales: ["en", "pt"],
        supportedCurrencies: ["EUR", "GBP"]
      }
    }).onConflictDoUpdate({
      target: organizations.id,
      set: {
        name: "Mushroom Compadres",
        defaultCurrency: "EUR",
        defaultLocale: "en",
        timezone: "Europe/Lisbon",
        settingsJson: {
          supportedLocales: ["en", "pt"],
          supportedCurrencies: ["EUR", "GBP"]
        }
      }
    });

    for (const [id, code, name, description] of seedRoles) {
      await db.insert(roles).values({
        id,
        organizationId,
        code,
        name,
        description
      }).onConflictDoUpdate({
        target: [roles.organizationId, roles.code],
        set: { name, description }
      });
    }

    for (const [id, code, name, type] of seedLocations) {
      await db.insert(locations).values({
        id,
        organizationId,
        code,
        name,
        type,
        countryCode: "PT",
        isActive: true
      }).onConflictDoUpdate({
        target: [locations.organizationId, locations.code],
        set: { name, type, countryCode: "PT", isActive: true }
      });
    }

    for (const [id, name, category, defaultUom] of seedProducts) {
      await db.insert(products).values({
        id,
        organizationId,
        name,
        category,
        defaultUom,
        descriptionI18n: {
          en: name,
          pt: name
        },
        status: "active"
      }).onConflictDoUpdate({
        target: [products.organizationId, products.name],
        set: {
          category,
          defaultUom,
          descriptionI18n: {
            en: name,
            pt: name
          },
          status: "active"
        }
      });
    }
  } finally {
    await pool.end();
  }
}

if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  await seedDatabase();
}
