import { Calculator, CheckCircle2, ClipboardList, Factory, FileText, FlaskConical, GitCompare, History, LockKeyhole, PackagePlus, Save, ShieldCheck, Smartphone, Timer, Wrench } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Badge, Button, Dialog, Input, Tabs, useToast } from "./components/ui";
import {
  completeProcessingBatch,
  approveFormulaRevision,
  compareFormulaRevisions,
  createBillOfMaterials,
  createBomOperation,
  createBomOperationEquipment,
  createBomOperationMaterial,
  createBomOperationStep,
  createProcessingBatch,
  createProductionOrder,
  completeEbrExecution,
  completeEbrStep,
  exportEbrPacket,
  listEbrExecutions,
  listEbrTemplates,
  listBillOfMaterials,
  listFormulaRevisions,
  listMasterData,
  listLots,
  listProcessingBatches,
  listProductionOrders,
  listRoutingMasterData,
  scaleFormulaRevision
} from "./lib/api";
import { useAuth } from "./auth";
import { useI18n } from "./i18n/I18nProvider";
import type {
  BillOfMaterialsDetail,
  EbrExecutionDetail,
  EbrPacket,
  EbrTemplateDetail,
  FormulaRevisionComparison,
  FormulaRevisionDetail,
  FormulaScaleResult,
  LotDetail,
  MasterDataSnapshot,
  ProcessingBatchDetail,
  ProductionOrderDetail,
  RoutingMasterData
} from "./types";

function statusTone(status: string): "neutral" | "success" | "warning" | "info" {
  if (status === "completed" || status === "active") {
    return "success";
  }
  if (status === "in_progress" || status === "released") {
    return "info";
  }
  if (status === "on_hold" || status === "draft" || status === "planned") {
    return "warning";
  }
  return "neutral";
}

const emptyMasterData: MasterDataSnapshot = {
  products: [],
  productVariants: [],
  materials: [],
  packagingComponents: [],
  locations: []
};

const emptyRoutingMasterData: RoutingMasterData = {
  workCenters: [],
  equipment: [],
  laborRoles: [],
  operationCodes: []
};

function formText(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

function nullableFormText(form: FormData, name: string): string | null {
  const value = formText(form, name);
  return value.length > 0 ? value : null;
}

export function ProductionScreen() {
  const auth = useAuth();
  const { formatDate, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<ProductionOrderDetail[]>([]);
  const [boms, setBoms] = useState<BillOfMaterialsDetail[]>([]);
  const [formulas, setFormulas] = useState<FormulaRevisionDetail[]>([]);
  const [batches, setBatches] = useState<ProcessingBatchDetail[]>([]);
  const [masterData, setMasterData] = useState<MasterDataSnapshot>(emptyMasterData);
  const [routingMasterData, setRoutingMasterData] = useState<RoutingMasterData>(emptyRoutingMasterData);
  const [ebrTemplates, setEbrTemplates] = useState<EbrTemplateDetail[]>([]);
  const [ebrExecutions, setEbrExecutions] = useState<EbrExecutionDetail[]>([]);
  const [ebrPacket, setEbrPacket] = useState<EbrPacket | null>(null);
  const [lots, setLots] = useState<LotDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState("batch-lm-bottle-001");
  const [inputAlcoholLotId, setInputAlcoholLotId] = useState("lot-alcohol-2026-06");
  const [inputBottleLotId, setInputBottleLotId] = useState("lot-bottles-2026-06");
  const [alcoholQuantity, setAlcoholQuantity] = useState("2");
  const [bottleQuantity, setBottleQuantity] = useState("48");
  const [outputLotCode, setOutputLotCode] = useState("LM-BOTTLED-2026-07");
  const [outputQuantity, setOutputQuantity] = useState("46");
  const [fillVolumeMl, setFillVolumeMl] = useState("50");
  const [bottlesRejected, setBottlesRejected] = useState("2");
  const [ebrScanLotId, setEbrScanLotId] = useState("lot-alcohol-2026-06");
  const [ebrWeight, setEbrWeight] = useState("2");
  const [ebrValue, setEbrValue] = useState("50");
  const [ebrEvidence, setEbrEvidence] = useState("label-revision-photo.jpg");
  const [ebrQcStatus, setEbrQcStatus] = useState("pass");
  const [ebrSupervisorApproved, setEbrSupervisorApproved] = useState(false);
  const [ebrConfirmation, setEbrConfirmation] = useState("CONFIRM");
  const [ebrScaleAdapterId, setEbrScaleAdapterId] = useState<"manual" | "mock-scale">("manual");
  const [ebrAdminOverrideReason, setEbrAdminOverrideReason] = useState("");
  const [selectedFormulaId, setSelectedFormulaId] = useState("formula-lm-tincture-v1");
  const [compareFromId, setCompareFromId] = useState("formula-lm-tincture-v1");
  const [compareToId, setCompareToId] = useState("formula-lm-tincture-v2-draft");
  const [scaleQuantity, setScaleQuantity] = useState("96");
  const [scaleResult, setScaleResult] = useState<FormulaScaleResult | null>(null);
  const [comparison, setComparison] = useState<FormulaRevisionComparison | null>(null);
  const [createDialog, setCreateDialog] = useState<"order" | "batch" | "bom" | null>(null);
  const [selectedBomId, setSelectedBomId] = useState("bom-lm-tincture-v1");

  const selectedBatch = batches.find((detail) => detail.batch.id === selectedBatchId) ?? batches[0] ?? null;
  const selectedOrder =
    orders.find((detail) => detail.order.id === selectedBatch?.batch.productionOrderId) ?? orders[0] ?? null;
  const selectedExecution = ebrExecutions[0] ?? null;
  const selectedFormula = formulas.find((detail) => detail.revision.id === selectedFormulaId) ?? formulas[0] ?? null;
  const selectedBom = boms.find((detail) => detail.bom.id === selectedBomId) ?? boms[0] ?? null;
  const approvedFormulaCount = formulas.filter((detail) => detail.revision.status === "approved").length;
  const currentEbrStep = selectedExecution?.steps.find(
    (step) => !selectedExecution.results.some((result) => result.templateStepId === step.id)
  ) ?? null;
  const weighTargetQuantity =
    typeof currentEbrStep?.configJson.targetQuantity === "number" ? currentEbrStep.configJson.targetQuantity : null;
  const weighTolerancePercent =
    typeof currentEbrStep?.configJson.tolerancePercent === "number" ? currentEbrStep.configJson.tolerancePercent : null;
  const weighUnit = typeof currentEbrStep?.configJson.uom === "string" ? currentEbrStep.configJson.uom : "l";
  const weighEquipmentId =
    typeof currentEbrStep?.configJson.equipmentId === "string" ? currentEbrStep.configJson.equipmentId : null;
  const usableLots = useMemo(
    () =>
      lots.filter(
        (detail) =>
          detail.lot.status === "active" &&
          detail.lot.qcStatus === "released" &&
          detail.allocation.available > 0
      ),
    [lots]
  );

  async function loadProduction() {
    if (!auth.session) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [
        orderResponse,
        bomResponse,
        formulaResponse,
        batchResponse,
        lotResponse,
        ebrTemplateResponse,
        ebrExecutionResponse,
        masterDataResponse,
        routingMasterDataResponse
      ] = await Promise.all([
        listProductionOrders(auth.session.accessToken),
        listBillOfMaterials(auth.session.accessToken),
        listFormulaRevisions(auth.session.accessToken),
        listProcessingBatches(auth.session.accessToken),
        listLots(auth.session.accessToken),
        listEbrTemplates(auth.session.accessToken),
        listEbrExecutions(auth.session.accessToken),
        listMasterData(auth.session.accessToken),
        listRoutingMasterData(auth.session.accessToken)
      ]);
      setOrders(orderResponse.orders);
      setBoms(bomResponse.boms);
      setFormulas(formulaResponse.formulas);
      setBatches(batchResponse.batches);
      setMasterData(masterDataResponse);
      setRoutingMasterData(routingMasterDataResponse);
      setLots(lotResponse.lots);
      setEbrTemplates(ebrTemplateResponse.templates);
      setEbrExecutions(ebrExecutionResponse.executions);
      setSelectedBatchId(batchResponse.batches[0]?.batch.id ?? "");
      setSelectedBomId((current) =>
        bomResponse.boms.some((detail) => detail.bom.id === current)
          ? current
          : bomResponse.boms[0]?.bom.id ?? ""
      );
      setSelectedFormulaId(formulaResponse.formulas[0]?.revision.id ?? "");
      setCompareFromId(formulaResponse.formulas[0]?.revision.id ?? "");
      setCompareToId(formulaResponse.formulas[1]?.revision.id ?? formulaResponse.formulas[0]?.revision.id ?? "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Production data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProduction();
  }, [auth.session]);

  async function submitCompletion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedBatch) {
      return;
    }

    const alcohol = Number(alcoholQuantity);
    const bottles = Number(bottleQuantity);
    const output = Number(outputQuantity);
    if (![alcohol, bottles, output].every((value) => Number.isFinite(value) && value > 0)) {
      setError("Input and output quantities must be greater than zero.");
      return;
    }

    try {
      const response = await completeProcessingBatch(auth.session.accessToken, selectedBatch.batch.id, {
        clientTransactionId: crypto.randomUUID(),
        endedAt: new Date().toISOString(),
        processParamsJson: {
          fillVolumeMl: Number(fillVolumeMl),
          bottlesRejected: Number(bottlesRejected),
          batchType: selectedBatch.batch.type
        },
        inputs: [
          { sourceLotId: inputAlcoholLotId, quantity: alcohol, uom: "l" },
          { sourceLotId: inputBottleLotId, quantity: bottles, uom: "each" }
        ],
        outputs: [
          {
            lotCode: outputLotCode,
            itemType: "product_variant",
            itemId: "var-lions-mane-50",
            itemName: "Lion's Mane Tincture 50 ml",
            itemSku: "LM-TINC-50",
            quantity: output,
            uom: "bottle",
            expiresAt: "2027-06-26T00:00:00.000Z"
          }
        ]
      });
      setBatches((current) =>
        current.map((detail) => (detail.batch.id === response.batchDetail.batch.id ? response.batchDetail : detail))
      );
      showToast({ title: "Batch completed", description: response.batchDetail.batch.batchCode });
      await loadProduction();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Batch completion failed.");
    }
  }

  async function submitEbrStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedExecution || !currentEbrStep) {
      return;
    }

    const requiresSignature = currentEbrStep.isCritical || currentEbrStep.requiresSignature;
    const payload = {
      ...(currentEbrStep.stepType === "scan_material" ? { scannedLotId: ebrScanLotId } : {}),
      ...(currentEbrStep.stepType === "weigh_material"
        ? {
            weighedQuantity: Number(ebrWeight),
            uom: weighUnit,
            equipmentId: weighEquipmentId,
            scaleAdapterId: ebrScaleAdapterId,
            targetQuantity: weighTargetQuantity,
            tolerancePercent: weighTolerancePercent,
            adminOverrideReason: ebrAdminOverrideReason.trim() || null
          }
        : {}),
      ...(currentEbrStep.stepType === "enter_value" ? { enteredValue: Number(ebrValue) } : {}),
      ...(currentEbrStep.stepType === "attach_evidence" ? { evidenceFileName: ebrEvidence } : {}),
      ...(currentEbrStep.stepType === "qc_check" ? { qcStatus: ebrQcStatus } : {}),
      ...(currentEbrStep.stepType === "supervisor_sign_off" ? { supervisorApproved: ebrSupervisorApproved } : {}),
      ...(requiresSignature
        ? {
            signature: {
              method: "secure_confirmation" as const,
              meaning: `${currentEbrStep.title} completed by operator`,
              confirmationText: ebrConfirmation
            }
          }
        : {})
    };

    try {
      const response = await completeEbrStep(
        auth.session.accessToken,
        selectedExecution.execution.id,
        currentEbrStep.id,
        payload
      );
      setEbrExecutions((current) =>
        current.map((detail) => (detail.execution.id === response.execution.execution.id ? response.execution : detail))
      );
      setEbrSupervisorApproved(false);
      showToast({ title: "EBR step recorded", description: currentEbrStep.title });
    } catch (stepError) {
      setError(stepError instanceof Error ? stepError.message : "EBR step could not be recorded.");
    }
  }

  async function lockEbrRecord() {
    if (!auth.session || !selectedExecution) {
      return;
    }
    try {
      const response = await completeEbrExecution(auth.session.accessToken, selectedExecution.execution.id);
      setEbrExecutions((current) =>
        current.map((detail) => (detail.execution.id === response.execution.execution.id ? response.execution : detail))
      );
      showToast({ title: "Batch record locked", description: response.execution.execution.executionCode });
    } catch (lockError) {
      setError(lockError instanceof Error ? lockError.message : "EBR record could not be locked.");
    }
  }

  async function loadEbrPacket() {
    if (!auth.session || !selectedExecution) {
      return;
    }
    try {
      const response = await exportEbrPacket(auth.session.accessToken, selectedExecution.execution.id);
      setEbrPacket(response.packet);
      showToast({ title: "Batch packet ready", description: response.packet.execution.executionCode });
    } catch (packetError) {
      setError(packetError instanceof Error ? packetError.message : "EBR packet could not be exported.");
    }
  }

  async function runFormulaScale() {
    if (!auth.session || !selectedFormula) {
      return;
    }
    const targetOutputQuantity = Number(scaleQuantity);
    if (!Number.isFinite(targetOutputQuantity) || targetOutputQuantity <= 0) {
      setError("Scale target must be greater than zero.");
      return;
    }
    try {
      const response = await scaleFormulaRevision(auth.session.accessToken, selectedFormula.revision.id, {
        targetOutputQuantity,
        targetOutputUom: selectedFormula.revision.targetOutputUom
      });
      setScaleResult(response.scale);
      showToast({ title: "Formula scaled", description: `${targetOutputQuantity} ${selectedFormula.revision.targetOutputUom}` });
    } catch (scaleError) {
      setError(scaleError instanceof Error ? scaleError.message : "Formula could not be scaled.");
    }
  }

  async function runFormulaCompare() {
    if (!auth.session || !compareFromId || !compareToId) {
      return;
    }
    try {
      const response = await compareFormulaRevisions(auth.session.accessToken, compareFromId, compareToId);
      setComparison(response.comparison);
      showToast({ title: "Revisions compared", description: "Added, removed, and changed lines are ready." });
    } catch (compareError) {
      setError(compareError instanceof Error ? compareError.message : "Formula revisions could not be compared.");
    }
  }

  async function approveSelectedFormula() {
    if (!auth.session || !selectedFormula) {
      return;
    }
    try {
      const response = await approveFormulaRevision(auth.session.accessToken, selectedFormula.revision.id, {
        status: "approved",
        comment: "Approved from formulation vault."
      });
      setFormulas((current) =>
        current.map((detail) => (detail.revision.id === response.formula.revision.id ? response.formula : detail))
      );
      showToast({ title: "Formula approved", description: response.formula.revision.revisionCode });
      await loadProduction();
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : "Formula approval failed.");
    }
  }

  async function submitProductionOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }
    const form = new FormData(event.currentTarget);
    const plannedQuantity = Number(formText(form, "plannedQuantity"));
    try {
      const response = await createProductionOrder(auth.session.accessToken, {
        orderNumber: formText(form, "orderNumber"),
        type: formText(form, "type"),
        status: "planned",
        plannedStartAt: new Date(`${formText(form, "plannedStartAt")}T08:00:00.000Z`).toISOString(),
        dueAt: new Date(`${formText(form, "dueAt")}T16:00:00.000Z`).toISOString(),
        locationId: formText(form, "locationId"),
        productVariantId: nullableFormText(form, "productVariantId"),
        formulaRevisionId: nullableFormText(form, "formulaRevisionId"),
        routingTemplateId: null,
        plannedQuantity: Number.isFinite(plannedQuantity) ? plannedQuantity : null,
        uom: nullableFormText(form, "uom"),
        priority: Number(formText(form, "priority")) || 3,
        notes: nullableFormText(form, "notes")
      });
      showToast({ title: "Production order created", description: response.order.orderNumber });
      setCreateDialog(null);
      await loadProduction();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Production order create failed.");
    }
  }

  async function submitProcessingBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }
    const form = new FormData(event.currentTarget);
    try {
      const response = await createProcessingBatch(auth.session.accessToken, {
        batchCode: formText(form, "batchCode"),
        type: formText(form, "type") as ProcessingBatchDetail["batch"]["type"],
        status: "planned",
        productionOrderId: nullableFormText(form, "productionOrderId"),
        locationId: formText(form, "locationId"),
        startedAt: new Date(`${formText(form, "startedAt")}T08:00:00.000Z`).toISOString(),
        processParamsJson: {
          bomId: nullableFormText(form, "bomId"),
          source: "production_create_dialog"
        },
        notes: nullableFormText(form, "notes")
      });
      showToast({ title: "Batch order created", description: response.batch.batchCode });
      setSelectedBatchId(response.batch.id);
      setCreateDialog(null);
      await loadProduction();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Batch order create failed.");
    }
  }

  async function submitBom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }
    const form = new FormData(event.currentTarget);
    const yieldQuantity = Number(formText(form, "yieldQuantity"));
    try {
      const response = await createBillOfMaterials(auth.session.accessToken, {
        productVariantId: formText(form, "productVariantId"),
        formulaRevisionId: nullableFormText(form, "formulaRevisionId"),
        versionCode: formText(form, "versionCode"),
        status: "draft",
        yieldQuantity: Number.isFinite(yieldQuantity) && yieldQuantity > 0 ? yieldQuantity : 1,
        yieldUom: formText(form, "yieldUom"),
        effectiveFrom: new Date(`${formText(form, "effectiveFrom")}T00:00:00.000Z`).toISOString(),
        effectiveTo: null
      });
      showToast({ title: "BOM created", description: response.bom.versionCode });
      setSelectedBomId(response.bom.id);
      setCreateDialog(null);
      await loadProduction();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "BOM create failed.");
    }
  }

  return (
    <section className="screen-grid" aria-labelledby="production-title">
      <div className="screen-heading">
        <p className="eyebrow">Production</p>
        <h2 id="production-title">Orders, BOMs, and processing batches</h2>
        <p>Batch completion consumes released input lots and creates traceable output lots.</p>
      </div>

      <div className="action-row">
        <Button type="button" onClick={() => setCreateDialog("order")}>
          <PackagePlus aria-hidden="true" size={18} />
          New order
        </Button>
        <Button type="button" variant="secondary" onClick={() => setCreateDialog("batch")}>
          <Factory aria-hidden="true" size={18} />
          New batch
        </Button>
        <Button type="button" variant="secondary" onClick={() => setCreateDialog("bom")}>
          <ClipboardList aria-hidden="true" size={18} />
          New BOM
        </Button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="metric-grid">
        <article className="metric-panel">
          <span>Open orders</span>
          <strong>{orders.filter((detail) => detail.order.status !== "completed").length}</strong>
        </article>
        <article className="metric-panel">
          <span>Active BOMs</span>
          <strong>{boms.filter((detail) => detail.bom.status === "active").length}</strong>
        </article>
        <article className="metric-panel">
          <span>Approved formulas</span>
          <strong>{approvedFormulaCount}</strong>
        </article>
        <article className="metric-panel">
          <span>Batch yield</span>
          <strong>
            {selectedOrder?.yieldSummary.varianceQuantity === null
              ? "Pending"
              : `${formatNumber(selectedOrder?.yieldSummary.varianceQuantity ?? 0)} ${selectedOrder?.yieldSummary.uom ?? ""}`}
          </strong>
        </article>
      </div>

      <Tabs
        tabs={[
          {
            id: "orders",
            label: "Orders",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Production order board</h3>
                  <Button variant="secondary" size="sm" onClick={() => void loadProduction()}>
                    <History aria-hidden="true" size={16} />
                    Refresh
                  </Button>
                </div>
                {loading ? (
                  <p>Loading production orders...</p>
                ) : (
                  <table className="list-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Status</th>
                        <th>Due</th>
                        <th>Planned</th>
                        <th>Actual</th>
                        <th>Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((detail) => (
                        <tr key={detail.order.id}>
                          <td>
                            <strong>{detail.order.orderNumber}</strong>
                            <span>{detail.order.type}</span>
                          </td>
                          <td><Badge tone={statusTone(detail.order.status)}>{detail.order.status}</Badge></td>
                          <td>{detail.order.dueAt ? formatDate(new Date(detail.order.dueAt)) : "None"}</td>
                          <td>{formatNumber(detail.order.plannedQuantity ?? 0)} {detail.order.uom}</td>
                          <td>{formatNumber(detail.yieldSummary.actualQuantity)} {detail.yieldSummary.uom}</td>
                          <td>
                            {detail.yieldSummary.varianceQuantity === null
                              ? "Pending"
                              : `${formatNumber(detail.yieldSummary.varianceQuantity)} ${detail.yieldSummary.uom}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )
          },
          {
            id: "boms",
            label: "BOMs",
            content: (
              <BomEditor
                authToken={auth.session?.accessToken ?? ""}
                batches={batches}
                boms={boms}
                ebrTemplates={ebrTemplates}
                formulas={formulas}
                formatNumber={formatNumber}
                masterData={masterData}
                onError={setError}
                onReload={loadProduction}
                onSelectBom={setSelectedBomId}
                routingMasterData={routingMasterData}
                selectedBom={selectedBom}
                showToast={showToast}
              />
            )
          },
          {
            id: "formulas",
            label: "Formulation vault",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Formulation vault</h3>
                  <Badge tone="info"><ShieldCheck aria-hidden="true" size={16} /> Controlled</Badge>
                </div>
                <label className="select-field">
                  <span>Revision</span>
                  <select value={selectedFormulaId} onChange={(event) => setSelectedFormulaId(event.target.value)}>
                    {formulas.map((detail) => (
                      <option key={detail.revision.id} value={detail.revision.id}>
                        {detail.family.code} / {detail.revision.revisionCode} / {detail.revision.status}
                      </option>
                    ))}
                  </select>
                </label>
                {selectedFormula ? (
                  <div className="stack">
                    <div className="metric-grid">
                      <article className="metric-panel">
                        <span>Status</span>
                        <strong><Badge tone={statusTone(selectedFormula.revision.status)}>{selectedFormula.revision.status}</Badge></strong>
                      </article>
                      <article className="metric-panel">
                        <span>Target output</span>
                        <strong>{formatNumber(selectedFormula.revision.targetOutputQuantity)} {selectedFormula.revision.targetOutputUom}</strong>
                      </article>
                      <article className="metric-panel">
                        <span>Expected yield</span>
                        <strong>{formatNumber(selectedFormula.revision.expectedYieldPercent)}%</strong>
                      </article>
                      <article className="metric-panel">
                        <span>Potency target</span>
                        <strong>{String(selectedFormula.revision.potencyTargetsJson.betaGlucansMgPerServing ?? "Set")}</strong>
                      </article>
                    </div>
                    <table className="list-table">
                      <thead>
                        <tr>
                          <th>Line</th>
                          <th>Type</th>
                          <th>Quantity</th>
                          <th>Flags</th>
                          <th>Alternates</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedFormula.lines.map((line) => (
                          <tr key={line.id}>
                            <td>
                              <strong>{line.componentNameSnapshot}</strong>
                              <span>{line.instructionText ?? line.componentId ?? "Placeholder"}</span>
                            </td>
                            <td>{line.lineType.replaceAll("_", " ")}</td>
                            <td>{formatNumber(line.quantity)} {line.uom} + {formatNumber(line.wastePercent)}%</td>
                            <td>
                              {[...line.allergenFlags, ...line.dietaryFlags].map((flag) => (
                                <Badge key={flag} tone="neutral">{flag.replaceAll("_", " ")}</Badge>
                              ))}
                              {line.requiresApproval ? <Badge tone="warning">Approval</Badge> : null}
                            </td>
                            <td>
                              {line.alternates.length === 0
                                ? "None"
                                : line.alternates.map((alternate) => (
                                    <Badge key={alternate.id} tone={alternate.approved ? "success" : "warning"}>
                                      {alternate.componentNameSnapshot}
                                    </Badge>
                                  ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No formulas are available.</p>
                )}
              </div>
            )
          },
          {
            id: "approval",
            label: "Approval workflow",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Formula release approval</h3>
                  <Badge tone="warning"><ShieldCheck aria-hidden="true" size={16} /> Release gate</Badge>
                </div>
                {selectedFormula ? (
                  <div className="stack">
                    <p>
                      {selectedFormula.family.name} / {selectedFormula.revision.revisionCode} is currently{" "}
                      <strong>{selectedFormula.revision.status}</strong>.
                    </p>
                    <div className="form-actions">
                      <Button
                        type="button"
                        disabled={selectedFormula.revision.status === "approved"}
                        onClick={() => void approveSelectedFormula()}
                      >
                        <ShieldCheck aria-hidden="true" size={18} />
                        Approve revision
                      </Button>
                    </div>
                    <table className="list-table">
                      <thead>
                        <tr>
                          <th>Decision</th>
                          <th>Actor</th>
                          <th>When</th>
                          <th>Comment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedFormula.approvals.map((approval) => (
                          <tr key={approval.id}>
                            <td><Badge tone={approval.status === "approved" ? "success" : "warning"}>{approval.status}</Badge></td>
                            <td>{approval.approverUserId ?? "Pending"}</td>
                            <td>{approval.decisionAt ? formatDate(new Date(approval.decisionAt)) : "Open"}</td>
                            <td>{approval.comment ?? "None"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            )
          },
          {
            id: "compare",
            label: "Revision compare",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Revision compare</h3>
                  <Button type="button" variant="secondary" size="sm" onClick={() => void runFormulaCompare()}>
                    <GitCompare aria-hidden="true" size={16} />
                    Compare
                  </Button>
                </div>
                <div className="compact-form-grid">
                  <label className="select-field">
                    <span>From revision</span>
                    <select value={compareFromId} onChange={(event) => setCompareFromId(event.target.value)}>
                      {formulas.map((detail) => (
                        <option key={detail.revision.id} value={detail.revision.id}>{detail.revision.revisionCode}</option>
                      ))}
                    </select>
                  </label>
                  <label className="select-field">
                    <span>To revision</span>
                    <select value={compareToId} onChange={(event) => setCompareToId(event.target.value)}>
                      {formulas.map((detail) => (
                        <option key={detail.revision.id} value={detail.revision.id}>{detail.revision.revisionCode}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {comparison ? (
                  <div className="stack">
                    <h4>Added</h4>
                    <p>{comparison.added.map((line) => line.componentNameSnapshot ?? line.componentName ?? line.id).join(", ") || "None"}</p>
                    <h4>Removed</h4>
                    <p>{comparison.removed.map((line) => line.componentNameSnapshot ?? line.componentName ?? line.id).join(", ") || "None"}</p>
                    <h4>Changed</h4>
                    <table className="list-table">
                      <thead>
                        <tr>
                          <th>Line</th>
                          <th>Before</th>
                          <th>After</th>
                          <th>Changes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.changed.map((change) => (
                          <tr key={change.to.id}>
                            <td>{change.to.componentNameSnapshot ?? change.to.componentName ?? change.to.id}</td>
                            <td>{formatNumber(change.from.quantity)} {change.from.uom}</td>
                            <td>{formatNumber(change.to.quantity)} {change.to.uom}</td>
                            <td>{change.changes.join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Run a comparison to see added, removed, and changed lines.</p>
                )}
              </div>
            )
          },
          {
            id: "scale",
            label: "Scale calculator",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Scale calculator</h3>
                  <Button type="button" variant="secondary" size="sm" onClick={() => void runFormulaScale()}>
                    <Calculator aria-hidden="true" size={16} />
                    Scale
                  </Button>
                </div>
                <Input
                  label={`Target output (${selectedFormula?.revision.targetOutputUom ?? "uom"})`}
                  type="number"
                  step="0.000001"
                  value={scaleQuantity}
                  onChange={(event) => setScaleQuantity(event.target.value)}
                />
                {scaleResult ? (
                  <div className="stack">
                    <p>
                      Scale factor {formatNumber(scaleResult.scaleFactor)} / expected yield{" "}
                      {formatNumber(scaleResult.expectedYieldQuantity)} {scaleResult.expectedYieldUom}
                    </p>
                    <table className="list-table">
                      <thead>
                        <tr>
                          <th>Component</th>
                          <th>Net</th>
                          <th>Waste</th>
                          <th>Gross</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scaleResult.lines.map((line) => (
                          <tr key={line.id}>
                            <td>{line.componentNameSnapshot ?? line.componentName ?? line.id}</td>
                            <td>{formatNumber(line.scaledQuantity)} {line.uom}</td>
                            <td>{formatNumber(line.scaledWasteQuantity)} {line.uom}</td>
                            <td>{formatNumber(line.scaledGrossQuantity)} {line.uom}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Enter a target output and scale the selected formula.</p>
                )}
              </div>
            )
          },
          {
            id: "ebr-templates",
            label: "EBR templates",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Electronic batch record templates</h3>
                  <Badge tone="info"><FileText aria-hidden="true" size={16} /> Controlled</Badge>
                </div>
                {ebrTemplates.map((detail) => (
                  <div className="stack" key={detail.template.id}>
                    <h4>{detail.template.name} / {detail.template.versionCode}</h4>
                    <p>{detail.template.processingBatchType ?? "Any batch"} / {detail.template.status}</p>
                    <table className="list-table">
                      <thead>
                        <tr>
                          <th>Step</th>
                          <th>Type</th>
                          <th>Controls</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.steps.map((step) => (
                          <tr key={step.id}>
                            <td>
                              <strong>{step.sequence}. {step.title}</strong>
                              <span>{step.instructions}</span>
                            </td>
                            <td>{step.stepType.replaceAll("_", " ")}</td>
                            <td>
                              {step.isCritical ? <Badge tone="warning">Critical</Badge> : null}
                              {step.requiresSignature ? <Badge tone="info">E-sign</Badge> : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )
          },
          {
            id: "wizard",
            label: "Batch wizard",
            content: (
              <form className="table-panel compact-form-grid" onSubmit={submitCompletion}>
                <h3>Complete processing batch</h3>
                <label className="select-field">
                  <span>Batch</span>
                  <select value={selectedBatchId} onChange={(event) => setSelectedBatchId(event.target.value)}>
                    {batches.map((detail) => (
                      <option key={detail.batch.id} value={detail.batch.id}>
                        {detail.batch.batchCode} / {detail.batch.type} / {detail.batch.status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="select-field">
                  <span>Alcohol input lot</span>
                  <select value={inputAlcoholLotId} onChange={(event) => setInputAlcoholLotId(event.target.value)}>
                    {usableLots.filter((detail) => detail.lot.itemType === "material").map((detail) => (
                      <option key={detail.lot.id} value={detail.lot.id}>
                        {detail.lot.lotCode} / {formatNumber(detail.allocation.available)} {detail.balances[0]?.uom}
                      </option>
                    ))}
                  </select>
                </label>
                <Input label="Alcohol quantity" type="number" step="0.000001" value={alcoholQuantity} onChange={(event) => setAlcoholQuantity(event.target.value)} />
                <label className="select-field">
                  <span>Packaging input lot</span>
                  <select value={inputBottleLotId} onChange={(event) => setInputBottleLotId(event.target.value)}>
                    {usableLots.filter((detail) => detail.lot.itemType === "packaging_component").map((detail) => (
                      <option key={detail.lot.id} value={detail.lot.id}>
                        {detail.lot.lotCode} / {formatNumber(detail.allocation.available)} {detail.balances[0]?.uom}
                      </option>
                    ))}
                  </select>
                </label>
                <Input label="Packaging quantity" type="number" step="1" value={bottleQuantity} onChange={(event) => setBottleQuantity(event.target.value)} />
                <Input label="Output lot code" value={outputLotCode} onChange={(event) => setOutputLotCode(event.target.value)} />
                <Input label="Output quantity" type="number" step="1" value={outputQuantity} onChange={(event) => setOutputQuantity(event.target.value)} />
                <Input label="Fill volume ml" type="number" value={fillVolumeMl} onChange={(event) => setFillVolumeMl(event.target.value)} />
                <Input label="Rejected bottles" type="number" value={bottlesRejected} onChange={(event) => setBottlesRejected(event.target.value)} />
                <div className="form-actions">
                  <Button type="submit" disabled={!selectedBatch || selectedBatch.batch.status === "completed"}>
                    <CheckCircle2 aria-hidden="true" size={18} />
                    Complete batch
                  </Button>
                </div>
              </form>
            )
          },
          {
            id: "ebr",
            label: "Shop-floor EBR",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Mobile batch execution</h3>
                  <Badge tone={statusTone(selectedExecution?.execution.status ?? "planned")}>
                    <Smartphone aria-hidden="true" size={16} />
                    {selectedExecution?.execution.executionCode ?? "No EBR"}
                  </Badge>
                </div>
                {selectedExecution && currentEbrStep ? (
                  <form className="compact-form-grid" onSubmit={submitEbrStep}>
                    <div className="stack">
                      <p className="eyebrow">Current step</p>
                      <h4>{currentEbrStep.sequence}. {currentEbrStep.title}</h4>
                      <p>{currentEbrStep.instructions}</p>
                    </div>
                    {currentEbrStep.stepType === "scan_material" ? (
                      <label className="select-field">
                        <span>Material lot scan</span>
                        <select value={ebrScanLotId} onChange={(event) => setEbrScanLotId(event.target.value)}>
                          {usableLots.map((detail) => (
                            <option key={detail.lot.id} value={detail.lot.id}>{detail.lot.lotCode}</option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    {currentEbrStep.stepType === "weigh_material" ? (
                      <>
                        <dl className="sync-metrics">
                          <div><dt>Target</dt><dd>{weighTargetQuantity ?? "-"} {weighUnit}</dd></div>
                          <div><dt>Tolerance</dt><dd>{weighTolerancePercent ?? 0}%</dd></div>
                          <div><dt>Equipment</dt><dd>{weighEquipmentId ?? "Manual"}</dd></div>
                          <div><dt>Source</dt><dd>{ebrScaleAdapterId}</dd></div>
                        </dl>
                        <label className="select-field">
                          <span>Scale source</span>
                          <select value={ebrScaleAdapterId} onChange={(event) => setEbrScaleAdapterId(event.target.value as "manual" | "mock-scale")}>
                            <option value="manual">Manual entry</option>
                            <option value="mock-scale">Mock scale</option>
                          </select>
                        </label>
                        <Input label="Weighed quantity" type="number" step="0.000001" value={ebrWeight} onChange={(event) => setEbrWeight(event.target.value)} />
                        <Input label="Admin override reason" value={ebrAdminOverrideReason} onChange={(event) => setEbrAdminOverrideReason(event.target.value)} />
                      </>
                    ) : null}
                    {currentEbrStep.stepType === "enter_value" ? (
                      <Input label="Entered value" type="number" value={ebrValue} onChange={(event) => setEbrValue(event.target.value)} />
                    ) : null}
                    {currentEbrStep.stepType === "attach_evidence" ? (
                      <Input label="Evidence file" value={ebrEvidence} onChange={(event) => setEbrEvidence(event.target.value)} />
                    ) : null}
                    {currentEbrStep.stepType === "qc_check" ? (
                      <label className="select-field">
                        <span>QC result</span>
                        <select value={ebrQcStatus} onChange={(event) => setEbrQcStatus(event.target.value)}>
                          <option value="pass">pass</option>
                          <option value="fail">fail</option>
                          <option value="hold">hold</option>
                        </select>
                      </label>
                    ) : null}
                    {currentEbrStep.stepType === "supervisor_sign_off" ? (
                      <label className="checkbox-row">
                        <input type="checkbox" checked={ebrSupervisorApproved} onChange={(event) => setEbrSupervisorApproved(event.target.checked)} />
                        <span>Supervisor approval</span>
                      </label>
                    ) : null}
                    {currentEbrStep.isCritical || currentEbrStep.requiresSignature ? (
                      <Input label="Secure confirmation" value={ebrConfirmation} onChange={(event) => setEbrConfirmation(event.target.value)} />
                    ) : null}
                    <div className="form-actions">
                      <Button type="submit">
                        <ShieldCheck aria-hidden="true" size={18} />
                        Complete EBR step
                      </Button>
                    </div>
                  </form>
                ) : selectedExecution ? (
                  <div className="stack">
                    <h4>All EBR steps are recorded</h4>
                    <p>Lock the batch record to make it immutable for review and export.</p>
                    <Button onClick={() => void lockEbrRecord()} disabled={selectedExecution.execution.status === "completed"}>
                      <LockKeyhole aria-hidden="true" size={18} />
                      Lock batch record
                    </Button>
                  </div>
                ) : (
                  <p>No electronic batch record execution is available.</p>
                )}
                {selectedExecution ? (
                  <table className="list-table">
                    <thead>
                      <tr>
                        <th>Step</th>
                        <th>Status</th>
                        <th>Audit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedExecution.steps.map((step) => {
                        const result = selectedExecution.results.find((candidate) => candidate.templateStepId === step.id);
                        return (
                          <tr key={step.id}>
                            <td>{step.sequence}. {step.title}</td>
                            <td><Badge tone={result ? "success" : "warning"}>{result ? "done" : "open"}</Badge></td>
                            <td>{result?.auditHash.slice(0, 16) ?? "Pending"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : null}
              </div>
            )
          },
          {
            id: "packet",
            label: "EBR packet",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Batch record review/export</h3>
                  <Button variant="secondary" size="sm" onClick={() => void loadEbrPacket()} disabled={!selectedExecution}>
                    <FileText aria-hidden="true" size={16} />
                    Export packet
                  </Button>
                </div>
                {ebrPacket ? (
                  <div className="stack">
                    <p><strong>{ebrPacket.execution.executionCode}</strong> / {ebrPacket.template.name}</p>
                    <p>{ebrPacket.steps.filter((step) => step.completedAt).length} of {ebrPacket.steps.length} steps complete</p>
                    <table className="list-table">
                      <thead>
                        <tr>
                          <th>Packet step</th>
                          <th>Timestamp</th>
                          <th>Signature</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ebrPacket.steps.map((step) => (
                          <tr key={step.stepId}>
                            <td>{step.sequence}. {step.title}</td>
                            <td>{step.completedAt ? formatDate(new Date(step.completedAt)) : "Pending"}</td>
                            <td>{step.signatures.length > 0 ? "Signed" : "None"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Exported packet will include steps, users, timestamps, inputs, outputs, QC checks, deviations, and audit hashes.</p>
                )}
              </div>
            )
          },
          {
            id: "outputs",
            label: "Outputs",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Created output lots</h3>
                  <Badge tone="success"><PackagePlus aria-hidden="true" size={16} /> Traceable</Badge>
                </div>
                {batches.flatMap((detail) => detail.outputs).length === 0 ? (
                  <p>No output lots have been created yet.</p>
                ) : (
                  <table className="list-table">
                    <thead>
                      <tr>
                        <th>Lot</th>
                        <th>Batch</th>
                        <th>Quantity</th>
                        <th>QC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.flatMap((detail) =>
                        detail.outputs.map((output) => (
                          <tr key={output.id}>
                            <td>{output.lot.lotCode}</td>
                            <td><FlaskConical aria-hidden="true" size={16} /> {detail.batch.batchCode}</td>
                            <td>{formatNumber(output.quantity)} {output.uom}</td>
                            <td><Badge tone={statusTone(output.lot.qcStatus)}>{output.lot.qcStatus}</Badge></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )
          }
        ]}
      />

      <Dialog title="Create production order" open={createDialog === "order"} onClose={() => setCreateDialog(null)}>
        <form className="form-grid" onSubmit={submitProductionOrder}>
          <Input label="Order number" name="orderNumber" required defaultValue={`PO-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${orders.length + 1}`} />
          <label className="select-field">
            <span>Type</span>
            <select name="type" defaultValue="bottling">
              <option value="extraction">Extraction</option>
              <option value="blending">Blending</option>
              <option value="bottling">Bottling</option>
              <option value="packaging">Packaging</option>
              <option value="encapsulation">Encapsulation</option>
              <option value="food">Food</option>
            </select>
          </label>
          <label className="select-field">
            <span>Product variant</span>
            <select name="productVariantId" defaultValue={masterData.productVariants[0]?.id ?? ""}>
              {masterData.productVariants.map((variant) => (
                <option key={variant.id} value={variant.id}>{variant.sku} / {variant.localizedNames.en}</option>
              ))}
            </select>
          </label>
          <label className="select-field">
            <span>Formula</span>
            <select name="formulaRevisionId" defaultValue={formulas[0]?.revision.id ?? ""}>
              <option value="">None</option>
              {formulas.map((detail) => (
                <option key={detail.revision.id} value={detail.revision.id}>{detail.family.code} / {detail.revision.revisionCode}</option>
              ))}
            </select>
          </label>
          <label className="select-field">
            <span>Location</span>
            <select name="locationId" defaultValue={masterData.locations[0]?.id ?? "loc-pack"}>
              {masterData.locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </label>
          <Input label="Planned quantity" name="plannedQuantity" required type="number" min="0.000001" step="0.000001" defaultValue="48" />
          <Input label="UOM" name="uom" required defaultValue="bottle" />
          <Input label="Priority" name="priority" type="number" min="0" step="1" defaultValue="3" />
          <Input label="Start date" name="plannedStartAt" required type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          <Input label="Due date" name="dueAt" required type="date" defaultValue={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} />
          <Input label="Notes" name="notes" className="full-span" defaultValue="Created from production dashboard." />
          <div className="form-actions full-span">
            <Button type="submit"><Save aria-hidden="true" size={18} />Save order</Button>
          </div>
        </form>
      </Dialog>

      <Dialog title="Create batch order" open={createDialog === "batch"} onClose={() => setCreateDialog(null)}>
        <form className="form-grid" onSubmit={submitProcessingBatch}>
          <Input label="Batch code" name="batchCode" required defaultValue={`BATCH-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${batches.length + 1}`} />
          <label className="select-field">
            <span>Type</span>
            <select name="type" defaultValue="bottling">
              <option value="extraction">Extraction</option>
              <option value="blending">Blending</option>
              <option value="bottling">Bottling</option>
              <option value="packaging">Packaging</option>
              <option value="encapsulation">Encapsulation</option>
              <option value="food">Food</option>
              <option value="powder">Powder</option>
            </select>
          </label>
          <label className="select-field">
            <span>Production order</span>
            <select name="productionOrderId" defaultValue={orders[0]?.order.id ?? ""}>
              <option value="">Standalone batch</option>
              {orders.map((detail) => (
                <option key={detail.order.id} value={detail.order.id}>{detail.order.orderNumber}</option>
              ))}
            </select>
          </label>
          <label className="select-field">
            <span>BOM</span>
            <select name="bomId" defaultValue={selectedBom?.bom.id ?? ""}>
              <option value="">No BOM reference</option>
              {boms.map((detail) => (
                <option key={detail.bom.id} value={detail.bom.id}>{detail.bom.versionCode}</option>
              ))}
            </select>
          </label>
          <label className="select-field">
            <span>Location</span>
            <select name="locationId" defaultValue={masterData.locations[0]?.id ?? "loc-pack"}>
              {masterData.locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </label>
          <Input label="Start date" name="startedAt" required type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          <Input label="Notes" name="notes" className="full-span" defaultValue="Created from production dashboard." />
          <div className="form-actions full-span">
            <Button type="submit"><Save aria-hidden="true" size={18} />Save batch</Button>
          </div>
        </form>
      </Dialog>

      <Dialog title="Create BOM" open={createDialog === "bom"} onClose={() => setCreateDialog(null)}>
        <form className="form-grid" onSubmit={submitBom}>
          <label className="select-field">
            <span>Product variant</span>
            <select name="productVariantId" defaultValue={masterData.productVariants[0]?.id ?? ""}>
              {masterData.productVariants.map((variant) => (
                <option key={variant.id} value={variant.id}>{variant.sku} / {variant.localizedNames.en}</option>
              ))}
            </select>
          </label>
          <label className="select-field">
            <span>Formula</span>
            <select name="formulaRevisionId" defaultValue={formulas[0]?.revision.id ?? ""}>
              <option value="">No formula</option>
              {formulas.map((detail) => (
                <option key={detail.revision.id} value={detail.revision.id}>{detail.family.code} / {detail.revision.revisionCode}</option>
              ))}
            </select>
          </label>
          <Input label="Version" name="versionCode" required defaultValue={`v${boms.length + 1}`} />
          <Input label="Yield quantity" name="yieldQuantity" required type="number" min="0.000001" step="0.000001" defaultValue="48" />
          <Input label="Yield UOM" name="yieldUom" required defaultValue="bottle" />
          <Input label="Effective from" name="effectiveFrom" required type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          <div className="form-actions full-span">
            <Button type="submit"><Save aria-hidden="true" size={18} />Save BOM</Button>
          </div>
        </form>
      </Dialog>
    </section>
  );
}

function BomEditor({
  authToken,
  batches,
  boms,
  ebrTemplates,
  formulas,
  formatNumber,
  masterData,
  onError,
  onReload,
  onSelectBom,
  routingMasterData,
  selectedBom,
  showToast
}: {
  authToken: string;
  batches: ProcessingBatchDetail[];
  boms: BillOfMaterialsDetail[];
  ebrTemplates: EbrTemplateDetail[];
  formulas: FormulaRevisionDetail[];
  formatNumber: (value: number) => string;
  masterData: MasterDataSnapshot;
  onError: (message: string | null) => void;
  onReload: () => Promise<void>;
  onSelectBom: (bomId: string) => void;
  routingMasterData: RoutingMasterData;
  selectedBom: BillOfMaterialsDetail | null;
  showToast: (toast: { title: string; description?: string }) => void;
}) {
  const operations = useMemo(
    () => [...(selectedBom?.operations ?? [])].sort((left, right) => left.operation.sequence - right.operation.sequence),
    [selectedBom]
  );
  const [selectedOperationId, setSelectedOperationId] = useState("");
  const selectedOperation =
    operations.find((entry) => entry.operation.id === selectedOperationId) ?? operations[0] ?? null;
  const runtime = selectedBom?.productionPlan?.operationRuntimes.find(
    (entry) => entry.bomOperationId === selectedOperation?.operation.id
  ) ?? null;
  const componentOptions = useMemo(
    () => [
      ...masterData.materials.map((item) => ({
        value: `material:${item.id}`,
        label: `${item.sku ?? "MAT"} / ${item.name}`
      })),
      ...masterData.packagingComponents.map((item) => ({
        value: `packaging_component:${item.id}`,
        label: `${item.sku ?? "PKG"} / ${item.name}`
      })),
      ...masterData.productVariants.map((item) => ({
        value: `product_variant:${item.id}`,
        label: `${item.sku} / ${item.localizedNames.en}`
      }))
    ],
    [masterData.materials, masterData.packagingComponents, masterData.productVariants]
  );

  useEffect(() => {
    if (!operations.some((entry) => entry.operation.id === selectedOperationId)) {
      setSelectedOperationId(operations[0]?.operation.id ?? "");
    }
  }, [operations, selectedOperationId]);

  function componentLabel(componentType: string, componentId: string) {
    if (componentType === "material") {
      const material = masterData.materials.find((item) => item.id === componentId);
      return material ? `${material.sku ?? "MAT"} / ${material.name}` : componentId;
    }
    if (componentType === "packaging_component") {
      const component = masterData.packagingComponents.find((item) => item.id === componentId);
      return component ? `${component.sku ?? "PKG"} / ${component.name}` : componentId;
    }
    const variant = masterData.productVariants.find((item) => item.id === componentId);
    return variant ? `${variant.sku} / ${variant.localizedNames.en}` : componentId;
  }

  function equipmentLabel(equipmentId: string) {
    const equipment = routingMasterData.equipment.find((item) => item.id === equipmentId);
    return equipment ? `${equipment.code} / ${equipment.name}` : equipmentId;
  }

  async function submitOperation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedBom || !authToken) {
      return;
    }
    const form = new FormData(event.currentTarget);
    try {
      const machineUnits = formText(form, "machineUnits");
      const machineTimeMinutes = formText(form, "machineTimeMinutes");
      await createBomOperation(authToken, selectedBom.bom.id, {
        sequence: Number(formText(form, "sequence")) || (operations.length + 1) * 10,
        operationId: formText(form, "operationId"),
        operationCodeId: formText(form, "operationCodeId"),
        workCenterId: formText(form, "workCenterId"),
        setupTimeMinutes: Number(formText(form, "setupTimeMinutes")) || 0,
        runUnits: Number(formText(form, "runUnits")) || selectedBom.bom.yieldQuantity,
        runTimeMinutes: Number(formText(form, "runTimeMinutes")) || 0,
        machineUnits: machineUnits ? Number(machineUnits) : null,
        machineTimeMinutes: machineTimeMinutes ? Number(machineTimeMinutes) : null,
        queueTimeMinutes: Number(formText(form, "queueTimeMinutes")) || 0,
        moveTimeMinutes: Number(formText(form, "moveTimeMinutes")) || 0,
        finishTimeMinutes: Number(formText(form, "finishTimeMinutes")) || 0,
        laborRoleId: nullableFormText(form, "laborRoleId"),
        laborCrewSize: Number(formText(form, "laborCrewSize")) || 1,
        runtimeBasis: formText(form, "runtimeBasis") as "manual" | "equipment" | "mixed",
        backflushLabor: form.get("backflushLabor") === "on",
        controlPoint: form.get("controlPoint") === "on",
        scrapAction: formText(form, "scrapAction") as "write_off" | "quarantine" | "rework",
        instructions: nullableFormText(form, "instructions")
      });
      showToast({ title: "Operation added", description: formText(form, "operationId") });
      event.currentTarget.reset();
      await onReload();
    } catch (submitError) {
      onError(submitError instanceof Error ? submitError.message : "BOM operation create failed.");
    }
  }

  async function submitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOperation || !authToken) {
      return;
    }
    const form = new FormData(event.currentTarget);
    try {
      await createBomOperationStep(authToken, selectedOperation.operation.id, {
        sequence: Number(formText(form, "sequence")) || (selectedOperation.steps.length + 1) * 10,
        title: formText(form, "title"),
        instructions: formText(form, "instructions"),
        isCritical: form.get("isCritical") === "on",
        requiresSignature: form.get("requiresSignature") === "on",
        requiresQcEntry: form.get("requiresQcEntry") === "on"
      });
      showToast({ title: "Step added", description: formText(form, "title") });
      event.currentTarget.reset();
      await onReload();
    } catch (submitError) {
      onError(submitError instanceof Error ? submitError.message : "BOM step create failed.");
    }
  }

  async function submitMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOperation || !authToken) {
      return;
    }
    const form = new FormData(event.currentTarget);
    const [componentType, componentId] = formText(form, "componentRef").split(":");
    if (!componentType || !componentId) {
      onError("Select a BOM component before assigning material.");
      return;
    }
    try {
      await createBomOperationMaterial(authToken, selectedOperation.operation.id, {
        lineType: formText(form, "lineType") as BillOfMaterialsDetail["lines"][number]["lineType"],
        componentType: componentType as BillOfMaterialsDetail["lines"][number]["componentType"],
        componentId,
        quantity: Number(formText(form, "quantity")) || 1,
        uom: formText(form, "uom"),
        wastePercent: Number(formText(form, "wastePercent")) || 0,
        issueMethod: formText(form, "issueMethod") as "manual" | "backflush",
        effectiveFrom: null,
        effectiveTo: null,
        isCritical: form.get("isCritical") === "on",
        lotTraceRequired: form.get("lotTraceRequired") === "on"
      });
      showToast({ title: "Material assigned", description: componentLabel(componentType, componentId) });
      event.currentTarget.reset();
      await onReload();
    } catch (submitError) {
      onError(submitError instanceof Error ? submitError.message : "BOM material create failed.");
    }
  }

  async function submitEquipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOperation || !authToken) {
      return;
    }
    const form = new FormData(event.currentTarget);
    const runUnits = formText(form, "runUnits");
    const runTimeMinutes = formText(form, "runTimeMinutes");
    try {
      await createBomOperationEquipment(authToken, selectedOperation.operation.id, {
        equipmentId: formText(form, "equipmentId"),
        isPrimary: form.get("isPrimary") === "on",
        required: form.get("required") === "on",
        setupTimeMinutes: Number(formText(form, "setupTimeMinutes")) || 0,
        runUnits: runUnits ? Number(runUnits) : null,
        runTimeMinutes: runTimeMinutes ? Number(runTimeMinutes) : null,
        cleaningTimeMinutes: Number(formText(form, "cleaningTimeMinutes")) || 0,
        notes: nullableFormText(form, "notes")
      });
      showToast({ title: "Equipment assigned", description: equipmentLabel(formText(form, "equipmentId")) });
      event.currentTarget.reset();
      await onReload();
    } catch (submitError) {
      onError(submitError instanceof Error ? submitError.message : "BOM equipment create failed.");
    }
  }

  if (!selectedBom) {
    return (
      <div className="table-panel">
        <div className="panel-heading">
          <h3>BOM editor</h3>
          <Badge tone="warning">No BOM</Badge>
        </div>
        <p>No BOM selected.</p>
      </div>
    );
  }

  return (
    <div className="bom-workspace">
      <section className="table-panel bom-header-panel">
        <div className="panel-heading">
          <h3>BOM editor</h3>
          <Badge tone="info"><ClipboardList aria-hidden="true" size={16} /> Versioned</Badge>
        </div>
        <div className="bom-header-grid">
          <label className="select-field">
            <span>Selected BOM</span>
            <select value={selectedBom.bom.id} onChange={(event) => onSelectBom(event.target.value)}>
              {boms.map((detail) => (
                <option key={detail.bom.id} value={detail.bom.id}>
                  {detail.bom.versionCode} / {detail.bom.status} / {detail.bom.yieldQuantity} {detail.bom.yieldUom}
                </option>
              ))}
            </select>
          </label>
          <div className="bom-status-strip">
            <Badge tone={statusTone(selectedBom.bom.status)}>{selectedBom.bom.status}</Badge>
            <span>{formatNumber(selectedBom.bom.yieldQuantity)} {selectedBom.bom.yieldUom}</span>
            <span>{operations.length} operation(s)</span>
            <span>{selectedBom.productionPlan ? `${formatNumber(selectedBom.productionPlan.totalElapsedMinutes)} min elapsed` : "No runtime"}</span>
          </div>
        </div>
        <BomProcessOverview
          bom={selectedBom}
          batches={batches}
          ebrTemplates={ebrTemplates}
          formulas={formulas}
          formatNumber={formatNumber}
        />
      </section>

      <section className="bom-definition-layout">
        <div className="table-panel">
          <div className="panel-heading">
            <h3>Operations</h3>
            <Badge tone={operations.length > 0 ? "success" : "warning"}>{operations.length} rows</Badge>
          </div>
          <div className="bom-operation-stack">
            {operations.map((entry) => {
              const operationRuntime = selectedBom.productionPlan?.operationRuntimes.find(
                (item) => item.bomOperationId === entry.operation.id
              );
              const workCenter = entry.workCenter ?? routingMasterData.workCenters.find((item) => item.id === entry.operation.workCenterId);
              const operationCode = entry.operationCode ?? routingMasterData.operationCodes.find((item) => item.id === entry.operation.operationCodeId);
              return (
                <button
                  className={`bom-operation-card${selectedOperation?.operation.id === entry.operation.id ? " selected" : ""}`}
                  key={entry.operation.id}
                  onClick={() => setSelectedOperationId(entry.operation.id)}
                  type="button"
                >
                  <span>
                    <strong>{entry.operation.operationId} / {operationCode?.code ?? entry.operation.operationCodeId}</strong>
                    <small>{workCenter?.name ?? entry.operation.workCenterId}</small>
                  </span>
                  <span>
                    <Badge tone={entry.operation.controlPoint ? "success" : "neutral"}>
                      {entry.operation.controlPoint ? "Control point" : entry.operation.runtimeBasis}
                    </Badge>
                    <small>{operationRuntime ? `${formatNumber(operationRuntime.totalElapsedMinutes)} min` : "Runtime pending"}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form className="table-panel bom-form-grid" onSubmit={submitOperation}>
          <div className="panel-heading">
            <h3>Add operation</h3>
            <Badge tone="info"><Timer aria-hidden="true" size={16} /> Runtime</Badge>
          </div>
          <Input label="Seq" name="sequence" type="number" min="1" step="1" defaultValue={String((operations.length + 1) * 10)} />
          <Input label="Operation ID" name="operationId" required defaultValue={String((operations.length + 1) * 10).padStart(3, "0")} />
          <label className="select-field">
            <span>Operation code</span>
            <select name="operationCodeId" defaultValue={routingMasterData.operationCodes[0]?.id ?? ""} required>
              {routingMasterData.operationCodes.map((operationCode) => (
                <option key={operationCode.id} value={operationCode.id}>{operationCode.code} / {operationCode.name}</option>
              ))}
            </select>
          </label>
          <label className="select-field">
            <span>Work center</span>
            <select name="workCenterId" defaultValue={routingMasterData.workCenters[0]?.id ?? ""} required>
              {routingMasterData.workCenters.map((workCenter) => (
                <option key={workCenter.id} value={workCenter.id}>{workCenter.code} / {workCenter.name}</option>
              ))}
            </select>
          </label>
          <label className="select-field">
            <span>Labor role</span>
            <select name="laborRoleId" defaultValue={routingMasterData.laborRoles[0]?.id ?? ""}>
              <option value="">None</option>
              {routingMasterData.laborRoles.map((role) => (
                <option key={role.id} value={role.id}>{role.code} / {role.name}</option>
              ))}
            </select>
          </label>
          <label className="select-field">
            <span>Runtime basis</span>
            <select name="runtimeBasis" defaultValue="mixed">
              <option value="manual">Manual</option>
              <option value="equipment">Equipment</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <Input label="Setup min" name="setupTimeMinutes" type="number" min="0" step="0.01" defaultValue="10" />
          <Input label="Run units" name="runUnits" type="number" min="0.000001" step="0.000001" defaultValue={String(selectedBom.bom.yieldQuantity)} />
          <Input label="Run min" name="runTimeMinutes" type="number" min="0" step="0.01" defaultValue="30" />
          <Input label="Machine units" name="machineUnits" type="number" min="0.000001" step="0.000001" />
          <Input label="Machine min" name="machineTimeMinutes" type="number" min="0" step="0.01" />
          <Input label="Queue min" name="queueTimeMinutes" type="number" min="0" step="0.01" defaultValue="0" />
          <Input label="Move min" name="moveTimeMinutes" type="number" min="0" step="0.01" defaultValue="0" />
          <Input label="Finish min" name="finishTimeMinutes" type="number" min="0" step="0.01" defaultValue="0" />
          <Input label="Crew" name="laborCrewSize" type="number" min="1" step="1" defaultValue="1" />
          <label className="select-field">
            <span>Scrap action</span>
            <select name="scrapAction" defaultValue="write_off">
              <option value="write_off">Write off</option>
              <option value="quarantine">Quarantine</option>
              <option value="rework">Rework</option>
            </select>
          </label>
          <Input label="Instructions" name="instructions" className="full-span" />
          <label className="checkbox-row">
            <input name="backflushLabor" type="checkbox" />
            <span>Backflush labor</span>
          </label>
          <label className="checkbox-row">
            <input name="controlPoint" type="checkbox" />
            <span>Control point</span>
          </label>
          <div className="form-actions full-span">
            <Button type="submit"><Save aria-hidden="true" size={18} />Add operation</Button>
          </div>
        </form>
      </section>

      {selectedOperation ? (
        <section className="bom-detail-grid">
          <div className="table-panel">
            <div className="panel-heading">
              <h3>Operation {selectedOperation.operation.operationId}</h3>
              <Badge tone={selectedOperation.operation.controlPoint ? "success" : "info"}>
                {selectedOperation.operation.controlPoint ? "Final control" : selectedOperation.operation.runtimeBasis}
              </Badge>
            </div>
            <div className="metric-grid bom-runtime-grid">
              <article className="metric-panel">
                <span>Elapsed</span>
                <strong>{runtime ? formatNumber(runtime.totalElapsedMinutes) : "0"} min</strong>
              </article>
              <article className="metric-panel">
                <span>Manual</span>
                <strong>{runtime ? formatNumber(runtime.totalManualMinutes) : "0"} min</strong>
              </article>
              <article className="metric-panel">
                <span>Machine</span>
                <strong>{runtime ? formatNumber(runtime.totalMachineMinutes) : "0"} min</strong>
              </article>
            </div>
            <div className="bom-subtables">
              <section>
                <h4>Steps</h4>
                <table className="list-table">
                  <thead><tr><th>Seq</th><th>Step</th><th>Controls</th></tr></thead>
                  <tbody>
                    {selectedOperation.steps.map((step) => (
                      <tr key={step.id}>
                        <td>{step.sequence}</td>
                        <td>{step.title}<div className="muted-line">{step.instructions}</div></td>
                        <td>{[step.isCritical ? "critical" : null, step.requiresSignature ? "signature" : null, step.requiresQcEntry ? "QC" : null].filter(Boolean).join(", ") || "standard"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <section>
                <h4>Materials</h4>
                <table className="list-table">
                  <thead><tr><th>Component</th><th>Qty</th><th>Issue</th></tr></thead>
                  <tbody>
                    {selectedOperation.materials.map((material) => (
                      <tr key={material.id}>
                        <td>{componentLabel(material.componentType, material.componentId)}</td>
                        <td>{formatNumber(material.quantity)} {material.uom}<div className="muted-line">{formatNumber(material.wastePercent)}% waste</div></td>
                        <td>{material.issueMethod}{material.lotTraceRequired ? " / lot trace" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <section>
                <h4>Equipment</h4>
                <table className="list-table">
                  <thead><tr><th>Equipment</th><th>Timing</th><th>Role</th></tr></thead>
                  <tbody>
                    {selectedOperation.equipment.map(({ requirement, equipment }) => (
                      <tr key={requirement.id}>
                        <td>{equipment ? `${equipment.code} / ${equipment.name}` : equipmentLabel(requirement.equipmentId)}</td>
                        <td>{formatNumber(requirement.setupTimeMinutes)} setup / {formatNumber(requirement.cleaningTimeMinutes)} clean</td>
                        <td>{requirement.isPrimary ? "Primary" : "Alternate"}{requirement.required ? " / required" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </div>

          <div className="bom-write-panel">
            <form className="table-panel bom-form-grid" onSubmit={submitStep}>
              <div className="panel-heading"><h3>Add step</h3><Badge tone="info">SOP</Badge></div>
              <Input label="Seq" name="sequence" type="number" min="1" step="1" defaultValue={String((selectedOperation.steps.length + 1) * 10)} />
              <Input label="Title" name="title" required />
              <Input label="Instructions" name="instructions" required className="full-span" />
              <label className="checkbox-row"><input name="isCritical" type="checkbox" /><span>Critical</span></label>
              <label className="checkbox-row"><input name="requiresSignature" type="checkbox" /><span>Signature</span></label>
              <label className="checkbox-row"><input name="requiresQcEntry" type="checkbox" /><span>QC entry</span></label>
              <div className="form-actions full-span"><Button type="submit"><Save aria-hidden="true" size={18} />Add step</Button></div>
            </form>

            <form className="table-panel bom-form-grid" onSubmit={submitMaterial}>
              <div className="panel-heading"><h3>Add material</h3><Badge tone="info">Per operation</Badge></div>
              <label className="select-field full-span">
                <span>Component</span>
                <select name="componentRef" required defaultValue={componentOptions[0]?.value ?? ""}>
                  {componentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="select-field">
                <span>Line type</span>
                <select name="lineType" defaultValue="ingredient">
                  <option value="ingredient">Ingredient</option>
                  <option value="extract">Extract</option>
                  <option value="packaging">Packaging</option>
                  <option value="wip">WIP</option>
                </select>
              </label>
              <label className="select-field">
                <span>Issue</span>
                <select name="issueMethod" defaultValue="manual">
                  <option value="manual">Manual</option>
                  <option value="backflush">Backflush</option>
                </select>
              </label>
              <Input label="Quantity" name="quantity" type="number" min="0.000001" step="0.000001" defaultValue="1" />
              <Input label="UOM" name="uom" defaultValue="each" />
              <Input label="Waste %" name="wastePercent" type="number" min="0" step="0.01" defaultValue="0" />
              <label className="checkbox-row"><input name="isCritical" type="checkbox" defaultChecked /><span>Critical</span></label>
              <label className="checkbox-row"><input name="lotTraceRequired" type="checkbox" defaultChecked /><span>Lot trace</span></label>
              <div className="form-actions full-span"><Button type="submit"><Save aria-hidden="true" size={18} />Add material</Button></div>
            </form>

            <form className="table-panel bom-form-grid" onSubmit={submitEquipment}>
              <div className="panel-heading"><h3>Add equipment</h3><Badge tone="info"><Wrench aria-hidden="true" size={16} /> Catalog</Badge></div>
              <label className="select-field full-span">
                <span>Equipment</span>
                <select name="equipmentId" required defaultValue={routingMasterData.equipment[0]?.id ?? ""}>
                  {routingMasterData.equipment.map((equipment) => (
                    <option key={equipment.id} value={equipment.id}>{equipment.code} / {equipment.name} / {equipment.status}</option>
                  ))}
                </select>
              </label>
              <Input label="Setup min" name="setupTimeMinutes" type="number" min="0" step="0.01" defaultValue="0" />
              <Input label="Run units" name="runUnits" type="number" min="0.000001" step="0.000001" />
              <Input label="Run min" name="runTimeMinutes" type="number" min="0" step="0.01" />
              <Input label="Clean min" name="cleaningTimeMinutes" type="number" min="0" step="0.01" defaultValue="0" />
              <Input label="Notes" name="notes" className="full-span" />
              <label className="checkbox-row"><input name="isPrimary" type="checkbox" defaultChecked /><span>Primary</span></label>
              <label className="checkbox-row"><input name="required" type="checkbox" defaultChecked /><span>Required</span></label>
              <div className="form-actions full-span"><Button type="submit"><Save aria-hidden="true" size={18} />Add equipment</Button></div>
            </form>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function BomProcessOverview({
  bom,
  batches,
  ebrTemplates,
  formulas,
  formatNumber
}: {
  bom: BillOfMaterialsDetail | null;
  batches: ProcessingBatchDetail[];
  ebrTemplates: EbrTemplateDetail[];
  formulas: FormulaRevisionDetail[];
  formatNumber: (value: number) => string;
}) {
  if (!bom) {
    return <p>No BOM selected.</p>;
  }

  const formula = formulas.find((detail) => detail.revision.id === bom.bom.formulaRevisionId) ?? null;
  const template = ebrTemplates.find((detail) => detail.template.bomId === bom.bom.id) ?? null;
  const relatedBatches = batches.filter((detail) => detail.batch.processParamsJson.bomId === bom.bom.id);
  const criticalLines = bom.lines.filter((line) => line.isCritical);
  const packagingLines = bom.lines.filter((line) => line.lineType === "packaging");

  return (
    <section className="process-overview" aria-label="Selected BOM process overview">
      <article>
        <span>Output</span>
        <strong>{formatNumber(bom.bom.yieldQuantity)} {bom.bom.yieldUom}</strong>
        <small>{bom.bom.status} / {bom.bom.versionCode}</small>
      </article>
      <article>
        <span>Formula control</span>
        <strong>{formula ? `${formula.family.code} ${formula.revision.revisionCode}` : "Not linked"}</strong>
        <small>{formula?.revision.status ?? "No formula status"}</small>
      </article>
      <article>
        <span>Process record</span>
        <strong>{template?.template.name ?? "No EBR template"}</strong>
        <small>{template ? `${template.steps.length} steps / ${template.template.status}` : "Create an EBR template before release"}</small>
      </article>
      <article>
        <span>Material controls</span>
        <strong>{formatNumber(criticalLines.length)} critical</strong>
        <small>{formatNumber(packagingLines.length)} packaging line(s)</small>
      </article>
      <article>
        <span>Batch orders</span>
        <strong>{formatNumber(relatedBatches.length)}</strong>
        <small>{relatedBatches.map((detail) => detail.batch.batchCode).join(", ") || "None created from this BOM yet"}</small>
      </article>
    </section>
  );
}
