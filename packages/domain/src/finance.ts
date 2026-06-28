import { DomainValidationError } from "./errors.js";
import type { InventoryBalance, InventoryItemType } from "./inventory.js";

export const landedCostCategories = ["freight", "duty", "handling", "supplier_fee", "manual"] as const;
export type LandedCostCategory = (typeof landedCostCategories)[number];

export const landedCostAllocationBases = ["quantity", "value", "weight", "manual"] as const;
export type LandedCostAllocationBasis = (typeof landedCostAllocationBases)[number];

export type LandedCostComponent = {
  id: string;
  category: LandedCostCategory;
  description: string;
  amount: number;
  currency: string;
  allocationBasis: LandedCostAllocationBasis;
};

export type LandedCostReceiptLine = {
  receiptLineId: string;
  receiptId: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  quantity: number;
  uom: string;
  unitCost: number;
  currency: string;
  weight?: number | null;
  manualBasis?: number | null;
};

export type LandedCostAllocation = {
  landedCostId: string;
  componentId: string;
  category: LandedCostCategory;
  receiptLineId: string;
  receiptId: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  allocatedAmount: number;
  allocatedUnitCost: number;
  totalUnitCost: number;
  quantity: number;
  uom: string;
  currency: string;
  allocationBasis: LandedCostAllocationBasis;
};

export type LandedCostAllocationResult = {
  landedCostId: string;
  receiptIds: string[];
  currency: string;
  totalAmount: number;
  allocations: LandedCostAllocation[];
};

export type InventoryValuationCost = {
  itemType: InventoryItemType;
  itemId: string;
  lotId?: string | null;
  unitCost: number;
  currency: string;
  valuationMethod: string;
  costSource: string;
  metadata?: Record<string, unknown>;
};

export type InventoryValuationSnapshotLine = {
  id: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  locationId: string;
  status: "available" | "reserved" | "held" | "net";
  quantity: number;
  uom: string;
  unitCost: number;
  currency: string;
  value: number;
  valuationMethod: string;
  costSource: string;
  metadata: Record<string, unknown>;
};

export type InventoryValuationSnapshot = {
  id: string;
  organizationId: string;
  snapshotNumber: string;
  period: string;
  asOf: Date;
  currency: string;
  valuationMethod: string;
  lines: InventoryValuationSnapshotLine[];
  totalValue: number;
  generatedAt: Date;
  metadata: Record<string, unknown>;
};

export type InventoryValuationComparisonLine = {
  key: string;
  itemType: InventoryItemType;
  itemId: string;
  lotId: string | null;
  locationId: string;
  previousQuantity: number;
  currentQuantity: number;
  quantityChange: number;
  previousValue: number;
  currentValue: number;
  valueChange: number;
};

export type InventoryValuationComparison = {
  previousSnapshotId: string;
  currentSnapshotId: string;
  previousTotalValue: number;
  currentTotalValue: number;
  totalValueChange: number;
  lines: InventoryValuationComparisonLine[];
};

export type PeriodCloseCheckCode =
  | "unposted_corrections"
  | "negative_balances"
  | "unreleased_receipts"
  | "open_counts"
  | "unresolved_holds"
  | "incomplete_production"
  | "missing_cost_records";

export type PeriodCloseCheckResult = {
  code: PeriodCloseCheckCode;
  status: "passed" | "warning" | "blocked";
  severity: "info" | "warning" | "blocker";
  count: number;
  message: string;
  records: Array<{ id: string; label: string; href?: string | null }>;
};

export type PeriodCloseRun = {
  id: string;
  organizationId: string;
  period: string;
  status: "ready" | "blocked";
  checkedAt: Date;
  results: PeriodCloseCheckResult[];
};

export type PeriodCloseInput = {
  id: string;
  organizationId: string;
  period: string;
  checkedAt?: Date;
  unpostedCorrections: Array<{ id: string; label: string }>;
  balances: Array<InventoryBalance & { itemName?: string | null }>;
  unreleasedReceipts: Array<{ id: string; label: string; status: string }>;
  openCounts: Array<{ id: string; label: string; status: string }>;
  unresolvedHolds: Array<{ id: string; label: string; reason?: string | null }>;
  incompleteProduction: Array<{ id: string; label: string; status: string }>;
  missingCostRecords: Array<{ id: string; label: string; itemType: InventoryItemType; itemId: string }>;
};

export const financeExportSourceTypes = [
  "purchase",
  "receipt",
  "sale",
  "shipment",
  "inventory_adjustment",
  "production_variance",
  "landed_cost"
] as const;
export type FinanceExportSourceType = (typeof financeExportSourceTypes)[number];

export type ExportMappingTemplate = {
  id: string;
  name: string;
  accountingSystem: string;
  version: number;
  sourceType: FinanceExportSourceType;
  fieldMap: Record<string, string>;
  defaults?: Record<string, string | number | null>;
};

export type FinanceExportRecord = {
  sourceType: FinanceExportSourceType;
  sourceId: string;
  occurredAt: Date | string;
  amount: number;
  currency: string;
  payload: Record<string, string | number | boolean | null>;
};

export type FinanceExportBatch = {
  id: string;
  organizationId: string;
  batchNumber: string;
  version: number;
  status: "generated";
  format: "csv" | "json";
  generatedAt: Date;
  generatedBy: string;
  mappingTemplateId: string;
  sourceTypes: FinanceExportSourceType[];
  rowCount: number;
  rows: Array<Record<string, string | number | boolean | null>>;
  content: string;
  audit: {
    checksum: string;
    sourceRecordIds: string[];
    repeatedFromBatchId: string | null;
  };
};

export type ReconciliationResult = {
  id: string;
  title: string;
  status: "matched" | "variance";
  rows: Array<{
    recordId: string;
    reference: string;
    expected: number;
    actual: number;
    variance: number;
    message: string;
  }>;
};

export function allocateLandedCost(input: {
  landedCostId: string;
  components: LandedCostComponent[];
  receiptLines: LandedCostReceiptLine[];
}): LandedCostAllocationResult {
  if (input.components.length === 0) {
    throw new DomainValidationError("At least one landed cost component is required");
  }
  if (input.receiptLines.length === 0) {
    throw new DomainValidationError("At least one receipt line is required");
  }

  const firstComponent = input.components[0];
  const firstReceiptLine = input.receiptLines[0];
  if (!firstComponent || !firstReceiptLine) {
    throw new DomainValidationError("Landed cost allocation requires components and receipt lines");
  }
  const currency = firstComponent.currency;
  for (const component of input.components) {
    assertPositiveMoney(component.amount, "Landed cost amount");
    assertSame(component.currency, currency, "Landed cost components must use one currency");
  }
  for (const line of input.receiptLines) {
    assertPositive(line.quantity, "Receipt line quantity");
    assertSame(line.currency, currency, "Receipt line currency must match landed cost currency");
  }

  const allocations = input.components.flatMap((component) => {
    const weights = input.receiptLines.map((line) => allocationWeight(component.allocationBasis, line));
    const totalWeight = weights.reduce((total, weight) => total + weight, 0);
    if (totalWeight <= 0) {
      throw new DomainValidationError("Allocation basis must produce a positive total", {
        componentId: component.id,
        allocationBasis: component.allocationBasis
      });
    }

    const raw = input.receiptLines.map((line, index) => ({
      line,
      amount: (component.amount * (weights[index] ?? 0)) / totalWeight
    }));
    const rounded = roundAllocatedAmounts(raw.map((entry) => entry.amount), component.amount);

    return raw.map(({ line }, index) => {
      const allocatedAmount = rounded[index] ?? 0;
      const allocatedUnitCost = roundMoney(allocatedAmount / line.quantity);
      return {
        landedCostId: input.landedCostId,
        componentId: component.id,
        category: component.category,
        receiptLineId: line.receiptLineId,
        receiptId: line.receiptId,
        itemType: line.itemType,
        itemId: line.itemId,
        lotId: line.lotId,
        allocatedAmount,
        allocatedUnitCost,
        totalUnitCost: roundMoney(line.unitCost + allocatedUnitCost),
        quantity: line.quantity,
        uom: line.uom,
        currency,
        allocationBasis: component.allocationBasis
      } satisfies LandedCostAllocation;
    });
  });

  return {
    landedCostId: input.landedCostId,
    receiptIds: [...new Set(input.receiptLines.map((line) => line.receiptId))],
    currency,
    totalAmount: roundMoney(input.components.reduce((total, component) => total + component.amount, 0)),
    allocations
  };
}

export function createInventoryValuationSnapshot(input: {
  id: string;
  organizationId: string;
  snapshotNumber: string;
  period: string;
  asOf: Date;
  currency: string;
  valuationMethod: string;
  balances: InventoryBalance[];
  costs: InventoryValuationCost[];
  includeStatuses?: Array<InventoryValuationSnapshotLine["status"]>;
  metadata?: Record<string, unknown>;
  generatedAt?: Date;
}): InventoryValuationSnapshot {
  const include = new Set(input.includeStatuses ?? ["available", "reserved", "held"]);
  const lines = input.balances.flatMap((balance) => {
    const cost = resolveValuationCost(balance, input.costs, input.currency, input.valuationMethod);
    const quantities: Array<[InventoryValuationSnapshotLine["status"], number]> = [
      ["available", balance.availableQuantity],
      ["reserved", balance.reservedQuantity],
      ["held", balance.heldQuantity]
    ];
    return quantities
      .filter(([status, quantity]) => include.has(status) && quantity !== 0)
      .map(([status, quantity]) => ({
        id: [
          input.id,
          balance.itemType,
          balance.itemId,
          balance.lotId ?? "none",
          balance.locationId,
          status
        ].join(":"),
        itemType: balance.itemType,
        itemId: balance.itemId,
        lotId: balance.lotId,
        locationId: balance.locationId,
        status,
        quantity: roundQuantity(quantity),
        uom: balance.uom,
        unitCost: cost.unitCost,
        currency: cost.currency,
        value: roundMoney(quantity * cost.unitCost),
        valuationMethod: cost.valuationMethod,
        costSource: cost.costSource,
        metadata: cost.metadata ?? {}
      }));
  });

  return {
    id: input.id,
    organizationId: input.organizationId,
    snapshotNumber: input.snapshotNumber,
    period: input.period,
    asOf: input.asOf,
    currency: input.currency,
    valuationMethod: input.valuationMethod,
    lines,
    totalValue: roundMoney(lines.reduce((total, line) => total + line.value, 0)),
    generatedAt: input.generatedAt ?? new Date(),
    metadata: input.metadata ?? {}
  };
}

export function compareInventoryValuationSnapshots(
  previous: InventoryValuationSnapshot,
  current: InventoryValuationSnapshot
): InventoryValuationComparison {
  const keys = new Set([...previous.lines.map(valuationKey), ...current.lines.map(valuationKey)]);
  const lines = [...keys].map((key) => {
    const previousLines = previous.lines.filter((line) => valuationKey(line) === key);
    const currentLines = current.lines.filter((line) => valuationKey(line) === key);
    const sample = currentLines[0] ?? previousLines[0];
    if (!sample) {
      throw new DomainValidationError("Valuation comparison key had no sample line", { key });
    }
    const previousQuantity = roundQuantity(sum(previousLines.map((line) => line.quantity)));
    const currentQuantity = roundQuantity(sum(currentLines.map((line) => line.quantity)));
    const previousValue = roundMoney(sum(previousLines.map((line) => line.value)));
    const currentValue = roundMoney(sum(currentLines.map((line) => line.value)));
    return {
      key,
      itemType: sample.itemType,
      itemId: sample.itemId,
      lotId: sample.lotId,
      locationId: sample.locationId,
      previousQuantity,
      currentQuantity,
      quantityChange: roundQuantity(currentQuantity - previousQuantity),
      previousValue,
      currentValue,
      valueChange: roundMoney(currentValue - previousValue)
    };
  });

  return {
    previousSnapshotId: previous.id,
    currentSnapshotId: current.id,
    previousTotalValue: previous.totalValue,
    currentTotalValue: current.totalValue,
    totalValueChange: roundMoney(current.totalValue - previous.totalValue),
    lines: lines.sort((left, right) => left.key.localeCompare(right.key))
  };
}

export function runPeriodCloseChecks(input: PeriodCloseInput): PeriodCloseRun {
  const negativeBalances = input.balances
    .filter((balance) => balance.availableQuantity < 0 || balance.reservedQuantity < 0 || balance.heldQuantity < 0)
    .map((balance) => ({
      id: `${balance.itemType}:${balance.itemId}:${balance.lotId ?? "none"}:${balance.locationId}`,
      label: balance.itemName ?? `${balance.itemType} ${balance.itemId}`
    }));
  const results: PeriodCloseCheckResult[] = [
    blocker("unposted_corrections", "Unposted corrections must be posted or voided before close.", input.unpostedCorrections),
    blocker("negative_balances", "Negative inventory balances must be resolved before close.", negativeBalances),
    blocker("unreleased_receipts", "Receipt drafts and unreleased receipts must be posted or cancelled.", input.unreleasedReceipts),
    blocker("open_counts", "Open stock counts must be closed, cancelled, or posted.", input.openCounts),
    blocker("unresolved_holds", "Unresolved lot holds need disposition before close.", input.unresolvedHolds),
    blocker("incomplete_production", "Incomplete production needs completion, hold, or carry-forward approval.", input.incompleteProduction),
    blocker("missing_cost_records", "Items with inventory value need an active cost record.", input.missingCostRecords)
  ];
  return {
    id: input.id,
    organizationId: input.organizationId,
    period: input.period,
    status: results.some((result) => result.status === "blocked") ? "blocked" : "ready",
    checkedAt: input.checkedAt ?? new Date(),
    results
  };
}

export function buildFinanceExportBatch(input: {
  id: string;
  organizationId: string;
  batchNumber: string;
  version: number;
  format: "csv" | "json";
  generatedAt: Date;
  generatedBy: string;
  mappingTemplate: ExportMappingTemplate;
  records: FinanceExportRecord[];
  repeatedFromBatchId?: string | null;
}): FinanceExportBatch {
  if (input.records.length === 0) {
    throw new DomainValidationError("At least one source record is required for finance export");
  }
  const rows = input.records.map((record) => mapExportRecord(record, input.mappingTemplate));
  const content = input.format === "json" ? JSON.stringify(rows, dateJsonReplacer, 2) : rowsToCsv(rows);
  return {
    id: input.id,
    organizationId: input.organizationId,
    batchNumber: input.batchNumber,
    version: input.version,
    status: "generated",
    format: input.format,
    generatedAt: input.generatedAt,
    generatedBy: input.generatedBy,
    mappingTemplateId: input.mappingTemplate.id,
    sourceTypes: [...new Set(input.records.map((record) => record.sourceType))],
    rowCount: rows.length,
    rows,
    content,
    audit: {
      checksum: simpleChecksum(content),
      sourceRecordIds: input.records.map((record) => `${record.sourceType}:${record.sourceId}`),
      repeatedFromBatchId: input.repeatedFromBatchId ?? null
    }
  };
}

export function reconcileInventoryLedgerToBalances(input: {
  movements: Array<{ id: string; itemType: InventoryItemType; itemId: string; lotId: string | null; locationId: string; quantityDelta: number }>;
  balances: InventoryBalance[];
}): ReconciliationResult {
  const expectedByKey = groupSum(input.movements, (movement) =>
    [movement.itemType, movement.itemId, movement.lotId ?? "none", movement.locationId].join(":")
  );
  const actualByKey = groupSum(input.balances, (balance) =>
    [balance.itemType, balance.itemId, balance.lotId ?? "none", balance.locationId].join(":")
  , (balance) => balance.availableQuantity + balance.reservedQuantity + balance.heldQuantity);
  return reconciliation("inventory_ledger_to_balances", "Inventory ledger to balances", expectedByKey, actualByKey);
}

export function reconcileExpectedActual(input: {
  id: string;
  title: string;
  expected: Array<{ id: string; reference: string; quantity: number }>;
  actual: Array<{ id: string; reference: string; quantity: number }>;
}): ReconciliationResult {
  const expected = new Map(input.expected.map((row) => [row.reference, row.quantity]));
  const actual = new Map(input.actual.map((row) => [row.reference, row.quantity]));
  return reconciliation(input.id, input.title, expected, actual);
}

function allocationWeight(basis: LandedCostAllocationBasis, line: LandedCostReceiptLine): number {
  if (basis === "quantity") {
    return line.quantity;
  }
  if (basis === "value") {
    return line.quantity * line.unitCost;
  }
  if (basis === "weight") {
    return line.weight ?? 0;
  }
  return line.manualBasis ?? 0;
}

function resolveValuationCost(
  balance: InventoryBalance,
  costs: InventoryValuationCost[],
  currency: string,
  valuationMethod: string
): InventoryValuationCost {
  const cost = costs.find(
    (candidate) =>
      candidate.itemType === balance.itemType &&
      candidate.itemId === balance.itemId &&
      (candidate.lotId ?? null) === balance.lotId &&
      candidate.currency === currency
  ) ?? costs.find(
    (candidate) =>
      candidate.itemType === balance.itemType &&
      candidate.itemId === balance.itemId &&
      (candidate.lotId ?? null) === null &&
      candidate.currency === currency
  );
  if (!cost) {
    throw new DomainValidationError("Missing valuation cost record", {
      itemType: balance.itemType,
      itemId: balance.itemId,
      lotId: balance.lotId,
      currency
    });
  }
  return { ...cost, valuationMethod: cost.valuationMethod || valuationMethod };
}

function blocker(
  code: PeriodCloseCheckCode,
  message: string,
  records: Array<{ id: string; label: string; href?: string | null }>
): PeriodCloseCheckResult {
  return {
    code,
    status: records.length > 0 ? "blocked" : "passed",
    severity: records.length > 0 ? "blocker" : "info",
    count: records.length,
    message: records.length > 0 ? message : "No issues found.",
    records
  };
}

function mapExportRecord(record: FinanceExportRecord, template: ExportMappingTemplate) {
  const row: Record<string, string | number | boolean | null> = { ...(template.defaults ?? {}) };
  for (const [targetField, sourceField] of Object.entries(template.fieldMap)) {
    row[targetField] = exportValue(record, sourceField);
  }
  return row;
}

function exportValue(record: FinanceExportRecord, sourceField: string): string | number | boolean | null {
  if (sourceField === "sourceType") {
    return record.sourceType;
  }
  if (sourceField === "sourceId") {
    return record.sourceId;
  }
  if (sourceField === "occurredAt") {
    return new Date(record.occurredAt).toISOString();
  }
  if (sourceField === "amount") {
    return record.amount;
  }
  if (sourceField === "currency") {
    return record.currency;
  }
  const value = record.payload[sourceField];
  return value === undefined ? null : value;
}

function reconciliation(
  id: string,
  title: string,
  expected: Map<string, number>,
  actual: Map<string, number>
): ReconciliationResult {
  const references = [...new Set([...expected.keys(), ...actual.keys()])].sort();
  const rows = references.map((reference) => {
    const expectedQuantity = roundQuantity(expected.get(reference) ?? 0);
    const actualQuantity = roundQuantity(actual.get(reference) ?? 0);
    const variance = roundQuantity(actualQuantity - expectedQuantity);
    return {
      recordId: reference,
      reference,
      expected: expectedQuantity,
      actual: actualQuantity,
      variance,
      message: variance === 0 ? "Matched" : "Variance requires review"
    };
  });
  return {
    id,
    title,
    status: rows.some((row) => row.variance !== 0) ? "variance" : "matched",
    rows
  };
}

function groupSum<T>(items: T[], key: (item: T) => string, value: (item: T) => number = (item) => (item as { quantityDelta: number }).quantityDelta): Map<string, number> {
  const grouped = new Map<string, number>();
  for (const item of items) {
    const itemKey = key(item);
    grouped.set(itemKey, roundQuantity((grouped.get(itemKey) ?? 0) + value(item)));
  }
  return grouped;
}

function valuationKey(line: InventoryValuationSnapshotLine): string {
  return [line.itemType, line.itemId, line.lotId ?? "none", line.locationId].join(":");
}

function roundAllocatedAmounts(values: number[], expectedTotal: number): number[] {
  const rounded = values.map(roundMoney);
  const difference = roundMoney(expectedTotal - rounded.reduce((total, value) => total + value, 0));
  if (difference !== 0 && rounded.length > 0) {
    let largestIndex = 0;
    for (let index = 1; index < values.length; index += 1) {
      if ((values[index] ?? 0) > (values[largestIndex] ?? 0)) {
        largestIndex = index;
      }
    }
    rounded[largestIndex] = roundMoney((rounded[largestIndex] ?? 0) + difference);
  }
  return rounded;
}

function rowsToCsv(rows: Array<Record<string, string | number | boolean | null>>): string {
  if (rows.length === 0) {
    return "";
  }
  const firstRow = rows[0];
  if (!firstRow) {
    return "";
  }
  const headers = Object.keys(firstRow);
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))].join("\n");
}

function csvCell(value: string | number | boolean | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function simpleChecksum(text: string): string {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function dateJsonReplacer(_key: string, value: unknown): unknown {
  return value instanceof Date ? value.toISOString() : value;
}

function assertPositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new DomainValidationError(`${label} must be greater than zero`, { value });
  }
}

function assertPositiveMoney(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new DomainValidationError(`${label} must be non-negative`, { value });
  }
}

function assertSame(left: string, right: string, message: string): void {
  if (left !== right) {
    throw new DomainValidationError(message, { left, right });
  }
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundQuantity(value: number): number {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}
