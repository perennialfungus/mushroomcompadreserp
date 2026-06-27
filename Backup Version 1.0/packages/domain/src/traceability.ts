export type TraceNodeType =
  | "lot"
  | "processing_batch"
  | "batch_input"
  | "batch_output"
  | "grow_batch"
  | "harvest"
  | "sales_order"
  | "sales_order_line"
  | "order_allocation"
  | "shipment"
  | "customer"
  | "reseller";

export type TraceDirection = "backward" | "forward";

export type TraceNodeStatus = "normal" | "hold" | "recalled" | "rejected" | "expired";

export type TraceNode = {
  id: string;
  type: TraceNodeType;
  label: string;
  subtitle?: string | undefined;
  status: TraceNodeStatus;
  metadata?: Record<string, unknown> | undefined;
};

export type TraceEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
};

export type TraceGraph = {
  query: {
    direction: TraceDirection;
    sourceType: TraceNodeType;
    sourceId: string;
  };
  nodes: TraceNode[];
  edges: TraceEdge[];
};

export type TraceLotRecord = {
  id: string;
  organizationId: string;
  lotCode: string;
  itemType: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  sourceType: string;
  sourceId: string;
  qcStatus: string;
  status: string;
  parentLotId: string | null;
  expiresAt: Date | string | null;
  metadataJson?: Record<string, unknown> | undefined;
};

export type TraceProcessingBatchRecord = {
  id: string;
  organizationId: string;
  batchCode: string;
  type: string;
  status: string;
  productionOrderId?: string | null | undefined;
  startedAt?: Date | string | null | undefined;
  endedAt?: Date | string | null | undefined;
};

export type TraceBatchInputRecord = {
  id: string;
  processingBatchId: string;
  inputType: string;
  sourceLotId: string;
  quantity: number;
  uom: string;
};

export type TraceBatchOutputRecord = {
  id: string;
  processingBatchId: string;
  lotId: string;
  quantity: number;
  uom: string;
};

export type TraceGrowBatchRecord = {
  id: string;
  organizationId: string;
  batchCode: string;
  species: string;
  strain?: string | null | undefined;
  status: string;
};

export type TraceHarvestRecord = {
  id: string;
  organizationId: string;
  harvestCode: string;
  growBatchId: string;
  status: string;
  harvestedAt: Date | string;
};

export type TraceCustomerRecord = {
  id: string;
  organizationId: string;
  type: string;
  name: string;
  email?: string | null | undefined;
  phone?: string | null | undefined;
};

export type TraceResellerRecord = {
  id: string;
  organizationId: string;
  customerId: string;
  status: string;
  taxId?: string | null | undefined;
};

export type TraceSalesOrderRecord = {
  id: string;
  organizationId: string;
  orderNumber: string;
  channel: string;
  status: string;
  customerId: string | null;
  shopifyOrderGid?: string | null | undefined;
  externalOrderNumber?: string | null | undefined;
  orderedAt: Date | string;
};

export type TraceSalesOrderLineRecord = {
  id: string;
  salesOrderId: string;
  productVariantId: string;
  quantity: number;
  uom: string;
  status: string;
};

export type TraceOrderAllocationRecord = {
  id: string;
  salesOrderLineId: string;
  lotId: string;
  locationId: string;
  quantity: number;
  uom: string;
  shippedAt?: Date | string | null | undefined;
};

export type TraceShipmentRecord = {
  id: string;
  organizationId: string;
  salesOrderId: string;
  shipmentNumber: string;
  status: string;
  carrier?: string | null | undefined;
  trackingNumber?: string | null | undefined;
  shippedAt?: Date | string | null | undefined;
};

export type TraceabilityDataSet = {
  lots: TraceLotRecord[];
  processingBatches: TraceProcessingBatchRecord[];
  batchInputs: TraceBatchInputRecord[];
  batchOutputs: TraceBatchOutputRecord[];
  growBatches: TraceGrowBatchRecord[];
  harvests: TraceHarvestRecord[];
  salesOrders: TraceSalesOrderRecord[];
  salesOrderLines: TraceSalesOrderLineRecord[];
  orderAllocations: TraceOrderAllocationRecord[];
  shipments: TraceShipmentRecord[];
  customers: TraceCustomerRecord[];
  resellers: TraceResellerRecord[];
  stockMovements?: TraceStockMovementRecord[] | undefined;
  inventoryBalances?: TraceInventoryBalanceRecord[] | undefined;
  qcRecords?: TraceQcRecord[] | undefined;
  coaAttachments?: TraceCoaAttachment[] | undefined;
  qualityEvents?: TraceQualityEvent[] | undefined;
};

export type TraceStockMovementRecord = {
  id: string;
  movementNumber: string;
  movementType: string;
  itemType: string;
  itemId: string;
  lotId: string | null;
  fromLocationId: string | null;
  toLocationId: string | null;
  quantity: number;
  uom: string;
  occurredAt: Date | string;
  sourceType?: string | null | undefined;
  sourceId?: string | null | undefined;
};

export type TraceInventoryBalanceRecord = {
  id: string;
  lotId: string | null;
  locationId: string;
  locationName?: string | null | undefined;
  locationCode?: string | null | undefined;
  availableQuantity: number;
  reservedQuantity: number;
  heldQuantity: number;
  uom: string;
};

export type TraceQcRecord = {
  id: string;
  recordCode: string;
  subjectType: string;
  subjectId: string;
  qcType: string;
  status: string;
  testedAt?: Date | string | null | undefined;
  releasedAt?: Date | string | null | undefined;
  summary?: string | null | undefined;
};

export type TraceCoaAttachment = {
  id: string;
  qcRecordId: string;
  lotId: string | null;
  fileName: string;
  filePath: string;
  contentType: string;
  uploadedAt: Date | string;
};

export type TraceQualityEvent = {
  id: string;
  eventNumber: string;
  eventType: string;
  subjectType: string;
  subjectId: string;
  severity: string;
  status: string;
  summary: string;
  occurredAt: Date | string;
};

export type TraceSearchResult = {
  id: string;
  type: TraceNodeType;
  label: string;
  subtitle: string;
  status: TraceNodeStatus;
  recommendedDirection: TraceDirection;
};

export type RecallReport = {
  generatedAt: string;
  source: TraceNode;
  summary: {
    affectedLots: number;
    heldOrRecalledLots: number;
    affectedOrders: number;
    affectedCustomers: number;
    affectedResellers: number;
    shippedQuantity: number;
  };
  lots: Array<{
    lotId: string;
    lotCode: string;
    itemName: string;
    itemSku: string;
    qcStatus: string;
    status: TraceNodeStatus;
  }>;
  orders: Array<{
    orderId: string;
    orderNumber: string;
    channel: string;
    shopifyOrderNumber: string | null;
    status: string;
    customerName: string | null;
    customerEmail: string | null;
    resellerName: string | null;
    lotCode: string;
    quantity: number;
    uom: string;
    shipmentNumber: string | null;
    shippedAt: string | null;
  }>;
  graph: TraceGraph;
};

export type MockRecallRunStatus = "draft" | "in_progress" | "completed" | "cancelled";
export type RecallActionStatus = "open" | "completed" | "gap";

export type MockRecallRunSnapshot = {
  id: string;
  runNumber: string;
  scope: string;
  initiatingReason: string;
  targetType: TraceNodeType;
  targetId: string;
  ownerUserId: string;
  status: MockRecallRunStatus;
  drillMode: boolean;
  startedAt: Date | string;
  completedAt?: Date | string | null | undefined;
  elapsedSeconds?: number | null | undefined;
};

export type RecallActionSnapshot = {
  id: string;
  runId: string;
  actionType: string;
  description: string;
  status: RecallActionStatus;
  ownerUserId?: string | null | undefined;
  occurredAt: Date | string;
  gap?: string | null | undefined;
  decision?: string | null | undefined;
};

export type RecallAuditPacket = {
  generatedAt: string;
  run: MockRecallRunSnapshot;
  source: TraceNode;
  summary: RecallReport["summary"] & {
    openStockQuantity: number;
    shippedStockQuantity: number;
    unresolvedStockLocations: number;
    openActions: number;
    recordedGaps: number;
    qcRecordCount: number;
    coaCount: number;
    deviationCount: number;
  };
  traceGraph: TraceGraph;
  lots: RecallReport["lots"];
  stockStatus: Array<{
    lotId: string;
    lotCode: string;
    locationId: string;
    locationName: string;
    availableQuantity: number;
    reservedQuantity: number;
    heldQuantity: number;
    uom: string;
    unresolved: boolean;
  }>;
  shipments: RecallReport["orders"];
  contacts: Array<{
    contactType: "customer" | "reseller";
    customerName: string;
    email: string | null;
    phone: string | null;
    resellerStatus: string | null;
    orderNumbers: string[];
    affectedLotCodes: string[];
  }>;
  qcRecords: Array<TraceQcRecord & { subjectLabel: string }>;
  coaAttachments: TraceCoaAttachment[];
  deviations: TraceQualityEvent[];
  decisions: RecallActionSnapshot[];
  openActions: RecallActionSnapshot[];
  gaps: RecallActionSnapshot[];
};

export function buildTraceabilityGraph(
  data: TraceabilityDataSet,
  sourceType: TraceNodeType,
  sourceId: string,
  direction: TraceDirection
): TraceGraph {
  const builder = createGraphBuilder(data, sourceType, sourceId, direction);

  if (direction === "backward") {
    traceBackward(builder, sourceType, sourceId);
  } else {
    traceForward(builder, sourceType, sourceId);
  }

  return builder.graph();
}

export function searchTraceability(data: TraceabilityDataSet, rawQuery: string): TraceSearchResult[] {
  const query = normalize(rawQuery);
  if (!query) {
    return [];
  }

  const results: TraceSearchResult[] = [];
  const add = (result: TraceSearchResult) => {
    if (!results.some((candidate) => candidate.type === result.type && candidate.id === result.id)) {
      results.push(result);
    }
  };

  for (const lot of data.lots) {
    if ([lot.lotCode, lot.itemSku, lot.itemName].some((value) => normalize(value).includes(query))) {
      add({
        id: lot.id,
        type: "lot",
        label: lot.lotCode,
        subtitle: `${lot.itemSku} - ${lot.itemName}`,
        status: lotStatus(lot),
        recommendedDirection: lot.itemType === "product_variant" ? "backward" : "forward"
      });
    }
  }

  for (const batch of data.processingBatches) {
    if ([batch.batchCode, batch.type].some((value) => normalize(value).includes(query))) {
      add({
        id: batch.id,
        type: "processing_batch",
        label: batch.batchCode,
        subtitle: `${batch.type} batch`,
        status: "normal",
        recommendedDirection: "forward"
      });
    }
  }

  for (const growBatch of data.growBatches) {
    if ([growBatch.batchCode, growBatch.species, growBatch.strain].some((value) => normalize(value).includes(query))) {
      add({
        id: growBatch.id,
        type: "grow_batch",
        label: growBatch.batchCode,
        subtitle: `${growBatch.species}${growBatch.strain ? ` - ${growBatch.strain}` : ""}`,
        status: "normal",
        recommendedDirection: "forward"
      });
    }
  }

  for (const harvest of data.harvests) {
    if (normalize(harvest.harvestCode).includes(query)) {
      add({
        id: harvest.id,
        type: "harvest",
        label: harvest.harvestCode,
        subtitle: "Harvest",
        status: "normal",
        recommendedDirection: "forward"
      });
    }
  }

  for (const order of data.salesOrders) {
    if (
      [order.orderNumber, order.externalOrderNumber, order.shopifyOrderGid].some((value) =>
        normalize(value).includes(query)
      )
    ) {
      add({
        id: order.id,
        type: "sales_order",
        label: order.orderNumber,
        subtitle: `${order.channel}${order.externalOrderNumber ? ` - ${order.externalOrderNumber}` : ""}`,
        status: "normal",
        recommendedDirection: "backward"
      });
    }
  }

  return results.slice(0, 20);
}

export function buildRecallReport(
  data: TraceabilityDataSet,
  sourceType: TraceNodeType,
  sourceId: string,
  generatedAt = new Date()
): RecallReport {
  const graph = buildTraceabilityGraph(data, sourceType, sourceId, "forward");
  const source = graph.nodes.find((node) => node.id === nodeKey(sourceType, sourceId)) ?? nodeFor(data, sourceType, sourceId);
  const lotNodes = graph.nodes.filter((node) => node.type === "lot");
  const allocationNodeIds = new Set(graph.nodes.filter((node) => node.type === "order_allocation").map((node) => node.id));
  const orderRows = data.orderAllocations
    .filter((allocation) => allocationNodeIds.has(nodeKey("order_allocation", allocation.id)))
    .map((allocation) => {
      const line = data.salesOrderLines.find((candidate) => candidate.id === allocation.salesOrderLineId) ?? null;
      const order = line ? data.salesOrders.find((candidate) => candidate.id === line.salesOrderId) ?? null : null;
      const lot = data.lots.find((candidate) => candidate.id === allocation.lotId) ?? null;
      const customer = order?.customerId
        ? data.customers.find((candidate) => candidate.id === order.customerId) ?? null
        : null;
      const reseller = customer ? data.resellers.find((candidate) => candidate.customerId === customer.id) ?? null : null;
      const shipment = order
        ? data.shipments.find((candidate) => candidate.salesOrderId === order.id) ?? null
        : null;

      return {
        orderId: order?.id ?? "",
        orderNumber: order?.orderNumber ?? "Unknown order",
        channel: order?.channel ?? "unknown",
        shopifyOrderNumber: order?.externalOrderNumber ?? null,
        status: order?.status ?? "unknown",
        customerName: customer?.name ?? null,
        customerEmail: customer?.email ?? null,
        resellerName: reseller ? customer?.name ?? null : null,
        lotCode: lot?.lotCode ?? allocation.lotId,
        quantity: allocation.quantity,
        uom: allocation.uom,
        shipmentNumber: shipment?.shipmentNumber ?? null,
        shippedAt: stringifyDate(allocation.shippedAt ?? shipment?.shippedAt ?? null)
      };
    });

  const customers = new Set(orderRows.map((row) => row.customerEmail ?? row.customerName).filter(Boolean));
  const resellers = new Set(orderRows.map((row) => row.resellerName).filter(Boolean));

  return {
    generatedAt: generatedAt.toISOString(),
    source,
    summary: {
      affectedLots: lotNodes.length,
      heldOrRecalledLots: lotNodes.filter((node) => node.status !== "normal").length,
      affectedOrders: new Set(orderRows.map((row) => row.orderId).filter(Boolean)).size,
      affectedCustomers: customers.size,
      affectedResellers: resellers.size,
      shippedQuantity: orderRows.reduce((total, row) => total + row.quantity, 0)
    },
    lots: lotNodes.map((node) => {
      const lot = data.lots.find((candidate) => node.id === nodeKey("lot", candidate.id));
      return {
        lotId: lot?.id ?? node.id,
        lotCode: lot?.lotCode ?? node.label,
        itemName: lot?.itemName ?? node.subtitle ?? "",
        itemSku: lot?.itemSku ?? "",
        qcStatus: lot?.qcStatus ?? node.status,
        status: node.status
      };
    }),
    orders: orderRows,
    graph
  };
}

export function recallReportToCsv(report: RecallReport): string {
  const header = [
    "order_number",
    "channel",
    "shopify_order_number",
    "customer_name",
    "customer_email",
    "reseller_name",
    "lot_code",
    "quantity",
    "uom",
    "shipment_number",
    "shipped_at",
    "status"
  ];
  const rows = report.orders.map((order) => [
    order.orderNumber,
    order.channel,
    order.shopifyOrderNumber,
    order.customerName,
    order.customerEmail,
    order.resellerName,
    order.lotCode,
    order.quantity,
    order.uom,
    order.shipmentNumber,
    order.shippedAt,
    order.status
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function buildRecallAuditPacket(
  data: TraceabilityDataSet,
  run: MockRecallRunSnapshot,
  actions: RecallActionSnapshot[] = [],
  generatedAt = new Date()
): RecallAuditPacket {
  const report = buildRecallReport(data, run.targetType, run.targetId, generatedAt);
  const affectedLotIds = new Set(report.lots.map((lot) => lot.lotId));
  const affectedNodePairs = report.graph.nodes.map((node) => splitNodeKey(node.id));
  const affectedSubjects = new Set(affectedNodePairs.map(([type, id]) => `${type}:${id}`));

  const stockStatus = (data.inventoryBalances ?? [])
    .filter((balance) => balance.lotId && affectedLotIds.has(balance.lotId))
    .map((balance) => {
      const lot = data.lots.find((candidate) => candidate.id === balance.lotId);
      const openQuantity = balance.availableQuantity + balance.reservedQuantity + balance.heldQuantity;
      return {
        lotId: balance.lotId ?? "",
        lotCode: lot?.lotCode ?? balance.lotId ?? "",
        locationId: balance.locationId,
        locationName: balance.locationName ?? balance.locationCode ?? balance.locationId,
        availableQuantity: balance.availableQuantity,
        reservedQuantity: balance.reservedQuantity,
        heldQuantity: balance.heldQuantity,
        uom: balance.uom,
        unresolved: openQuantity > 0
      };
    });

  const contactMap = new Map<string, RecallAuditPacket["contacts"][number]>();
  for (const order of report.orders) {
    const key = `${order.resellerName ? "reseller" : "customer"}:${order.customerEmail ?? order.customerName ?? order.orderId}`;
    const existing = contactMap.get(key);
    if (existing) {
      existing.orderNumbers = unique([...existing.orderNumbers, order.orderNumber]);
      existing.affectedLotCodes = unique([...existing.affectedLotCodes, order.lotCode]);
      continue;
    }

    const customer = data.customers.find(
      (candidate) => candidate.name === order.customerName || candidate.email === order.customerEmail
    );
    const reseller = customer ? data.resellers.find((candidate) => candidate.customerId === customer.id) : null;
    contactMap.set(key, {
      contactType: order.resellerName ? "reseller" : "customer",
      customerName: order.customerName ?? "Unknown contact",
      email: order.customerEmail,
      phone: customer?.phone ?? null,
      resellerStatus: reseller?.status ?? null,
      orderNumbers: [order.orderNumber],
      affectedLotCodes: [order.lotCode]
    });
  }

  const qcRecords = (data.qcRecords ?? [])
    .filter((record) => affectedSubjects.has(`${record.subjectType}:${record.subjectId}`))
    .map((record) => ({
      ...record,
      testedAt: stringifyDate(record.testedAt ?? null),
      releasedAt: stringifyDate(record.releasedAt ?? null),
      subjectLabel: nodeFor(data, record.subjectType as TraceNodeType, record.subjectId).label
    }));
  const qcRecordIds = new Set(qcRecords.map((record) => record.id));
  const coaAttachments = (data.coaAttachments ?? []).filter(
    (coa) => qcRecordIds.has(coa.qcRecordId) || (coa.lotId !== null && affectedLotIds.has(coa.lotId))
  );
  const deviations = (data.qualityEvents ?? []).filter(
    (event) =>
      affectedSubjects.has(`${event.subjectType}:${event.subjectId}`) ||
      (event.subjectType === "lot" && affectedLotIds.has(event.subjectId))
  );
  const decisions = actions.filter((action) => action.decision || action.actionType === "decision");
  const openActions = actions.filter((action) => action.status === "open");
  const gaps = actions.filter((action) => action.status === "gap" || action.gap);
  const shippedStockQuantity = report.orders
    .filter((order) => order.shippedAt)
    .reduce((total, order) => total + order.quantity, 0);

  return {
    generatedAt: generatedAt.toISOString(),
    run,
    source: report.source,
    summary: {
      ...report.summary,
      openStockQuantity: stockStatus.reduce(
        (total, stock) => total + stock.availableQuantity + stock.reservedQuantity + stock.heldQuantity,
        0
      ),
      shippedStockQuantity,
      unresolvedStockLocations: stockStatus.filter((stock) => stock.unresolved).length,
      openActions: openActions.length,
      recordedGaps: gaps.length,
      qcRecordCount: qcRecords.length,
      coaCount: coaAttachments.length,
      deviationCount: deviations.length
    },
    traceGraph: report.graph,
    lots: report.lots,
    stockStatus,
    shipments: report.orders,
    contacts: Array.from(contactMap.values()),
    qcRecords,
    coaAttachments,
    deviations,
    decisions,
    openActions,
    gaps
  };
}

export function recallContactsToCsv(packet: RecallAuditPacket): string {
  const header = [
    "contact_type",
    "customer_name",
    "email",
    "phone",
    "reseller_status",
    "order_numbers",
    "affected_lot_codes"
  ];
  const rows = packet.contacts.map((contact) => [
    contact.contactType,
    contact.customerName,
    contact.email,
    contact.phone,
    contact.resellerStatus,
    contact.orderNumbers.join("; "),
    contact.affectedLotCodes.join("; ")
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function createGraphBuilder(
  data: TraceabilityDataSet,
  sourceType: TraceNodeType,
  sourceId: string,
  direction: TraceDirection
) {
  const nodes = new Map<string, TraceNode>();
  const edges = new Map<string, TraceEdge>();
  const visited = new Set<string>();

  return {
    data,
    visit(type: TraceNodeType, id: string): boolean {
      const key = nodeKey(type, id);
      if (visited.has(key)) {
        return false;
      }
      visited.add(key);
      this.addNode(nodeFor(data, type, id));
      return true;
    },
    addNode(node: TraceNode): void {
      nodes.set(node.id, node);
    },
    addEdge(fromType: TraceNodeType, fromId: string, toType: TraceNodeType, toId: string, label: string): void {
      const edge = {
        id: `${nodeKey(fromType, fromId)}->${nodeKey(toType, toId)}:${label}`,
        from: nodeKey(fromType, fromId),
        to: nodeKey(toType, toId),
        label
      };
      edges.set(edge.id, edge);
      this.addNode(nodeFor(data, fromType, fromId));
      this.addNode(nodeFor(data, toType, toId));
    },
    graph(): TraceGraph {
      return {
        query: { direction, sourceType, sourceId },
        nodes: Array.from(nodes.values()),
        edges: Array.from(edges.values())
      };
    }
  };
}

type GraphBuilder = ReturnType<typeof createGraphBuilder>;

function traceBackward(builder: GraphBuilder, type: TraceNodeType, id: string): void {
  if (!builder.visit(type, id)) {
    return;
  }

  if (type === "sales_order") {
    for (const line of builder.data.salesOrderLines.filter((candidate) => candidate.salesOrderId === id)) {
      builder.addEdge("sales_order_line", line.id, "sales_order", id, "line on order");
      traceBackward(builder, "sales_order_line", line.id);
    }
    return;
  }

  if (type === "sales_order_line") {
    for (const allocation of builder.data.orderAllocations.filter((candidate) => candidate.salesOrderLineId === id)) {
      builder.addEdge("order_allocation", allocation.id, "sales_order_line", id, "allocated to line");
      traceBackward(builder, "order_allocation", allocation.id);
    }
    return;
  }

  if (type === "order_allocation") {
    const allocation = builder.data.orderAllocations.find((candidate) => candidate.id === id);
    if (allocation) {
      builder.addEdge("lot", allocation.lotId, "order_allocation", allocation.id, "allocated stock");
      traceBackward(builder, "lot", allocation.lotId);
    }
    return;
  }

  if (type === "lot") {
    const lot = builder.data.lots.find((candidate) => candidate.id === id);
    if (!lot) {
      return;
    }

    if (lot.parentLotId) {
      builder.addEdge("lot", lot.parentLotId, "lot", lot.id, "parent lot");
      traceBackward(builder, "lot", lot.parentLotId);
    }

    if (lot.sourceType === "processing_batch") {
      builder.addEdge("processing_batch", lot.sourceId, "lot", lot.id, "produced lot");
      traceBackward(builder, "processing_batch", lot.sourceId);
    }
    if (lot.sourceType === "harvest") {
      builder.addEdge("harvest", lot.sourceId, "lot", lot.id, "created harvest lot");
      traceBackward(builder, "harvest", lot.sourceId);
    }
    if (lot.sourceType === "grow_batch") {
      builder.addEdge("grow_batch", lot.sourceId, "lot", lot.id, "created from grow");
      traceBackward(builder, "grow_batch", lot.sourceId);
    }
    return;
  }

  if (type === "processing_batch") {
    for (const input of builder.data.batchInputs.filter((candidate) => candidate.processingBatchId === id)) {
      builder.addEdge("lot", input.sourceLotId, "batch_input", input.id, `${input.quantity} ${input.uom}`);
      builder.addEdge("batch_input", input.id, "processing_batch", id, "consumed by batch");
      traceBackward(builder, "lot", input.sourceLotId);
    }
    return;
  }

  if (type === "harvest") {
    const harvest = builder.data.harvests.find((candidate) => candidate.id === id);
    if (harvest) {
      builder.addEdge("grow_batch", harvest.growBatchId, "harvest", harvest.id, "harvested from");
      traceBackward(builder, "grow_batch", harvest.growBatchId);
    }
  }
}

function traceForward(builder: GraphBuilder, type: TraceNodeType, id: string): void {
  if (!builder.visit(type, id)) {
    return;
  }

  if (type === "grow_batch") {
    for (const harvest of builder.data.harvests.filter((candidate) => candidate.growBatchId === id)) {
      builder.addEdge("grow_batch", id, "harvest", harvest.id, "harvested into");
      traceForward(builder, "harvest", harvest.id);
    }
    for (const lot of builder.data.lots.filter((candidate) => candidate.sourceType === "grow_batch" && candidate.sourceId === id)) {
      builder.addEdge("grow_batch", id, "lot", lot.id, "created lot");
      traceForward(builder, "lot", lot.id);
    }
    return;
  }

  if (type === "harvest") {
    for (const lot of builder.data.lots.filter((candidate) => candidate.sourceType === "harvest" && candidate.sourceId === id)) {
      builder.addEdge("harvest", id, "lot", lot.id, "created harvest lot");
      traceForward(builder, "lot", lot.id);
    }
    return;
  }

  if (type === "processing_batch") {
    for (const output of builder.data.batchOutputs.filter((candidate) => candidate.processingBatchId === id)) {
      builder.addEdge("processing_batch", id, "batch_output", output.id, "created output");
      builder.addEdge("batch_output", output.id, "lot", output.lotId, `${output.quantity} ${output.uom}`);
      traceForward(builder, "lot", output.lotId);
    }
    return;
  }

  if (type === "lot") {
    for (const input of builder.data.batchInputs.filter((candidate) => candidate.sourceLotId === id)) {
      builder.addEdge("lot", id, "batch_input", input.id, `${input.quantity} ${input.uom}`);
      builder.addEdge("batch_input", input.id, "processing_batch", input.processingBatchId, "consumed by batch");
      traceForward(builder, "processing_batch", input.processingBatchId);
    }

    for (const allocation of builder.data.orderAllocations.filter((candidate) => candidate.lotId === id)) {
      builder.addEdge("lot", id, "order_allocation", allocation.id, `${allocation.quantity} ${allocation.uom}`);
      traceForward(builder, "order_allocation", allocation.id);
    }
    return;
  }

  if (type === "order_allocation") {
    const allocation = builder.data.orderAllocations.find((candidate) => candidate.id === id);
    if (!allocation) {
      return;
    }
    builder.addEdge("order_allocation", allocation.id, "sales_order_line", allocation.salesOrderLineId, "allocated to line");
    traceForward(builder, "sales_order_line", allocation.salesOrderLineId);
    return;
  }

  if (type === "sales_order_line") {
    const line = builder.data.salesOrderLines.find((candidate) => candidate.id === id);
    if (!line) {
      return;
    }
    builder.addEdge("sales_order_line", id, "sales_order", line.salesOrderId, "line on order");
    traceForward(builder, "sales_order", line.salesOrderId);
    return;
  }

  if (type === "sales_order") {
    const order = builder.data.salesOrders.find((candidate) => candidate.id === id);
    if (!order) {
      return;
    }
    if (order.customerId) {
      builder.addEdge("sales_order", id, "customer", order.customerId, "ordered by");
      traceForward(builder, "customer", order.customerId);
    }
    for (const shipment of builder.data.shipments.filter((candidate) => candidate.salesOrderId === id)) {
      builder.addEdge("sales_order", id, "shipment", shipment.id, "shipped in");
      traceForward(builder, "shipment", shipment.id);
    }
    return;
  }

  if (type === "customer") {
    const reseller = builder.data.resellers.find((candidate) => candidate.customerId === id);
    if (reseller) {
      builder.addEdge("customer", id, "reseller", reseller.id, "reseller account");
      traceForward(builder, "reseller", reseller.id);
    }
  }
}

function nodeFor(data: TraceabilityDataSet, type: TraceNodeType, id: string): TraceNode {
  const fallback = (label = id): TraceNode => ({
    id: nodeKey(type, id),
    type,
    label,
    status: "normal"
  });

  if (type === "lot") {
    const lot = data.lots.find((candidate) => candidate.id === id);
    return lot
      ? {
          id: nodeKey(type, id),
          type,
          label: lot.lotCode,
          subtitle: `${lot.itemSku} - ${lot.itemName}`,
          status: lotStatus(lot),
          metadata: {
            itemType: lot.itemType,
            qcStatus: lot.qcStatus,
            lifecycleStatus: lot.status,
            sourceType: lot.sourceType
          }
        }
      : fallback();
  }

  if (type === "processing_batch") {
    const batch = data.processingBatches.find((candidate) => candidate.id === id);
    return batch
      ? {
          id: nodeKey(type, id),
          type,
          label: batch.batchCode,
          subtitle: `${batch.type} batch - ${batch.status}`,
          status: batch.status === "on_hold" ? "hold" : "normal"
        }
      : fallback();
  }

  if (type === "batch_input") {
    const input = data.batchInputs.find((candidate) => candidate.id === id);
    return input
      ? {
          id: nodeKey(type, id),
          type,
          label: "Batch input",
          subtitle: `${input.quantity} ${input.uom} ${input.inputType}`,
          status: "normal"
        }
      : fallback("Batch input");
  }

  if (type === "batch_output") {
    const output = data.batchOutputs.find((candidate) => candidate.id === id);
    return output
      ? {
          id: nodeKey(type, id),
          type,
          label: "Batch output",
          subtitle: `${output.quantity} ${output.uom}`,
          status: "normal"
        }
      : fallback("Batch output");
  }

  if (type === "grow_batch") {
    const growBatch = data.growBatches.find((candidate) => candidate.id === id);
    return growBatch
      ? {
          id: nodeKey(type, id),
          type,
          label: growBatch.batchCode,
          subtitle: `${growBatch.species}${growBatch.strain ? ` - ${growBatch.strain}` : ""}`,
          status: "normal"
        }
      : fallback();
  }

  if (type === "harvest") {
    const harvest = data.harvests.find((candidate) => candidate.id === id);
    return harvest
      ? {
          id: nodeKey(type, id),
          type,
          label: harvest.harvestCode,
          subtitle: `${harvest.status} harvest`,
          status: harvest.status === "held" || harvest.status === "rejected" ? "hold" : "normal"
        }
      : fallback();
  }

  if (type === "sales_order") {
    const order = data.salesOrders.find((candidate) => candidate.id === id);
    return order
      ? {
          id: nodeKey(type, id),
          type,
          label: order.orderNumber,
          subtitle: `${order.channel}${order.externalOrderNumber ? ` - ${order.externalOrderNumber}` : ""}`,
          status: "normal"
        }
      : fallback();
  }

  if (type === "sales_order_line") {
    const line = data.salesOrderLines.find((candidate) => candidate.id === id);
    return line
      ? {
          id: nodeKey(type, id),
          type,
          label: "Order line",
          subtitle: `${line.quantity} ${line.uom} - ${line.status}`,
          status: "normal"
        }
      : fallback("Order line");
  }

  if (type === "order_allocation") {
    const allocation = data.orderAllocations.find((candidate) => candidate.id === id);
    return allocation
      ? {
          id: nodeKey(type, id),
          type,
          label: "Lot allocation",
          subtitle: `${allocation.quantity} ${allocation.uom}`,
          status: "normal"
        }
      : fallback("Lot allocation");
  }

  if (type === "shipment") {
    const shipment = data.shipments.find((candidate) => candidate.id === id);
    return shipment
      ? {
          id: nodeKey(type, id),
          type,
          label: shipment.shipmentNumber,
          subtitle: `${shipment.status}${shipment.trackingNumber ? ` - ${shipment.trackingNumber}` : ""}`,
          status: "normal"
        }
      : fallback();
  }

  if (type === "customer") {
    const customer = data.customers.find((candidate) => candidate.id === id);
    return customer
      ? {
          id: nodeKey(type, id),
          type,
          label: customer.name,
          subtitle: customer.email ?? customer.type,
          status: "normal"
        }
      : fallback();
  }

  const reseller = data.resellers.find((candidate) => candidate.id === id);
  const customer = reseller ? data.customers.find((candidate) => candidate.id === reseller.customerId) : null;
  return reseller
    ? {
        id: nodeKey(type, id),
        type,
        label: customer?.name ?? reseller.id,
        subtitle: `${reseller.status} reseller`,
        status: reseller.status === "on_hold" ? "hold" : "normal"
      }
    : fallback();
}

function lotStatus(lot: TraceLotRecord): TraceNodeStatus {
  if (lot.qcStatus === "hold") {
    return "hold";
  }
  if (lot.qcStatus === "rejected") {
    return "rejected";
  }
  if (lot.qcStatus === "expired" || isExpired(lot.expiresAt)) {
    return "expired";
  }
  if (lot.status === "archived" || lot.metadataJson?.recallStatus === "recalled") {
    return "recalled";
  }
  return "normal";
}

function nodeKey(type: TraceNodeType, id: string): string {
  return `${type}:${id}`;
}

function splitNodeKey(key: string): [TraceNodeType, string] {
  const separatorIndex = key.indexOf(":");
  return [key.slice(0, separatorIndex) as TraceNodeType, key.slice(separatorIndex + 1)];
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLocaleLowerCase();
}

function isExpired(value: Date | string | null): boolean {
  if (!value) {
    return false;
  }
  return new Date(value).getTime() <= Date.now();
}

function stringifyDate(value: Date | string | null | undefined): string | null {
  return value ? new Date(value).toISOString() : null;
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll("\"", "\"\"")}"` : text;
}
