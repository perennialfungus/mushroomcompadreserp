import { describe, expect, it } from "vitest";
import {
  defaultAlertRules,
  evaluateOperationalAlerts,
  isAlertVisible,
  type AlertEvent
} from "./operational-alerts.js";

const asOf = new Date("2026-06-27T12:00:00.000Z");

describe("operational alerts", () => {
  it("generates role-targeted exceptions with drill-down links", () => {
    const result = evaluateOperationalAlerts({
      organizationId: "org-mc",
      asOf,
      rules: defaultAlertRules,
      productionOrders: [
        {
          id: "po-late",
          orderNumber: "PO-2026-041",
          status: "released",
          dueAt: new Date("2026-06-26T17:00:00.000Z")
        }
      ],
      qcTasks: [
        {
          id: "qc-overdue",
          taskCode: "QCT-041",
          status: "pending",
          dueAt: new Date("2026-06-26T10:00:00.000Z"),
          subjectLabel: "LM-2026-06"
        }
      ],
      lots: [
        {
          id: "lot-expiring",
          lotCode: "LM-EXP-01",
          itemName: "Lion's Mane Tincture 50 ml",
          qcStatus: "released",
          status: "active",
          expiresAt: new Date("2026-07-10T00:00:00.000Z")
        }
      ]
    });

    expect(result.newEvents).toHaveLength(3);
    expect(result.events.map((event) => event.ruleType).sort()).toEqual([
      "expiring_lot",
      "late_production",
      "qc_overdue"
    ]);
    expect(result.events.find((event) => event.ruleType === "late_production")?.actionHref).toBe("/production?orderId=po-late");
    expect(result.events.find((event) => event.ruleType === "qc_overdue")?.roleTargets).toContain("qc");
  });

  it("does not create duplicate alert events for the same source exception", () => {
    const first = evaluateOperationalAlerts({
      organizationId: "org-mc",
      asOf,
      rules: defaultAlertRules,
      lowStock: [
        {
          id: "stock-lm",
          itemType: "product_variant",
          itemId: "var-lm",
          itemName: "Lion's Mane Tincture 50 ml",
          itemSku: "LM-TINC-50",
          locationId: "loc-pack",
          locationName: "Packing Room",
          availableQuantity: 12,
          minimumQuantity: 48,
          uom: "bottle"
        }
      ]
    });
    const existing = first.events[0] as AlertEvent;
    const second = evaluateOperationalAlerts({
      organizationId: "org-mc",
      asOf: new Date("2026-06-27T13:00:00.000Z"),
      rules: defaultAlertRules,
      existingEvents: [{ ...existing, status: "acknowledged", acknowledgedBy: "user-owner", acknowledgedAt: asOf }],
      lowStock: [
        {
          id: "stock-lm",
          itemType: "product_variant",
          itemId: "var-lm",
          itemName: "Lion's Mane Tincture 50 ml",
          itemSku: "LM-TINC-50",
          locationId: "loc-pack",
          locationName: "Packing Room",
          availableQuantity: 10,
          minimumQuantity: 48,
          uom: "bottle"
        }
      ]
    });

    expect(first.newEvents).toHaveLength(1);
    expect(second.newEvents).toHaveLength(0);
    expect(second.events[0]?.id).toBe(existing.id);
    expect(second.events[0]?.status).toBe("acknowledged");
  });

  it("hides active snoozed alerts until the snooze window expires", () => {
    const event = evaluateOperationalAlerts({
      organizationId: "org-mc",
      asOf,
      rules: defaultAlertRules,
      supplierDocuments: [
        {
          id: "doc-organic-cert",
          supplierId: "supplier-algarve",
          supplierName: "Algarve Botanicals",
          documentType: "Organic certificate",
          expiresAt: new Date("2026-06-28T00:00:00.000Z")
        }
      ]
    }).events[0]!;

    expect(isAlertVisible({ ...event, status: "snoozed", snoozedUntil: new Date("2026-06-28T12:00:00.000Z") }, asOf)).toBe(false);
    expect(isAlertVisible({ ...event, status: "snoozed", snoozedUntil: new Date("2026-06-27T11:00:00.000Z") }, asOf)).toBe(true);
  });
});
