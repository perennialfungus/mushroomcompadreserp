import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  History,
  Link2,
  PlusCircle,
  RefreshCw,
  Save,
  Scale,
  Settings2,
  Zap,
  Wrench
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Badge, Button, Input, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import { useI18n } from "./i18n/I18nProvider";
import {
  createEquipment,
  getEquipmentDashboard,
  listRoutingMasterData,
  recordEquipmentCalibration,
  recordEquipmentMaintenance
} from "./lib/api";
import type { Equipment, EquipmentDashboard, RoutingMasterData } from "./types";

function statusTone(status: string): "neutral" | "success" | "warning" | "info" {
  if (status === "available" || status === "completed") {
    return "success";
  }
  if (status === "in_use" || status === "scheduled") {
    return "info";
  }
  if (status === "maintenance" || status === "overdue" || status.includes("due")) {
    return "warning";
  }
  return "neutral";
}

function alertTone(severity: string): "neutral" | "success" | "warning" | "info" {
  return severity === "critical" || severity === "warning" ? "warning" : "info";
}

const equipmentTypes: Equipment["equipmentType"][] = [
  "scale",
  "dehydrator",
  "extraction",
  "bottling",
  "packaging",
  "refrigerator",
  "freezer",
  "printer",
  "other"
];

const equipmentStatuses: Equipment["status"][] = ["available", "in_use", "maintenance", "offline", "unavailable"];

type EquipmentMetadata = {
  manufacturer?: string | undefined;
  model?: string | undefined;
  assetTag?: string | undefined;
  oemContact?: {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    url?: string | undefined;
  };
  purchaseOrder?: {
    number?: string | undefined;
    url?: string | undefined;
  };
  maintenanceReminderDays?: number | null;
  maintenanceRemindersEnabled?: boolean;
  power?: {
    requirements?: string | undefined;
    voltage?: string | undefined;
    amperage?: string | undefined;
    phase?: string | undefined;
    plugType?: string | undefined;
    breaker?: string | undefined;
  };
  filter?: {
    name?: string | undefined;
    url?: string | undefined;
  };
  links?: {
    otherUrl?: string | undefined;
    sopUrl?: string | undefined;
  };
  lifecycle?: {
    installDate?: string | undefined;
    commissionedAt?: string | undefined;
    warrantyExpiresAt?: string | undefined;
    criticality?: string | undefined;
    owner?: string | undefined;
    locationDescription?: string | undefined;
    validationStatus?: string | undefined;
  };
  documents?: Array<{
    documentType: string;
    fileName: string;
    contentType: string;
    size: number;
  }>;
  sparesAndConsumables?: string | undefined;
  cleaningProcedure?: string | undefined;
  notes?: string | undefined;
};

type NewEquipmentForm = {
  code: string;
  name: string;
  workCenterId: string;
  equipmentType: Equipment["equipmentType"];
  status: Equipment["status"];
  serialNumber: string;
  manufacturer: string;
  model: string;
  assetTag: string;
  oemContactName: string;
  oemEmail: string;
  oemPhone: string;
  oemSupportUrl: string;
  purchaseOrderNumber: string;
  purchaseOrderUrl: string;
  maintenanceFrequencyDays: string;
  maintenanceReminderDays: string;
  maintenanceRemindersEnabled: boolean;
  nextMaintenanceDueAt: string;
  calibrationRequired: boolean;
  calibrationIntervalDays: string;
  nextCalibrationDueAt: string;
  powerRequirements: string;
  voltage: string;
  amperage: string;
  phase: string;
  plugType: string;
  breaker: string;
  filterTypeName: string;
  filterTypeUrl: string;
  otherUrl: string;
  sopUrl: string;
  installDate: string;
  commissionedAt: string;
  warrantyExpiresAt: string;
  criticality: string;
  owner: string;
  locationDescription: string;
  validationStatus: string;
  sparesAndConsumables: string;
  cleaningProcedure: string;
  notes: string;
};

const blankNewEquipmentForm: NewEquipmentForm = {
  code: "",
  name: "",
  workCenterId: "",
  equipmentType: "other",
  status: "available",
  serialNumber: "",
  manufacturer: "",
  model: "",
  assetTag: "",
  oemContactName: "",
  oemEmail: "",
  oemPhone: "",
  oemSupportUrl: "",
  purchaseOrderNumber: "",
  purchaseOrderUrl: "",
  maintenanceFrequencyDays: "90",
  maintenanceReminderDays: "14",
  maintenanceRemindersEnabled: true,
  nextMaintenanceDueAt: "",
  calibrationRequired: false,
  calibrationIntervalDays: "",
  nextCalibrationDueAt: "",
  powerRequirements: "",
  voltage: "",
  amperage: "",
  phase: "",
  plugType: "",
  breaker: "",
  filterTypeName: "",
  filterTypeUrl: "",
  otherUrl: "",
  sopUrl: "",
  installDate: "",
  commissionedAt: "",
  warrantyExpiresAt: "",
  criticality: "medium",
  owner: "",
  locationDescription: "",
  validationStatus: "not_required",
  sparesAndConsumables: "",
  cleaningProcedure: "",
  notes: ""
};

function positiveIntegerOrNull(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function dateTimeLocalToIso(value: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function dateToIsoDate(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function dueAtFromInterval(days: number | null): string | null {
  if (!days) {
    return null;
  }
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function textOrUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function metadataForForm(form: NewEquipmentForm, documentFiles: File[]): EquipmentMetadata {
  return {
    manufacturer: textOrUndefined(form.manufacturer),
    model: textOrUndefined(form.model),
    assetTag: textOrUndefined(form.assetTag),
    oemContact: {
      name: textOrUndefined(form.oemContactName),
      email: textOrUndefined(form.oemEmail),
      phone: textOrUndefined(form.oemPhone),
      url: textOrUndefined(form.oemSupportUrl)
    },
    purchaseOrder: {
      number: textOrUndefined(form.purchaseOrderNumber),
      url: textOrUndefined(form.purchaseOrderUrl)
    },
    maintenanceReminderDays: positiveIntegerOrNull(form.maintenanceReminderDays),
    maintenanceRemindersEnabled: form.maintenanceRemindersEnabled,
    power: {
      requirements: textOrUndefined(form.powerRequirements),
      voltage: textOrUndefined(form.voltage),
      amperage: textOrUndefined(form.amperage),
      phase: textOrUndefined(form.phase),
      plugType: textOrUndefined(form.plugType),
      breaker: textOrUndefined(form.breaker)
    },
    filter: {
      name: textOrUndefined(form.filterTypeName),
      url: textOrUndefined(form.filterTypeUrl)
    },
    links: {
      otherUrl: textOrUndefined(form.otherUrl),
      sopUrl: textOrUndefined(form.sopUrl)
    },
    lifecycle: {
      installDate: dateToIsoDate(form.installDate),
      commissionedAt: dateToIsoDate(form.commissionedAt),
      warrantyExpiresAt: dateToIsoDate(form.warrantyExpiresAt),
      criticality: form.criticality,
      owner: textOrUndefined(form.owner),
      locationDescription: textOrUndefined(form.locationDescription),
      validationStatus: form.validationStatus
    },
    documents: documentFiles.map((file) => ({
      documentType: inferDocumentType(file.name),
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size
    })),
    sparesAndConsumables: textOrUndefined(form.sparesAndConsumables),
    cleaningProcedure: textOrUndefined(form.cleaningProcedure),
    notes: textOrUndefined(form.notes)
  };
}

function inferDocumentType(fileName: string): string {
  const lower = fileName.toLocaleLowerCase();
  if (lower.includes("sds")) {
    return "SDS";
  }
  if (lower.includes("tds")) {
    return "TDS";
  }
  if (lower.includes("manual")) {
    return "manual";
  }
  if (lower.includes("warranty")) {
    return "warranty";
  }
  return "equipment_document";
}

function equipmentMetadata(equipment: Equipment): EquipmentMetadata {
  return equipment.metadataJson as EquipmentMetadata;
}

export function EquipmentScreen() {
  const auth = useAuth();
  const { formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<EquipmentDashboard | null>(null);
  const [workCenters, setWorkCenters] = useState<RoutingMasterData["workCenters"]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("equip-scale-01");
  const [newEquipment, setNewEquipment] = useState<NewEquipmentForm>(blankNewEquipmentForm);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [calibrationDueAt, setCalibrationDueAt] = useState("2026-07-27T08:00");
  const [calibrationNotes, setCalibrationNotes] = useState("Monthly calibration passed with check weights.");
  const [maintenanceSummary, setMaintenanceSummary] = useState("Clean filters and verify airflow.");
  const [maintenanceDueAt, setMaintenanceDueAt] = useState("2026-08-27T08:00");
  const [error, setError] = useState<string | null>(null);

  const equipment = dashboard?.equipment ?? [];
  const selectedEquipment = equipment.find((candidate) => candidate.id === selectedEquipmentId) ?? equipment[0] ?? null;
  const criticalAlerts = dashboard?.alerts.filter((alert) => alert.severity === "critical").length ?? 0;
  const scales = equipment.filter((item) => item.equipmentType === "scale").length;
  const dueCalibrations = dashboard?.alerts.filter((alert) => alert.alertType.startsWith("calibration")).length ?? 0;

  const equipmentById = useMemo(
    () => new Map(equipment.map((item) => [item.id, item] as const)),
    [equipment]
  );

  async function loadDashboard() {
    if (!auth.session) {
      return;
    }
    setError(null);
    try {
      const [response, masterData] = await Promise.all([
        getEquipmentDashboard(auth.session.accessToken),
        listRoutingMasterData(auth.session.accessToken)
      ]);
      setDashboard(response.dashboard);
      setWorkCenters(masterData.workCenters);
      setNewEquipment((current) => ({
        ...current,
        workCenterId: current.workCenterId || masterData.workCenters[0]?.id || ""
      }));
      setSelectedEquipmentId((current) =>
        response.dashboard.equipment.some((item) => item.id === current) ? current : response.dashboard.equipment[0]?.id ?? ""
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Equipment dashboard could not be loaded.");
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, [auth.session]);

  function updateNewEquipment<K extends keyof NewEquipmentForm>(key: K, value: NewEquipmentForm[K]) {
    setNewEquipment((current) => ({ ...current, [key]: value }));
  }

  async function submitNewEquipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }
    const maintenanceIntervalDays = positiveIntegerOrNull(newEquipment.maintenanceFrequencyDays);
    const calibrationIntervalDays = positiveIntegerOrNull(newEquipment.calibrationIntervalDays);
    const nextMaintenanceDueAt =
      dateTimeLocalToIso(newEquipment.nextMaintenanceDueAt) ?? dueAtFromInterval(maintenanceIntervalDays);
    const nextCalibrationDueAt =
      dateTimeLocalToIso(newEquipment.nextCalibrationDueAt) ??
      (newEquipment.calibrationRequired ? dueAtFromInterval(calibrationIntervalDays) : null);

    try {
      const response = await createEquipment(auth.session.accessToken, {
        code: newEquipment.code,
        name: newEquipment.name,
        workCenterId: newEquipment.workCenterId,
        equipmentType: newEquipment.equipmentType,
        status: newEquipment.status,
        serialNumber: newEquipment.serialNumber || null,
        calibrationRequired: newEquipment.calibrationRequired,
        calibrationIntervalDays,
        maintenanceIntervalDays,
        nextCalibrationDueAt,
        nextMaintenanceDueAt,
        metadataJson: metadataForForm(newEquipment, documentFiles)
      });
      await loadDashboard();
      setSelectedEquipmentId(response.equipment.id);
      setNewEquipment({
        ...blankNewEquipmentForm,
        workCenterId: newEquipment.workCenterId,
        maintenanceFrequencyDays: newEquipment.maintenanceFrequencyDays,
        maintenanceReminderDays: newEquipment.maintenanceReminderDays
      });
      setDocumentFiles([]);
      showToast({
        title: "Equipment created",
        description: `${response.equipment.code} is now tracked with maintenance reminders and documents.`
      });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Equipment could not be created.");
    }
  }

  async function submitCalibration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedEquipment) {
      return;
    }
    const response = await recordEquipmentCalibration(auth.session.accessToken, {
      equipmentId: selectedEquipment.id,
      completedAt: new Date().toISOString(),
      dueAt: new Date(calibrationDueAt).toISOString(),
      result: "pass",
      certificateFileName: `${selectedEquipment.code}-calibration.pdf`,
      notes: calibrationNotes
    });
    setDashboard(response.dashboard);
    showToast({ title: "Calibration recorded", description: `${selectedEquipment.code} is ready for critical use.` });
  }

  async function submitMaintenance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedEquipment) {
      return;
    }
    const response = await recordEquipmentMaintenance(auth.session.accessToken, {
      equipmentId: selectedEquipment.id,
      serviceType: "preventive_maintenance",
      completedAt: new Date().toISOString(),
      dueAt: new Date(maintenanceDueAt).toISOString(),
      summary: maintenanceSummary,
      notes: "Recorded from equipment maintenance log."
    });
    setDashboard(response.dashboard);
    showToast({ title: "Maintenance recorded", description: `${selectedEquipment.code} service log updated.` });
  }

  return (
    <section className="screen-grid" aria-labelledby="equipment-title">
      <div className="screen-heading">
        <p className="eyebrow">Equipment</p>
        <h2 id="equipment-title">Equipment readiness and calibration</h2>
        <p>Critical production and weigh steps are blocked when assigned equipment is unavailable or calibration is expired.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="metric-grid">
        <article className="metric-panel">
          <span>Equipment records</span>
          <strong>{formatNumber(equipment.length)}</strong>
        </article>
        <article className="metric-panel">
          <span>Scales</span>
          <strong>{formatNumber(scales)}</strong>
        </article>
        <article className="metric-panel">
          <span>Calibration alerts</span>
          <strong>{formatNumber(dueCalibrations)}</strong>
        </article>
        <article className="metric-panel">
          <span>Critical alerts</span>
          <strong>{formatNumber(criticalAlerts)}</strong>
        </article>
      </div>

      <Tabs
        tabs={[
          {
            id: "dashboard",
            label: "Dashboard",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Due and overdue alerts</h3>
                  <Button type="button" size="sm" variant="secondary" onClick={() => void loadDashboard()}>
                    <RefreshCw aria-hidden="true" size={16} />
                    Refresh
                  </Button>
                </div>
                <table className="list-table">
                  <thead><tr><th>Equipment</th><th>Alert</th><th>Due</th><th>Severity</th></tr></thead>
                  <tbody>
                    {(dashboard?.alerts ?? []).map((alert) => (
                      <tr key={alert.id}>
                        <td>
                          <strong>{alert.equipmentCode}</strong>
                          <span>{alert.equipmentName}</span>
                        </td>
                        <td>{alert.message}</td>
                        <td>{alert.dueAt ? formatDateTime(new Date(alert.dueAt)) : "Now"}</td>
                        <td><Badge tone={alertTone(alert.severity)}><AlertTriangle aria-hidden="true" size={16} /> {alert.severity}</Badge></td>
                      </tr>
                    ))}
                    {(dashboard?.alerts.length ?? 0) === 0 ? (
                      <tr><td colSpan={4}>No equipment alerts.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )
          },
          {
            id: "records",
            label: "Equipment",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Equipment list</h3>
                  <Badge tone="info"><Settings2 aria-hidden="true" size={16} /> {formatNumber(equipment.length)} assets</Badge>
                </div>
                <table className="list-table">
                  <thead><tr><th>Code</th><th>Type</th><th>Status</th><th>Calibration</th><th>Maintenance</th></tr></thead>
                  <tbody>
                    {equipment.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <button className="link-button" type="button" onClick={() => setSelectedEquipmentId(item.id)}>
                            {item.code}
                          </button>
                          <span>{item.name}</span>
                        </td>
                        <td>{item.equipmentType}</td>
                        <td><Badge tone={statusTone(item.status)}>{item.status.replaceAll("_", " ")}</Badge></td>
                        <td>{item.nextCalibrationDueAt ? formatDateTime(new Date(item.nextCalibrationDueAt)) : "Not required"}</td>
                        <td>{item.nextMaintenanceDueAt ? formatDateTime(new Date(item.nextMaintenanceDueAt)) : "Not scheduled"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedEquipment ? <EquipmentDetail equipment={selectedEquipment} /> : null}
              </div>
            )
          },
          {
            id: "add",
            label: "Add equipment",
            content: (
              <EquipmentCreateForm
                documentFiles={documentFiles}
                form={newEquipment}
                onDocumentFilesChange={setDocumentFiles}
                onSubmit={submitNewEquipment}
                onUpdate={updateNewEquipment}
                workCenters={workCenters}
              />
            )
          },
          {
            id: "calibration",
            label: "Calibration",
            content: (
              <div className="split-panel">
                <form className="table-panel compact-form-grid" onSubmit={submitCalibration}>
                  <div className="panel-heading">
                    <h3>Record calibration</h3>
                    <Badge tone="info"><Scale aria-hidden="true" size={16} /> Manual/mock scale</Badge>
                  </div>
                  <EquipmentSelect equipment={equipment} value={selectedEquipmentId} onChange={setSelectedEquipmentId} />
                  <Input label="Next due" type="datetime-local" value={calibrationDueAt} onChange={(event) => setCalibrationDueAt(event.target.value)} />
                  <Input label="Notes" value={calibrationNotes} onChange={(event) => setCalibrationNotes(event.target.value)} />
                  <Button type="submit" disabled={!selectedEquipment}>
                    <CheckCircle2 aria-hidden="true" size={18} />
                    Record calibration
                  </Button>
                </form>
                <RecordTable
                  title="Calibration calendar"
                  icon={<CalendarClock aria-hidden="true" size={16} />}
                  rows={(dashboard?.calibrations ?? []).map((record) => ({
                    id: record.id,
                    equipment: equipmentById.get(record.equipmentId),
                    status: record.status,
                    primary: record.result,
                    dueAt: record.dueAt,
                    completedAt: record.completedAt
                  }))}
                />
              </div>
            )
          },
          {
            id: "maintenance",
            label: "Maintenance",
            content: (
              <div className="split-panel">
                <form className="table-panel compact-form-grid" onSubmit={submitMaintenance}>
                  <div className="panel-heading">
                    <h3>Maintenance log</h3>
                    <Badge tone="warning"><Wrench aria-hidden="true" size={16} /> Service record</Badge>
                  </div>
                  <EquipmentSelect equipment={equipment} value={selectedEquipmentId} onChange={setSelectedEquipmentId} />
                  <Input label="Summary" value={maintenanceSummary} onChange={(event) => setMaintenanceSummary(event.target.value)} />
                  <Input label="Next due" type="datetime-local" value={maintenanceDueAt} onChange={(event) => setMaintenanceDueAt(event.target.value)} />
                  <Button type="submit" disabled={!selectedEquipment || !maintenanceSummary.trim()}>
                    <Wrench aria-hidden="true" size={18} />
                    Record maintenance
                  </Button>
                </form>
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Equipment events</h3>
                    <Badge tone="info"><History aria-hidden="true" size={16} /> {formatNumber(dashboard?.events.length ?? 0)}</Badge>
                  </div>
                  <table className="list-table">
                    <thead><tr><th>Equipment</th><th>Event</th><th>When</th></tr></thead>
                    <tbody>
                      {(dashboard?.events ?? []).map((event) => {
                        const item = equipmentById.get(event.equipmentId);
                        return (
                          <tr key={event.id}>
                            <td>{item?.code ?? event.equipmentId}</td>
                            <td>
                              <strong>{event.title}</strong>
                              <span>{event.eventType.replaceAll("_", " ")}</span>
                            </td>
                            <td>{formatDateTime(new Date(event.occurredAt))}</td>
                          </tr>
                        );
                      })}
                      {(dashboard?.events.length ?? 0) === 0 ? (
                        <tr><td colSpan={3}>No equipment events recorded yet.</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }
        ]}
      />
    </section>
  );
}

function EquipmentSelect({
  equipment,
  value,
  onChange
}: {
  equipment: Equipment[];
  value: string;
  onChange: (equipmentId: string) => void;
}) {
  return (
    <label className="select-field">
      <span>Equipment</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {equipment.map((item) => (
          <option key={item.id} value={item.id}>
            {item.code} / {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function EquipmentCreateForm({
  documentFiles,
  form,
  onDocumentFilesChange,
  onSubmit,
  onUpdate,
  workCenters
}: {
  documentFiles: File[];
  form: NewEquipmentForm;
  onDocumentFilesChange: (files: File[]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdate: <K extends keyof NewEquipmentForm>(key: K, value: NewEquipmentForm[K]) => void;
  workCenters: RoutingMasterData["workCenters"];
}) {
  return (
    <form className="table-panel equipment-create-form" onSubmit={onSubmit}>
      <div className="panel-heading equipment-form-heading">
        <h3>New equipment record</h3>
        <Badge tone="info"><PlusCircle aria-hidden="true" size={16} /> Asset intake</Badge>
      </div>

      <h4 className="form-section-title"><ClipboardList aria-hidden="true" size={16} /> Identity</h4>
      <Input label="Equipment code" required value={form.code} onChange={(event) => onUpdate("code", event.target.value)} />
      <Input label="Equipment name" required value={form.name} onChange={(event) => onUpdate("name", event.target.value)} />
      <label className="select-field">
        <span>Work center</span>
        <select required value={form.workCenterId} onChange={(event) => onUpdate("workCenterId", event.target.value)}>
          <option value="">Select work center</option>
          {workCenters.map((workCenter) => (
            <option key={workCenter.id} value={workCenter.id}>
              {workCenter.code} / {workCenter.name}
            </option>
          ))}
        </select>
      </label>
      <label className="select-field">
        <span>Equipment type</span>
        <select
          value={form.equipmentType}
          onChange={(event) => {
            const equipmentType = event.target.value as Equipment["equipmentType"];
            onUpdate("equipmentType", equipmentType);
            if (equipmentType === "scale") {
              onUpdate("calibrationRequired", true);
              onUpdate("calibrationIntervalDays", form.calibrationIntervalDays || "30");
            }
          }}
        >
          {equipmentTypes.map((type) => (
            <option key={type} value={type}>{type.replaceAll("_", " ")}</option>
          ))}
        </select>
      </label>
      <label className="select-field">
        <span>Status</span>
        <select value={form.status} onChange={(event) => onUpdate("status", event.target.value as Equipment["status"])}>
          {equipmentStatuses.map((status) => (
            <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
          ))}
        </select>
      </label>
      <Input label="Serial number" value={form.serialNumber} onChange={(event) => onUpdate("serialNumber", event.target.value)} />
      <Input label="Manufacturer" value={form.manufacturer} onChange={(event) => onUpdate("manufacturer", event.target.value)} />
      <Input label="Model" value={form.model} onChange={(event) => onUpdate("model", event.target.value)} />
      <Input label="Asset tag" value={form.assetTag} onChange={(event) => onUpdate("assetTag", event.target.value)} />

      <h4 className="form-section-title"><Link2 aria-hidden="true" size={16} /> OEM and purchasing</h4>
      <Input label="OEM contact name" value={form.oemContactName} onChange={(event) => onUpdate("oemContactName", event.target.value)} />
      <Input label="OEM email" type="email" value={form.oemEmail} onChange={(event) => onUpdate("oemEmail", event.target.value)} />
      <Input label="OEM phone" type="tel" value={form.oemPhone} onChange={(event) => onUpdate("oemPhone", event.target.value)} />
      <Input label="OEM support URL" type="url" value={form.oemSupportUrl} onChange={(event) => onUpdate("oemSupportUrl", event.target.value)} />
      <Input label="Purchase order number" value={form.purchaseOrderNumber} onChange={(event) => onUpdate("purchaseOrderNumber", event.target.value)} />
      <Input label="Purchase order link" type="url" value={form.purchaseOrderUrl} onChange={(event) => onUpdate("purchaseOrderUrl", event.target.value)} />

      <h4 className="form-section-title"><Wrench aria-hidden="true" size={16} /> Maintenance and reminders</h4>
      <Input label="Maintenance frequency days" type="number" min="1" value={form.maintenanceFrequencyDays} onChange={(event) => onUpdate("maintenanceFrequencyDays", event.target.value)} />
      <Input label="Reminder lead days" type="number" min="1" value={form.maintenanceReminderDays} onChange={(event) => onUpdate("maintenanceReminderDays", event.target.value)} />
      <Input label="Next maintenance due" type="datetime-local" value={form.nextMaintenanceDueAt} onChange={(event) => onUpdate("nextMaintenanceDueAt", event.target.value)} />
      <div className="checkbox-grid">
        <label>
          <input
            checked={form.maintenanceRemindersEnabled}
            type="checkbox"
            onChange={(event) => onUpdate("maintenanceRemindersEnabled", event.target.checked)}
          />
          Maintenance reminders
        </label>
      </div>
      <div className="checkbox-grid">
        <label>
          <input
            checked={form.calibrationRequired}
            type="checkbox"
            onChange={(event) => onUpdate("calibrationRequired", event.target.checked)}
          />
          Calibration required
        </label>
      </div>
      <Input label="Calibration interval days" type="number" min="1" value={form.calibrationIntervalDays} onChange={(event) => onUpdate("calibrationIntervalDays", event.target.value)} />
      <Input label="Next calibration due" type="datetime-local" value={form.nextCalibrationDueAt} onChange={(event) => onUpdate("nextCalibrationDueAt", event.target.value)} />

      <h4 className="form-section-title"><Zap aria-hidden="true" size={16} /> Power and add-ons</h4>
      <Input label="Power requirements" value={form.powerRequirements} onChange={(event) => onUpdate("powerRequirements", event.target.value)} />
      <Input label="Voltage" value={form.voltage} onChange={(event) => onUpdate("voltage", event.target.value)} />
      <Input label="Amperage" value={form.amperage} onChange={(event) => onUpdate("amperage", event.target.value)} />
      <Input label="Phase" value={form.phase} onChange={(event) => onUpdate("phase", event.target.value)} />
      <Input label="Plug type" value={form.plugType} onChange={(event) => onUpdate("plugType", event.target.value)} />
      <Input label="Breaker" value={form.breaker} onChange={(event) => onUpdate("breaker", event.target.value)} />
      <Input label="Filter type" value={form.filterTypeName} onChange={(event) => onUpdate("filterTypeName", event.target.value)} />
      <Input label="Filter link" type="url" value={form.filterTypeUrl} onChange={(event) => onUpdate("filterTypeUrl", event.target.value)} />

      <h4 className="form-section-title"><FileText aria-hidden="true" size={16} /> Documents and lifecycle</h4>
      <Input label="SOP link" type="url" value={form.sopUrl} onChange={(event) => onUpdate("sopUrl", event.target.value)} />
      <Input label="Other URL" type="url" value={form.otherUrl} onChange={(event) => onUpdate("otherUrl", event.target.value)} />
      <Input label="Install date" type="date" value={form.installDate} onChange={(event) => onUpdate("installDate", event.target.value)} />
      <Input label="Commissioned date" type="date" value={form.commissionedAt} onChange={(event) => onUpdate("commissionedAt", event.target.value)} />
      <Input label="Warranty expires" type="date" value={form.warrantyExpiresAt} onChange={(event) => onUpdate("warrantyExpiresAt", event.target.value)} />
      <label className="select-field">
        <span>Criticality</span>
        <select value={form.criticality} onChange={(event) => onUpdate("criticality", event.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </label>
      <Input label="Asset owner" value={form.owner} onChange={(event) => onUpdate("owner", event.target.value)} />
      <Input label="Location notes" value={form.locationDescription} onChange={(event) => onUpdate("locationDescription", event.target.value)} />
      <label className="select-field">
        <span>Validation status</span>
        <select value={form.validationStatus} onChange={(event) => onUpdate("validationStatus", event.target.value)}>
          <option value="not_required">Not required</option>
          <option value="needed">Needed</option>
          <option value="qualified">Qualified</option>
          <option value="expired">Expired</option>
        </select>
      </label>
      <label className="input-field">
        <span>Documents</span>
        <input
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
          multiple
          type="file"
          onChange={(event) => onDocumentFilesChange(Array.from(event.currentTarget.files ?? []))}
        />
        <small>SDS, TDS, manuals, warranties, validation, and service docs are tracked on the asset.</small>
      </label>
      {documentFiles.length > 0 ? (
        <ul className="document-upload-list full-span">
          {documentFiles.map((file) => (
            <li key={`${file.name}-${file.size}`}>
              <FileText aria-hidden="true" size={16} />
              {inferDocumentType(file.name)} / {file.name}
            </li>
          ))}
        </ul>
      ) : null}
      <label className="input-field full-span">
        <span>Spare parts and consumables</span>
        <textarea rows={3} value={form.sparesAndConsumables} onChange={(event) => onUpdate("sparesAndConsumables", event.target.value)} />
      </label>
      <label className="input-field full-span">
        <span>Cleaning or sanitation procedure</span>
        <textarea rows={3} value={form.cleaningProcedure} onChange={(event) => onUpdate("cleaningProcedure", event.target.value)} />
      </label>
      <label className="input-field full-span">
        <span>Notes</span>
        <textarea rows={3} value={form.notes} onChange={(event) => onUpdate("notes", event.target.value)} />
      </label>
      <div className="form-actions full-span">
        <Button type="submit" disabled={!form.code.trim() || !form.name.trim() || !form.workCenterId}>
          <Save aria-hidden="true" size={18} />
          Create equipment
        </Button>
      </div>
    </form>
  );
}

function EquipmentDetail({ equipment }: { equipment: Equipment }) {
  const metadata = equipmentMetadata(equipment);
  const documents = metadata.documents ?? [];
  return (
    <div className="equipment-detail-stack">
      <dl className="sync-metrics">
        <div><dt>Selected</dt><dd>{equipment.name}</dd></div>
        <div><dt>Serial</dt><dd>{equipment.serialNumber ?? "Not recorded"}</dd></div>
        <div><dt>Manufacturer</dt><dd>{metadata.manufacturer ?? "Not recorded"}</dd></div>
        <div><dt>Model</dt><dd>{metadata.model ?? "Not recorded"}</dd></div>
        <div><dt>Asset tag</dt><dd>{metadata.assetTag ?? "Not recorded"}</dd></div>
        <div><dt>Criticality</dt><dd>{metadata.lifecycle?.criticality ?? "Not assigned"}</dd></div>
        <div><dt>Maintenance cadence</dt><dd>{equipment.maintenanceIntervalDays ? `${equipment.maintenanceIntervalDays} days` : "Not scheduled"}</dd></div>
        <div><dt>Reminder lead</dt><dd>{metadata.maintenanceReminderDays ? `${metadata.maintenanceReminderDays} days` : "Default"}</dd></div>
        <div><dt>Calibration required</dt><dd>{equipment.calibrationRequired ? "Yes" : "No"}</dd></div>
        <div><dt>Power</dt><dd>{metadata.power?.requirements ?? metadata.power?.voltage ?? "Not recorded"}</dd></div>
      </dl>
      <dl className="sync-metrics">
        <div><dt>OEM</dt><dd>{metadata.oemContact?.name ?? "Not recorded"}</dd></div>
        <div><dt>OEM email</dt><dd>{metadata.oemContact?.email ?? "Not recorded"}</dd></div>
        <div><dt>PO</dt><dd>{metadata.purchaseOrder?.number ?? "Not recorded"}</dd></div>
        <div><dt>Filter</dt><dd>{metadata.filter?.name ?? "Not recorded"}</dd></div>
        <div><dt>Owner</dt><dd>{metadata.lifecycle?.owner ?? "Not assigned"}</dd></div>
        <div><dt>Validation</dt><dd>{metadata.lifecycle?.validationStatus?.replaceAll("_", " ") ?? "Not required"}</dd></div>
        <div><dt>Documents</dt><dd>{documents.length > 0 ? `${documents.length} file${documents.length === 1 ? "" : "s"}` : "None uploaded"}</dd></div>
        <div><dt>Scale adapter</dt><dd>{equipment.equipmentType === "scale" ? "Manual/mock ready" : "Not a scale"}</dd></div>
      </dl>
      <div className="equipment-link-row">
        <EquipmentLink label="PO link" url={metadata.purchaseOrder?.url} />
        <EquipmentLink label="OEM support" url={metadata.oemContact?.url} />
        <EquipmentLink label="Filter link" url={metadata.filter?.url} />
        <EquipmentLink label="SOP" url={metadata.links?.sopUrl} />
        <EquipmentLink label="Other" url={metadata.links?.otherUrl} />
      </div>
      {metadata.sparesAndConsumables || metadata.cleaningProcedure || metadata.notes ? (
        <div className="equipment-notes-grid">
          {metadata.sparesAndConsumables ? <p><strong>Spares</strong>{metadata.sparesAndConsumables}</p> : null}
          {metadata.cleaningProcedure ? <p><strong>Cleaning</strong>{metadata.cleaningProcedure}</p> : null}
          {metadata.notes ? <p><strong>Notes</strong>{metadata.notes}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function EquipmentLink({ label, url }: { label: string; url: string | undefined }) {
  if (!url) {
    return null;
  }
  return (
    <a className="detail-link" href={url} rel="noreferrer" target="_blank">
      <Link2 aria-hidden="true" size={16} />
      {label}
    </a>
  );
}

function RecordTable({
  title,
  icon,
  rows
}: {
  title: string;
  icon: ReactNode;
  rows: Array<{
    id: string;
    equipment: Equipment | undefined;
    status: string;
    primary: string;
    dueAt: string;
    completedAt: string | null;
  }>;
}) {
  const { formatDateTime } = useI18n();
  return (
    <div className="table-panel">
      <div className="panel-heading">
        <h3>{title}</h3>
        <Badge tone="info">{icon} {rows.length}</Badge>
      </div>
      <table className="list-table">
        <thead><tr><th>Equipment</th><th>Status</th><th>Result</th><th>Due</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.equipment?.code ?? "Unknown"}</td>
              <td><Badge tone={statusTone(row.status)}>{row.status}</Badge></td>
              <td>{row.primary}</td>
              <td>{formatDateTime(new Date(row.dueAt))}</td>
            </tr>
          ))}
          {rows.length === 0 ? <tr><td colSpan={4}>No records yet.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}
