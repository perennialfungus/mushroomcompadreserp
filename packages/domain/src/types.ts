export type EntityId = string;
export type IsoDateTime = string;
export type LocaleCode = "en" | "pt";

export type ItemType = "product_variant" | "material" | "packaging_component" | "wip" | "finished_good" | "merch";
export type SourceType =
  | "purchase_receipt"
  | "grow_batch"
  | "harvest"
  | "drying_run"
  | "processing_batch"
  | "production_order"
  | "stock_adjustment"
  | "manual";

export type LocationType =
  | "farm"
  | "drying"
  | "production"
  | "packing"
  | "warehouse"
  | "retail_shopify"
  | "supplier"
  | "customer"
  | "quarantine"
  | "virtual";

export type StockMovementType =
  | "receipt"
  | "adjustment"
  | "transfer"
  | "consumption"
  | "production_output"
  | "hold"
  | "release"
  | "allocation"
  | "shipment"
  | "return"
  | "count_correction"
  | "reversal";

export type GrowBatchStatus = "planned" | "inoculated" | "fruiting" | "harvested" | "closed";
export type ProductionOrderStatus = "draft" | "planned" | "released" | "in_progress" | "completed" | "cancelled";
export type PurchaseOrderStatus = "draft" | "ordered" | "partially_received" | "received" | "cancelled";
export type ProcessingBatchStatus = "planned" | "in_progress" | "qc_pending" | "completed" | "on_hold" | "cancelled";
export type QcRecordStatus = "draft" | "pending" | "in_review" | "passed" | "failed" | "released" | "rejected" | "cancelled";
export type LotStatus = "pending" | "released" | "hold" | "rejected" | "expired" | "consumed";
export type SalesOrderStatus =
  | "draft"
  | "confirmed"
  | "allocated"
  | "picking"
  | "packed"
  | "partially_shipped"
  | "shipped"
  | "closed"
  | "on_hold"
  | "cancelled";
export type ShipmentStatus = "draft" | "packed" | "shipped" | "delivered" | "returned" | "cancelled";

export type ProcessingBatchType =
  | "extraction"
  | "blending"
  | "encapsulation"
  | "bottling"
  | "packaging"
  | "chocolate"
  | "food"
  | "powder";

export type SalesChannel = "shopify" | "wholesale" | "manual";

export interface RegulatedTransitionMetadata {
  readonly actorUserId: EntityId;
  readonly reason: string;
  readonly occurredAt?: IsoDateTime;
  readonly requestId?: string;
}

export interface Quantity {
  readonly quantity: number;
  readonly uom: string;
}

export interface LifecycleTransitionResult<TStatus extends string> {
  readonly from: TStatus;
  readonly to: TStatus;
  readonly regulated: boolean;
  readonly metadata?: RegulatedTransitionMetadata;
}
