import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  History,
  RefreshCw,
  Scale,
  Settings2,
  Wrench
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Badge, Button, Input, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import { useI18n } from "./i18n/I18nProvider";
import {
  getEquipmentDashboard,
  recordEquipmentCalibration,
  recordEquipmentMaintenance
} from "./lib/api";
import type { Equipment, EquipmentDashboard } from "./types";

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

export function EquipmentScreen() {
  const auth = useAuth();
  const { formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<EquipmentDashboard | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("equip-scale-01");
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
      const response = await getEquipmentDashboard(auth.session.accessToken);
      setDashboard(response.dashboard);
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

function EquipmentDetail({ equipment }: { equipment: Equipment }) {
  return (
    <dl className="sync-metrics">
      <div><dt>Selected</dt><dd>{equipment.name}</dd></div>
      <div><dt>Serial</dt><dd>{equipment.serialNumber ?? "Not recorded"}</dd></div>
      <div><dt>Calibration required</dt><dd>{equipment.calibrationRequired ? "Yes" : "No"}</dd></div>
      <div><dt>Scale adapter</dt><dd>{equipment.equipmentType === "scale" ? "Manual/mock ready" : "Not a scale"}</dd></div>
    </dl>
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
