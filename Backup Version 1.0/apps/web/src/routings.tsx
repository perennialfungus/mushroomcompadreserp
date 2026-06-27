import {
  CheckCircle2,
  ClipboardList,
  Factory,
  Gauge,
  Hammer,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  SquareCheckBig
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Input, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import { useI18n } from "./i18n/I18nProvider";
import {
  getProductionProgressByWorkCenter,
  listProductionOperationRuns,
  listRoutingMasterData,
  listRoutingTemplates,
  transitionProductionOperationRun
} from "./lib/api";
import type {
  OperationRunDetail,
  ProductionOperationRunStatus,
  RoutingMasterData,
  RoutingTemplateDetail,
  WorkCenterProgress
} from "./types";

function statusTone(status: ProductionOperationRunStatus | string): "neutral" | "success" | "warning" | "info" {
  if (status === "completed" || status === "available" || status === "active") {
    return "success";
  }
  if (status === "in_progress" || status === "ready") {
    return "info";
  }
  if (status === "paused" || status === "pending" || status === "maintenance") {
    return "warning";
  }
  return "neutral";
}

export function RoutingsScreen() {
  const auth = useAuth();
  const { formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [masterData, setMasterData] = useState<RoutingMasterData>({
    workCenters: [],
    equipment: [],
    laborRoles: [],
    operationCodes: []
  });
  const [routings, setRoutings] = useState<RoutingTemplateDetail[]>([]);
  const [runs, setRuns] = useState<OperationRunDetail[]>([]);
  const [progress, setProgress] = useState<WorkCenterProgress[]>([]);
  const [selectedRunId, setSelectedRunId] = useState("run-po-001-stage");
  const [outputQuantity, setOutputQuantity] = useState("44");
  const [scrapQuantity, setScrapQuantity] = useState("2");
  const [reworkQuantity, setReworkQuantity] = useState("1");
  const [notes, setNotes] = useState("Kiosk entry captured at work center.");
  const [error, setError] = useState<string | null>(null);

  const selectedRun = runs.find((detail) => detail.run.id === selectedRunId) ?? runs[0] ?? null;
  const activeRuns = runs.filter((detail) => detail.run.status !== "completed" && detail.run.status !== "cancelled");
  const totalLaborMinutes = useMemo(
    () => runs.reduce((total, detail) => total + detail.laborTimeEntries.reduce((entryTotal, entry) => entryTotal + entry.durationMinutes, 0), 0),
    [runs]
  );
  const totalMachineMinutes = useMemo(
    () => runs.reduce((total, detail) => total + detail.machineTimeEntries.reduce((entryTotal, entry) => entryTotal + entry.durationMinutes, 0), 0),
    [runs]
  );

  async function loadRoutings() {
    if (!auth.session) {
      return;
    }
    setError(null);
    try {
      const [masterResponse, routingResponse, runResponse, progressResponse] = await Promise.all([
        listRoutingMasterData(auth.session.accessToken),
        listRoutingTemplates(auth.session.accessToken),
        listProductionOperationRuns(auth.session.accessToken),
        getProductionProgressByWorkCenter(auth.session.accessToken)
      ]);
      setMasterData(masterResponse);
      setRoutings(routingResponse.routings);
      setRuns(runResponse.runs);
      setProgress(progressResponse.progress);
      setSelectedRunId((current) => runResponse.runs.some((detail) => detail.run.id === current) ? current : runResponse.runs[0]?.run.id ?? "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Routing data could not be loaded.");
    }
  }

  useEffect(() => {
    void loadRoutings();
  }, [auth.session]);

  async function transitionRun(action: "start" | "pause" | "resume" | "complete") {
    if (!auth.session || !selectedRun) {
      return;
    }
    setError(null);
    try {
      const payload =
        action === "complete"
          ? {
              action,
              occurredAt: new Date().toISOString(),
              outputQuantity: Number(outputQuantity),
              scrapQuantity: Number(scrapQuantity),
              reworkQuantity: Number(reworkQuantity),
              notes
            }
          : { action, occurredAt: new Date().toISOString(), notes };
      const response = await transitionProductionOperationRun(auth.session.accessToken, selectedRun.run.id, payload);
      setRuns((current) =>
        current
          .map((detail) => (detail.run.id === response.run.run.id ? response.run : detail))
          .map((detail) =>
            detail.run.productionOrderId === response.run.run.productionOrderId &&
            detail.run.status === "pending" &&
            response.run.run.status === "completed" &&
            detail.run.sequence > response.run.run.sequence
              ? { ...detail, run: { ...detail.run, status: "ready" } }
              : detail
          )
      );
      showToast({ title: "Operation updated", description: `${response.run.operationCode?.code ?? "OP"} / ${response.run.run.status}` });
      const progressResponse = await getProductionProgressByWorkCenter(auth.session.accessToken);
      setProgress(progressResponse.progress);
    } catch (transitionError) {
      setError(transitionError instanceof Error ? transitionError.message : "Operation update failed.");
    }
  }

  return (
    <section className="screen-grid" aria-labelledby="routings-title">
      <div className="screen-heading">
        <p className="eyebrow">Routings</p>
        <h2 id="routings-title">Work centers and shop floor execution</h2>
        <p>Operators can start, pause, complete, and capture output while labor and machine time post to the operation run.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="metric-grid">
        <article className="metric-panel">
          <span>Open operations</span>
          <strong>{formatNumber(activeRuns.length)}</strong>
        </article>
        <article className="metric-panel">
          <span>Labor minutes</span>
          <strong>{formatNumber(totalLaborMinutes)}</strong>
        </article>
        <article className="metric-panel">
          <span>Machine minutes</span>
          <strong>{formatNumber(totalMachineMinutes)}</strong>
        </article>
      </div>

      <Tabs
        tabs={[
          {
            id: "admin",
            label: "Work centers",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Work center admin</h3>
                  <Badge tone="info"><Factory aria-hidden="true" size={16} /> {formatNumber(masterData.workCenters.length)} centers</Badge>
                </div>
                <table className="list-table">
                  <thead>
                    <tr><th>Work center</th><th>Location</th><th>Equipment</th><th>Labor roles</th></tr>
                  </thead>
                  <tbody>
                    {masterData.workCenters.map((workCenter) => (
                      <tr key={workCenter.id}>
                        <td>
                          <strong>{workCenter.code}</strong>
                          <span>{workCenter.name}</span>
                        </td>
                        <td>{workCenter.locationId}</td>
                        <td>
                          {masterData.equipment
                            .filter((equipment) => equipment.workCenterId === workCenter.id)
                            .map((equipment) => `${equipment.code} (${equipment.status})`)
                            .join(", ") || "None"}
                        </td>
                        <td>{masterData.laborRoles.map((role) => role.code).join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          },
          {
            id: "editor",
            label: "Routing editor",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Routing templates</h3>
                  <Badge tone="success"><ClipboardList aria-hidden="true" size={16} /> EBR linked</Badge>
                </div>
                {routings.map((routing) => (
                  <div className="stack" key={routing.template.id}>
                    <h4>{routing.template.routingCode} / {routing.template.name}</h4>
                    <table className="list-table">
                      <thead>
                        <tr><th>Seq</th><th>Operation</th><th>Times</th><th>Labor/equipment</th><th>EBR step</th></tr>
                      </thead>
                      <tbody>
                        {routing.operations.map((operation) => {
                          const operationCode = masterData.operationCodes.find((candidate) => candidate.id === operation.operationCodeId);
                          const workCenter = masterData.workCenters.find((candidate) => candidate.id === operation.workCenterId);
                          const equipment = masterData.equipment.find((candidate) => candidate.id === operation.equipmentId);
                          const laborRole = masterData.laborRoles.find((candidate) => candidate.id === operation.laborRoleId);
                          return (
                            <tr key={operation.id}>
                              <td>{operation.sequence}</td>
                              <td>
                                <strong>{operationCode?.code ?? operation.operationCodeId}</strong>
                                <span>{workCenter?.name ?? operation.workCenterId}</span>
                              </td>
                              <td>
                                Setup {formatNumber(operation.setupTimeMinutes)}m / Run {formatNumber(operation.runTimeMinutes)}m
                                <div className="muted-line">Queue {formatNumber(operation.queueTimeMinutes)}m / Move {formatNumber(operation.moveTimeMinutes)}m</div>
                              </td>
                              <td>{laborRole?.code ?? "None"} / {equipment?.code ?? "Manual"}</td>
                              <td>{operation.ebrStepId ?? "None"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )
          },
          {
            id: "kiosk",
            label: "Kiosk",
            content: (
              <div className="kiosk-layout">
                <section className="table-panel kiosk-worklist" aria-label="Operation worklist">
                  <div className="panel-heading">
                    <h3>Operator queue</h3>
                    <Button type="button" variant="secondary" size="sm" onClick={() => void loadRoutings()}>
                      <RotateCcw aria-hidden="true" size={16} />
                      Refresh
                    </Button>
                  </div>
                  <div className="operation-run-list">
                    {runs.map((detail) => (
                      <button
                        className={detail.run.id === selectedRun?.run.id ? "operation-run-row active" : "operation-run-row"}
                        key={detail.run.id}
                        onClick={() => setSelectedRunId(detail.run.id)}
                        type="button"
                      >
                        <span>
                          <strong>{detail.productionOrder.orderNumber}</strong>
                          <small>{detail.operationCode?.name ?? detail.run.operationCodeId}</small>
                        </span>
                        <Badge tone={statusTone(detail.run.status)}>{detail.run.status.replaceAll("_", " ")}</Badge>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="table-panel kiosk-console" aria-label="Operation kiosk">
                  {selectedRun ? (
                    <>
                      <div className="panel-heading">
                        <h3>{selectedRun.operationCode?.name ?? "Operation"}</h3>
                        <Badge tone={statusTone(selectedRun.run.status)}>{selectedRun.run.status.replaceAll("_", " ")}</Badge>
                      </div>
                      <dl className="sync-metrics">
                        <div><dt>Order</dt><dd>{selectedRun.productionOrder.orderNumber}</dd></div>
                        <div><dt>Work center</dt><dd>{selectedRun.workCenter?.name ?? selectedRun.run.workCenterId}</dd></div>
                        <div><dt>Equipment</dt><dd>{selectedRun.equipment?.name ?? "Manual"}</dd></div>
                        <div><dt>Scheduled</dt><dd>{selectedRun.run.scheduledStartAt ? formatDateTime(new Date(selectedRun.run.scheduledStartAt)) : "Unscheduled"}</dd></div>
                      </dl>
                      <div className="kiosk-actions">
                        <Button type="button" onClick={() => void transitionRun("start")} disabled={!["ready", "pending"].includes(selectedRun.run.status)}>
                          <PlayCircle aria-hidden="true" size={20} />
                          Start
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => void transitionRun("pause")} disabled={selectedRun.run.status !== "in_progress"}>
                          <PauseCircle aria-hidden="true" size={20} />
                          Pause
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => void transitionRun("resume")} disabled={selectedRun.run.status !== "paused"}>
                          <PlayCircle aria-hidden="true" size={20} />
                          Resume
                        </Button>
                      </div>
                      <div className="compact-form-grid">
                        <Input label="Output" type="number" inputMode="decimal" value={outputQuantity} onChange={(event) => setOutputQuantity(event.target.value)} />
                        <Input label="Scrap" type="number" inputMode="decimal" value={scrapQuantity} onChange={(event) => setScrapQuantity(event.target.value)} />
                        <Input label="Rework" type="number" inputMode="decimal" value={reworkQuantity} onChange={(event) => setReworkQuantity(event.target.value)} />
                        <Input label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
                      </div>
                      <Button type="button" onClick={() => void transitionRun("complete")} disabled={!["in_progress", "paused"].includes(selectedRun.run.status)}>
                        <SquareCheckBig aria-hidden="true" size={20} />
                        Complete operation
                      </Button>
                      <table className="list-table">
                        <thead><tr><th>Time source</th><th>Started</th><th>Ended</th><th>Minutes</th></tr></thead>
                        <tbody>
                          {[...selectedRun.laborTimeEntries, ...selectedRun.machineTimeEntries].map((entry) => (
                            <tr key={entry.id}>
                              <td>{entry.sourceAction}</td>
                              <td>{formatDateTime(new Date(entry.startedAt))}</td>
                              <td>{entry.endedAt ? formatDateTime(new Date(entry.endedAt)) : "Running"}</td>
                              <td>{formatNumber(entry.durationMinutes)}</td>
                            </tr>
                          ))}
                          {selectedRun.laborTimeEntries.length + selectedRun.machineTimeEntries.length === 0 ? (
                            <tr><td colSpan={4}>No labor or machine time captured yet.</td></tr>
                          ) : null}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <p>No operation runs are scheduled.</p>
                  )}
                </section>
              </div>
            )
          },
          {
            id: "progress",
            label: "Progress",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Progress by work center</h3>
                  <Badge tone="info"><Gauge aria-hidden="true" size={16} /> Throughput</Badge>
                </div>
                <table className="list-table">
                  <thead>
                    <tr><th>Work center</th><th>Open</th><th>Completed</th><th>Labor/machine</th><th>Output / scrap / rework</th></tr>
                  </thead>
                  <tbody>
                    {progress.map((row) => (
                      <tr key={row.workCenter.id}>
                        <td>
                          <strong><Hammer aria-hidden="true" size={16} /> {row.workCenter.code}</strong>
                          <span>{row.workCenter.name}</span>
                        </td>
                        <td>{formatNumber(row.counts.pending + row.counts.ready + row.counts.in_progress + row.counts.paused)}</td>
                        <td><Badge tone="success"><CheckCircle2 aria-hidden="true" size={16} /> {formatNumber(row.counts.completed)}</Badge></td>
                        <td>{formatNumber(row.actualLaborMinutes)}m / {formatNumber(row.actualMachineMinutes)}m</td>
                        <td>{formatNumber(row.outputQuantity)} / {formatNumber(row.scrapQuantity)} / {formatNumber(row.reworkQuantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        ]}
      />
    </section>
  );
}
