import { describe, expect, it } from "vitest";
import { calculateMrpPlan, type MrpPlanInput } from "./mrp.js";

const horizonEnd = new Date("2026-07-31T00:00:00.000Z");

function baseInput(): MrpPlanInput {
  return {
    generatedAt: new Date("2026-06-26T00:00:00.000Z"),
    horizonEnd,
    locationIds: ["loc-pack"],
    itemCatalog: [
      { itemType: "product_variant", itemId: "kit", name: "Tincture kit", sku: "KIT", uom: "each" },
      { itemType: "product_variant", itemId: "extract", name: "Lion's Mane extract", sku: "EXT", uom: "l" },
      { itemType: "material", itemId: "mushroom", name: "Dried mushroom", sku: "RM-LM", uom: "kg" },
      { itemType: "packaging_component", itemId: "bottle", name: "Bottle", sku: "PKG-BTL", uom: "each" }
    ],
    demands: [
      {
        id: "so-line-1",
        sourceType: "sales_order",
        sourceId: "so-1",
        itemType: "product_variant",
        itemId: "kit",
        name: "Tincture kit",
        sku: "KIT",
        quantity: 10,
        uom: "each",
        neededAt: new Date("2026-07-10T00:00:00.000Z"),
        locationId: "loc-pack",
        description: "SO-1"
      }
    ],
    supplies: [
      {
        id: "stock-kit",
        sourceType: "on_hand",
        sourceId: "bal-kit",
        itemType: "product_variant",
        itemId: "kit",
        name: "Tincture kit",
        sku: "KIT",
        quantity: 2,
        uom: "each",
        availableAt: null,
        locationId: "loc-pack",
        description: "Released on hand"
      },
      {
        id: "stock-bottle",
        sourceType: "on_hand",
        sourceId: "bal-bottle",
        itemType: "packaging_component",
        itemId: "bottle",
        name: "Bottle",
        sku: "PKG-BTL",
        quantity: 3,
        uom: "each",
        availableAt: null,
        locationId: "loc-pack",
        description: "Released on hand"
      }
    ],
    boms: [
      {
        id: "bom-kit",
        productVariantId: "kit",
        versionCode: "v1",
        status: "active",
        yieldQuantity: 1,
        yieldUom: "each",
        effectiveFrom: null,
        effectiveTo: null,
        lines: [
          {
            id: "kit-extract",
            componentType: "product_variant",
            componentId: "extract",
            quantity: 0.05,
            uom: "l",
            wastePercent: 0,
            isCritical: true
          },
          {
            id: "kit-bottle",
            componentType: "packaging_component",
            componentId: "bottle",
            quantity: 1,
            uom: "each",
            wastePercent: 10,
            isCritical: true
          }
        ]
      },
      {
        id: "bom-extract",
        productVariantId: "extract",
        versionCode: "v1",
        status: "active",
        yieldQuantity: 1,
        yieldUom: "l",
        effectiveFrom: null,
        effectiveTo: null,
        lines: [
          {
            id: "extract-mushroom",
            componentType: "material",
            componentId: "mushroom",
            quantity: 2,
            uom: "kg",
            wastePercent: 5,
            isCritical: true
          }
        ]
      }
    ]
  };
}

describe("calculateMrpPlan", () => {
  it("calculates multi-level BOM shortages and suggestions", () => {
    const plan = calculateMrpPlan(baseInput());

    expect(plan.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ suggestionType: "production_order", itemId: "kit", quantity: 8 }),
        expect.objectContaining({ suggestionType: "production_order", itemId: "extract", quantity: 0.4 }),
        expect.objectContaining({ suggestionType: "purchase_order", itemId: "mushroom", quantity: 0.84 }),
        expect.objectContaining({ suggestionType: "purchase_order", itemId: "bottle", quantity: 5.8 })
      ])
    );
    expect(plan.shortages.find((shortage) => shortage.itemId === "bottle")).toMatchObject({
      quantityDemanded: 8.8,
      quantitySupplied: 3,
      shortageQuantity: 5.8
    });
  });

  it("honors planning horizon and location filters", () => {
    const input = baseInput();
    input.demands.push({
      id: "outside-location",
      sourceType: "sales_order",
      sourceId: "so-2",
      itemType: "product_variant",
      itemId: "kit",
      name: "Tincture kit",
      sku: "KIT",
      quantity: 99,
      uom: "each",
      neededAt: new Date("2026-07-10T00:00:00.000Z"),
      locationId: "loc-farm",
      description: "SO-2"
    });
    input.supplies.push({
      id: "late-po",
      sourceType: "purchase_order",
      sourceId: "po-1",
      itemType: "packaging_component",
      itemId: "bottle",
      name: "Bottle",
      sku: "PKG-BTL",
      quantity: 100,
      uom: "each",
      availableAt: new Date("2026-08-10T00:00:00.000Z"),
      locationId: "loc-pack",
      description: "Late PO"
    });

    const plan = calculateMrpPlan(input);

    expect(plan.shortages.find((shortage) => shortage.itemId === "kit")?.shortageQuantity).toBe(8);
    expect(plan.shortages.find((shortage) => shortage.itemId === "bottle")?.quantitySupplied).toBe(3);
  });

  it("creates time-phased buckets, capacity alerts, CTP promises, and scenario comparisons", () => {
    const input = baseInput();
    const plan = calculateMrpPlan({
      ...input,
      planningStart: new Date("2026-07-01T00:00:00.000Z"),
      leadTimes: [
        {
          id: "lt-kit",
          itemType: "product_variant",
          itemId: "kit",
          productionDays: 2,
          qcReleaseDays: 1
        }
      ],
      capacityCalendars: [
        {
          id: "cal-fill-1",
          resourceType: "work_center",
          resourceId: "wc-fill",
          resourceName: "Filling line",
          date: new Date("2026-07-08T00:00:00.000Z"),
          availableMinutes: 60
        },
        {
          id: "cal-fill-2",
          resourceType: "work_center",
          resourceId: "wc-fill",
          resourceName: "Filling line",
          date: new Date("2026-07-09T00:00:00.000Z"),
          availableMinutes: 180
        }
      ],
      productionOperations: [
        {
          id: "op-1",
          productionOrderId: "prod-1",
          orderNumber: "PROD-1",
          operationCode: "FILL",
          description: "Fill bottles",
          workCenterId: "wc-fill",
          workCenterName: "Filling line",
          sequence: 10,
          requiredMinutes: 90,
          scheduledStartAt: new Date("2026-07-08T08:00:00.000Z"),
          scheduledEndAt: new Date("2026-07-08T09:30:00.000Z"),
          dueAt: new Date("2026-07-09T17:00:00.000Z"),
          status: "ready"
        }
      ],
      ctpRequests: [
        {
          id: "ctp-1",
          salesOrderId: "so-1",
          orderNumber: "SO-1",
          salesOrderLineId: "so-line-1",
          itemType: "product_variant",
          itemId: "kit",
          name: "Tincture kit",
          sku: "KIT",
          quantity: 10,
          uom: "each",
          requestedAt: new Date("2026-07-05T00:00:00.000Z"),
          locationId: "loc-pack"
        }
      ],
      scenarioSnapshots: [
        {
          id: "live",
          name: "Live",
          createdAt: new Date("2026-07-01T00:00:00.000Z"),
          notes: null,
          horizonEnd,
          shortageCount: 4,
          totalShortageQuantity: 16,
          overloadedResourceCount: 1,
          latePromiseCount: 1
        },
        {
          id: "expedite",
          name: "Expedite",
          createdAt: new Date("2026-07-01T01:00:00.000Z"),
          notes: null,
          horizonEnd,
          shortageCount: 2,
          totalShortageQuantity: 8,
          overloadedResourceCount: 0,
          latePromiseCount: 0
        }
      ]
    });

    expect(plan.bucketLines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemId: "kit",
          bucketStart: new Date("2026-07-01T00:00:00.000Z"),
          supplyQuantity: 2,
          projectedAvailableQuantity: 2
        }),
        expect.objectContaining({
          itemId: "kit",
          bucketStart: new Date("2026-07-10T00:00:00.000Z"),
          demandQuantity: 10,
          shortageQuantity: 8
        })
      ])
    );
    expect(plan.capacityLoads).toEqual([
      expect.objectContaining({ resourceName: "Filling line", scheduledMinutes: 90, overloadMinutes: 30 }),
      expect.objectContaining({ resourceName: "Filling line", availableMinutes: 180, scheduledMinutes: 0 })
    ]);
    expect(plan.finiteCapacitySuggestions[0]).toMatchObject({
      operationId: "op-1",
      suggestedStartAt: new Date("2026-07-09T08:00:00.000Z")
    });
    expect(plan.scheduleRun).toMatchObject({
      operationCount: 1,
      overloadCount: 1
    });
    expect(plan.scheduleOperations[0]).toMatchObject({
      id: "op-1",
      finiteStartAt: new Date("2026-07-09T08:00:00.000Z"),
      finiteEndAt: new Date("2026-07-09T09:30:00.000Z")
    });
    expect(plan.dispatchBoard[0]).toMatchObject({
      id: "op-1",
      dispatchRank: 1,
      constraintSummary: expect.stringContaining("Finite capacity")
    });
    expect(plan.roughCutCapacity).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          resourceId: "wc-fill",
          plannedMinutes: 0,
          openMinutes: 90,
          overloadMinutes: 30
        })
      ])
    );
    expect(plan.capableToPromise[0]).toMatchObject({
      orderNumber: "SO-1",
      promiseStatus: "late_risk",
      promisedAt: new Date("2026-07-11T00:00:00.000Z")
    });
    expect(plan.alerts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "capacity_overload", sourceId: "wc-fill" }),
        expect.objectContaining({ type: "late_promise", sourceId: "so-1" })
      ])
    );
    expect(plan.scenarioComparisons[0]).toMatchObject({
      baselineId: "live",
      compareId: "expedite",
      shortageDelta: -2,
      overloadDelta: -1,
      latePromiseDelta: -1
    });
  });

  it("uses material shortages to constrain finite production starts", () => {
    const input = baseInput();
    input.demands.push({
      id: "prod-2-bottle",
      sourceType: "production_order",
      sourceId: "prod-2",
      itemType: "packaging_component",
      itemId: "bottle",
      name: "Bottle",
      sku: "PKG-BTL",
      quantity: 20,
      uom: "each",
      neededAt: new Date("2026-07-08T08:00:00.000Z"),
      locationId: "loc-pack",
      description: "PROD-2 component demand"
    });

    const plan = calculateMrpPlan({
      ...input,
      planningStart: new Date("2026-07-01T00:00:00.000Z"),
      capacityCalendars: [
        {
          id: "cal-pack-1",
          resourceType: "work_center",
          resourceId: "wc-pack",
          resourceName: "Packing bench",
          date: new Date("2026-07-08T00:00:00.000Z"),
          availableMinutes: 240
        },
        {
          id: "cal-pack-2",
          resourceType: "work_center",
          resourceId: "wc-pack",
          resourceName: "Packing bench",
          date: horizonEnd,
          availableMinutes: 240
        }
      ],
      productionOperations: [
        {
          id: "op-prod-2",
          productionOrderId: "prod-2",
          orderNumber: "PROD-2",
          operationCode: "PACK",
          description: "Pack bottles",
          workCenterId: "wc-pack",
          workCenterName: "Packing bench",
          sequence: 10,
          requiredMinutes: 60,
          scheduledStartAt: new Date("2026-07-08T08:00:00.000Z"),
          scheduledEndAt: new Date("2026-07-08T09:00:00.000Z"),
          dueAt: new Date("2026-07-09T17:00:00.000Z"),
          status: "ready"
        }
      ]
    });

    expect(plan.materialConstraints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productionOrderId: "prod-2",
          itemId: "bottle",
          shortageQuantity: 25.8,
          explanation: expect.stringContaining("production can start after replenishment")
        })
      ])
    );
    expect(plan.scheduleOperations[0]).toMatchObject({
      id: "op-prod-2",
      constrainedByMaterialUntil: new Date("2026-07-08T08:00:00.000Z")
    });
    expect(plan.scheduleOperations[0]?.warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "material_shortage" })])
    );
  });
});
