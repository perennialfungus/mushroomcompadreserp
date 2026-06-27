import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, Edit3, FileUp, PackagePlus, Save, ShieldCheck, Truck } from "lucide-react";
import { Badge, Button, EmptyState, Input, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import {
  createPurchaseOrder,
  createSupplierDocument,
  createSupplier,
  getSupplierQualityDashboard,
  listLocations,
  listPurchaseOrders,
  listReceipts,
  listSuppliers,
  receivePurchaseOrder,
  updatePurchaseOrder,
  updateSupplier,
  upsertSupplierApproval
} from "./lib/api";
import { useI18n } from "./i18n/I18nProvider";
import type { Location, PurchaseOrderDetail, ReceiptDetail, Supplier, SupplierQualityDashboard } from "./types";

function field(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

function nullableField(form: FormData, name: string): string | null {
  const value = field(form, name);
  return value.length > 0 ? value : null;
}

function statusTone(status: string): "neutral" | "success" | "warning" | "info" {
  if (status === "received" || status === "active" || status === "posted") {
    return "success";
  }
  if (status === "ordered" || status === "partially_received") {
    return "info";
  }
  if (status === "cancelled" || status === "on_hold") {
    return "warning";
  }
  return "neutral";
}

export function PurchasingScreen() {
  const auth = useAuth();
  const toast = useToast();
  const { formatDate, formatDateTime, formatNumber } = useI18n();
  const token = auth.session?.accessToken;
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderDetail[]>([]);
  const [receipts, setReceipts] = useState<ReceiptDetail[]>([]);
  const [supplierQuality, setSupplierQuality] = useState<SupplierQualityDashboard | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedPoId, setSelectedPoId] = useState("purchase-order-alcohol-001");
  const [editingSupplierId, setEditingSupplierId] = useState<string | "new" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedPo = useMemo(
    () => purchaseOrders.find((detail) => detail.order.id === selectedPoId) ?? purchaseOrders[0] ?? null,
    [purchaseOrders, selectedPoId]
  );

  async function refresh() {
    if (!token) {
      return;
    }
    setError(null);
    try {
      const [supplierResponse, poResponse, receiptResponse, locationResponse, supplierQualityResponse] = await Promise.all([
        listSuppliers(token),
        listPurchaseOrders(token),
        listReceipts(token),
        listLocations(token),
        getSupplierQualityDashboard(token)
      ]);
      setSuppliers(supplierResponse.suppliers);
      setPurchaseOrders(poResponse.purchaseOrders);
      setReceipts(receiptResponse.receipts);
      setLocations(locationResponse.locations);
      setSupplierQuality(supplierQualityResponse.dashboard);
      setSelectedPoId((current) => current || poResponse.purchaseOrders[0]?.order.id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Purchasing could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [token]);

  async function saveSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    const form = new FormData(event.currentTarget);
    const input = {
      name: field(form, "name"),
      status: field(form, "status") as Supplier["status"],
      contactName: nullableField(form, "contactName"),
      email: nullableField(form, "email"),
      phone: nullableField(form, "phone"),
      addressLine1: nullableField(form, "addressLine1"),
      addressLine2: null,
      city: nullableField(form, "city"),
      region: nullableField(form, "region"),
      postalCode: nullableField(form, "postalCode"),
      countryCode: nullableField(form, "countryCode"),
      defaultCurrency: field(form, "defaultCurrency") || "EUR",
      notes: nullableField(form, "notes")
    };
    const response =
      editingSupplierId && editingSupplierId !== "new"
        ? await updateSupplier(token, editingSupplierId, input)
        : await createSupplier(token, input);
    toast.showToast({ title: "Supplier saved", description: response.supplier.name });
    setEditingSupplierId(response.supplier.id);
    await refresh();
  }

  async function createDemoPo() {
    const firstSupplier = suppliers[0];
    if (!token || !firstSupplier) {
      return;
    }
    const response = await createPurchaseOrder(token, {
      poNumber: `SUP-PO-${new Date().toISOString().slice(0, 10)}-${String(Date.now()).slice(-4)}`,
      supplierId: firstSupplier.id,
      status: "draft",
      currency: firstSupplier.defaultCurrency,
      expectedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "Created from purchasing workspace.",
      lines: [
        {
          itemType: "material",
          itemId: "mat-alcohol",
          supplierSku: "ALC-96",
          quantity: 10,
          uom: "l",
          unitCost: 8.5,
          taxCodeExport: null
        }
      ]
    });
    setSelectedPoId(response.purchaseOrder.order.id);
    toast.showToast({ title: "Purchase order created", description: response.purchaseOrder.order.poNumber });
    await refresh();
  }

  async function markOrdered(orderId: string) {
    if (!token) {
      return;
    }
    const response = await updatePurchaseOrder(token, orderId, {
      status: "ordered",
      orderedAt: new Date().toISOString()
    });
    toast.showToast({ title: "PO ordered", description: response.purchaseOrder.order.poNumber });
    await refresh();
  }

  async function saveApproval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    const form = new FormData(event.currentTarget);
    const response = await upsertSupplierApproval(token, {
      supplierId: field(form, "supplierId"),
      itemType: field(form, "itemType") as "material" | "packaging_component",
      itemId: field(form, "itemId"),
      status: field(form, "status") as "prospect" | "qualified" | "conditional" | "suspended" | "expired",
      riskLevel: field(form, "riskLevel") as "low" | "medium" | "high" | "critical",
      qualificationSummary: nullableField(form, "qualificationSummary"),
      reviewCadenceDays: Number(field(form, "reviewCadenceDays") || "365"),
      expiresAt: nullableField(form, "expiresAt")
        ? new Date(`${field(form, "expiresAt")}T00:00:00.000Z`).toISOString()
        : null,
      nextReviewAt: nullableField(form, "nextReviewAt")
        ? new Date(`${field(form, "nextReviewAt")}T00:00:00.000Z`).toISOString()
        : null
    });
    toast.showToast({ title: "Supplier approval saved", description: response.approval.itemName ?? response.approval.itemId });
    await refresh();
  }

  async function saveSupplierDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    const form = new FormData(event.currentTarget);
    const fileName = field(form, "fileName");
    const response = await createSupplierDocument(token, {
      supplierId: field(form, "supplierId"),
      approvalId: nullableField(form, "approvalId"),
      documentType: field(form, "documentType"),
      documentNumber: nullableField(form, "documentNumber"),
      filePath: `supplier-documents/${field(form, "supplierId")}/${fileName}`,
      fileName,
      contentType: "application/pdf",
      issuedAt: nullableField(form, "issuedAt") ? new Date(`${field(form, "issuedAt")}T00:00:00.000Z`).toISOString() : null,
      expiresAt: nullableField(form, "expiresAt") ? new Date(`${field(form, "expiresAt")}T00:00:00.000Z`).toISOString() : null
    });
    toast.showToast({ title: "Supplier document uploaded", description: response.document.fileName });
    await refresh();
  }

  async function submitReceipt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedPo) {
      return;
    }
    const form = new FormData(event.currentTarget);
    const line = selectedPo.lines.find((candidate) => candidate.id === field(form, "purchaseOrderLineId")) ?? selectedPo.lines[0];
    if (!line) {
      setError("Select a purchase order line to receive.");
      return;
    }
    const quantity = Number(field(form, "quantity"));
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Received quantity must be greater than zero.");
      return;
    }
    const receiptNumber = field(form, "receiptNumber") || `RCPT-${String(Date.now()).slice(-6)}`;
    const response = await receivePurchaseOrder(token, {
      receiptNumber,
      purchaseOrderId: selectedPo.order.id,
      supplierId: selectedPo.order.supplierId,
      receivedAt: new Date().toISOString(),
      locationId: field(form, "locationId") || locations[0]?.id || "loc-pack",
      clientTransactionId: crypto.randomUUID(),
      lines: [
        {
          purchaseOrderLineId: line.id,
          lotCode: field(form, "lotCode"),
          supplierLotNumber: nullableField(form, "supplierLotNumber"),
          quantity,
          uom: line.uom,
          expiryDate: nullableField(form, "expiryDate")
            ? new Date(`${field(form, "expiryDate")}T00:00:00.000Z`).toISOString()
            : null,
          coaAttachment: nullableField(form, "coaFileName")
            ? {
                filePath: `supplier-coas/${field(form, "coaFileName")}`,
                fileName: field(form, "coaFileName"),
                contentType: "application/pdf"
              }
            : null
        }
      ]
    });
    toast.showToast({
      title: "Receipt posted",
      description:
        response.receipt.generatedInspectionTasks.length > 0
          ? `${response.receipt.receipt.receiptNumber} generated incoming QC`
          : response.receipt.receipt.receiptNumber
    });
    await refresh();
  }

  if (loading) {
    return <EmptyState title="Loading purchasing" description="Fetching suppliers, POs, and receipts." />;
  }

  return (
    <section className="screen-grid" aria-labelledby="purchasing-title">
      <div className="screen-heading master-heading">
        <div>
          <p className="eyebrow">Purchasing</p>
          <h2 id="purchasing-title">Supplier quality and receiving</h2>
          <p>Control approved vendor lists, supplier documents, incoming inspection, and receiving release.</p>
        </div>
        <Button variant="secondary" onClick={() => void refresh()}>
          <Truck aria-hidden="true" size={18} />
          Refresh
        </Button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {supplierQuality ? (
        <div className="metric-grid">
          <article className="metric-panel">
            <span>Approved vendor links</span>
            <strong>{formatNumber(supplierQuality.approvals.length)}</strong>
          </article>
          <article className="metric-panel">
            <span>Renewal alerts</span>
            <strong>{formatNumber(supplierQuality.renewalAlerts.length)}</strong>
          </article>
          <article className="metric-panel">
            <span>Incoming QC queue</span>
            <strong>{formatNumber(supplierQuality.inspectionQueue.filter((task) => task.status !== "completed").length)}</strong>
          </article>
          <article className="metric-panel">
            <span>Blocked POs</span>
            <strong>{formatNumber(supplierQuality.purchaseOrderGates.filter((gate) => !gate.gate.approved).length)}</strong>
          </article>
        </div>
      ) : null}

      <Tabs
        tabs={[
          {
            id: "approved-vendors",
            label: "Approved vendor list",
            content: supplierQuality ? (
              <div className="master-grid">
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Approved vendor list</h3>
                    <Badge tone="info">{formatNumber(supplierQuality.approvals.length)} links</Badge>
                  </div>
                  <table className="list-table">
                    <thead>
                      <tr><th>Supplier</th><th>Item</th><th>Status</th><th>Risk</th><th>Next review</th></tr>
                    </thead>
                    <tbody>
                      {supplierQuality.approvals.map((approval) => (
                        <tr key={approval.id}>
                          <td>{approval.supplier?.name ?? approval.supplierId}</td>
                          <td>
                            {approval.itemName ?? approval.itemId}
                            <div className="muted-line">{approval.itemSku ?? approval.itemType}</div>
                          </td>
                          <td><Badge tone={approval.status === "qualified" ? "success" : approval.status === "conditional" ? "warning" : "neutral"}>{approval.status}</Badge></td>
                          <td><Badge tone={approval.riskLevel === "high" || approval.riskLevel === "critical" ? "warning" : "info"}>{approval.riskLevel}</Badge></td>
                          <td>{approval.nextReviewAt ? formatDate(new Date(approval.nextReviewAt)) : "Not set"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <form className="editor-panel" onSubmit={saveApproval}>
                  <h3>Qualification detail</h3>
                  <div className="form-grid">
                    <label className="select-field">
                      <span>Supplier</span>
                      <select name="supplierId" defaultValue={suppliers[0]?.id}>
                        {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
                      </select>
                    </label>
                    <label className="select-field">
                      <span>Item type</span>
                      <select name="itemType" defaultValue="material">
                        <option value="material">Material</option>
                        <option value="packaging_component">Packaging component</option>
                      </select>
                    </label>
                    <Input label="Item id" name="itemId" defaultValue="mat-alcohol" required />
                    <label className="select-field">
                      <span>Status</span>
                      <select name="status" defaultValue="qualified">
                        <option value="qualified">Qualified</option>
                        <option value="conditional">Conditional</option>
                        <option value="prospect">Prospect</option>
                        <option value="suspended">Suspended</option>
                        <option value="expired">Expired</option>
                      </select>
                    </label>
                    <label className="select-field">
                      <span>Risk level</span>
                      <select name="riskLevel" defaultValue="high">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </label>
                    <Input label="Review cadence days" name="reviewCadenceDays" type="number" defaultValue="365" />
                    <Input label="Expires" name="expiresAt" type="date" defaultValue="2027-01-01" />
                    <Input label="Next review" name="nextReviewAt" type="date" defaultValue="2026-12-15" />
                    <Input label="Qualification summary" name="qualificationSummary" defaultValue="Document review complete; approved for controlled purchasing." />
                  </div>
                  <Button type="submit">
                    <ShieldCheck aria-hidden="true" size={18} />
                    Save approval
                  </Button>
                </form>
              </div>
            ) : (
              <EmptyState title="Loading supplier quality" description="Fetching approved vendor records." />
            )
          },
          {
            id: "documents",
            label: "Qualification documents",
            content: supplierQuality ? (
              <div className="master-grid">
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Document expiry</h3>
                    <Badge tone={supplierQuality.renewalAlerts.length > 0 ? "warning" : "success"}>{formatNumber(supplierQuality.renewalAlerts.length)} alerts</Badge>
                  </div>
                  <table className="list-table">
                    <thead>
                      <tr><th>Supplier</th><th>Document</th><th>Status</th><th>Expires</th></tr>
                    </thead>
                    <tbody>
                      {supplierQuality.documents.map((document) => (
                        <tr key={document.id}>
                          <td>{document.supplier?.name ?? document.supplierId}</td>
                          <td>
                            {document.documentType}
                            <div className="muted-line">{document.fileName}</div>
                          </td>
                          <td><Badge tone={document.status === "current" ? "success" : "warning"}>{document.status}</Badge></td>
                          <td>{document.expiresAt ? formatDate(new Date(document.expiresAt)) : "No expiry"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <form className="editor-panel" onSubmit={saveSupplierDocument}>
                  <h3>Upload supplier document</h3>
                  <div className="form-grid">
                    <label className="select-field">
                      <span>Supplier</span>
                      <select name="supplierId" defaultValue={suppliers[0]?.id}>
                        {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
                      </select>
                    </label>
                    <label className="select-field">
                      <span>Approval link</span>
                      <select name="approvalId" defaultValue={supplierQuality.approvals[0]?.id ?? ""}>
                        <option value="">Supplier-level document</option>
                        {supplierQuality.approvals.map((approval) => (
                          <option key={approval.id} value={approval.id}>{approval.itemName ?? approval.itemId}</option>
                        ))}
                      </select>
                    </label>
                    <Input label="Document type" name="documentType" defaultValue="Organic certificate" required />
                    <Input label="Document number" name="documentNumber" defaultValue="BIO-PT-2026-184" />
                    <Input label="File name" name="fileName" defaultValue="organic-certificate-renewal.pdf" required />
                    <Input label="Issued" name="issuedAt" type="date" defaultValue="2026-06-27" />
                    <Input label="Expires" name="expiresAt" type="date" defaultValue="2027-06-27" />
                  </div>
                  <Button type="submit">
                    <FileUp aria-hidden="true" size={18} />
                    Upload document
                  </Button>
                </form>
              </div>
            ) : (
              <EmptyState title="Loading documents" description="Fetching supplier qualification files." />
            )
          },
          {
            id: "suppliers",
            label: "Suppliers",
            content: (
              <div className="master-grid">
                <div className="record-list">
                  <div className="panel-header">
                    <h3>Supplier list</h3>
                    <Button size="sm" variant="secondary" onClick={() => setEditingSupplierId("new")}>
                      <PackagePlus aria-hidden="true" size={16} />
                      New supplier
                    </Button>
                  </div>
                  {suppliers.map((supplier) => (
                    <article className="record-row static" key={supplier.id}>
                      <Truck aria-hidden="true" size={18} />
                      <span>
                        <strong>{supplier.name}</strong>
                        <small>{supplier.email ?? supplier.phone ?? "No contact"} · {supplier.defaultCurrency}</small>
                      </span>
                      <Badge tone={statusTone(supplier.status)}>{supplier.status}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => setEditingSupplierId(supplier.id)}>
                        <Edit3 aria-hidden="true" size={16} />
                        Edit
                      </Button>
                    </article>
                  ))}
                </div>
                {editingSupplierId ? (
                  <SupplierForm
                    supplier={editingSupplierId === "new" ? null : suppliers.find((supplier) => supplier.id === editingSupplierId) ?? null}
                    onSubmit={saveSupplier}
                  />
                ) : null}
              </div>
            )
          },
          {
            id: "purchase-orders",
            label: "Purchase orders",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Purchase orders</h3>
                  <Button size="sm" onClick={() => void createDemoPo()}>
                    <PackagePlus aria-hidden="true" size={16} />
                    New PO
                  </Button>
                </div>
                <table className="list-table">
                  <thead>
                    <tr>
                      <th>PO</th>
                      <th>Supplier</th>
                      <th>Status</th>
                      <th>Expected</th>
                      <th>Lines</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((detail) => (
                      <tr key={detail.order.id}>
                        <td>
                          <button className="text-link" type="button" onClick={() => setSelectedPoId(detail.order.id)}>
                            {detail.order.poNumber}
                          </button>
                          {!detail.approvalGate.approved ? (
                            <div className="muted-line"><AlertTriangle aria-hidden="true" size={14} /> Supplier approval blocked</div>
                          ) : detail.approvalGate.issues.length > 0 ? (
                            <div className="muted-line">Supplier approval warning</div>
                          ) : null}
                        </td>
                        <td>{detail.supplier?.name ?? detail.order.supplierId}</td>
                        <td><Badge tone={statusTone(detail.order.status)}>{detail.order.status}</Badge></td>
                        <td>{detail.order.expectedAt ? formatDateTime(new Date(detail.order.expectedAt)) : "Not set"}</td>
                        <td>{formatNumber(detail.lines.length)}</td>
                        <td>
                          {detail.order.status === "draft" ? (
                            <Button size="sm" variant="secondary" onClick={() => void markOrdered(detail.order.id)}>
                              <CheckCircle2 aria-hidden="true" size={16} />
                              Order
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          },
          {
            id: "receiving",
            label: "Receiving",
            content: selectedPo ? (
              <div className="master-grid">
                <div className="detail-card">
                  <div className="panel-header">
                    <h3>{selectedPo.order.poNumber}</h3>
                    <Badge tone={statusTone(selectedPo.order.status)}>{selectedPo.order.status}</Badge>
                  </div>
                  <table className="list-table">
                    <thead>
                      <tr><th>Line</th><th>Ordered</th><th>Received</th><th>Remaining</th></tr>
                    </thead>
                    <tbody>
                      {selectedPo.lines.map((line) => (
                        <tr key={line.id}>
                          <td>
                            {line.itemName ?? line.itemId}
                            <div className="muted-line">{line.itemSku ?? line.supplierSku ?? "No SKU"}</div>
                          </td>
                          <td>{formatNumber(line.quantity)} {line.uom}</td>
                          <td>{formatNumber(line.receivedQuantity ?? 0)} {line.uom}</td>
                          <td>{formatNumber(line.remainingQuantity ?? line.quantity)} {line.uom}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <form className="editor-panel" onSubmit={submitReceipt}>
                  <h3>Receive line</h3>
                  <div className="form-grid">
                    <Input label="Receipt number" name="receiptNumber" defaultValue={`RCPT-${String(Date.now()).slice(-6)}`} />
                    <label className="select-field">
                      <span>PO line</span>
                      <select name="purchaseOrderLineId" defaultValue={selectedPo.lines[0]?.id}>
                        {selectedPo.lines.map((line) => (
                          <option key={line.id} value={line.id}>
                            {line.itemName ?? line.itemId} · {line.remainingQuantity ?? line.quantity} {line.uom} remaining
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="select-field">
                      <span>Receive location</span>
                      <select name="locationId" defaultValue={locations.find((location) => location.id === "loc-pack")?.id ?? locations[0]?.id}>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.code} · {location.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Input label="Lot code" name="lotCode" required defaultValue={`ALC-RCV-${String(Date.now()).slice(-4)}`} />
                    <Input label="Supplier lot number" name="supplierLotNumber" defaultValue="SUP-LOT-778B" />
                    <Input label="Received quantity" name="quantity" type="number" step="0.001" min="0" required defaultValue="10" />
                    <Input label="Expiry date" name="expiryDate" type="date" defaultValue="2027-06-30" />
                    <Input label="COA file name" name="coaFileName" defaultValue="alcohol-coa.pdf" />
                  </div>
                  <Button type="submit">
                    <ClipboardCheck aria-hidden="true" size={18} />
                    Post receipt
                  </Button>
                </form>
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Recent receipts</h3>
                    <Badge tone="info">{formatNumber(receipts.length)} posted</Badge>
                  </div>
                  <table className="list-table">
                    <thead>
                      <tr><th>Receipt</th><th>Lot</th><th>Supplier lot</th><th>Quantity</th><th>COA</th></tr>
                    </thead>
                    <tbody>
                      {receipts.map((detail) =>
                        detail.lines.map((line) => (
                          <tr key={line.id}>
                            <td>{detail.receipt.receiptNumber}</td>
                            <td>{line.lot.lotCode}</td>
                            <td>{line.supplierLotNumber ?? "None"}</td>
                            <td>{formatNumber(line.quantity - line.correctedQuantity)} {line.uom}</td>
                            <td>{line.coaAttachments[0]?.fileName ?? "None"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState title="No purchase order selected" description="Create or select an ordered PO to receive." />
            )
          },
          {
            id: "incoming-qc",
            label: "Incoming inspection queue",
            content: supplierQuality ? (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Incoming inspection queue</h3>
                  <Badge tone="info">{formatNumber(supplierQuality.inspectionQueue.length)} tasks</Badge>
                </div>
                <table className="list-table">
                  <thead>
                    <tr><th>Task</th><th>Supplier</th><th>Subject</th><th>Status</th><th>Due</th></tr>
                  </thead>
                  <tbody>
                    {supplierQuality.inspectionQueue.map((task) => (
                      <tr key={task.id}>
                        <td>{task.taskCode}<div className="muted-line">{task.specLine?.name ?? task.createdFrom}</div></td>
                        <td>{suppliers.find((supplier) => supplier.id === task.supplierId)?.name ?? task.supplierId ?? "None"}</td>
                        <td>{task.subjectLabel}</td>
                        <td><Badge tone={task.status === "completed" ? "success" : "warning"}>{task.status}</Badge></td>
                        <td>{task.dueAt ? formatDateTime(new Date(task.dueAt)) : "Not set"}</td>
                      </tr>
                    ))}
                    {supplierQuality.inspectionQueue.length === 0 ? (
                      <tr><td colSpan={5}>No incoming inspection tasks are waiting.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Loading incoming QC" description="Fetching supplier inspection tasks." />
            )
          },
          {
            id: "scorecard",
            label: "Supplier scorecard",
            content: supplierQuality ? (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Supplier scorecards</h3>
                  <Badge tone="info">{formatNumber(supplierQuality.scorecards.length)} current</Badge>
                </div>
                <table className="list-table">
                  <thead>
                    <tr><th>Supplier</th><th>Overall</th><th>On-time</th><th>QC pass</th><th>Deviations</th><th>Documents</th></tr>
                  </thead>
                  <tbody>
                    {supplierQuality.scorecards.map((scorecard) => (
                      <tr key={scorecard.id}>
                        <td>{scorecard.supplier?.name ?? scorecard.supplierId}</td>
                        <td><Badge tone={scorecard.overallScore >= 90 ? "success" : scorecard.overallScore >= 70 ? "info" : "warning"}>{formatNumber(scorecard.overallScore)}</Badge></td>
                        <td>{formatNumber(scorecard.onTimeDeliveryRate * 100)}%</td>
                        <td>{formatNumber(scorecard.qcPassRate * 100)}%</td>
                        <td>{formatNumber(scorecard.deviationCount)}</td>
                        <td>{formatNumber(scorecard.documentCompletenessRate * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Loading scorecards" description="Calculating supplier scorecard metrics." />
            )
          }
        ]}
      />
    </section>
  );
}

function SupplierForm({ supplier, onSubmit }: { supplier: Supplier | null; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="editor-panel" onSubmit={onSubmit}>
      <h3>{supplier ? "Edit supplier" : "Create supplier"}</h3>
      <div className="form-grid">
        <Input label="Name" name="name" required defaultValue={supplier?.name ?? ""} />
        <label className="select-field">
          <span>Status</span>
          <select name="status" defaultValue={supplier?.status ?? "active"}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_hold">On hold</option>
          </select>
        </label>
        <Input label="Contact name" name="contactName" defaultValue={supplier?.contactName ?? ""} />
        <Input label="Email" name="email" type="email" defaultValue={supplier?.email ?? ""} />
        <Input label="Phone" name="phone" defaultValue={supplier?.phone ?? ""} />
        <Input label="Address line 1" name="addressLine1" defaultValue={supplier?.addressLine1 ?? ""} />
        <Input label="City" name="city" defaultValue={supplier?.city ?? ""} />
        <Input label="Region" name="region" defaultValue={supplier?.region ?? ""} />
        <Input label="Postal code" name="postalCode" defaultValue={supplier?.postalCode ?? ""} />
        <Input label="Country code" name="countryCode" defaultValue={supplier?.countryCode ?? "PT"} />
        <Input label="Default currency" name="defaultCurrency" defaultValue={supplier?.defaultCurrency ?? "EUR"} />
        <Input label="Notes" name="notes" defaultValue={supplier?.notes ?? ""} />
      </div>
      <Button type="submit">
        <Save aria-hidden="true" size={18} />
        Save supplier
      </Button>
    </form>
  );
}
