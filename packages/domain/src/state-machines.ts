import {
  InvalidLifecycleTransitionError,
  RegulatedTransitionMetadataError
} from "./errors.js";
import type {
  GrowBatchStatus,
  LifecycleTransitionResult,
  LotStatus,
  ProcessingBatchStatus,
  ProductionOrderStatus,
  PurchaseOrderStatus,
  QcRecordStatus,
  RegulatedTransitionMetadata,
  SalesOrderStatus,
  ShipmentStatus
} from "./types.js";

export interface StateMachineDefinition<TStatus extends string> {
  readonly entity: string;
  readonly transitions: Readonly<Record<TStatus, readonly TStatus[]>>;
  readonly regulatedTransitions?: ReadonlySet<string>;
}

const transitionKey = (from: string, to: string) => `${from}->${to}`;

export function transitionStatus<TStatus extends string>(
  definition: StateMachineDefinition<TStatus>,
  from: TStatus,
  to: TStatus,
  metadata?: RegulatedTransitionMetadata
): LifecycleTransitionResult<TStatus> {
  if (from === to) {
    return { from, to, regulated: false };
  }

  const allowed = definition.transitions[from] ?? [];
  if (!allowed.includes(to)) {
    throw new InvalidLifecycleTransitionError(definition.entity, from, to);
  }

  const regulated = definition.regulatedTransitions?.has(transitionKey(from, to)) ?? false;
  if (regulated && (!metadata?.actorUserId || !metadata.reason?.trim())) {
    throw new RegulatedTransitionMetadataError(definition.entity, from, to);
  }

  return regulated ? { from, to, regulated, metadata: metadata! } : { from, to, regulated };
}

export const growBatchStateMachine: StateMachineDefinition<GrowBatchStatus> = {
  entity: "grow_batch",
  transitions: {
    planned: ["inoculated"],
    inoculated: ["fruiting"],
    fruiting: ["harvested"],
    harvested: ["closed"],
    closed: []
  },
  regulatedTransitions: new Set([transitionKey("harvested", "closed")])
};

export const productionOrderStateMachine: StateMachineDefinition<ProductionOrderStatus> = {
  entity: "production_order",
  transitions: {
    draft: ["planned", "cancelled"],
    planned: ["released", "cancelled"],
    released: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    cancelled: []
  },
  regulatedTransitions: new Set([
    transitionKey("released", "cancelled"),
    transitionKey("in_progress", "completed"),
    transitionKey("in_progress", "cancelled")
  ])
};

export const purchaseOrderStateMachine: StateMachineDefinition<PurchaseOrderStatus> = {
  entity: "purchase_order",
  transitions: {
    draft: ["ordered", "cancelled"],
    ordered: ["partially_received", "received", "cancelled"],
    partially_received: ["received", "cancelled"],
    received: [],
    cancelled: []
  },
  regulatedTransitions: new Set([
    transitionKey("ordered", "cancelled"),
    transitionKey("partially_received", "cancelled")
  ])
};

export const processingBatchStateMachine: StateMachineDefinition<ProcessingBatchStatus> = {
  entity: "processing_batch",
  transitions: {
    planned: ["in_progress", "cancelled"],
    in_progress: ["qc_pending", "on_hold", "cancelled"],
    qc_pending: ["completed", "on_hold", "cancelled"],
    on_hold: ["in_progress", "qc_pending", "cancelled"],
    completed: [],
    cancelled: []
  },
  regulatedTransitions: new Set([
    transitionKey("in_progress", "qc_pending"),
    transitionKey("qc_pending", "completed"),
    transitionKey("in_progress", "on_hold"),
    transitionKey("qc_pending", "on_hold"),
    transitionKey("on_hold", "qc_pending")
  ])
};

export const qcRecordStateMachine: StateMachineDefinition<QcRecordStatus> = {
  entity: "qc_record",
  transitions: {
    draft: ["pending", "cancelled"],
    pending: ["in_review", "cancelled"],
    in_review: ["passed", "failed", "cancelled"],
    passed: ["released"],
    failed: ["rejected"],
    released: [],
    rejected: [],
    cancelled: []
  },
  regulatedTransitions: new Set([transitionKey("passed", "released"), transitionKey("failed", "rejected")])
};

export const lotStateMachine: StateMachineDefinition<LotStatus> = {
  entity: "lot",
  transitions: {
    pending: ["released", "hold", "rejected", "expired"],
    released: ["hold", "expired", "consumed"],
    hold: ["released", "rejected", "expired"],
    rejected: [],
    expired: [],
    consumed: []
  },
  regulatedTransitions: new Set([
    transitionKey("pending", "released"),
    transitionKey("pending", "hold"),
    transitionKey("pending", "rejected"),
    transitionKey("released", "hold"),
    transitionKey("hold", "released"),
    transitionKey("hold", "rejected")
  ])
};

export const salesOrderStateMachine: StateMachineDefinition<SalesOrderStatus> = {
  entity: "sales_order",
  transitions: {
    draft: ["confirmed", "cancelled"],
    confirmed: ["allocated", "on_hold", "cancelled"],
    allocated: ["picking", "on_hold", "cancelled"],
    picking: ["packed", "on_hold", "cancelled"],
    packed: ["partially_shipped", "shipped", "on_hold", "cancelled"],
    partially_shipped: ["shipped", "on_hold"],
    shipped: ["closed"],
    closed: [],
    on_hold: ["confirmed", "allocated", "picking", "packed", "cancelled"],
    cancelled: []
  },
  regulatedTransitions: new Set([
    transitionKey("confirmed", "on_hold"),
    transitionKey("allocated", "on_hold"),
    transitionKey("picking", "on_hold"),
    transitionKey("packed", "on_hold"),
    transitionKey("partially_shipped", "on_hold"),
    transitionKey("on_hold", "cancelled")
  ])
};

export const shipmentStateMachine: StateMachineDefinition<ShipmentStatus> = {
  entity: "shipment",
  transitions: {
    draft: ["packed", "cancelled"],
    packed: ["shipped", "cancelled"],
    shipped: ["delivered", "returned"],
    delivered: [],
    returned: [],
    cancelled: []
  },
  regulatedTransitions: new Set([transitionKey("packed", "cancelled"), transitionKey("shipped", "returned")])
};

export const transitionGrowBatchStatus = (
  from: GrowBatchStatus,
  to: GrowBatchStatus,
  metadata?: RegulatedTransitionMetadata
) => transitionStatus(growBatchStateMachine, from, to, metadata);

export const transitionProductionOrderStatus = (
  from: ProductionOrderStatus,
  to: ProductionOrderStatus,
  metadata?: RegulatedTransitionMetadata
) => transitionStatus(productionOrderStateMachine, from, to, metadata);

export const transitionPurchaseOrderStatus = (
  from: PurchaseOrderStatus,
  to: PurchaseOrderStatus,
  metadata?: RegulatedTransitionMetadata
) => transitionStatus(purchaseOrderStateMachine, from, to, metadata);

export const transitionProcessingBatchStatus = (
  from: ProcessingBatchStatus,
  to: ProcessingBatchStatus,
  metadata?: RegulatedTransitionMetadata
) => transitionStatus(processingBatchStateMachine, from, to, metadata);

export const transitionQcRecordStatus = (
  from: QcRecordStatus,
  to: QcRecordStatus,
  metadata?: RegulatedTransitionMetadata
) => transitionStatus(qcRecordStateMachine, from, to, metadata);

export const transitionLotStatus = (from: LotStatus, to: LotStatus, metadata?: RegulatedTransitionMetadata) =>
  transitionStatus(lotStateMachine, from, to, metadata);

export const transitionSalesOrderStatus = (
  from: SalesOrderStatus,
  to: SalesOrderStatus,
  metadata?: RegulatedTransitionMetadata
) => transitionStatus(salesOrderStateMachine, from, to, metadata);

export const transitionShipmentStatus = (
  from: ShipmentStatus,
  to: ShipmentStatus,
  metadata?: RegulatedTransitionMetadata
) => transitionStatus(shipmentStateMachine, from, to, metadata);
