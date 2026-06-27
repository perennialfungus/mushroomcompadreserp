import { describe, expect, it } from "vitest";
import {
  calculateSupplierScorecard,
  decideIncomingInspection,
  documentStatus,
  evaluateSupplierApprovalGate
} from "./supplier-quality.js";

describe("supplier quality gates", () => {
  const asOf = new Date("2026-06-27T00:00:00.000Z");

  it("blocks unapproved supplier/material combinations", () => {
    const result = evaluateSupplierApprovalGate({
      supplierId: "supplier-a",
      asOf,
      lines: [{ id: "line-1", itemType: "material", itemId: "mat-a" }],
      approvals: []
    });

    expect(result.approved).toBe(false);
    expect(result.issues).toEqual([
      expect.objectContaining({
        severity: "blocker",
        code: "missing_supplier_approval",
        lineId: "line-1"
      })
    ]);
  });

  it("warns when qualification review is due but keeps conditional approvals purchasable", () => {
    const result = evaluateSupplierApprovalGate({
      supplierId: "supplier-a",
      asOf,
      lines: [{ id: "line-1", itemType: "packaging_component", itemId: "pkg-a" }],
      approvals: [
        {
          id: "approval-a",
          supplierId: "supplier-a",
          itemType: "packaging_component",
          itemId: "pkg-a",
          status: "conditional",
          effectiveFrom: "2026-01-01T00:00:00.000Z",
          expiresAt: "2026-12-31T00:00:00.000Z",
          nextReviewAt: "2026-07-01T00:00:00.000Z",
          reviewCadenceDays: 180
        }
      ]
    });

    expect(result.approved).toBe(true);
    expect(result.issues).toEqual([
      expect.objectContaining({
        severity: "warning",
        code: "supplier_review_due"
      })
    ]);
  });

  it("blocks expired supplier documents", () => {
    const result = evaluateSupplierApprovalGate({
      supplierId: "supplier-a",
      asOf,
      lines: [{ id: "line-1", itemType: "material", itemId: "mat-a" }],
      approvals: [
        {
          id: "approval-a",
          supplierId: "supplier-a",
          itemType: "material",
          itemId: "mat-a",
          status: "qualified",
          effectiveFrom: "2026-01-01T00:00:00.000Z",
          expiresAt: "2026-12-31T00:00:00.000Z"
        }
      ],
      documents: [
        {
          id: "doc-a",
          supplierId: "supplier-a",
          approvalId: "approval-a",
          documentType: "Organic certificate",
          expiresAt: "2026-05-31T00:00:00.000Z"
        }
      ]
    });

    expect(result.approved).toBe(false);
    expect(result.issues).toEqual([
      expect.objectContaining({
        severity: "blocker",
        code: "supplier_document_expired"
      })
    ]);
  });

  it("chooses the highest matching incoming inspection risk", () => {
    expect(
      decideIncomingInspection({
        supplierId: "supplier-a",
        itemType: "material",
        itemId: "mat-a",
        approvalStatus: "qualified",
        supplierScore: 72,
        plans: [
          {
            id: "plan-low",
            supplierId: null,
            itemType: "material",
            itemId: null,
            riskLevel: "low",
            required: true
          },
          {
            id: "plan-high",
            supplierId: "supplier-a",
            itemType: "material",
            itemId: "mat-a",
            riskLevel: "high",
            required: true
          }
        ]
      })
    ).toMatchObject({
      required: true,
      riskLevel: "high",
      planIds: ["plan-low", "plan-high"]
    });
  });

  it("calculates scorecard metrics from receipt, QC, deviation, and document facts", () => {
    const metrics = calculateSupplierScorecard(
      "supplier-a",
      {
        purchaseOrders: [
          { id: "po-1", supplierId: "supplier-a", expectedAt: "2026-06-20T00:00:00.000Z" },
          { id: "po-2", supplierId: "supplier-a", expectedAt: "2026-06-20T00:00:00.000Z" }
        ],
        receipts: [
          { id: "receipt-1", supplierId: "supplier-a", purchaseOrderId: "po-1", receivedAt: "2026-06-19T00:00:00.000Z" },
          { id: "receipt-2", supplierId: "supplier-a", purchaseOrderId: "po-2", receivedAt: "2026-06-21T00:00:00.000Z" }
        ],
        qcTasks: [
          { id: "task-1", supplierId: "supplier-a", status: "completed", latestResultStatus: "approved" },
          { id: "task-2", supplierId: "supplier-a", status: "completed", latestResultStatus: "fail" }
        ],
        qualityEvents: [{ id: "qe-1", supplierId: "supplier-a", status: "open" }],
        documents: [
          { id: "doc-current", supplierId: "supplier-a", documentType: "Insurance", expiresAt: "2026-12-01T00:00:00.000Z" },
          { id: "doc-expired", supplierId: "supplier-a", documentType: "COA", expiresAt: "2026-01-01T00:00:00.000Z" }
        ]
      },
      asOf
    );

    expect(metrics).toMatchObject({
      onTimeDeliveryRate: 0.5,
      qcPassRate: 0.5,
      deviationCount: 1,
      responsivenessScore: 0.85,
      documentCompletenessRate: 0.5,
      overallScore: 57
    });
  });

  it("classifies document expiry alert states", () => {
    expect(documentStatus("2026-06-26T00:00:00.000Z", asOf)).toBe("expired");
    expect(documentStatus("2026-07-10T00:00:00.000Z", asOf)).toBe("expiring");
    expect(documentStatus("2026-12-01T00:00:00.000Z", asOf)).toBe("current");
    expect(documentStatus(null, asOf)).toBe("missing");
  });
});
