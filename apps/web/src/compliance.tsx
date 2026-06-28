import { AlertTriangle, CheckCircle2, FileText, GraduationCap, PackageCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "./auth";
import { Badge, Button, EmptyState, Input, Tabs, useToast } from "./components/ui";
import { useI18n } from "./i18n/I18nProvider";
import {
  evaluateComplianceGate,
  generateComplianceAuditPacket,
  getComplianceDashboard,
  recordComplianceSanitationCheck,
  recordComplianceTraining
} from "./lib/api";
import type { ComplianceDashboard, ComplianceGate } from "./types";

function toneForStatus(status: string): "neutral" | "success" | "warning" | "info" {
  if (["current", "pass", "generated"].includes(status)) return "success";
  if (["pending", "draft"].includes(status)) return "info";
  if (["expired", "fail", "revoked"].includes(status)) return "warning";
  return "neutral";
}

export function ComplianceScreen() {
  const auth = useAuth();
  const { formatDate, formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<ComplianceDashboard | null>(null);
  const [gate, setGate] = useState<ComplianceGate | null>(null);
  const [targetId, setTargetId] = useState("lot-lm-hold");
  const [customerFacing, setCustomerFacing] = useState(true);
  const [busy, setBusy] = useState(false);

  const bottlingRequirement = dashboard?.trainingRequirements.find((requirement) => requirement.id === "train-req-bottling-sop");
  const latestPacket = dashboard?.auditPackets[0] ?? null;

  async function load() {
    if (!auth.session) return;
    const response = await getComplianceDashboard(auth.session.accessToken);
    setDashboard(response.dashboard);
  }

  async function evaluateGate() {
    if (!auth.session) return;
    const response = await evaluateComplianceGate(auth.session.accessToken, {
      action: "production.start",
      equipmentId: "equip-filler-01",
      roomId: "loc-pack",
      productFamily: "tincture",
      ingredientClass: "cacao",
      productionOrderId: "prod-lm-2026-06"
    });
    setGate(response.gate);
  }

  useEffect(() => {
    if (!auth.session) return;
    void load().then(() => evaluateGate());
  }, [auth.session]);

  async function submitSanitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) return;
    setBusy(true);
    try {
      const response = await recordComplianceSanitationCheck(auth.session.accessToken, {
        checklistCode: `SAN-FILL-${Date.now().toString().slice(-4)}`,
        equipmentId: "equip-filler-01",
        roomId: "loc-pack",
        productFamily: "tincture",
        productionOrderId: "prod-lm-2026-06",
        status: "pass",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        notes: "Line clearance, food-contact surfaces, and release swabs verified."
      });
      setDashboard(response.dashboard);
      await evaluateGate();
      showToast({ title: "Sanitation check passed", description: "Production start gate re-evaluated." });
    } finally {
      setBusy(false);
    }
  }

  async function submitTraining() {
    if (!auth.session || !bottlingRequirement) return;
    const response = await recordComplianceTraining(auth.session.accessToken, {
      requirementId: bottlingRequirement.id,
      userId: "user-staff",
      completedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });
    setDashboard(response.dashboard);
    showToast({ title: "Training record updated", description: "Production Staff is current for bottling SOP." });
  }

  async function submitAuditPacket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) return;
    const response = await generateComplianceAuditPacket(auth.session.accessToken, {
      targetType: "lot",
      targetId,
      customerFacing
    });
    await load();
    showToast({
      title: "Audit packet generated",
      description: `${response.packet.packetNumber} / ${response.document.documentNumber}`
    });
  }

  const readinessPercent = useMemo(() => {
    if (!dashboard) return 0;
    const total =
      dashboard.readiness.controlledDocumentsTotal +
      dashboard.readiness.trainingTotal +
      dashboard.readiness.sanitationTotal +
      dashboard.readiness.allergenTotal;
    const ready =
      dashboard.readiness.controlledDocumentsCurrent +
      dashboard.readiness.trainingCurrent +
      dashboard.readiness.sanitationReady +
      dashboard.readiness.allergenReady;
    return total === 0 ? 100 : Math.round((ready / total) * 100);
  }, [dashboard]);

  if (!dashboard) {
    return <EmptyState title="Loading compliance" description="Fetching documents, training, sanitation, and audit packets." />;
  }

  return (
    <section className="screen-grid" aria-labelledby="compliance-title">
      <div className="screen-heading">
        <p className="eyebrow">Compliance</p>
        <h2 id="compliance-title">Compliance readiness and audit packets</h2>
        <p>Controlled actions check current training, sanitation, allergen controls, and compliance documents before work proceeds.</p>
      </div>

      <div className="metric-grid">
        <article className="metric-panel">
          <span>Readiness</span>
          <strong>{formatNumber(readinessPercent)}%</strong>
        </article>
        <article className="metric-panel">
          <span>Renewal alerts</span>
          <strong>{formatNumber(dashboard.alerts.length)}</strong>
        </article>
        <article className="metric-panel">
          <span>Training gaps</span>
          <strong>{formatNumber(dashboard.readiness.trainingGaps)}</strong>
        </article>
        <article className="metric-panel">
          <span>Audit packets</span>
          <strong>{formatNumber(dashboard.auditPackets.length)}</strong>
        </article>
      </div>

      <Tabs
        tabs={[
          {
            id: "readiness",
            label: "Readiness",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Compliance readiness panel</h3>
                  <Button type="button" size="sm" variant="secondary" onClick={() => void load()}>
                    <RefreshCw aria-hidden="true" size={16} />
                    Refresh
                  </Button>
                </div>
                <table className="list-table">
                  <thead><tr><th>Alert</th><th>Source</th><th>Due</th><th>Severity</th></tr></thead>
                  <tbody>
                    {dashboard.alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>{alert.title}<div className="muted-line">{alert.message}</div></td>
                        <td>{alert.sourceType}</td>
                        <td>{alert.dueAt ? formatDate(new Date(alert.dueAt)) : "Open"}</td>
                        <td><Badge tone={alert.severity === "critical" ? "warning" : "info"}><AlertTriangle aria-hidden="true" size={16} /> {alert.severity}</Badge></td>
                      </tr>
                    ))}
                    {dashboard.alerts.length === 0 ? <tr><td colSpan={4}>No compliance alerts.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            )
          },
          {
            id: "documents",
            label: "Documents",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>SDS, allergen, HACCP, and SOP library</h3>
                  <Badge tone="info"><FileText aria-hidden="true" size={16} /> {formatNumber(dashboard.documents.length)} docs</Badge>
                </div>
                <table className="list-table">
                  <thead><tr><th>Document</th><th>Type</th><th>Status</th><th>Expires</th><th>Audience</th></tr></thead>
                  <tbody>
                    {dashboard.documents.map((document) => (
                      <tr key={document.id}>
                        <td>{document.documentNumber}<div className="muted-line">{document.title}</div></td>
                        <td>{document.documentType.replaceAll("_", " ")}</td>
                        <td><Badge tone={toneForStatus(document.status)}>{document.status}</Badge></td>
                        <td>{document.expiresAt ? formatDate(new Date(document.expiresAt)) : "No expiry"}</td>
                        <td>{document.internalOnly ? "Internal only" : "Customer ready"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          },
          {
            id: "sanitation",
            label: "Sanitation gate",
            content: (
              <div className="split-panel">
                <form className="table-panel compact-form-grid" onSubmit={submitSanitation}>
                  <div className="panel-heading">
                    <h3>Production start gate</h3>
                    <Badge tone={gate?.allowed ? "success" : "warning"}>
                      <ShieldCheck aria-hidden="true" size={16} />
                      {gate?.allowed ? "Allowed" : "Blocked"}
                    </Badge>
                  </div>
                  <p className="muted-line">FILL-01 / Packing Room / tincture / cacao check.</p>
                  {gate?.blockers.map((blocker) => (
                    <p className="form-error" key={blocker.requirementId}>{blocker.message}</p>
                  ))}
                  <Button type="submit" disabled={busy}>
                    <CheckCircle2 aria-hidden="true" size={18} />
                    Complete sanitation check
                  </Button>
                </form>
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Sanitation checklist</h3>
                    <Badge tone="info">{formatNumber(dashboard.sanitationChecks.length)} checks</Badge>
                  </div>
                  <table className="list-table">
                    <thead><tr><th>Checklist</th><th>Equipment</th><th>Status</th><th>Completed</th></tr></thead>
                    <tbody>
                      {dashboard.sanitationChecks.map((check) => (
                        <tr key={check.id}>
                          <td>{check.checklistCode}<div className="muted-line">{check.notes}</div></td>
                          <td>{check.equipmentCode ?? check.equipmentId}</td>
                          <td><Badge tone={toneForStatus(check.status)}>{check.status}</Badge></td>
                          <td>{check.completedAt ? formatDateTime(new Date(check.completedAt)) : "Pending"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          },
          {
            id: "training",
            label: "Training matrix",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Training matrix</h3>
                  <Button type="button" size="sm" onClick={() => void submitTraining()}>
                    <GraduationCap aria-hidden="true" size={16} />
                    Mark staff current
                  </Button>
                </div>
                <table className="list-table">
                  <thead><tr><th>Requirement</th><th>User</th><th>Status</th><th>Expires</th></tr></thead>
                  <tbody>
                    {dashboard.trainingRecords.map((record) => {
                      const requirement = dashboard.trainingRequirements.find((candidate) => candidate.id === record.requirementId);
                      return (
                        <tr key={record.id}>
                          <td>{requirement?.title ?? record.requirementId}</td>
                          <td>{record.userName}</td>
                          <td><Badge tone={toneForStatus(record.status)}>{record.status}</Badge></td>
                          <td>{record.expiresAt ? formatDate(new Date(record.expiresAt)) : "No expiry"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          },
          {
            id: "packet",
            label: "Audit packet",
            content: (
              <div className="split-panel">
                <form className="table-panel compact-form-grid" onSubmit={submitAuditPacket}>
                  <div className="panel-heading">
                    <h3>Audit packet builder</h3>
                    <Badge tone="info"><PackageCheck aria-hidden="true" size={16} /> Lot packet</Badge>
                  </div>
                  <Input label="Lot or target ID" value={targetId} onChange={(event) => setTargetId(event.target.value)} />
                  <div className="checkbox-grid">
                    <label>
                      <input checked={customerFacing} type="checkbox" onChange={(event) => setCustomerFacing(event.target.checked)} />
                      Customer-facing packet
                    </label>
                  </div>
                  <Button type="submit">
                    <PackageCheck aria-hidden="true" size={18} />
                    Generate packet
                  </Button>
                </form>
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Generated packets</h3>
                    <Badge tone={latestPacket ? "success" : "neutral"}>{latestPacket?.packetNumber ?? "None"}</Badge>
                  </div>
                  <table className="list-table">
                    <thead><tr><th>Packet</th><th>Target</th><th>Audience</th><th>Generated</th></tr></thead>
                    <tbody>
                      {dashboard.auditPackets.map((packet) => (
                        <tr key={packet.id}>
                          <td>{packet.packetNumber}</td>
                          <td>{packet.targetType} / {packet.targetId}</td>
                          <td>{packet.customerFacing ? "Customer-facing" : "Internal"}</td>
                          <td>{formatDateTime(new Date(packet.generatedAt))}</td>
                        </tr>
                      ))}
                      {dashboard.auditPackets.length === 0 ? <tr><td colSpan={4}>No audit packets generated yet.</td></tr> : null}
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
