import { AlertTriangle, CheckCircle2, ClipboardCheck, FileWarning, Gavel, PlusCircle, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "./auth";
import { Badge, Button, EmptyState, Input, useToast } from "./components/ui";
import { useI18n } from "./i18n/I18nProvider";
import {
  closeCapaRecord,
  createCapaRecord,
  createQualityEvent,
  decideLotHold,
  getQualityDashboard,
  listLots,
  updateCapaActionStatus
} from "./lib/api";
import type { LotDetail, QualityDashboard } from "./types";

export function QualityScreen() {
  const auth = useAuth();
  const { formatDate, formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<QualityDashboard | null>(null);
  const [lots, setLots] = useState<LotDetail[]>([]);
  const [selectedLotId, setSelectedLotId] = useState("lot-lm-2026-06");
  const [eventTitle, setEventTitle] = useState("Complaint investigation hold");
  const [eventDescription, setEventDescription] = useState("Customer complaint requires investigation before any further allocation.");
  const [capaRootCause, setCapaRootCause] = useState("Procedure did not make the verification owner explicit.");
  const [busy, setBusy] = useState(false);
  const openEvents = dashboard?.recentEvents.filter((event) => !["closed", "cancelled"].includes(event.status)) ?? [];
  const firstOpenEvent = openEvents[0] ?? dashboard?.recentEvents[0] ?? null;
  const firstHold = dashboard?.activeHoldsList[0] ?? null;

  async function load() {
    if (!auth.session) {
      return;
    }
    const [qualityResponse, lotResponse] = await Promise.all([
      getQualityDashboard(auth.session.accessToken),
      listLots(auth.session.accessToken)
    ]);
    setDashboard(qualityResponse.dashboard);
    setLots(lotResponse.lots);
    setSelectedLotId((current) => current || lotResponse.lots[0]?.lot.id || "");
  }

  useEffect(() => {
    if (!auth.session) {
      return;
    }
    void load();
  }, [auth.session]);

  const selectedLot = useMemo(
    () => lots.find((detail) => detail.lot.id === selectedLotId) ?? lots[0] ?? null,
    [lots, selectedLotId]
  );

  async function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedLot) {
      return;
    }
    setBusy(true);
    try {
      await createQualityEvent(auth.session.accessToken, {
        eventType: "complaint",
        severity: "major",
        title: eventTitle,
        description: eventDescription,
        links: [{ entityType: "lot", entityId: selectedLot.lot.id }],
        createHoldLotIds: [selectedLot.lot.id]
      });
      showToast({ title: "Quality event opened", description: selectedLot.lot.lotCode });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function submitCapa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !firstOpenEvent || !auth.userContext?.userId) {
      return;
    }
    setBusy(true);
    try {
      const dueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await createCapaRecord(auth.session.accessToken, {
        qualityEventId: firstOpenEvent.id,
        rootCause: capaRootCause,
        ownerUserId: auth.userContext.userId,
        dueAt,
        correctiveActions: [{ description: "Contain affected stock and document disposition.", ownerUserId: auth.userContext.userId, dueAt }],
        preventiveActions: [{ description: "Update the checklist and verify the next three runs.", ownerUserId: auth.userContext.userId, dueAt }]
      });
      showToast({ title: "CAPA opened", description: firstOpenEvent.eventNumber });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function verifyAction(actionId: string) {
    if (!auth.session) {
      return;
    }
    await updateCapaActionStatus(auth.session.accessToken, actionId, "verified");
    showToast({ title: "CAPA action verified" });
    await load();
  }

  async function closeCapa(capaId: string) {
    if (!auth.session || !auth.userContext?.userId) {
      return;
    }
    await closeCapaRecord(auth.session.accessToken, capaId, {
      effectivenessCheck: "Follow-up review found no repeat event in the next controlled run.",
      closureApprovedBy: auth.userContext.userId
    });
    showToast({ title: "CAPA closed" });
    await load();
  }

  async function releaseHold() {
    if (!auth.session || !firstHold) {
      return;
    }
    await decideLotHold(auth.session.accessToken, firstHold.id, {
      decision: "release",
      reason: "Investigation complete and release approved.",
      evidence: "QA approval note attached to event."
    });
    showToast({ title: "Hold released", description: firstHold.lotCode ?? firstHold.lotId });
    await load();
  }

  if (!dashboard) {
    return <EmptyState title="Loading quality" description="Fetching quality events, CAPA, and holds." />;
  }

  return (
    <section className="screen-grid" aria-labelledby="quality-title">
      <div className="screen-heading">
        <p className="eyebrow">Quality events</p>
        <h2 id="quality-title">Deviations, CAPA, and controlled holds</h2>
        <p>Failed QC, complaints, deviations, and disposition decisions stay linked to affected records.</p>
      </div>

      <div className="metric-grid">
        <article className="metric-panel">
          <span>Open events</span>
          <strong>{formatNumber(dashboard.openEvents)}</strong>
        </article>
        <article className="metric-panel">
          <span>Critical</span>
          <strong>{formatNumber(dashboard.criticalEvents)}</strong>
        </article>
        <article className="metric-panel">
          <span>Active holds</span>
          <strong>{formatNumber(dashboard.activeHolds)}</strong>
        </article>
        <article className="metric-panel">
          <span>CAPA overdue</span>
          <strong>{formatNumber(dashboard.overdueCapaActions)}</strong>
        </article>
      </div>

      <form className="table-panel compact-form-grid" onSubmit={submitEvent}>
        <div className="panel-heading">
          <h3>Open event and hold stock</h3>
          <Badge tone="warning"><FileWarning aria-hidden="true" size={16} /> Complaint</Badge>
        </div>
        <label className="select-field">
          <span>Affected lot</span>
          <select value={selectedLot?.lot.id ?? ""} onChange={(event) => setSelectedLotId(event.target.value)}>
            {lots.map((detail) => (
              <option key={detail.lot.id} value={detail.lot.id}>
                {detail.lot.lotCode} / {detail.lot.itemName}
              </option>
            ))}
          </select>
        </label>
        <Input label="Title" value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} />
        <Input label="Description" value={eventDescription} onChange={(event) => setEventDescription(event.target.value)} />
        <Button type="submit" disabled={busy || !selectedLot}>
          <PlusCircle aria-hidden="true" size={18} />
          Create hold
        </Button>
      </form>

      <div className="table-panel">
        <div className="panel-heading">
          <h3>Quality event list</h3>
          <Button type="button" size="sm" variant="secondary" onClick={() => void load()}>
            <RefreshCw aria-hidden="true" size={16} />
            Refresh
          </Button>
        </div>
        <table className="list-table">
          <thead>
            <tr><th>Event</th><th>Type</th><th>Severity</th><th>Status</th><th>Detected</th></tr>
          </thead>
          <tbody>
            {dashboard.recentEvents.map((event) => (
              <tr key={event.id}>
                <td>
                  {event.eventNumber}
                  <div className="muted-line">{event.title}</div>
                </td>
                <td>{event.eventType}</td>
                <td><Badge tone={event.severity === "minor" ? "info" : "warning"}>{event.severity}</Badge></td>
                <td><Badge tone={event.status === "closed" ? "success" : "warning"}>{event.status}</Badge></td>
                <td>{formatDateTime(new Date(event.detectedAt))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="table-panel compact-form-grid" onSubmit={submitCapa}>
        <div className="panel-heading">
          <h3>CAPA board</h3>
          <Badge tone="info"><ClipboardCheck aria-hidden="true" size={16} /> {formatNumber(dashboard.capaRecords.length)} CAPA</Badge>
        </div>
        <Input label="Root cause" value={capaRootCause} onChange={(event) => setCapaRootCause(event.target.value)} />
        <Button type="submit" disabled={busy || !firstOpenEvent}>
          <PlusCircle aria-hidden="true" size={18} />
          Create CAPA
        </Button>
      </form>

      <div className="quality-board">
        {dashboard.capaRecords.map((capa) => (
          <article className="table-panel" key={capa.id}>
            <div className="panel-heading">
              <h3>{capa.capaNumber}</h3>
              <Badge tone={capa.status === "closed" ? "success" : "warning"}>{capa.status}</Badge>
            </div>
            <p>{capa.rootCause ?? capa.event?.title ?? "Root cause pending"}</p>
            <p className="muted-line">Due {formatDate(new Date(capa.dueAt))}</p>
            <table className="list-table">
              <thead><tr><th>Action</th><th>Owner</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {capa.actions.map((action) => (
                  <tr key={action.id}>
                    <td>
                      {action.description}
                      <div className="muted-line">{action.actionType} / due {formatDate(new Date(action.dueAt))}</div>
                    </td>
                    <td>{action.ownerUserId}</td>
                    <td><Badge tone={action.status === "verified" ? "success" : "info"}>{action.status}</Badge></td>
                    <td>
                      <Button type="button" size="sm" variant="secondary" onClick={() => void verifyAction(action.id)} disabled={action.status === "verified"}>
                        <CheckCircle2 aria-hidden="true" size={16} />
                        Verify
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button type="button" onClick={() => void closeCapa(capa.id)} disabled={capa.status === "closed" || capa.actions.some((action) => action.status !== "verified")}>
              <ClipboardCheck aria-hidden="true" size={18} />
              Close CAPA
            </Button>
          </article>
        ))}
      </div>

      <div className="table-panel">
        <div className="panel-heading">
          <h3>Hold and release approval</h3>
          <Badge tone={dashboard.activeHolds > 0 ? "warning" : "success"}>
            <AlertTriangle aria-hidden="true" size={16} />
            {formatNumber(dashboard.activeHolds)} active
          </Badge>
        </div>
        <table className="list-table">
          <thead><tr><th>Lot</th><th>Reason</th><th>Held</th><th>Decision</th><th></th></tr></thead>
          <tbody>
            {dashboard.activeHoldsList.map((hold) => (
              <tr key={hold.id}>
                <td>{hold.lotCode ?? hold.lotId}<div className="muted-line">{hold.itemName}</div></td>
                <td>{hold.reason}</td>
                <td>{formatDateTime(new Date(hold.heldAt))}</td>
                <td><Badge tone="warning">{hold.status}</Badge></td>
                <td>
                  <Button type="button" size="sm" onClick={() => void releaseHold()}>
                    <Gavel aria-hidden="true" size={16} />
                    Approve release
                  </Button>
                </td>
              </tr>
            ))}
            {dashboard.activeHoldsList.length === 0 ? (
              <tr><td colSpan={5}>No active lot holds.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
