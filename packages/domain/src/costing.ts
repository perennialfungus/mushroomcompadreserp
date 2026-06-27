import { DomainValidationError } from "./errors.js";
import type { InventoryItemType } from "./inventory.js";

export const costCategories = ["material", "packaging", "labor", "machine", "overhead", "freight"] as const;
export type CostCategory = (typeof costCategories)[number];

export type CostItemType =
  | Extract<InventoryItemType, "product_variant" | "material" | "packaging_component" | "wip" | "harvest">
  | "labor_role"
  | "machine"
  | "overhead"
  | "freight";

export type StandardCostRecord = {
  id: string;
  itemType: CostItemType;
  itemId: string;
  itemName: string;
  category: CostCategory;
  unitCost: number;
  uom: string;
  currency: string;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  metadataJson?: Record<string, unknown>;
};

export type CostedBomLine = {
  id: string;
  componentType: Extract<InventoryItemType, "product_variant" | "material" | "packaging_component">;
  componentId: string;
  componentName: string;
  quantity: number;
  uom: string;
  wastePercent: number;
};

export type CostRollupLine = {
  lineId: string;
  componentType: CostedBomLine["componentType"];
  componentId: string;
  componentName: string;
  category: CostCategory;
  quantity: number;
  wasteQuantity: number;
  costQuantity: number;
  uom: string;
  unitCost: number;
  lineCost: number;
  currency: string;
  standardCostId: string;
};

export type CostSummary = Record<CostCategory, number> & {
  totalCost: number;
};

export type FormulaCostRollup = {
  id: string;
  bomId: string;
  formulaRevisionId: string | null;
  revisionCode: string;
  productVariantId: string;
  yieldQuantity: number;
  yieldUom: string;
  currency: string;
  lines: CostRollupLine[];
  summary: CostSummary;
  unitCost: number;
  generatedAt: Date;
};

export type ProductionCostUsage = {
  id: string;
  category: Extract<CostCategory, "labor" | "machine" | "overhead" | "freight">;
  itemId: string;
  itemName: string;
  quantity: number;
  uom: "hour" | "flat";
  unitCost: number;
  currency: string;
};

export type ProductionOrderEstimatedCost = {
  id: string;
  productionOrderId: string;
  costRollupId: string;
  plannedOutputQuantity: number;
  outputUom: string;
  currency: string;
  usages: ProductionCostUsage[];
  summary: CostSummary;
  unitCost: number;
  generatedAt: Date;
};

export type ConsumedLotCost = {
  lotId: string;
  itemType: InventoryItemType;
  itemId: string;
  itemName: string;
  category: Extract<CostCategory, "material" | "packaging">;
  quantity: number;
  uom: string;
  unitCost: number;
  currency: string;
};

export type BatchActualCost = {
  id: string;
  processingBatchId: string;
  productionOrderId: string | null;
  outputQuantity: number;
  outputUom: string;
  scrapQuantity: number;
  reworkQuantity: number;
  currency: string;
  consumedLots: ConsumedLotCost[];
  usages: ProductionCostUsage[];
  summary: CostSummary;
  unitCost: number;
  generatedAt: Date;
};

export type CostVarianceLine = {
  category: "material" | "labor" | "machine" | "yield" | "scrap" | "total";
  standardCost: number;
  estimatedCost: number;
  actualCost: number;
  varianceCost: number;
  explanation: string;
};

export type CostVarianceReport = {
  id: string;
  productionOrderId: string;
  processingBatchId: string | null;
  currency: string;
  standardUnitCost: number;
  estimatedUnitCost: number;
  actualUnitCost: number;
  lines: CostVarianceLine[];
  generatedAt: Date;
};

export type MarginPricePoint = {
  id: string;
  channel: "b2b" | "retail";
  label: string;
  currency: string;
  unitPrice: number;
};

export type MarginSimulationRow = MarginPricePoint & {
  unitCost: number;
  grossMargin: number;
  marginPercent: number;
};

export type MarginSimulation = {
  batchActualCostId: string;
  outputUom: string;
  rows: MarginSimulationRow[];
};

export function calculateFormulaCostRollup(input: {
  id: string;
  bomId: string;
  formulaRevisionId?: string | null;
  revisionCode: string;
  productVariantId: string;
  yieldQuantity: number;
  yieldUom: string;
  currency: string;
  lines: CostedBomLine[];
  standardCosts: StandardCostRecord[];
  generatedAt?: Date;
}): FormulaCostRollup {
  assertPositive(input.yieldQuantity, "Yield quantity");
  const lines = input.lines.map((line) => costBomLine(line, input.standardCosts, input.currency));
  const summary = summarizeCostLines(lines);

  return {
    id: input.id,
    bomId: input.bomId,
    formulaRevisionId: input.formulaRevisionId ?? null,
    revisionCode: input.revisionCode,
    productVariantId: input.productVariantId,
    yieldQuantity: input.yieldQuantity,
    yieldUom: input.yieldUom,
    currency: input.currency,
    lines,
    summary,
    unitCost: roundMoney(summary.totalCost / input.yieldQuantity),
    generatedAt: input.generatedAt ?? new Date()
  };
}

export function calculateProductionOrderEstimatedCost(input: {
  id: string;
  productionOrderId: string;
  costRollup: FormulaCostRollup;
  plannedOutputQuantity: number;
  outputUom: string;
  usages?: ProductionCostUsage[];
  generatedAt?: Date;
}): ProductionOrderEstimatedCost {
  assertPositive(input.plannedOutputQuantity, "Planned output quantity");
  assertSame(input.outputUom, input.costRollup.yieldUom, "Estimated output UOM must match rollup yield UOM");
  const scaleFactor = input.plannedOutputQuantity / input.costRollup.yieldQuantity;
  const usageSummary = summarizeUsages(input.usages ?? [], input.costRollup.currency);
  const summary = addSummaries(scaleSummary(input.costRollup.summary, scaleFactor), usageSummary);

  return {
    id: input.id,
    productionOrderId: input.productionOrderId,
    costRollupId: input.costRollup.id,
    plannedOutputQuantity: input.plannedOutputQuantity,
    outputUom: input.outputUom,
    currency: input.costRollup.currency,
    usages: input.usages ?? [],
    summary,
    unitCost: roundMoney(summary.totalCost / input.plannedOutputQuantity),
    generatedAt: input.generatedAt ?? new Date()
  };
}

export function calculateBatchActualCost(input: {
  id: string;
  processingBatchId: string;
  productionOrderId?: string | null;
  outputQuantity: number;
  outputUom: string;
  scrapQuantity?: number;
  reworkQuantity?: number;
  currency: string;
  consumedLots: ConsumedLotCost[];
  usages?: ProductionCostUsage[];
  generatedAt?: Date;
}): BatchActualCost {
  assertPositive(input.outputQuantity, "Output quantity");
  const lotSummary = summarizeConsumedLots(input.consumedLots, input.currency);
  const usageSummary = summarizeUsages(input.usages ?? [], input.currency);
  const summary = addSummaries(lotSummary, usageSummary);

  return {
    id: input.id,
    processingBatchId: input.processingBatchId,
    productionOrderId: input.productionOrderId ?? null,
    outputQuantity: input.outputQuantity,
    outputUom: input.outputUom,
    scrapQuantity: input.scrapQuantity ?? 0,
    reworkQuantity: input.reworkQuantity ?? 0,
    currency: input.currency,
    consumedLots: input.consumedLots,
    usages: input.usages ?? [],
    summary,
    unitCost: roundMoney(summary.totalCost / input.outputQuantity),
    generatedAt: input.generatedAt ?? new Date()
  };
}

export function calculateCostVarianceReport(input: {
  id: string;
  productionOrderId: string;
  processingBatchId?: string | null;
  standardRollup: FormulaCostRollup;
  estimatedCost: ProductionOrderEstimatedCost;
  actualCost: BatchActualCost;
  generatedAt?: Date;
}): CostVarianceReport {
  const currency = input.estimatedCost.currency;
  assertSame(input.standardRollup.currency, currency, "Standard and estimated currency must match");
  assertSame(input.actualCost.currency, currency, "Actual and estimated currency must match");
  const plannedQuantity = input.estimatedCost.plannedOutputQuantity;
  const actualQuantity = input.actualCost.outputQuantity;
  const standardAtPlan = input.standardRollup.unitCost * plannedQuantity;
  const yieldVariance = roundMoney((plannedQuantity - actualQuantity) * input.standardRollup.unitCost);
  const scrapVariance = roundMoney(input.actualCost.scrapQuantity * input.standardRollup.unitCost);
  const lines: CostVarianceLine[] = [
    buildVarianceLine(
      "material",
      input.standardRollup.summary.material + input.standardRollup.summary.packaging,
      input.estimatedCost.summary.material + input.estimatedCost.summary.packaging,
      input.actualCost.summary.material + input.actualCost.summary.packaging,
      "Actual consumed lot costs compared with estimated formula material and packaging cost."
    ),
    buildVarianceLine(
      "labor",
      input.standardRollup.summary.labor,
      input.estimatedCost.summary.labor,
      input.actualCost.summary.labor,
      "Labor variance comes from actual recorded time and labor rates."
    ),
    buildVarianceLine(
      "machine",
      input.standardRollup.summary.machine,
      input.estimatedCost.summary.machine,
      input.actualCost.summary.machine,
      "Machine variance comes from actual machine time and equipment rates."
    ),
    {
      category: "yield",
      standardCost: roundMoney(standardAtPlan),
      estimatedCost: roundMoney(input.estimatedCost.summary.totalCost),
      actualCost: roundMoney(input.actualCost.unitCost * plannedQuantity),
      varianceCost: yieldVariance,
      explanation:
        actualQuantity < plannedQuantity
          ? "Lower output quantity spread fixed and consumed costs across fewer units."
          : "Higher output quantity spread batch costs across more units."
    },
    {
      category: "scrap",
      standardCost: 0,
      estimatedCost: 0,
      actualCost: scrapVariance,
      varianceCost: scrapVariance,
      explanation: "Scrap variance uses recorded scrap quantity at the standard unit cost."
    },
    buildVarianceLine(
      "total",
      standardAtPlan,
      input.estimatedCost.summary.totalCost,
      input.actualCost.summary.totalCost,
      "Total variance is actual batch cost compared with the production order estimate."
    )
  ];

  return {
    id: input.id,
    productionOrderId: input.productionOrderId,
    processingBatchId: input.processingBatchId ?? null,
    currency,
    standardUnitCost: input.standardRollup.unitCost,
    estimatedUnitCost: input.estimatedCost.unitCost,
    actualUnitCost: input.actualCost.unitCost,
    lines,
    generatedAt: input.generatedAt ?? new Date()
  };
}

export function simulateBatchMargins(input: {
  batchActualCost: BatchActualCost;
  pricePoints: MarginPricePoint[];
}): MarginSimulation {
  return {
    batchActualCostId: input.batchActualCost.id,
    outputUom: input.batchActualCost.outputUom,
    rows: input.pricePoints.map((pricePoint) => {
      assertSame(pricePoint.currency, input.batchActualCost.currency, "Price currency must match batch cost currency");
      const grossMargin = roundMoney(pricePoint.unitPrice - input.batchActualCost.unitCost);
      return {
        ...pricePoint,
        unitCost: input.batchActualCost.unitCost,
        grossMargin,
        marginPercent: pricePoint.unitPrice === 0 ? 0 : roundPercent((grossMargin / pricePoint.unitPrice) * 100)
      };
    })
  };
}

export function costExportToJson(input: unknown): string {
  return JSON.stringify(input, dateJsonReplacer, 2);
}

export function costRowsToCsv(rows: Array<Record<string, string | number | null | undefined>>): string {
  if (rows.length === 0) {
    return "";
  }
  const headers = Object.keys(rows[0] ?? {});
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))
  ].join("\n");
}

function costBomLine(
  line: CostedBomLine,
  standardCosts: StandardCostRecord[],
  currency: string
): CostRollupLine {
  const standardCost = standardCosts.find(
    (cost) =>
      cost.itemType === line.componentType &&
      cost.itemId === line.componentId &&
      cost.currency === currency &&
      isEffective(cost)
  );
  if (!standardCost) {
    throw new DomainValidationError("Missing standard cost for BOM line", {
      componentType: line.componentType,
      componentId: line.componentId,
      currency
    });
  }
  assertSame(line.uom, standardCost.uom, "BOM line UOM must match standard cost UOM");
  const wasteQuantity = line.quantity * (line.wastePercent / 100);
  const costQuantity = line.quantity + wasteQuantity;

  return {
    lineId: line.id,
    componentType: line.componentType,
    componentId: line.componentId,
    componentName: line.componentName,
    category: standardCost.category,
    quantity: roundQuantity(line.quantity),
    wasteQuantity: roundQuantity(wasteQuantity),
    costQuantity: roundQuantity(costQuantity),
    uom: line.uom,
    unitCost: standardCost.unitCost,
    lineCost: roundMoney(costQuantity * standardCost.unitCost),
    currency,
    standardCostId: standardCost.id
  };
}

function summarizeCostLines(lines: CostRollupLine[]): CostSummary {
  return summarizeCategories(lines.map((line) => ({ category: line.category, cost: line.lineCost })));
}

function summarizeConsumedLots(consumedLots: ConsumedLotCost[], currency: string): CostSummary {
  return summarizeCategories(
    consumedLots.map((lot) => {
      assertSame(lot.currency, currency, "Consumed lot currency must match actual cost currency");
      return { category: lot.category, cost: lot.quantity * lot.unitCost };
    })
  );
}

function summarizeUsages(usages: ProductionCostUsage[], currency: string): CostSummary {
  return summarizeCategories(
    usages.map((usage) => {
      assertSame(usage.currency, currency, "Usage currency must match cost currency");
      return { category: usage.category, cost: usage.quantity * usage.unitCost };
    })
  );
}

function summarizeCategories(items: Array<{ category: CostCategory; cost: number }>): CostSummary {
  const summary: CostSummary = {
    material: 0,
    packaging: 0,
    labor: 0,
    machine: 0,
    overhead: 0,
    freight: 0,
    totalCost: 0
  };
  for (const item of items) {
    summary[item.category] = roundMoney(summary[item.category] + item.cost);
    summary.totalCost = roundMoney(summary.totalCost + item.cost);
  }
  return summary;
}

function addSummaries(left: CostSummary, right: CostSummary): CostSummary {
  return summarizeCategories(
    costCategories.map((category) => ({ category, cost: left[category] + right[category] }))
  );
}

function scaleSummary(summary: CostSummary, scaleFactor: number): CostSummary {
  return summarizeCategories(costCategories.map((category) => ({ category, cost: summary[category] * scaleFactor })));
}

function buildVarianceLine(
  category: CostVarianceLine["category"],
  standardCost: number,
  estimatedCost: number,
  actualCost: number,
  explanation: string
): CostVarianceLine {
  return {
    category,
    standardCost: roundMoney(standardCost),
    estimatedCost: roundMoney(estimatedCost),
    actualCost: roundMoney(actualCost),
    varianceCost: roundMoney(actualCost - estimatedCost),
    explanation
  };
}

function isEffective(cost: StandardCostRecord, now = new Date()): boolean {
  return (
    (!cost.effectiveFrom || cost.effectiveFrom.getTime() <= now.getTime()) &&
    (!cost.effectiveTo || cost.effectiveTo.getTime() >= now.getTime())
  );
}

function assertPositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new DomainValidationError(`${label} must be greater than zero`, { value });
  }
}

function assertSame(left: string, right: string, message: string): void {
  if (left !== right) {
    throw new DomainValidationError(message, { left, right });
  }
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundQuantity(value: number): number {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}

function roundPercent(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}

function dateJsonReplacer(_key: string, value: unknown): unknown {
  return value instanceof Date ? value.toISOString() : value;
}
