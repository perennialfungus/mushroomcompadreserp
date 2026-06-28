import { DomainValidationError } from "./errors.js";
import type { InventoryItemType } from "./inventory.js";

export type MrpDemandSourceType =
  | "sales_order"
  | "production_order"
  | "minimum_stock"
  | "suggested_production"
  | "forecast";

export type MrpSupplySourceType = "on_hand" | "purchase_order" | "planned_production_order";
export type MrpSuggestionType = "purchase_order" | "production_order";
export type MrpBucketGranularity = "day" | "week";
export type MrpAlertSeverity = "info" | "warning" | "critical";
export type PlanningCapacityResourceType = "work_center" | "equipment" | "labor_role";
export type CapacityBlockReason = "shift" | "holiday" | "maintenance" | "cleaning" | "changeover" | "reservation";

export type MrpItemRef = {
  itemType: InventoryItemType;
  itemId: string;
  uom: string;
  name: string;
  sku: string | null;
};

export type MrpDemand = MrpItemRef & {
  id: string;
  sourceType: MrpDemandSourceType;
  sourceId: string;
  quantity: number;
  neededAt: Date | null;
  locationId: string | null;
  description: string;
  parentDemandId?: string | null;
};

export type MrpSupply = MrpItemRef & {
  id: string;
  sourceType: MrpSupplySourceType;
  sourceId: string;
  quantity: number;
  availableAt: Date | null;
  locationId: string | null;
  description: string;
};

export type MrpBomLine = {
  id: string;
  componentType: Extract<InventoryItemType, "product_variant" | "material" | "packaging_component">;
  componentId: string;
  quantity: number;
  uom: string;
  wastePercent: number;
  isCritical: boolean;
};

export type MrpBom = {
  id: string;
  productVariantId: string;
  versionCode: string;
  status: "draft" | "active" | "retired";
  bomKind?: "standard" | "phantom" | "planning" | "alternate";
  yieldQuantity: number;
  yieldUom: string;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  lines: MrpBomLine[];
};

export type MrpSuggestion = MrpItemRef & {
  id: string;
  suggestionType: MrpSuggestionType;
  quantity: number;
  locationId: string | null;
  dueAt: Date | null;
  reason: string;
  sourceDemandIds: string[];
  bomId: string | null;
};

export type MrpBucketLine = MrpItemRef & {
  id: string;
  bucketStart: Date;
  bucketEnd: Date;
  granularity: MrpBucketGranularity;
  locationId: string | null;
  demandQuantity: number;
  supplyQuantity: number;
  projectedAvailableQuantity: number;
  shortageQuantity: number;
  demandIds: string[];
  supplyIds: string[];
};

export type MrpShortage = MrpItemRef & {
  key: string;
  locationId: string | null;
  quantityDemanded: number;
  quantitySupplied: number;
  shortageQuantity: number;
  demands: MrpDemand[];
  supplies: MrpSupply[];
  suggestions: MrpSuggestion[];
};

export type PlanningLeadTime = {
  id: string;
  itemType?: MrpItemRef["itemType"] | null;
  itemId?: string | null;
  supplierId?: string | null;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  operationCode?: string | null;
  productionDays?: number;
  supplierDays?: number;
  transferDays?: number;
  qcReleaseDays?: number;
};

export type PlanningCapacityCalendar = {
  id: string;
  resourceType: PlanningCapacityResourceType;
  resourceId: string;
  resourceName: string;
  date: Date;
  availableMinutes: number;
  shiftCode?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  reason?: CapacityBlockReason | null;
  unavailableMinutes?: number;
  notes?: string | null;
};

export type ProductionOperationPlan = {
  id: string;
  productionOrderId: string;
  orderNumber: string;
  operationCode: string;
  description: string;
  workCenterId: string;
  workCenterName: string;
  equipmentId?: string | null;
  equipmentName?: string | null;
  laborRoleId?: string | null;
  laborRoleName?: string | null;
  sequence: number;
  requiredMinutes: number;
  scheduledStartAt: Date | null;
  scheduledEndAt: Date | null;
  dueAt: Date | null;
  dispatchPriority?: number;
  constraintDate?: Date | null;
  materialConstraintAt?: Date | null;
  minBlockMinutes?: number;
  changeoverMinutes?: number;
  status: "pending" | "ready" | "in_progress" | "paused" | "completed" | "cancelled";
};

export type CapacityLoadLine = {
  id: string;
  resourceType: PlanningCapacityResourceType;
  resourceId: string;
  resourceName: string;
  bucketStart: Date;
  bucketEnd: Date;
  availableMinutes: number;
  scheduledMinutes: number;
  loadPercent: number;
  overloadMinutes: number;
  operationIds: string[];
};

export type FiniteCapacitySuggestion = {
  id: string;
  productionOrderId: string;
  orderNumber: string;
  operationId: string;
  operationCode: string;
  resourceId: string;
  resourceName: string;
  requiredMinutes: number;
  scheduledStartAt: Date | null;
  suggestedStartAt: Date;
  suggestedEndAt: Date;
  overloadMinutes: number;
  reason: string;
};

export type CtpRequest = MrpItemRef & {
  id: string;
  salesOrderId: string;
  orderNumber: string;
  salesOrderLineId: string;
  quantity: number;
  requestedAt: Date | null;
  locationId: string | null;
};

export type CtpResult = MrpItemRef & {
  id: string;
  salesOrderId: string;
  orderNumber: string;
  salesOrderLineId: string;
  requestedAt: Date | null;
  locationId: string | null;
  requestedQuantity: number;
  promisedAt: Date | null;
  promiseStatus: "available_now" | "available_by_date" | "late_risk" | "not_capable";
  explanation: string[];
  contributingSupplies: Array<{
    supplyId: string;
    sourceType: MrpSupplySourceType | "capacity";
    quantity: number;
    availableAt: Date | null;
    description: string;
  }>;
};

export type MaterialAvailabilityConstraint = MrpItemRef & {
  id: string;
  productionOrderId: string | null;
  sourceDemandId: string;
  locationId: string | null;
  shortageQuantity: number;
  constrainedStartAt: Date | null;
  explanation: string;
};

export type ScheduleOperationWarningType =
  | "material_shortage"
  | "capacity_wait"
  | "late_to_constraint"
  | "completed_locked"
  | "maintenance"
  | "changeover";

export type ScheduleOperationWarning = {
  type: ScheduleOperationWarningType;
  severity: "info" | "warning" | "critical";
  message: string;
};

export type ScheduleOperation = ProductionOperationPlan & {
  scheduledStartAt: Date | null;
  scheduledEndAt: Date | null;
  finiteStartAt: Date | null;
  finiteEndAt: Date | null;
  dispatchPriority: number;
  blockMinutes: number;
  warnings: ScheduleOperationWarning[];
  predecessorOperationId: string | null;
  constrainedByMaterialUntil: Date | null;
};

export type ScheduleRun = {
  id: string;
  runNumber: string;
  generatedAt: Date;
  status: "draft" | "active" | "regenerated";
  horizonStart: Date;
  horizonEnd: Date;
  operationCount: number;
  overloadCount: number;
  materialConstraintCount: number;
  lateOperationCount: number;
  explanation: string[];
};

export type RoughCutCapacityLine = {
  id: string;
  resourceType: PlanningCapacityResourceType;
  resourceId: string;
  resourceName: string;
  bucketStart: Date;
  bucketEnd: Date;
  plannedMinutes: number;
  openMinutes: number;
  availableMinutes: number;
  utilizationPercent: number;
  overloadMinutes: number;
  productionOrderIds: string[];
};

export type DispatchBoardLine = ScheduleOperation & {
  dispatchRank: number;
  readyAt: Date | null;
  constraintSummary: string;
};

export type ScheduleAuditEntry = {
  id: string;
  eventType: "schedule.regenerated" | "schedule.resequenced";
  subjectId: string;
  actorUserId: string | null;
  occurredAt: Date;
  beforeJson: unknown | null;
  afterJson: unknown;
};

export type MrpRiskAlert = {
  id: string;
  severity: MrpAlertSeverity;
  type: "shortage" | "capacity_overload" | "late_promise" | "expedite";
  message: string;
  sourceType: string;
  sourceId: string;
  dueAt: Date | null;
};

export type PlanningScenarioSnapshot = {
  id: string;
  name: string;
  createdAt: Date;
  notes: string | null;
  horizonEnd: Date;
  shortageCount: number;
  totalShortageQuantity: number;
  overloadedResourceCount: number;
  latePromiseCount: number;
};

export type PlanningScenarioComparison = {
  baselineId: string;
  compareId: string;
  shortageDelta: number;
  overloadDelta: number;
  latePromiseDelta: number;
  summary: string;
};

export type MrpPlanInput = {
  generatedAt?: Date;
  horizonEnd: Date;
  planningStart?: Date;
  bucketGranularity?: MrpBucketGranularity;
  locationIds?: string[];
  demands: MrpDemand[];
  supplies: MrpSupply[];
  boms: MrpBom[];
  itemCatalog: MrpItemRef[];
  leadTimes?: PlanningLeadTime[];
  capacityCalendars?: PlanningCapacityCalendar[];
  productionOperations?: ProductionOperationPlan[];
  ctpRequests?: CtpRequest[];
  scenarioSnapshots?: PlanningScenarioSnapshot[];
};

export type MrpPlan = {
  generatedAt: Date;
  horizonEnd: Date;
  planningStart: Date;
  bucketGranularity: MrpBucketGranularity;
  locationIds: string[];
  shortages: MrpShortage[];
  suggestions: MrpSuggestion[];
  bucketLines: MrpBucketLine[];
  capacityLoads: CapacityLoadLine[];
  finiteCapacitySuggestions: FiniteCapacitySuggestion[];
  capableToPromise: CtpResult[];
  scheduleRun: ScheduleRun;
  scheduleOperations: ScheduleOperation[];
  roughCutCapacity: RoughCutCapacityLine[];
  dispatchBoard: DispatchBoardLine[];
  materialConstraints: MaterialAvailabilityConstraint[];
  scheduleAudits: ScheduleAuditEntry[];
  alerts: MrpRiskAlert[];
  scenarioSnapshots: PlanningScenarioSnapshot[];
  scenarioComparisons: PlanningScenarioComparison[];
  demandCount: number;
  supplyCount: number;
};

type ItemBucket = {
  ref: MrpItemRef;
  locationId: string | null;
  demands: MrpDemand[];
  supplies: MrpSupply[];
};

export function itemPlanningKey(itemType: InventoryItemType, itemId: string, uom: string, locationId: string | null): string {
  return [itemType, itemId, uom, locationId ?? "all"].join(":");
}

export function calculateMrpPlan(input: MrpPlanInput): MrpPlan {
  if (input.horizonEnd.getTime() <= 0 || Number.isNaN(input.horizonEnd.getTime())) {
    throw new DomainValidationError("MRP planning horizon must be a valid date");
  }

  const generatedAt = input.generatedAt ?? new Date();
  const planningStart = input.planningStart ?? generatedAt;
  const bucketGranularity = input.bucketGranularity ?? "day";
  const locationIds = input.locationIds ?? [];
  const activeBoms = input.boms.filter((bom) => isBomEffective(bom, input.horizonEnd));
  const bomByVariant = new Map(activeBoms.map((bom) => [bom.productVariantId, bom]));
  const itemCatalog = new Map(input.itemCatalog.map((item) => [itemCatalogKey(item.itemType, item.itemId), item]));
  const demands = input.demands.filter((demand) => inScope(demand.neededAt, demand.locationId, input.horizonEnd, locationIds));
  const supplies = input.supplies.filter((supply) => inScope(supply.availableAt, supply.locationId, input.horizonEnd, locationIds));
  const suggestions: MrpSuggestion[] = [];
  const expandedProductionKeys = new Set<string>();

  let changed = true;
  while (changed) {
    changed = false;
    const buckets = buildBuckets(demands, supplies);
    const shortages = [...buckets.values()].filter((bucket) => shortageFor(bucket) > 0.000001);

    for (const shortage of shortages) {
      if (shortage.ref.itemType !== "product_variant") {
        continue;
      }

      const bom = bomByVariant.get(shortage.ref.itemId);
      if (!bom) {
        continue;
      }

      const key = itemPlanningKey(shortage.ref.itemType, shortage.ref.itemId, shortage.ref.uom, shortage.locationId);
      if (expandedProductionKeys.has(key)) {
        continue;
      }

      expandedProductionKeys.add(key);
      const shortageQuantity = roundQuantity(shortageFor(shortage));
      if (bom.bomKind === "phantom") {
        const phantomExplosion = buildSuggestion({
          type: "production_order",
          ref: shortage.ref,
          quantity: shortageQuantity,
          locationId: shortage.locationId,
          dueAt: earliestNeededAt(shortage.demands),
          reason: `Explode phantom ${shortage.ref.name} to cover demand within horizon`,
          sourceDemandIds: shortage.demands.map((demand) => demand.id),
          bomId: bom.id
        });
        demands.push(...explodeBomDemand(bom, { ...phantomExplosion, id: `phantom-${bom.id}-${shortage.ref.itemId}` }, itemCatalog));
        changed = true;
        continue;
      }
      const suggestion = buildSuggestion({
        type: "production_order",
        ref: shortage.ref,
        quantity: shortageQuantity,
        locationId: shortage.locationId,
        dueAt: earliestNeededAt(shortage.demands),
        reason: `Produce ${shortageQuantity} ${shortage.ref.uom} to cover demand within horizon`,
        sourceDemandIds: shortage.demands.map((demand) => demand.id),
        bomId: bom.id
      });
      suggestions.push(suggestion);
      demands.push(...explodeBomDemand(bom, suggestion, itemCatalog));
      changed = true;
    }
  }

  const finalBuckets = buildBuckets(demands, supplies);
  const bucketLines = buildTimePhasedBucketLines({
    demands,
    supplies,
    planningStart,
    horizonEnd: input.horizonEnd,
    granularity: bucketGranularity
  });
  const capacityLoads = buildCapacityLoads({
    calendars: input.capacityCalendars ?? [],
    operations: input.productionOperations ?? [],
    planningStart,
    horizonEnd: input.horizonEnd,
    granularity: bucketGranularity
  });
  const materialConstraints = buildMaterialConstraints([...finalBuckets.values()], suggestions, input.horizonEnd);
  const scheduleOperations = buildFiniteSchedule({
    operations: input.productionOperations ?? [],
    calendars: input.capacityCalendars ?? [],
    materialConstraints,
    planningStart,
    horizonEnd: input.horizonEnd
  });
  const scheduleRun = buildScheduleRun({
    generatedAt,
    planningStart,
    horizonEnd: input.horizonEnd,
    scheduleOperations,
    capacityLoads,
    materialConstraints
  });
  const roughCutCapacity = buildRoughCutCapacity({
    calendars: input.capacityCalendars ?? [],
    operations: input.productionOperations ?? [],
    planningStart,
    horizonEnd: input.horizonEnd,
    granularity: bucketGranularity
  });
  const dispatchBoard = buildDispatchBoard(scheduleOperations);
  const finiteCapacitySuggestions = buildFiniteCapacitySuggestions(
    scheduleOperations,
    capacityLoads,
    input.capacityCalendars ?? [],
    planningStart
  );
  const capableToPromise = calculateCapableToPromise({
    requests: input.ctpRequests ?? [],
    supplies,
    suggestions,
    finiteCapacitySuggestions,
    leadTimes: input.leadTimes ?? [],
    generatedAt,
    horizonEnd: input.horizonEnd
  });
  const shortages = [...finalBuckets.values()]
    .map((bucket) => {
      const shortageQuantity = roundQuantity(shortageFor(bucket));
      const existingSuggestions = suggestions.filter(
        (suggestion) =>
          suggestion.itemType === bucket.ref.itemType &&
          suggestion.itemId === bucket.ref.itemId &&
          suggestion.uom === bucket.ref.uom &&
          suggestion.locationId === bucket.locationId
      );
      const generatedSuggestions =
        shortageQuantity > 0.000001 && bucket.ref.itemType !== "product_variant"
          ? [
              buildSuggestion({
                type: "purchase_order",
                ref: bucket.ref,
                quantity: shortageQuantity,
                locationId: bucket.locationId,
                dueAt: earliestNeededAt(bucket.demands),
                reason: `Buy ${shortageQuantity} ${bucket.ref.uom} to cover material demand within horizon`,
                sourceDemandIds: bucket.demands.map((demand) => demand.id),
                bomId: null
              })
            ]
          : [];
      suggestions.push(...generatedSuggestions);
      return {
        key: itemPlanningKey(bucket.ref.itemType, bucket.ref.itemId, bucket.ref.uom, bucket.locationId),
        ...bucket.ref,
        locationId: bucket.locationId,
        quantityDemanded: roundQuantity(bucket.demands.reduce((total, demand) => total + demand.quantity, 0)),
        quantitySupplied: roundQuantity(bucket.supplies.reduce((total, supply) => total + supply.quantity, 0)),
        shortageQuantity,
        demands: bucket.demands,
        supplies: bucket.supplies,
        suggestions: [...existingSuggestions, ...generatedSuggestions]
      } satisfies MrpShortage;
    })
    .filter((shortage) => shortage.shortageQuantity > 0.000001)
    .sort((left, right) => {
      if (left.itemType !== right.itemType) {
        return left.itemType.localeCompare(right.itemType);
      }
      return (left.sku ?? left.name).localeCompare(right.sku ?? right.name);
    });

  const alerts = buildRiskAlerts({
    shortages,
    capacityLoads,
    capableToPromise,
    horizonEnd: input.horizonEnd
  });
  const scenarioSnapshots = input.scenarioSnapshots ?? [];

  return {
    generatedAt,
    horizonEnd: input.horizonEnd,
    planningStart,
    bucketGranularity,
    locationIds,
    shortages,
    suggestions,
    bucketLines,
    capacityLoads,
    finiteCapacitySuggestions,
    capableToPromise,
    scheduleRun,
    scheduleOperations,
    roughCutCapacity,
    dispatchBoard,
    materialConstraints,
    scheduleAudits: [
      {
        id: `audit:${scheduleRun.id}`,
        eventType: "schedule.regenerated",
        subjectId: scheduleRun.id,
        actorUserId: null,
        occurredAt: generatedAt,
        beforeJson: null,
        afterJson: {
          operationCount: scheduleRun.operationCount,
          overloadCount: scheduleRun.overloadCount,
          materialConstraintCount: scheduleRun.materialConstraintCount,
          lateOperationCount: scheduleRun.lateOperationCount
        }
      }
    ],
    alerts,
    scenarioSnapshots,
    scenarioComparisons: compareScenarioSnapshots(scenarioSnapshots),
    demandCount: demands.length,
    supplyCount: supplies.length
  };
}

function buildTimePhasedBucketLines(input: {
  demands: MrpDemand[];
  supplies: MrpSupply[];
  planningStart: Date;
  horizonEnd: Date;
  granularity: MrpBucketGranularity;
}): MrpBucketLine[] {
  const buckets = buildBuckets(input.demands, input.supplies);
  const lines: MrpBucketLine[] = [];

  for (const bucket of buckets.values()) {
    const periods = new Map<string, {
      bucketStart: Date;
      bucketEnd: Date;
      demandQuantity: number;
      supplyQuantity: number;
      demandIds: string[];
      supplyIds: string[];
    }>();

    for (const demand of bucket.demands) {
      const period = periodFor(demand.neededAt ?? input.horizonEnd, input.granularity);
      if (period.bucketStart.getTime() > input.horizonEnd.getTime()) {
        continue;
      }
      const entry = ensurePeriod(periods, period);
      entry.demandQuantity += demand.quantity;
      entry.demandIds.push(demand.id);
    }

    for (const supply of bucket.supplies) {
      const period = periodFor(supply.availableAt ?? input.planningStart, input.granularity);
      if (period.bucketStart.getTime() > input.horizonEnd.getTime()) {
        continue;
      }
      const entry = ensurePeriod(periods, period);
      entry.supplyQuantity += supply.quantity;
      entry.supplyIds.push(supply.id);
    }

    let projected = 0;
    for (const period of [...periods.values()].sort((left, right) => left.bucketStart.getTime() - right.bucketStart.getTime())) {
      projected = roundQuantity(projected + period.supplyQuantity - period.demandQuantity);
      const shortageQuantity = projected < 0 ? roundQuantity(Math.abs(projected)) : 0;
      if (period.demandQuantity === 0 && period.supplyQuantity === 0 && shortageQuantity === 0) {
        continue;
      }
      lines.push({
        ...bucket.ref,
        id: `${itemPlanningKey(bucket.ref.itemType, bucket.ref.itemId, bucket.ref.uom, bucket.locationId)}:${period.bucketStart.toISOString()}`,
        bucketStart: period.bucketStart,
        bucketEnd: period.bucketEnd,
        granularity: input.granularity,
        locationId: bucket.locationId,
        demandQuantity: roundQuantity(period.demandQuantity),
        supplyQuantity: roundQuantity(period.supplyQuantity),
        projectedAvailableQuantity: projected,
        shortageQuantity,
        demandIds: period.demandIds,
        supplyIds: period.supplyIds
      });
    }
  }

  return lines.sort((left, right) => {
    const dateDelta = left.bucketStart.getTime() - right.bucketStart.getTime();
    return dateDelta !== 0 ? dateDelta : left.name.localeCompare(right.name);
  });
}

function buildCapacityLoads(input: {
  calendars: PlanningCapacityCalendar[];
  operations: ProductionOperationPlan[];
  planningStart: Date;
  horizonEnd: Date;
  granularity: MrpBucketGranularity;
}): CapacityLoadLine[] {
  const resourceNames = new Map(input.calendars.map((calendar) => [calendar.resourceId, calendar.resourceName]));
  for (const operation of input.operations) {
    resourceNames.set(operation.workCenterId, operation.workCenterName);
    if (operation.equipmentId && operation.equipmentName) {
      resourceNames.set(operation.equipmentId, operation.equipmentName);
    }
    if (operation.laborRoleId && operation.laborRoleName) {
      resourceNames.set(operation.laborRoleId, operation.laborRoleName);
    }
  }

  const loads = new Map<string, CapacityLoadLine>();
  for (const calendar of input.calendars) {
    const period = periodFor(calendar.date, input.granularity);
    const key = capacityKey(calendar.resourceType, calendar.resourceId, period.bucketStart);
    const existing = loads.get(key);
    loads.set(key, {
      id: key,
      resourceType: calendar.resourceType,
      resourceId: calendar.resourceId,
      resourceName: calendar.resourceName,
      bucketStart: period.bucketStart,
      bucketEnd: period.bucketEnd,
      availableMinutes: roundQuantity((existing?.availableMinutes ?? 0) + calendar.availableMinutes),
      scheduledMinutes: existing?.scheduledMinutes ?? 0,
      loadPercent: 0,
      overloadMinutes: 0,
      operationIds: existing?.operationIds ?? []
    });
  }

  for (const operation of input.operations.filter((candidate) => candidate.status !== "completed" && candidate.status !== "cancelled")) {
    const scheduledAt = operation.scheduledStartAt ?? operation.dueAt ?? input.planningStart;
    if (scheduledAt.getTime() > input.horizonEnd.getTime()) {
      continue;
    }
    addOperationLoad(loads, {
      resourceType: "work_center",
      resourceId: operation.workCenterId,
      resourceName: operation.workCenterName,
      at: scheduledAt,
      minutes: operation.requiredMinutes,
      operationId: operation.id,
      granularity: input.granularity
    });
    if (operation.equipmentId) {
      addOperationLoad(loads, {
        resourceType: "equipment",
        resourceId: operation.equipmentId,
        resourceName: operation.equipmentName ?? resourceNames.get(operation.equipmentId) ?? operation.equipmentId,
        at: scheduledAt,
        minutes: operation.requiredMinutes,
        operationId: operation.id,
        granularity: input.granularity
      });
    }
    if (operation.laborRoleId) {
      addOperationLoad(loads, {
        resourceType: "labor_role",
        resourceId: operation.laborRoleId,
        resourceName: operation.laborRoleName ?? resourceNames.get(operation.laborRoleId) ?? operation.laborRoleId,
        at: scheduledAt,
        minutes: operation.requiredMinutes,
        operationId: operation.id,
        granularity: input.granularity
      });
    }
  }

  return [...loads.values()]
    .map((load) => {
      const loadPercent = load.availableMinutes > 0 ? roundQuantity((load.scheduledMinutes / load.availableMinutes) * 100) : 100;
      const overloadMinutes = Math.max(0, roundQuantity(load.scheduledMinutes - load.availableMinutes));
      return { ...load, loadPercent, overloadMinutes };
    })
    .sort((left, right) => {
      const dateDelta = left.bucketStart.getTime() - right.bucketStart.getTime();
      return dateDelta !== 0 ? dateDelta : left.resourceName.localeCompare(right.resourceName);
    });
}

function buildFiniteCapacitySuggestions(
  operations: Array<ProductionOperationPlan | ScheduleOperation>,
  capacityLoads: CapacityLoadLine[],
  calendars: PlanningCapacityCalendar[],
  planningStart: Date
): FiniteCapacitySuggestion[] {
  const overloadedResourceDates = new Map(
    capacityLoads
      .filter((load) => load.resourceType === "work_center" && load.overloadMinutes > 0)
      .map((load) => [capacityKey(load.resourceType, load.resourceId, load.bucketStart), load])
  );

  return operations
    .filter((operation) => {
      const scheduledAt = operation.scheduledStartAt ?? operation.dueAt ?? planningStart;
      return overloadedResourceDates.has(capacityKey("work_center", operation.workCenterId, periodFor(scheduledAt, "day").bucketStart));
    })
    .map((operation) => {
      const scheduledAt = operation.scheduledStartAt ?? operation.dueAt ?? planningStart;
      const load = overloadedResourceDates.get(capacityKey("work_center", operation.workCenterId, periodFor(scheduledAt, "day").bucketStart));
      const slotStart = "finiteStartAt" in operation && operation.finiteStartAt
        ? operation.finiteStartAt
        : findNextCapacitySlot(operation, capacityLoads, calendars, scheduledAt);
      const suggestedEndAt = addMinutes(slotStart, operation.requiredMinutes);
      return {
        id: `finite:${operation.id}`,
        productionOrderId: operation.productionOrderId,
        orderNumber: operation.orderNumber,
        operationId: operation.id,
        operationCode: operation.operationCode,
        resourceId: operation.workCenterId,
        resourceName: operation.workCenterName,
        requiredMinutes: operation.requiredMinutes,
        scheduledStartAt: operation.scheduledStartAt,
        suggestedStartAt: slotStart,
        suggestedEndAt,
        overloadMinutes: load?.overloadMinutes ?? operation.requiredMinutes,
        reason: `${operation.workCenterName} is overloaded; move ${operation.operationCode} to the next finite-capacity slot.`
      };
    });
}

function calculateCapableToPromise(input: {
  requests: CtpRequest[];
  supplies: MrpSupply[];
  suggestions: MrpSuggestion[];
  finiteCapacitySuggestions: FiniteCapacitySuggestion[];
  leadTimes: PlanningLeadTime[];
  generatedAt: Date;
  horizonEnd: Date;
}): CtpResult[] {
  return input.requests.map((request) => {
    const matchingSupplies = input.supplies
      .filter(
        (supply) =>
          supply.itemType === request.itemType &&
          supply.itemId === request.itemId &&
          supply.uom === request.uom &&
          supply.locationId === request.locationId
      )
      .sort((left, right) => supplyDate(left, input.generatedAt).getTime() - supplyDate(right, input.generatedAt).getTime());
    const leadTime = leadTimeFor(request.itemType, request.itemId, input.leadTimes);
    const explanation: string[] = [];
    const contributingSupplies: CtpResult["contributingSupplies"] = [];
    let cumulative = 0;
    let promisedAt: Date | null = null;

    for (const supply of matchingSupplies) {
      if (cumulative >= request.quantity) {
        break;
      }
      const usableQuantity = Math.min(request.quantity - cumulative, supply.quantity);
      cumulative = roundQuantity(cumulative + usableQuantity);
      const supplyAvailableAt = supply.availableAt ? addDays(supply.availableAt, leadTime.qcReleaseDays) : input.generatedAt;
      promisedAt = maxDate(promisedAt, supplyAvailableAt);
      contributingSupplies.push({
        supplyId: supply.id,
        sourceType: supply.sourceType,
        quantity: usableQuantity,
        availableAt: supplyAvailableAt,
        description: supply.description
      });
    }

    if (cumulative < request.quantity) {
      const matchingSuggestion = input.suggestions.find(
        (suggestion) =>
          suggestion.suggestionType === "production_order" &&
          suggestion.itemType === request.itemType &&
          suggestion.itemId === request.itemId &&
          suggestion.locationId === request.locationId
      );
      if (matchingSuggestion) {
        const capacityDate = input.finiteCapacitySuggestions
          .map((suggestion) => suggestion.suggestedEndAt)
          .sort((left, right) => left.getTime() - right.getTime())[0];
        const plannedDate = matchingSuggestion.dueAt ?? addDays(input.generatedAt, leadTime.productionDays);
        const availableAt = addDays(maxDate(plannedDate, capacityDate) ?? plannedDate, leadTime.qcReleaseDays);
        const quantity = roundQuantity(request.quantity - cumulative);
        cumulative = request.quantity;
        promisedAt = maxDate(promisedAt, availableAt);
        contributingSupplies.push({
          supplyId: matchingSuggestion.id,
          sourceType: "capacity",
          quantity,
          availableAt,
          description: matchingSuggestion.reason
        });
      }
    }

    if (contributingSupplies.some((supply) => supply.sourceType === "on_hand")) {
      explanation.push("Released on-hand stock contributes first.");
    }
    if (contributingSupplies.some((supply) => supply.sourceType === "planned_production_order")) {
      explanation.push(`Open production supply is included after ${leadTime.qcReleaseDays} QC release day(s).`);
    }
    if (contributingSupplies.some((supply) => supply.sourceType === "purchase_order")) {
      explanation.push(`Purchase receipts are included after supplier and QC gates.`);
    }
    if (contributingSupplies.some((supply) => supply.sourceType === "capacity")) {
      explanation.push("Remaining demand uses a suggested production plan with finite-capacity timing.");
    }
    if (cumulative < request.quantity) {
      explanation.push("Demand cannot be promised within the planning horizon from known supply and capacity.");
    }

    const promiseStatus = promiseStatusFor({
      requestedAt: request.requestedAt,
      promisedAt,
      cumulative,
      requestedQuantity: request.quantity,
      horizonEnd: input.horizonEnd
    });

    return {
      ...request,
      requestedQuantity: request.quantity,
      promisedAt,
      promiseStatus,
      explanation,
      contributingSupplies
    };
  });
}

function buildFiniteSchedule(input: {
  operations: ProductionOperationPlan[];
  calendars: PlanningCapacityCalendar[];
  materialConstraints: MaterialAvailabilityConstraint[];
  planningStart: Date;
  horizonEnd: Date;
}): ScheduleOperation[] {
  const remainingCapacity = buildDailyCapacityLedger(input.calendars);
  const byOrder = groupOperationsByOrder(input.operations);
  const scheduled: ScheduleOperation[] = [];
  const materialConstraintByOrder = latestMaterialConstraintByOrder(input.materialConstraints);

  for (const orderOperations of byOrder.values()) {
    const sorted = [...orderOperations].sort((left, right) => left.sequence - right.sequence);
    let predecessorEnd: Date | null = null;
    let predecessorOperationId: string | null = null;

    for (const operation of sorted) {
      const warnings: ScheduleOperationWarning[] = [];
      const dispatchPriority = operation.dispatchPriority ?? priorityForOperation(operation);
      const blockMinutes = Math.max(operation.minBlockMinutes ?? 0, operation.requiredMinutes + (operation.changeoverMinutes ?? 0));
      const materialConstrainedUntil =
        operation.materialConstraintAt ??
        materialConstraintByOrder.get(operation.productionOrderId) ??
        null;
      const earliestStart = maxDate(
        maxDate(input.planningStart, predecessorEnd),
        maxDate(operation.constraintDate ?? null, materialConstrainedUntil)
      ) ?? input.planningStart;

      if (materialConstrainedUntil && materialConstrainedUntil.getTime() > input.planningStart.getTime()) {
        warnings.push({
          type: "material_shortage",
          severity: "critical",
          message: `Material availability holds this operation until ${materialConstrainedUntil.toISOString().slice(0, 10)}.`
        });
      }

      if ((operation.changeoverMinutes ?? 0) > 0) {
        warnings.push({
          type: "changeover",
          severity: "info",
          message: `${operation.changeoverMinutes} changeover minute(s) are included for cleaning or setup.`
        });
      }

      if (operation.status === "completed") {
        const completedStart = operation.scheduledStartAt ?? operation.scheduledEndAt ?? operation.dueAt;
        const completedEnd = operation.scheduledEndAt ?? completedStart;
        scheduled.push({
          ...operation,
          dispatchPriority,
          blockMinutes,
          finiteStartAt: completedStart,
          finiteEndAt: completedEnd,
          predecessorOperationId,
          constrainedByMaterialUntil: materialConstrainedUntil,
          warnings: [
            ...warnings,
            {
              type: "completed_locked",
              severity: "info",
              message: "Completed operation is locked and is not moved by schedule regeneration."
            }
          ]
        });
        predecessorEnd = completedEnd;
        predecessorOperationId = operation.id;
        continue;
      }

      const slot = findFiniteSlot({
        operation,
        blockMinutes,
        earliestStart,
        horizonEnd: input.horizonEnd,
        remainingCapacity
      });
      if (slot.start.getTime() > earliestStart.getTime()) {
        warnings.push({
          type: "capacity_wait",
          severity: "warning",
          message: `Finite capacity moves ${operation.operationCode} to the next available resource block.`
        });
      }
      if (operation.constraintDate && slot.end.getTime() > operation.constraintDate.getTime()) {
        warnings.push({
          type: "late_to_constraint",
          severity: "critical",
          message: `${operation.operationCode} finishes after its constraint date.`
        });
      }

      consumeFiniteCapacity(remainingCapacity, operation, slot.bucketStart, blockMinutes);
      scheduled.push({
        ...operation,
        dispatchPriority,
        blockMinutes,
        scheduledStartAt: operation.scheduledStartAt,
        scheduledEndAt: operation.scheduledEndAt,
        finiteStartAt: slot.start,
        finiteEndAt: slot.end,
        predecessorOperationId,
        constrainedByMaterialUntil: materialConstrainedUntil,
        warnings
      });
      predecessorEnd = slot.end;
      predecessorOperationId = operation.id;
    }
  }

  return scheduled.sort((left, right) => {
    const startDelta = (left.finiteStartAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (right.finiteStartAt?.getTime() ?? Number.MAX_SAFE_INTEGER);
    return startDelta !== 0 ? startDelta : left.dispatchPriority - right.dispatchPriority;
  });
}

function buildScheduleRun(input: {
  generatedAt: Date;
  planningStart: Date;
  horizonEnd: Date;
  scheduleOperations: ScheduleOperation[];
  capacityLoads: CapacityLoadLine[];
  materialConstraints: MaterialAvailabilityConstraint[];
}): ScheduleRun {
  const lateOperationCount = input.scheduleOperations.filter(
    (operation) => operation.dueAt && operation.finiteEndAt && operation.finiteEndAt.getTime() > operation.dueAt.getTime()
  ).length;
  const overloadCount = input.capacityLoads.filter((load) => load.overloadMinutes > 0).length;
  const materialConstraintCount = input.materialConstraints.length;
  return {
    id: `schedule:${input.generatedAt.toISOString()}`,
    runNumber: `APS-${input.generatedAt.toISOString().slice(0, 10).replaceAll("-", "")}`,
    generatedAt: input.generatedAt,
    status: "active",
    horizonStart: input.planningStart,
    horizonEnd: input.horizonEnd,
    operationCount: input.scheduleOperations.length,
    overloadCount,
    materialConstraintCount,
    lateOperationCount,
    explanation: [
      "Finite scheduling loads work centers, equipment, and labor roles before selecting operation slots.",
      "Material shortages, purchase receipts, production supply, and QC lead time can hold production starts.",
      "Completed operations remain locked; regeneration only changes open work."
    ]
  };
}

function buildRoughCutCapacity(input: {
  calendars: PlanningCapacityCalendar[];
  operations: ProductionOperationPlan[];
  planningStart: Date;
  horizonEnd: Date;
  granularity: MrpBucketGranularity;
}): RoughCutCapacityLine[] {
  const loads = new Map<string, RoughCutCapacityLine>();
  for (const calendar of input.calendars) {
    const period = periodFor(calendar.date, input.granularity);
    const key = capacityKey(calendar.resourceType, calendar.resourceId, period.bucketStart);
    const existing = loads.get(key);
    loads.set(key, {
      id: key,
      resourceType: calendar.resourceType,
      resourceId: calendar.resourceId,
      resourceName: calendar.resourceName,
      bucketStart: period.bucketStart,
      bucketEnd: period.bucketEnd,
      plannedMinutes: existing?.plannedMinutes ?? 0,
      openMinutes: existing?.openMinutes ?? 0,
      availableMinutes: roundQuantity((existing?.availableMinutes ?? 0) + calendar.availableMinutes),
      utilizationPercent: 0,
      overloadMinutes: 0,
      productionOrderIds: existing?.productionOrderIds ?? []
    });
  }

  for (const operation of input.operations.filter((candidate) => candidate.status !== "completed" && candidate.status !== "cancelled")) {
    const at = operation.scheduledStartAt ?? operation.dueAt ?? input.planningStart;
    const minutes = operation.requiredMinutes + (operation.changeoverMinutes ?? 0);
    const statusField = operation.status === "pending" ? "plannedMinutes" : "openMinutes";
    addRoughCutLoad(loads, "work_center", operation.workCenterId, operation.workCenterName, at, minutes, operation.productionOrderId, statusField, input.granularity);
    if (operation.equipmentId) {
      addRoughCutLoad(loads, "equipment", operation.equipmentId, operation.equipmentName ?? operation.equipmentId, at, minutes, operation.productionOrderId, statusField, input.granularity);
    }
    if (operation.laborRoleId) {
      addRoughCutLoad(loads, "labor_role", operation.laborRoleId, operation.laborRoleName ?? operation.laborRoleId, at, minutes, operation.productionOrderId, statusField, input.granularity);
    }
  }

  return [...loads.values()]
    .map((line) => {
      const loadMinutes = line.plannedMinutes + line.openMinutes;
      return {
        ...line,
        utilizationPercent: line.availableMinutes > 0 ? roundQuantity((loadMinutes / line.availableMinutes) * 100) : 100,
        overloadMinutes: Math.max(0, roundQuantity(loadMinutes - line.availableMinutes)),
        productionOrderIds: [...new Set(line.productionOrderIds)]
      };
    })
    .sort((left, right) => left.bucketStart.getTime() - right.bucketStart.getTime() || left.resourceName.localeCompare(right.resourceName));
}

function buildDispatchBoard(scheduleOperations: ScheduleOperation[]): DispatchBoardLine[] {
  return [...scheduleOperations]
    .filter((operation) => operation.status !== "completed" && operation.status !== "cancelled")
    .sort((left, right) => {
      const priorityDelta = left.dispatchPriority - right.dispatchPriority;
      if (priorityDelta !== 0) {
        return priorityDelta;
      }
      return (left.finiteStartAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (right.finiteStartAt?.getTime() ?? Number.MAX_SAFE_INTEGER);
    })
    .map((operation, index) => ({
      ...operation,
      dispatchRank: index + 1,
      readyAt: maxDate(operation.finiteStartAt, operation.constrainedByMaterialUntil),
      constraintSummary: operation.warnings.length > 0 ? operation.warnings.map((warning) => warning.message).join(" ") : "Ready inside finite capacity."
    }));
}

function buildMaterialConstraints(
  buckets: ItemBucket[],
  suggestions: MrpSuggestion[],
  horizonEnd: Date
): MaterialAvailabilityConstraint[] {
  const constraints: MaterialAvailabilityConstraint[] = [];
  for (const bucket of buckets) {
    const shortageQuantity = roundQuantity(shortageFor(bucket));
    if (shortageQuantity <= 0.000001) {
      continue;
    }
    for (const demand of bucket.demands.filter((candidate) => candidate.sourceType === "production_order")) {
      const supplySuggestion = suggestions.find(
        (suggestion) =>
          suggestion.itemType === bucket.ref.itemType &&
          suggestion.itemId === bucket.ref.itemId &&
          suggestion.uom === bucket.ref.uom &&
          suggestion.locationId === bucket.locationId
      );
      const constrainedStartAt = supplySuggestion?.dueAt ?? demand.neededAt ?? horizonEnd;
      constraints.push({
        ...bucket.ref,
        id: `material:${demand.id}`,
        productionOrderId: demand.sourceId,
        sourceDemandId: demand.id,
        locationId: bucket.locationId,
        shortageQuantity,
        constrainedStartAt,
        explanation: `${demand.description} is short ${shortageQuantity} ${bucket.ref.uom}; production can start after replenishment and QC release.`
      });
    }
  }
  return constraints;
}

function buildRiskAlerts(input: {
  shortages: MrpShortage[];
  capacityLoads: CapacityLoadLine[];
  capableToPromise: CtpResult[];
  horizonEnd: Date;
}): MrpRiskAlert[] {
  const alerts: MrpRiskAlert[] = [];
  for (const shortage of input.shortages) {
    const dueAt = earliestNeededAt(shortage.demands);
    alerts.push({
      id: `shortage:${shortage.key}`,
      severity: dueAt && dueAt.getTime() < input.horizonEnd.getTime() ? "critical" : "warning",
      type: dueAt && dueAt.getTime() < Date.now() ? "expedite" : "shortage",
      message: `${shortage.name} is short by ${shortage.shortageQuantity} ${shortage.uom} by ${dueAt ? dueAt.toISOString().slice(0, 10) : "the horizon"}.`,
      sourceType: "mrp_shortage",
      sourceId: shortage.key,
      dueAt
    });
  }
  for (const load of input.capacityLoads.filter((candidate) => candidate.overloadMinutes > 0)) {
    alerts.push({
      id: `capacity:${load.id}`,
      severity: load.loadPercent >= 125 ? "critical" : "warning",
      type: "capacity_overload",
      message: `${load.resourceName} is loaded to ${load.loadPercent}% with ${load.overloadMinutes} minutes over capacity.`,
      sourceType: load.resourceType,
      sourceId: load.resourceId,
      dueAt: load.bucketStart
    });
  }
  for (const ctp of input.capableToPromise.filter((candidate) => candidate.promiseStatus === "late_risk" || candidate.promiseStatus === "not_capable")) {
    alerts.push({
      id: `ctp:${ctp.id}`,
      severity: ctp.promiseStatus === "not_capable" ? "critical" : "warning",
      type: "late_promise",
      message: `${ctp.orderNumber} promise is ${ctp.promiseStatus === "not_capable" ? "not capable" : "later than requested"}.`,
      sourceType: "sales_order",
      sourceId: ctp.salesOrderId,
      dueAt: ctp.promisedAt
    });
  }
  return alerts;
}

function compareScenarioSnapshots(snapshots: PlanningScenarioSnapshot[]): PlanningScenarioComparison[] {
  if (snapshots.length < 2) {
    return [];
  }
  const sorted = [...snapshots].sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
  const baseline = sorted[0]!;
  return sorted.slice(1).map((snapshot) => {
    const shortageDelta = snapshot.shortageCount - baseline.shortageCount;
    const overloadDelta = snapshot.overloadedResourceCount - baseline.overloadedResourceCount;
    const latePromiseDelta = snapshot.latePromiseCount - baseline.latePromiseCount;
    return {
      baselineId: baseline.id,
      compareId: snapshot.id,
      shortageDelta,
      overloadDelta,
      latePromiseDelta,
      summary: `${snapshot.name} vs ${baseline.name}: ${formatDelta(shortageDelta)} shortages, ${formatDelta(overloadDelta)} overloads, ${formatDelta(latePromiseDelta)} late promises.`
    };
  });
}

function buildBuckets(demands: MrpDemand[], supplies: MrpSupply[]): Map<string, ItemBucket> {
  const buckets = new Map<string, ItemBucket>();

  for (const demand of demands) {
    const key = itemPlanningKey(demand.itemType, demand.itemId, demand.uom, demand.locationId);
    const bucket = buckets.get(key) ?? {
      ref: demand,
      locationId: demand.locationId,
      demands: [],
      supplies: []
    };
    bucket.demands.push(demand);
    buckets.set(key, bucket);
  }

  for (const supply of supplies) {
    const key = itemPlanningKey(supply.itemType, supply.itemId, supply.uom, supply.locationId);
    const bucket = buckets.get(key) ?? {
      ref: supply,
      locationId: supply.locationId,
      demands: [],
      supplies: []
    };
    bucket.supplies.push(supply);
    buckets.set(key, bucket);
  }

  return buckets;
}

function ensurePeriod(
  periods: Map<string, { bucketStart: Date; bucketEnd: Date; demandQuantity: number; supplyQuantity: number; demandIds: string[]; supplyIds: string[] }>,
  period: { bucketStart: Date; bucketEnd: Date }
) {
  const key = period.bucketStart.toISOString();
  const existing = periods.get(key);
  if (existing) {
    return existing;
  }
  const created = {
    ...period,
    demandQuantity: 0,
    supplyQuantity: 0,
    demandIds: [],
    supplyIds: []
  };
  periods.set(key, created);
  return created;
}

function periodFor(date: Date, granularity: MrpBucketGranularity): { bucketStart: Date; bucketEnd: Date } {
  const bucketStart = startOfUtcDay(date);
  if (granularity === "week") {
    const day = bucketStart.getUTCDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    bucketStart.setUTCDate(bucketStart.getUTCDate() + mondayOffset);
  }
  const bucketEnd = new Date(bucketStart);
  bucketEnd.setUTCDate(bucketEnd.getUTCDate() + (granularity === "week" ? 7 : 1));
  bucketEnd.setUTCMilliseconds(bucketEnd.getUTCMilliseconds() - 1);
  return { bucketStart, bucketEnd };
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addOperationLoad(
  loads: Map<string, CapacityLoadLine>,
  input: {
    resourceType: PlanningCapacityResourceType;
    resourceId: string;
    resourceName: string;
    at: Date;
    minutes: number;
    operationId: string;
    granularity: MrpBucketGranularity;
  }
): void {
  const period = periodFor(input.at, input.granularity);
  const key = capacityKey(input.resourceType, input.resourceId, period.bucketStart);
  const load = loads.get(key) ?? {
    id: key,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    resourceName: input.resourceName,
    bucketStart: period.bucketStart,
    bucketEnd: period.bucketEnd,
    availableMinutes: 0,
    scheduledMinutes: 0,
    loadPercent: 0,
    overloadMinutes: 0,
    operationIds: []
  };
  load.scheduledMinutes = roundQuantity(load.scheduledMinutes + input.minutes);
  load.operationIds = [...new Set([...load.operationIds, input.operationId])];
  loads.set(key, load);
}

function addRoughCutLoad(
  loads: Map<string, RoughCutCapacityLine>,
  resourceType: PlanningCapacityResourceType,
  resourceId: string,
  resourceName: string,
  at: Date,
  minutes: number,
  productionOrderId: string,
  statusField: "plannedMinutes" | "openMinutes",
  granularity: MrpBucketGranularity
): void {
  const period = periodFor(at, granularity);
  const key = capacityKey(resourceType, resourceId, period.bucketStart);
  const load = loads.get(key) ?? {
    id: key,
    resourceType,
    resourceId,
    resourceName,
    bucketStart: period.bucketStart,
    bucketEnd: period.bucketEnd,
    plannedMinutes: 0,
    openMinutes: 0,
    availableMinutes: 0,
    utilizationPercent: 0,
    overloadMinutes: 0,
    productionOrderIds: []
  };
  load[statusField] = roundQuantity(load[statusField] + minutes);
  load.productionOrderIds = [...new Set([...load.productionOrderIds, productionOrderId])];
  loads.set(key, load);
}

type CapacityLedger = Map<string, {
  date: Date;
  resourceType: PlanningCapacityResourceType;
  resourceId: string;
  resourceName: string;
  remainingMinutes: number;
  startsAt: Date;
}>;

function buildDailyCapacityLedger(calendars: PlanningCapacityCalendar[]): CapacityLedger {
  const ledger: CapacityLedger = new Map();
  for (const calendar of calendars) {
    if (calendar.reason === "holiday" || calendar.reason === "maintenance") {
      continue;
    }
    const period = periodFor(calendar.date, "day");
    const key = capacityKey(calendar.resourceType, calendar.resourceId, period.bucketStart);
    const existing = ledger.get(key);
    ledger.set(key, {
      date: period.bucketStart,
      resourceType: calendar.resourceType,
      resourceId: calendar.resourceId,
      resourceName: calendar.resourceName,
      remainingMinutes: roundQuantity((existing?.remainingMinutes ?? 0) + Math.max(0, calendar.availableMinutes - (calendar.unavailableMinutes ?? 0))),
      startsAt: calendar.startsAt ?? new Date(`${period.bucketStart.toISOString().slice(0, 10)}T08:00:00.000Z`)
    });
  }
  return ledger;
}

function groupOperationsByOrder(operations: ProductionOperationPlan[]): Map<string, ProductionOperationPlan[]> {
  const groups = new Map<string, ProductionOperationPlan[]>();
  const sorted = [...operations].sort((left, right) => {
    const priorityDelta = priorityForOperation(left) - priorityForOperation(right);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }
    return (left.constraintDate?.getTime() ?? left.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) -
      (right.constraintDate?.getTime() ?? right.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER);
  });
  for (const operation of sorted) {
    groups.set(operation.productionOrderId, [...(groups.get(operation.productionOrderId) ?? []), operation]);
  }
  return groups;
}

function latestMaterialConstraintByOrder(constraints: MaterialAvailabilityConstraint[]): Map<string, Date> {
  const result = new Map<string, Date>();
  for (const constraint of constraints) {
    if (!constraint.productionOrderId || !constraint.constrainedStartAt) {
      continue;
    }
    const existing = result.get(constraint.productionOrderId);
    if (!existing || constraint.constrainedStartAt.getTime() > existing.getTime()) {
      result.set(constraint.productionOrderId, constraint.constrainedStartAt);
    }
  }
  return result;
}

function findFiniteSlot(input: {
  operation: ProductionOperationPlan;
  blockMinutes: number;
  earliestStart: Date;
  horizonEnd: Date;
  remainingCapacity: CapacityLedger;
}): { bucketStart: Date; start: Date; end: Date } {
  const earliestDay = startOfUtcDay(input.earliestStart);
  for (let day = new Date(earliestDay); day.getTime() <= input.horizonEnd.getTime(); day.setUTCDate(day.getUTCDate() + 1)) {
    if (resourcesHaveCapacity(input.remainingCapacity, input.operation, day, input.blockMinutes)) {
      const workCenter = input.remainingCapacity.get(capacityKey("work_center", input.operation.workCenterId, day));
      const start = maxDate(input.earliestStart, workCenter?.startsAt ?? new Date(`${day.toISOString().slice(0, 10)}T08:00:00.000Z`)) ?? input.earliestStart;
      return { bucketStart: new Date(day), start, end: addMinutes(start, input.blockMinutes) };
    }
  }

  const fallbackStart = addDays(startOfUtcDay(input.horizonEnd), 1);
  return {
    bucketStart: fallbackStart,
    start: fallbackStart,
    end: addMinutes(fallbackStart, input.blockMinutes)
  };
}

function resourcesHaveCapacity(
  ledger: CapacityLedger,
  operation: ProductionOperationPlan,
  day: Date,
  blockMinutes: number
): boolean {
  const resourceKeys = [
    capacityKey("work_center", operation.workCenterId, day),
    ...(operation.equipmentId ? [capacityKey("equipment", operation.equipmentId, day)] : []),
    ...(operation.laborRoleId ? [capacityKey("labor_role", operation.laborRoleId, day)] : [])
  ];
  return resourceKeys.every((key) => (ledger.get(key)?.remainingMinutes ?? 0) >= blockMinutes);
}

function consumeFiniteCapacity(
  ledger: CapacityLedger,
  operation: ProductionOperationPlan,
  day: Date,
  blockMinutes: number
): void {
  const resourceKeys = [
    capacityKey("work_center", operation.workCenterId, day),
    ...(operation.equipmentId ? [capacityKey("equipment", operation.equipmentId, day)] : []),
    ...(operation.laborRoleId ? [capacityKey("labor_role", operation.laborRoleId, day)] : [])
  ];
  for (const key of resourceKeys) {
    const row = ledger.get(key);
    if (row) {
      row.remainingMinutes = roundQuantity(row.remainingMinutes - blockMinutes);
    }
  }
}

function priorityForOperation(operation: ProductionOperationPlan): number {
  if (operation.dispatchPriority !== undefined) {
    return operation.dispatchPriority;
  }
  if (operation.status === "in_progress") {
    return 1;
  }
  if (operation.status === "ready") {
    return 2;
  }
  return 5;
}

function capacityKey(resourceType: PlanningCapacityResourceType, resourceId: string, bucketStart: Date): string {
  return `${resourceType}:${resourceId}:${bucketStart.toISOString()}`;
}

function findNextCapacitySlot(
  operation: ProductionOperationPlan,
  capacityLoads: CapacityLoadLine[],
  calendars: PlanningCapacityCalendar[],
  scheduledAt: Date
): Date {
  const calendarsForResource = calendars
    .filter((calendar) => calendar.resourceType === "work_center" && calendar.resourceId === operation.workCenterId)
    .sort((left, right) => left.date.getTime() - right.date.getTime());

  for (const calendar of calendarsForResource) {
    if (calendar.date.getTime() < scheduledAt.getTime()) {
      continue;
    }
    const period = periodFor(calendar.date, "day");
    const load = capacityLoads.find(
      (candidate) =>
        candidate.resourceType === "work_center" &&
        candidate.resourceId === operation.workCenterId &&
        candidate.bucketStart.getTime() === period.bucketStart.getTime()
    );
    const scheduledMinutes = load?.scheduledMinutes ?? 0;
    const availableMinutes = load?.availableMinutes ?? calendar.availableMinutes;
    if (availableMinutes - scheduledMinutes + operation.requiredMinutes >= operation.requiredMinutes) {
      return new Date(`${period.bucketStart.toISOString().slice(0, 10)}T08:00:00.000Z`);
    }
  }

  return addDays(startOfUtcDay(scheduledAt), 1);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function addDays(date: Date, days = 0): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function maxDate(left: Date | null | undefined, right: Date | null | undefined): Date | null {
  if (!left) {
    return right ?? null;
  }
  if (!right) {
    return left;
  }
  return left.getTime() >= right.getTime() ? left : right;
}

function supplyDate(supply: MrpSupply, fallback: Date): Date {
  return supply.availableAt ?? fallback;
}

function leadTimeFor(itemType: MrpItemRef["itemType"], itemId: string, leadTimes: PlanningLeadTime[]) {
  const leadTime = leadTimes.find((candidate) => candidate.itemType === itemType && candidate.itemId === itemId);
  return {
    productionDays: leadTime?.productionDays ?? 3,
    supplierDays: leadTime?.supplierDays ?? 7,
    transferDays: leadTime?.transferDays ?? 1,
    qcReleaseDays: leadTime?.qcReleaseDays ?? 1
  };
}

function promiseStatusFor(input: {
  requestedAt: Date | null;
  promisedAt: Date | null;
  cumulative: number;
  requestedQuantity: number;
  horizonEnd: Date;
}): CtpResult["promiseStatus"] {
  if (input.cumulative < input.requestedQuantity || !input.promisedAt || input.promisedAt.getTime() > input.horizonEnd.getTime()) {
    return "not_capable";
  }
  if (!input.requestedAt || input.promisedAt.getTime() <= input.requestedAt.getTime()) {
    return input.promisedAt.getTime() <= Date.now() ? "available_now" : "available_by_date";
  }
  return "late_risk";
}

function formatDelta(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }
  return String(value);
}

function explodeBomDemand(bom: MrpBom, suggestion: MrpSuggestion, itemCatalog: Map<string, MrpItemRef>): MrpDemand[] {
  const multiplier = suggestion.quantity / bom.yieldQuantity;
  return bom.lines.map((line) => {
    const ref = itemCatalog.get(itemCatalogKey(line.componentType, line.componentId));
    if (!ref) {
      throw new DomainValidationError("BOM line references an unknown item", {
        bomId: bom.id,
        componentType: line.componentType,
        componentId: line.componentId
      });
    }
    const quantity = line.quantity * multiplier * (1 + line.wastePercent / 100);
    return {
      ...ref,
      id: `${suggestion.id}:component:${line.id}`,
      sourceType: "suggested_production",
      sourceId: suggestion.id,
      quantity: roundQuantity(quantity),
      neededAt: suggestion.dueAt,
      locationId: suggestion.locationId,
      description: `${suggestion.name} BOM ${bom.versionCode}`,
      parentDemandId: suggestion.id
    };
  });
}

function buildSuggestion(input: {
  type: MrpSuggestionType;
  ref: MrpItemRef;
  quantity: number;
  locationId: string | null;
  dueAt: Date | null;
  reason: string;
  sourceDemandIds: string[];
  bomId: string | null;
}): MrpSuggestion {
  return {
    ...input.ref,
    id: `mrp-${input.type}-${input.ref.itemType}-${input.ref.itemId}-${input.locationId ?? "all"}`,
    suggestionType: input.type,
    quantity: roundQuantity(input.quantity),
    locationId: input.locationId,
    dueAt: input.dueAt,
    reason: input.reason,
    sourceDemandIds: [...new Set(input.sourceDemandIds)],
    bomId: input.bomId
  };
}

function shortageFor(bucket: ItemBucket): number {
  const demand = bucket.demands.reduce((total, entry) => total + entry.quantity, 0);
  const supply = bucket.supplies.reduce((total, entry) => total + entry.quantity, 0);
  return demand - supply;
}

function earliestNeededAt(demands: MrpDemand[]): Date | null {
  return demands.reduce<Date | null>((earliest, demand) => {
    if (!demand.neededAt) {
      return earliest;
    }
    if (!earliest || demand.neededAt.getTime() < earliest.getTime()) {
      return demand.neededAt;
    }
    return earliest;
  }, null);
}

function inScope(date: Date | null, locationId: string | null, horizonEnd: Date, locationIds: string[]): boolean {
  const locationMatches = locationIds.length === 0 || (locationId !== null && locationIds.includes(locationId));
  const dateMatches = date === null || date.getTime() <= horizonEnd.getTime();
  return locationMatches && dateMatches;
}

function isBomEffective(bom: MrpBom, horizonEnd: Date): boolean {
  return (
    bom.status === "active" &&
    (!bom.effectiveFrom || bom.effectiveFrom.getTime() <= horizonEnd.getTime()) &&
    (!bom.effectiveTo || bom.effectiveTo.getTime() >= horizonEnd.getTime())
  );
}

function itemCatalogKey(itemType: InventoryItemType, itemId: string): string {
  return `${itemType}:${itemId}`;
}

function roundQuantity(value: number): number {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}
