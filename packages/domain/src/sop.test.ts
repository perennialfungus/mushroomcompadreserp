import { describe, expect, it } from "vitest";
import { DomainValidationError } from "./errors.js";
import {
  aggregateForecastLines,
  compareScenarioRiskSets,
  scoreScenarioRisks,
  type ForecastLine,
  type PlanningScenario
} from "./sop.js";
import type { MrpPlan } from "./mrp.js";

const baseLine: ForecastLine = {
  id: "line-1",
  forecastId: "forecast-1",
  productVariantId: "variant-1",
  sku: "LM-TINC-50",
  productName: "Lion's Mane Tincture 50 ml",
  productFamily: "tincture",
  customerId: null,
  resellerId: "reseller-1",
  shopifyChannel: "shopify_online",
  region: "PT",
  periodStart: new Date("2026-07-06T00:00:00.000Z"),
  periodEnd: new Date("2026-07-12T23:59:59.000Z"),
  scenarioId: "scenario-1",
  quantity: 100,
  uom: "bottle"
};

describe("S&OP forecasting domain", () => {
  it("aggregates forecast lines with drivers and audited manual overrides", () => {
    const result = aggregateForecastLines(
      [{ ...baseLine, manualOverrideQuantity: 150, manualOverrideReason: "Confirmed reseller campaign." }],
      [
        {
          id: "driver-1",
          forecastLineId: "line-1",
          driverType: "historical_sales",
          quantityImpact: 20,
          confidence: 0.8,
          reason: "Recent sales run rate."
        },
        {
          id: "driver-2",
          forecastLineId: "line-1",
          driverType: "promotion",
          quantityImpact: 30,
          confidence: 0.7,
          reason: "Bundle promotion."
        }
      ]
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      quantity: 150,
      manualOverrideReason: "Confirmed reseller campaign.",
      driverBreakdown: expect.objectContaining({ historical_sales: 20, promotion: 30 })
    });
  });

  it("requires a reason for manual forecast overrides", () => {
    expect(() => aggregateForecastLines([{ ...baseLine, manualOverrideQuantity: 150 }])).toThrow(DomainValidationError);
  });

  it("scores and compares scenario risk sets", () => {
    const scenario = scenarioRecord("scenario-a");
    const risks = scoreScenarioRisks({
      scenario,
      plan: planWithRisks(),
      expiringStock: [{
        id: "lot-1",
        itemName: "Lion's Mane Tincture 50 ml",
        quantity: 24,
        uom: "bottle",
        expiresAt: new Date("2026-07-10T00:00:00.000Z")
      }],
      purchaseSpend: [{
        id: "po-1",
        supplierName: "Glassworks",
        amount: 1420,
        currency: "EUR",
        expectedAt: new Date("2026-07-05T00:00:00.000Z")
      }],
      serviceLevelTarget: 0.98
    });

    expect(risks).toEqual(expect.arrayContaining([
      expect.objectContaining({ riskType: "shortage", severity: "critical" }),
      expect.objectContaining({ riskType: "capacity_overload" }),
      expect.objectContaining({ riskType: "expiring_stock" }),
      expect.objectContaining({ riskType: "purchase_spend" }),
      expect.objectContaining({ riskType: "service_level" })
    ]));

    const comparison = compareScenarioRiskSets("baseline", "scenario-a", [], risks);
    expect(comparison).toMatchObject({
      baselineScenarioId: "baseline",
      compareScenarioId: "scenario-a",
      shortageDelta: 1,
      capacityOverloadDelta: 1,
      expiringStockDelta: 1,
      serviceRiskDelta: 1
    });
    expect(comparison.purchaseSpendDelta).toBe(1420);
  });
});

function scenarioRecord(id: string): PlanningScenario {
  return {
    id,
    name: id,
    status: "review",
    forecastId: null,
    horizonStart: new Date("2026-07-01T00:00:00.000Z"),
    horizonEnd: new Date("2026-07-31T23:59:59.000Z"),
    notes: null,
    createdAt: new Date("2026-06-26T00:00:00.000Z")
  };
}

function planWithRisks(): MrpPlan {
  const now = new Date("2026-06-26T00:00:00.000Z");
  return {
    generatedAt: now,
    horizonEnd: new Date("2026-07-31T23:59:59.000Z"),
    planningStart: now,
    bucketGranularity: "week",
    locationIds: [],
    shortages: [{
      key: "product_variant:variant-1:bottle:loc-pack",
      itemType: "product_variant",
      itemId: "variant-1",
      name: "Lion's Mane Tincture 50 ml",
      sku: "LM-TINC-50",
      uom: "bottle",
      locationId: "loc-pack",
      quantityDemanded: 100,
      quantitySupplied: 20,
      shortageQuantity: 80,
      demands: [{
        id: "forecast:1",
        sourceType: "forecast",
        sourceId: "forecast-1",
        itemType: "product_variant",
        itemId: "variant-1",
        name: "Lion's Mane Tincture 50 ml",
        sku: "LM-TINC-50",
        quantity: 100,
        uom: "bottle",
        neededAt: new Date("2026-07-06T00:00:00.000Z"),
        locationId: "loc-pack",
        description: "Forecast demand"
      }],
      supplies: [],
      suggestions: []
    }],
    suggestions: [],
    bucketLines: [],
    capacityLoads: [{
      id: "work_center:wc-1:2026-07-06",
      resourceType: "work_center",
      resourceId: "wc-1",
      resourceName: "Bottling line",
      bucketStart: new Date("2026-07-06T00:00:00.000Z"),
      bucketEnd: new Date("2026-07-12T23:59:59.000Z"),
      availableMinutes: 60,
      scheduledMinutes: 100,
      loadPercent: 166.666667,
      overloadMinutes: 40,
      operationIds: ["op-1"]
    }],
    finiteCapacitySuggestions: [],
    capableToPromise: [{
      id: "ctp-1",
      salesOrderId: "order-1",
      orderNumber: "WS-1",
      salesOrderLineId: "line-1",
      itemType: "product_variant",
      itemId: "variant-1",
      name: "Lion's Mane Tincture 50 ml",
      sku: "LM-TINC-50",
      uom: "bottle",
      requestedAt: now,
      locationId: "loc-pack",
      requestedQuantity: 100,
      promisedAt: null,
      promiseStatus: "not_capable",
      explanation: [],
      contributingSupplies: []
    }],
    scheduleRun: {
      id: "schedule-1",
      runNumber: "S-1",
      generatedAt: now,
      status: "draft",
      horizonStart: now,
      horizonEnd: new Date("2026-07-31T23:59:59.000Z"),
      operationCount: 0,
      overloadCount: 0,
      materialConstraintCount: 0,
      lateOperationCount: 0,
      explanation: []
    },
    scheduleOperations: [],
    roughCutCapacity: [],
    dispatchBoard: [],
    materialConstraints: [],
    scheduleAudits: [],
    alerts: [],
    scenarioSnapshots: [],
    scenarioComparisons: [],
    demandCount: 1,
    supplyCount: 0
  };
}
