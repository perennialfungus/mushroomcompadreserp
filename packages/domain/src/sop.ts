import { DomainValidationError } from "./errors.js";
import type { CapacityLoadLine, MrpDemand, MrpPlan, MrpShortage } from "./mrp.js";

export type ForecastBucket = "week" | "month";
export type ForecastStatus = "draft" | "approved" | "archived";
export type ForecastDriverType =
  | "historical_sales"
  | "open_orders"
  | "minimum_stock"
  | "promotion"
  | "seasonality"
  | "reseller_commitment"
  | "manual_override";

export type DemandForecast = {
  id: string;
  name: string;
  scenarioId: string;
  status: ForecastStatus;
  bucket: ForecastBucket;
  horizonStart: Date;
  horizonEnd: Date;
  notes: string | null;
  approvedAt?: Date | null;
  approvedBy?: string | null;
};

export type ForecastLine = {
  id: string;
  forecastId: string;
  productVariantId: string;
  sku: string;
  productName: string;
  productFamily: string;
  customerId: string | null;
  resellerId: string | null;
  shopifyChannel: string | null;
  region: string;
  periodStart: Date;
  periodEnd: Date;
  scenarioId: string;
  quantity: number;
  uom: string;
  manualOverrideQuantity?: number | null;
  manualOverrideReason?: string | null;
};

export type ForecastDriver = {
  id: string;
  forecastLineId: string;
  driverType: ForecastDriverType;
  quantityImpact: number;
  confidence: number;
  reason: string;
};

export type AggregatedForecastLine = {
  key: string;
  forecastId: string;
  scenarioId: string;
  productVariantId: string;
  sku: string;
  productName: string;
  productFamily: string;
  customerId: string | null;
  resellerId: string | null;
  shopifyChannel: string | null;
  region: string;
  periodStart: Date;
  periodEnd: Date;
  quantity: number;
  uom: string;
  driverBreakdown: Record<ForecastDriverType, number>;
  manualOverrideReason: string | null;
};

export type PlanningScenarioStatus = "draft" | "review" | "approved" | "archived";
export type ScenarioRiskType =
  | "shortage"
  | "capacity_overload"
  | "expiring_stock"
  | "purchase_spend"
  | "service_level";

export type ScenarioRiskSeverity = "info" | "warning" | "critical";

export type PlanningScenario = {
  id: string;
  name: string;
  status: PlanningScenarioStatus;
  forecastId: string | null;
  horizonStart: Date;
  horizonEnd: Date;
  notes: string | null;
  createdAt: Date;
};

export type ScenarioRiskItem = {
  id: string;
  scenarioId: string;
  riskType: ScenarioRiskType;
  severity: ScenarioRiskSeverity;
  title: string;
  impact: string;
  quantity: number | null;
  value: number | null;
  dueAt: Date | null;
  sourceType: string;
  sourceId: string;
  managementHorizon: "now" | "next" | "later";
};

export type ScenarioComparison = {
  baselineScenarioId: string;
  compareScenarioId: string;
  shortageDelta: number;
  capacityOverloadDelta: number;
  expiringStockDelta: number;
  purchaseSpendDelta: number;
  serviceRiskDelta: number;
  summary: string;
};

export type ScenarioRiskInput = {
  scenario: PlanningScenario;
  plan: MrpPlan;
  expiringStock?: Array<{
    id: string;
    itemName: string;
    quantity: number;
    uom: string;
    expiresAt: Date;
  }>;
  purchaseSpend?: Array<{
    id: string;
    supplierName: string;
    amount: number;
    currency: string;
    expectedAt: Date | null;
  }>;
  serviceLevelTarget?: number;
};

type ForecastGroup = Omit<AggregatedForecastLine, "quantity" | "driverBreakdown" | "manualOverrideReason"> & {
  quantity: number;
  driverBreakdown: Record<ForecastDriverType, number>;
  manualOverrideReason: string | null;
};

export function aggregateForecastLines(lines: ForecastLine[], drivers: ForecastDriver[] = []): AggregatedForecastLine[] {
  const driverByLine = new Map<string, ForecastDriver[]>();
  for (const driver of drivers) {
    driverByLine.set(driver.forecastLineId, [...(driverByLine.get(driver.forecastLineId) ?? []), driver]);
  }

  const groups = new Map<string, ForecastGroup>();
  for (const line of lines) {
    if (line.quantity < 0) {
      throw new DomainValidationError("Forecast quantity cannot be negative", { lineId: line.id });
    }
    if (line.manualOverrideQuantity !== undefined && line.manualOverrideQuantity !== null && !line.manualOverrideReason?.trim()) {
      throw new DomainValidationError("Manual forecast overrides require a reason", { lineId: line.id });
    }

    const key = forecastGroupKey(line);
    const existing = groups.get(key) ?? {
      key,
      forecastId: line.forecastId,
      scenarioId: line.scenarioId,
      productVariantId: line.productVariantId,
      sku: line.sku,
      productName: line.productName,
      productFamily: line.productFamily,
      customerId: line.customerId,
      resellerId: line.resellerId,
      shopifyChannel: line.shopifyChannel,
      region: line.region,
      periodStart: line.periodStart,
      periodEnd: line.periodEnd,
      quantity: 0,
      uom: line.uom,
      driverBreakdown: emptyDriverBreakdown(),
      manualOverrideReason: null
    };

    const lineDrivers = driverByLine.get(line.id) ?? [];
    for (const driver of lineDrivers) {
      existing.driverBreakdown[driver.driverType] = roundQuantity(
        existing.driverBreakdown[driver.driverType] + driver.quantityImpact
      );
    }

    const drivenQuantity = line.quantity + lineDrivers.reduce((total, driver) => total + driver.quantityImpact, 0);
    existing.quantity = roundQuantity(
      existing.quantity + (line.manualOverrideQuantity ?? drivenQuantity)
    );
    existing.manualOverrideReason = line.manualOverrideReason?.trim() || existing.manualOverrideReason;
    groups.set(key, existing);
  }

  return [...groups.values()].sort((left, right) => {
    const dateDelta = left.periodStart.getTime() - right.periodStart.getTime();
    return dateDelta !== 0 ? dateDelta : left.sku.localeCompare(right.sku);
  });
}

export function forecastLinesToMrpDemands(forecast: DemandForecast, lines: AggregatedForecastLine[], locationId: string | null): MrpDemand[] {
  if (forecast.status !== "approved") {
    return [];
  }

  return lines.map((line) => ({
    id: `forecast:${forecast.id}:${line.key}`,
    sourceType: "forecast",
    sourceId: forecast.id,
    itemType: "product_variant",
    itemId: line.productVariantId,
    name: line.productName,
    sku: line.sku,
    quantity: line.quantity,
    uom: line.uom,
    neededAt: line.periodEnd,
    locationId,
    description: `${forecast.name} ${line.region} ${line.shopifyChannel ?? "all channels"} forecast`
  }));
}

export function scoreScenarioRisks(input: ScenarioRiskInput): ScenarioRiskItem[] {
  const risks: ScenarioRiskItem[] = [
    ...input.plan.shortages.map((shortage) => shortageRisk(input.scenario, shortage)),
    ...input.plan.capacityLoads
      .filter((load) => load.overloadMinutes > 0)
      .map((load) => capacityRisk(input.scenario, load)),
    ...input.plan.roughCutCapacity
      .filter((load) => load.overloadMinutes > 0)
      .map((load) => ({
        id: `capacity:${input.scenario.id}:rough:${load.id}`,
        scenarioId: input.scenario.id,
        riskType: "capacity_overload" as const,
        severity: load.utilizationPercent >= 125 ? "critical" as const : "warning" as const,
        title: `${load.resourceName} rough-cut overload`,
        impact: `${load.overloadMinutes} minutes over rough-cut capacity at ${roundQuantity(load.utilizationPercent)}% utilization.`,
        quantity: load.overloadMinutes,
        value: null,
        dueAt: load.bucketStart,
        sourceType: load.resourceType,
        sourceId: load.resourceId,
        managementHorizon: managementHorizon(load.bucketStart, input.scenario.createdAt)
      })),
    ...(input.expiringStock ?? []).map((stock) => ({
      id: `expiry:${input.scenario.id}:${stock.id}`,
      scenarioId: input.scenario.id,
      riskType: "expiring_stock" as const,
      severity: stock.expiresAt.getTime() <= addDays(input.scenario.createdAt, 30).getTime() ? "critical" as const : "warning" as const,
      title: `${stock.itemName} expires before the plan is consumed`,
      impact: `${stock.quantity} ${stock.uom} may expire by ${stock.expiresAt.toISOString().slice(0, 10)}.`,
      quantity: stock.quantity,
      value: null,
      dueAt: stock.expiresAt,
      sourceType: "lot",
      sourceId: stock.id,
      managementHorizon: managementHorizon(stock.expiresAt, input.scenario.createdAt)
    })),
    ...(input.purchaseSpend ?? []).map((spend) => ({
      id: `spend:${input.scenario.id}:${spend.id}`,
      scenarioId: input.scenario.id,
      riskType: "purchase_spend" as const,
      severity: spend.amount >= 1000 ? "warning" as const : "info" as const,
      title: `${spend.supplierName} purchase spend`,
      impact: `${spend.amount.toFixed(2)} ${spend.currency} committed or proposed in the scenario.`,
      quantity: null,
      value: spend.amount,
      dueAt: spend.expectedAt,
      sourceType: "purchase_order",
      sourceId: spend.id,
      managementHorizon: managementHorizon(spend.expectedAt, input.scenario.createdAt)
    })),
    ...serviceLevelRisks(input)
  ];

  return risks.sort((left, right) => riskRank(right.severity) - riskRank(left.severity) || left.title.localeCompare(right.title));
}

export function compareScenarioRiskSets(
  baselineScenarioId: string,
  compareScenarioId: string,
  baselineRisks: ScenarioRiskItem[],
  compareRisks: ScenarioRiskItem[]
): ScenarioComparison {
  const baseline = riskCounts(baselineRisks);
  const compare = riskCounts(compareRisks);
  const shortageDelta = compare.shortage - baseline.shortage;
  const capacityOverloadDelta = compare.capacity_overload - baseline.capacity_overload;
  const expiringStockDelta = compare.expiring_stock - baseline.expiring_stock;
  const purchaseSpendDelta = compare.purchase_spendValue - baseline.purchase_spendValue;
  const serviceRiskDelta = compare.service_level - baseline.service_level;

  return {
    baselineScenarioId,
    compareScenarioId,
    shortageDelta,
    capacityOverloadDelta,
    expiringStockDelta,
    purchaseSpendDelta,
    serviceRiskDelta,
    summary: [
      `${compareScenarioId} vs ${baselineScenarioId}:`,
      `${formatDelta(shortageDelta)} shortage risks`,
      `${formatDelta(capacityOverloadDelta)} capacity overloads`,
      `${formatDelta(expiringStockDelta)} expiry risks`,
      `${formatMoneyDelta(purchaseSpendDelta)} purchase spend`,
      `${formatDelta(serviceRiskDelta)} service risks`
    ].join(", ")
  };
}

function shortageRisk(scenario: PlanningScenario, shortage: MrpShortage): ScenarioRiskItem {
  const dueAt = shortage.demands.reduce<Date | null>((earliest, demand) => {
    if (!demand.neededAt) {
      return earliest;
    }
    if (!earliest || demand.neededAt.getTime() < earliest.getTime()) {
      return demand.neededAt;
    }
    return earliest;
  }, null);

  return {
    id: `shortage:${scenario.id}:${shortage.key}`,
    scenarioId: scenario.id,
    riskType: "shortage",
    severity: shortage.shortageQuantity >= shortage.quantityDemanded * 0.5 ? "critical" : "warning",
    title: `${shortage.name} shortage`,
    impact: `${shortage.shortageQuantity} ${shortage.uom} short against ${shortage.quantityDemanded} ${shortage.uom} demand.`,
    quantity: shortage.shortageQuantity,
    value: null,
    dueAt,
    sourceType: "mrp_shortage",
    sourceId: shortage.key,
    managementHorizon: managementHorizon(dueAt, scenario.createdAt)
  };
}

function capacityRisk(scenario: PlanningScenario, load: CapacityLoadLine): ScenarioRiskItem {
  return {
    id: `capacity:${scenario.id}:${load.id}`,
    scenarioId: scenario.id,
    riskType: "capacity_overload",
    severity: load.loadPercent >= 125 ? "critical" : "warning",
    title: `${load.resourceName} overload`,
    impact: `${load.overloadMinutes} minutes over capacity at ${roundQuantity(load.loadPercent)}% load.`,
    quantity: load.overloadMinutes,
    value: null,
    dueAt: load.bucketStart,
    sourceType: load.resourceType,
    sourceId: load.resourceId,
    managementHorizon: managementHorizon(load.bucketStart, scenario.createdAt)
  };
}

function serviceLevelRisks(input: ScenarioRiskInput): ScenarioRiskItem[] {
  const target = input.serviceLevelTarget ?? 0.95;
  const late = input.plan.capableToPromise.filter((row) => row.promiseStatus === "late_risk" || row.promiseStatus === "not_capable");
  const total = input.plan.capableToPromise.length;
  if (total === 0) {
    return [];
  }
  const serviceLevel = (total - late.length) / total;
  if (serviceLevel >= target) {
    return [];
  }

  return [{
    id: `service:${input.scenario.id}`,
    scenarioId: input.scenario.id,
    riskType: "service_level",
    severity: serviceLevel < target - 0.2 ? "critical" : "warning",
    title: "Service-level risk",
    impact: `${Math.round(serviceLevel * 100)}% promise coverage is below the ${Math.round(target * 100)}% target.`,
    quantity: late.length,
    value: serviceLevel,
    dueAt: input.scenario.horizonEnd,
    sourceType: "ctp",
    sourceId: input.scenario.id,
    managementHorizon: managementHorizon(input.scenario.horizonEnd, input.scenario.createdAt)
  }];
}

function forecastGroupKey(line: ForecastLine): string {
  return [
    line.forecastId,
    line.scenarioId,
    line.productVariantId,
    line.customerId ?? "all-customers",
    line.resellerId ?? "all-resellers",
    line.shopifyChannel ?? "all-channels",
    line.region,
    line.uom,
    line.periodStart.toISOString()
  ].join(":");
}

function emptyDriverBreakdown(): Record<ForecastDriverType, number> {
  return {
    historical_sales: 0,
    open_orders: 0,
    minimum_stock: 0,
    promotion: 0,
    seasonality: 0,
    reseller_commitment: 0,
    manual_override: 0
  };
}

function riskCounts(risks: ScenarioRiskItem[]) {
  return {
    shortage: risks.filter((risk) => risk.riskType === "shortage").length,
    capacity_overload: risks.filter((risk) => risk.riskType === "capacity_overload").length,
    expiring_stock: risks.filter((risk) => risk.riskType === "expiring_stock").length,
    purchase_spend: risks.filter((risk) => risk.riskType === "purchase_spend").length,
    purchase_spendValue: risks
      .filter((risk) => risk.riskType === "purchase_spend")
      .reduce((total, risk) => total + (risk.value ?? 0), 0),
    service_level: risks.filter((risk) => risk.riskType === "service_level").length
  };
}

function managementHorizon(dueAt: Date | null, asOf: Date): "now" | "next" | "later" {
  if (!dueAt) {
    return "later";
  }
  const days = (dueAt.getTime() - asOf.getTime()) / 86_400_000;
  if (days <= 14) {
    return "now";
  }
  if (days <= 60) {
    return "next";
  }
  return "later";
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function riskRank(severity: ScenarioRiskSeverity): number {
  return severity === "critical" ? 3 : severity === "warning" ? 2 : 1;
}

function formatDelta(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function formatMoneyDelta(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return rounded > 0 ? `+${rounded}` : String(rounded);
}

function roundQuantity(value: number): number {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}
