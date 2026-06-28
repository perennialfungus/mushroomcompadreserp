import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Download, Eye, FileJson, GitBranch, HelpCircle, PlayCircle, RotateCcw, ShieldAlert, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { defaultWorkflowGuides } from "@mushroom-compadres/domain";
import { useAuth } from "./auth";
import { Badge, Button, EmptyState, useToast } from "./components/ui";
import { useI18n } from "./i18n/I18nProvider";
import {
  completeWorkflowRun,
  exportWorkflowMermaid,
  listApprovalInbox,
  listWorkflowDefinitions,
  listWorkflowGuides,
  listWorkflowRuns,
  recordWorkflowRunEvent,
  requestWorkflowTransition,
  resolveWorkflowActions,
  startWorkflowRun
} from "./lib/api";
import type { WorkflowActionAvailability, WorkflowApprovalRequest, WorkflowDefinition, WorkflowGuide, WorkflowRunDetail } from "./types";

const activeGuideStorageKey = "mc-active-workflow-guide";
const activeGuideEvent = "mc-active-workflow-guide-changed";

type ActiveGuideSession = {
  guideId: string;
  runId: string;
  mode: "show_me" | "practice" | "live";
  stepIndex: number;
};

type GuideWithAvailability = WorkflowGuide & {
  availability: {
    available: boolean;
    learnOnly: boolean;
    reason: string | null;
  };
};

function readActiveGuideSession(): ActiveGuideSession | null {
  try {
    const raw = window.sessionStorage.getItem(activeGuideStorageKey);
    return raw ? (JSON.parse(raw) as ActiveGuideSession) : null;
  } catch {
    return null;
  }
}

function writeActiveGuideSession(value: ActiveGuideSession | null) {
  if (value) {
    window.sessionStorage.setItem(activeGuideStorageKey, JSON.stringify(value));
  } else {
    window.sessionStorage.removeItem(activeGuideStorageKey);
  }
  window.dispatchEvent(new Event(activeGuideEvent));
}

export function WorkflowScreen() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { formatDateTime, formatNumber } = useI18n();
  const toast = useToast();
  const [guides, setGuides] = useState<GuideWithAvailability[]>([]);
  const [runs, setRuns] = useState<WorkflowRunDetail[]>([]);
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>([]);
  const [approvalInbox, setApprovalInbox] = useState<WorkflowApprovalRequest[]>([]);
  const [availability, setAvailability] = useState<WorkflowActionAvailability | null>(null);
  const [selectedGuideId, setSelectedGuideId] = useState("create-bom");
  const [selectedDefinitionId, setSelectedDefinitionId] = useState("wf-receipt");
  const [exportText, setExportText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedGuide = guides.find((guide) => guide.id === selectedGuideId) ?? guides[0] ?? null;
  const selectedDefinition = definitions.find((definition) => definition.id === selectedDefinitionId) ?? definitions[0] ?? null;

  async function load() {
    if (!auth.session) {
      return;
    }
    try {
      const [guideResponse, runResponse, definitionResponse, inboxResponse] = await Promise.all([
        listWorkflowGuides(auth.session.accessToken),
        listWorkflowRuns(auth.session.accessToken),
        listWorkflowDefinitions(auth.session.accessToken),
        listApprovalInbox(auth.session.accessToken)
      ]);
      setGuides(guideResponse.guides as GuideWithAvailability[]);
      setRuns(runResponse.runs);
      setDefinitions(definitionResponse.definitions);
      setApprovalInbox(inboxResponse.approvals);
      setSelectedGuideId((current) =>
        guideResponse.guides.some((guide) => guide.id === current)
          ? current
          : guideResponse.guides[0]?.id ?? "create-bom"
      );
      setSelectedDefinitionId((current) =>
        definitionResponse.definitions.some((definition) => definition.id === current)
          ? current
          : definitionResponse.definitions[0]?.id ?? "wf-receipt"
      );
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Workflow guides could not be loaded.");
    }
  }

  useEffect(() => {
    void load();
  }, [auth.session]);

  async function startGuide(mode: "show_me" | "practice" | "live") {
    if (!auth.session || !selectedGuide) {
      return;
    }
    try {
      const runInput: { workflowId: string; mode: "show_me" | "practice" | "live"; practiceSeedJson?: Record<string, unknown> } = {
        workflowId: selectedGuide.id,
        mode
      };
      if (mode === "practice") {
        runInput.practiceSeedJson = { seededAt: new Date().toISOString(), workflowId: selectedGuide.id };
      }
      const response = await startWorkflowRun(auth.session.accessToken, runInput);
      writeActiveGuideSession({ guideId: selectedGuide.id, runId: response.run.run.id, mode, stepIndex: 0 });
      setRuns((current) => [response.run, ...current.filter((run) => run.run.id !== response.run.run.id)]);
      toast.showToast({
        title: mode === "practice" ? "Practice mode started" : "Show me started",
        description: selectedGuide.title
      });
      await navigate({ to: (selectedGuide.steps[0]?.routeTarget ?? "/workflows") as never });
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Workflow run could not start.");
    }
  }

  async function exportMermaid() {
    if (!auth.session || !selectedGuide) {
      return;
    }
    const mermaid = await exportWorkflowMermaid(auth.session.accessToken, selectedGuide.id);
    setExportText(mermaid);
    toast.showToast({ title: "Mermaid export ready", description: selectedGuide.title });
  }

  function exportPdfJson() {
    if (!selectedGuide) {
      return;
    }
    setExportText(JSON.stringify(selectedGuide.diagram, null, 2));
    toast.showToast({ title: "PDF-ready JSON export ready", description: selectedGuide.title });
  }

  async function previewActions() {
    if (!auth.session || !selectedDefinition) {
      return;
    }
    const stateId =
      selectedDefinition.id === "wf-production-order"
        ? "in_progress"
        : selectedDefinition.states.find((state) => state.id === "received")?.id ?? selectedDefinition.initialStateId;
    const record = {
      recordType: selectedDefinition.recordType,
      recordId: `${selectedDefinition.recordType}-preview`,
      stateId,
      fields: {
        bomApproved: true,
        inputsReleased: true,
        supplierApproved: true,
        qcStatus: "passed",
        qcSeverity: "critical",
        supplierRiskLevel: "high",
        amount: 1400,
        locationId: "loc-production"
      }
    };
    const response = await resolveWorkflowActions(auth.session.accessToken, selectedDefinition.id, {
      ...record,
      ...(selectedDefinition.documentTypeCode === undefined
        ? {}
        : { documentTypeCode: selectedDefinition.documentTypeCode })
    });
    setAvailability(response.availability);
  }

  async function requestPreviewTransition() {
    if (!auth.session || !selectedDefinition) {
      return;
    }
    const stateId = selectedDefinition.id === "wf-production-order" ? "in_progress" : "received";
    const actionId = selectedDefinition.id === "wf-production-order" ? "complete" : "release";
    const response = await requestWorkflowTransition(auth.session.accessToken, selectedDefinition.id, {
      record: {
        recordType: selectedDefinition.recordType,
        recordId: `${selectedDefinition.recordType}-preview`,
        stateId,
        fields: {
          bomApproved: true,
          inputsReleased: true,
          supplierApproved: true,
          qcStatus: "passed",
          qcSeverity: "critical",
          supplierRiskLevel: "high",
          amount: 1400,
          locationId: "loc-production"
        },
        ...(selectedDefinition.documentTypeCode === undefined
          ? {}
          : { documentTypeCode: selectedDefinition.documentTypeCode })
      },
      actionId,
      dialogValues: { reason: "Preview transition with evidence attached.", evidence: "preview-evidence.pdf", yieldEvidence: "yield.pdf" },
      metadata: { actorUserId: auth.userContext?.userId ?? "user-owner", reason: "Preview transition" }
    });
    setApprovalInbox((current) => [...response.transition.approvalRequests, ...current]);
    toast.showToast({
      title: "Approval requested",
      description: `${response.transition.approvalRequests.length} approval step(s) created`
    });
  }

  if (guides.length === 0 && !error) {
    return <EmptyState title="Loading workflows" description="Fetching guided workflows and run history." />;
  }

  return (
    <section className="screen-grid workflow-screen" aria-labelledby="workflow-title">
      <div className="screen-heading master-heading">
        <div>
          <p className="eyebrow">Training</p>
          <h2 id="workflow-title">Workflow guides</h2>
          <p>Guided diagrams and clickthroughs for BOMs, suppliers, POs, receiving, QC release, and production.</p>
        </div>
        <div className="action-row">
          <Button type="button" variant="secondary" onClick={() => void load()}>
            <RotateCcw aria-hidden="true" size={18} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="workflow-layout">
        <aside className="workflow-library" aria-label="Workflow library">
          <div className="panel-heading">
            <h3>Library</h3>
            <Badge tone="info">{formatNumber(guides.length)} guides</Badge>
          </div>
          {guides.map((guide) => (
            <button
              className={`workflow-list-item${guide.id === selectedGuide?.id ? " selected" : ""}`}
              key={guide.id}
              onClick={() => setSelectedGuideId(guide.id)}
              type="button"
            >
              <span>
                <strong>{guide.title}</strong>
                <small>{guide.module} / {guide.estimatedMinutes} min</small>
              </span>
              <Badge tone={guide.availability.available ? "success" : "warning"}>
                {guide.availability.available ? "Ready" : "Learn"}
              </Badge>
            </button>
          ))}
        </aside>

        {selectedGuide ? (
          <section className="workflow-detail">
            <div className="table-panel">
              <div className="panel-heading">
                <div>
                  <h3>{selectedGuide.title}</h3>
                  <p className="muted-line">{selectedGuide.summary}</p>
                </div>
                <Badge tone={selectedGuide.availability.available ? "success" : "warning"}>
                  {selectedGuide.availability.available ? "Role allowed" : "Role required"}
                </Badge>
              </div>
              {selectedGuide.availability.reason ? (
                <p className="permission-note">
                  <ShieldAlert aria-hidden="true" size={16} />
                  {selectedGuide.availability.reason}
                </p>
              ) : null}
              <div className="action-row">
                <Button type="button" onClick={() => void startGuide("show_me")}>
                  <Eye aria-hidden="true" size={18} />
                  Show me
                </Button>
                <Button type="button" variant="secondary" onClick={() => void startGuide("practice")} disabled={!selectedGuide.availability.available}>
                  <PlayCircle aria-hidden="true" size={18} />
                  Practice mode
                </Button>
                <Button type="button" variant="secondary" onClick={() => void exportMermaid()}>
                  <Download aria-hidden="true" size={18} />
                  Mermaid
                </Button>
                <Button type="button" variant="secondary" onClick={exportPdfJson}>
                  <FileJson aria-hidden="true" size={18} />
                  PDF JSON
                </Button>
              </div>
            </div>

            {selectedGuide.availability.available ? null : (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Permission reason</h3>
                  <Badge tone="warning">Learn-only</Badge>
                </div>
                <p>{selectedGuide.availability.reason}</p>
              </div>
            )}

            <WorkflowDiagram guide={selectedGuide} />

            <div className="table-panel">
              <div className="panel-heading">
                <h3>Export preview</h3>
                <Badge tone={exportText ? "success" : "neutral"}>{exportText ? "Ready" : "None"}</Badge>
              </div>
              <pre className="workflow-export" aria-label="Workflow export preview">
                {exportText || selectedGuide.mermaid}
              </pre>
            </div>
          </section>
        ) : (
          <EmptyState title="No guide selected" description="Select a workflow guide to view the diagram." />
        )}
      </div>

      <div className="table-panel">
        <div className="panel-heading">
          <h3>Run history</h3>
          <Badge tone="info">{formatNumber(runs.length)} runs</Badge>
        </div>
        <table className="list-table">
          <thead>
            <tr><th>Workflow</th><th>Mode</th><th>Status</th><th>Started</th><th>Events</th></tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.run.id}>
                <td>{run.guide.title}<div className="muted-line">{run.run.rollbackSummary ?? run.run.currentStepId ?? "Ready"}</div></td>
                <td>{run.run.mode.replaceAll("_", " ")}</td>
                <td><Badge tone={run.run.status === "rolled_back" ? "warning" : run.run.status === "completed" ? "success" : "info"}>{run.run.status}</Badge></td>
                <td>{formatDateTime(new Date(run.run.startedAt))}</td>
                <td>{formatNumber(run.events.length)}</td>
              </tr>
            ))}
            {runs.length === 0 ? <tr><td colSpan={5}>No workflow runs yet.</td></tr> : null}
          </tbody>
        </table>
      </div>

      <section className="workflow-engine-grid" aria-label="Workflow engine">
        <div className="table-panel">
          <div className="panel-heading">
            <div>
              <h3>Workflow designer</h3>
              <p className="muted-line">Configured states, actions, dialogs, guards, and side effects.</p>
            </div>
            <Badge tone="info">{formatNumber(definitions.length)} definitions</Badge>
          </div>
          <div className="segmented-list" role="list">
            {definitions.map((definition) => (
              <button
                className={`workflow-list-item${definition.id === selectedDefinition?.id ? " selected" : ""}`}
                key={definition.id}
                onClick={() => {
                  setSelectedDefinitionId(definition.id);
                  setAvailability(null);
                }}
                type="button"
              >
                <span>
                  <strong>{definition.name}</strong>
                  <small>{definition.recordType.replaceAll("_", " ")} / v{definition.version}</small>
                </span>
                <Badge tone={definition.active ? "success" : "neutral"}>{definition.active ? "Active" : "Off"}</Badge>
              </button>
            ))}
          </div>
        </div>

        {selectedDefinition ? (
          <>
            <div className="table-panel">
              <div className="panel-heading">
                <h3>State diagram viewer</h3>
                <Badge tone="info"><GitBranch aria-hidden="true" size={16} /> {selectedDefinition.states.length} states</Badge>
              </div>
              <ol className="workflow-node-list">
                {selectedDefinition.diagram.actions.map((action) => (
                  <li key={`${action.id}-${action.to}`}>
                    <span className={`workflow-node${action.controlled ? " workflow-node-approval" : ""}`}>
                      <strong>{action.label}</strong>
                      <small>{action.from.join(", ")} to {action.to}</small>
                    </span>
                  </li>
                ))}
              </ol>
              <pre className="workflow-export" aria-label="State diagram Mermaid">
                {selectedDefinition.mermaid}
              </pre>
            </div>

            <div className="table-panel">
              <div className="panel-heading">
                <h3>Approval map editor</h3>
                <Badge tone="warning">{formatNumber(selectedDefinition.approvalMaps.length)} maps</Badge>
              </div>
              {selectedDefinition.approvalMaps.flatMap((map) => map.rules).map((rule) => (
                <p className="permission-note" key={rule.id}>
                  <ShieldAlert aria-hidden="true" size={16} />
                  {rule.label}: {rule.stepIds.join(", ")}
                </p>
              ))}
              <div className="action-row">
                <Button type="button" variant="secondary" onClick={() => void previewActions()}>
                  <Eye aria-hidden="true" size={18} />
                  Preview actions
                </Button>
                <Button type="button" onClick={() => void requestPreviewTransition()}>
                  <PlayCircle aria-hidden="true" size={18} />
                  Request approval
                </Button>
              </div>
            </div>
          </>
        ) : null}

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Approval inbox</h3>
            <Badge tone="warning">{formatNumber(approvalInbox.length)} pending</Badge>
          </div>
          <table className="list-table">
            <thead>
              <tr><th>Record</th><th>Action</th><th>Step</th><th>Due</th></tr>
            </thead>
            <tbody>
              {approvalInbox.map((approval) => (
                <tr key={approval.id}>
                  <td>{approval.recordType.replaceAll("_", " ")}<div className="muted-line">{approval.recordId}</div></td>
                  <td>{approval.actionId}</td>
                  <td>{approval.stepId}</td>
                  <td>{formatDateTime(new Date(approval.dueAt))}</td>
                </tr>
              ))}
              {approvalInbox.length === 0 ? <tr><td colSpan={4}>No approvals waiting.</td></tr> : null}
            </tbody>
          </table>
        </div>

        <div className="table-panel">
          <div className="panel-heading">
            <h3>State/action availability</h3>
            <Badge tone={availability ? "success" : "neutral"}>{availability ? "Previewed" : "Idle"}</Badge>
          </div>
          {availability ? (
            <table className="list-table">
              <thead>
                <tr><th>Action</th><th>Status</th><th>Dialog</th><th>Approval steps</th></tr>
              </thead>
              <tbody>
                {availability.actions.map((item) => (
                  <tr key={item.action.id}>
                    <td>{item.action.label}<div className="muted-line">{item.reasons.join(" ") || "Ready"}</div></td>
                    <td><Badge tone={item.enabled ? "success" : "warning"}>{item.enabled ? "Available" : "Blocked"}</Badge></td>
                    <td>{item.dialog?.title ?? "None"}</td>
                    <td>{item.approvalSteps.map((step) => step.label).join(", ") || "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted-line">Preview a configured record to see valid actions for its state and permissions.</p>
          )}
        </div>

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Transition audit timeline</h3>
            <Badge tone="success">Audited</Badge>
          </div>
          <ol className="timeline-list">
            {approvalInbox.slice(0, 4).map((approval) => (
              <li key={`timeline-${approval.id}`}>
                <strong>{approval.actionId} requested</strong>
                <span>{approval.recordType.replaceAll("_", " ")} {approval.recordId} needs {approval.stepId} by {formatDateTime(new Date(approval.dueAt))}.</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </section>
  );
}

function WorkflowDiagram({ guide }: { guide: WorkflowGuide }) {
  return (
    <div className="table-panel workflow-diagram" aria-label={`${guide.title} diagram`}>
      <div className="panel-heading">
        <h3>Diagram</h3>
        <Badge tone="info"><GitBranch aria-hidden="true" size={16} /> {guide.steps.length} nodes</Badge>
      </div>
      <ol className="workflow-node-list">
        {guide.steps.map((step, index) => (
          <li key={step.id}>
            <span className={`workflow-node workflow-node-${step.diagramNode.kind}`}>
              <strong>{step.diagramNode.label}</strong>
              <small>{step.diagramNode.kind.replaceAll("_", " ")}</small>
            </span>
            {index < guide.steps.length - 1 ? <span className="workflow-edge" aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function GuidedWorkflowOverlay() {
  const auth = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [session, setSession] = useState<ActiveGuideSession | null>(() => readActiveGuideSession());
  const [busy, setBusy] = useState(false);

  const guide = useMemo(
    () => defaultWorkflowGuides.find((candidate) => candidate.id === session?.guideId) ?? null,
    [session?.guideId]
  );
  const step = guide?.steps[session?.stepIndex ?? 0] ?? null;

  useEffect(() => {
    const sync = () => setSession(readActiveGuideSession());
    window.addEventListener(activeGuideEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(activeGuideEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!step) {
      return;
    }
    let highlighted: Element | null = null;
    let cancelled = false;
    let attempts = 0;
    let retryTimer: number | undefined;

    const highlightTarget = () => {
      if (cancelled) {
        return;
      }
      const element = document.querySelector(step.uiSelector);
      if (element) {
        highlighted = element;
        element.classList.add("guide-highlight");
        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        return;
      }
      attempts += 1;
      if (attempts < 20) {
        retryTimer = window.setTimeout(highlightTarget, 50);
      }
    };

    highlightTarget();
    return () => {
      cancelled = true;
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
      highlighted?.classList.remove("guide-highlight");
    };
  }, [step, session?.stepIndex]);

  if (!session || !guide || !step) {
    return null;
  }

  const onTargetRoute = window.location.pathname === step.routeTarget;

  async function confirmStep() {
    if (!auth.session || !session || !guide || !step) {
      return;
    }
    setBusy(true);
    try {
      await recordWorkflowRunEvent(auth.session.accessToken, session.runId, {
        stepId: step.id,
        eventType: "step_confirmed",
        message: `${step.title} confirmed from guided overlay.`
      });
      const nextStepIndex = Math.min(session.stepIndex + 1, guide.steps.length - 1);
      if (session.stepIndex >= guide.steps.length - 1) {
        const response = await completeWorkflowRun(auth.session.accessToken, session.runId);
        writeActiveGuideSession(null);
        toast.showToast({
          title: response.run.run.status === "rolled_back" ? "Practice rolled back" : "Workflow complete",
          description: response.run.run.rollbackSummary ?? guide.title
        });
      } else {
        writeActiveGuideSession({ ...session, stepIndex: nextStepIndex });
        const nextStep = guide.steps[nextStepIndex];
        if (!nextStep) {
          return;
        }
        toast.showToast({ title: "Next step", description: nextStep.title });
        if (nextStep.routeTarget !== window.location.pathname) {
          await navigate({ to: nextStep.routeTarget as never });
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className={`guided-overlay${session.mode === "practice" ? " practice" : ""}`} aria-label="Guided workflow">
      <div>
        <Badge tone={session.mode === "practice" ? "warning" : "info"}>
          {session.mode === "practice" ? "Practice mode" : "Show me"}
        </Badge>
        <button className="icon-button" type="button" aria-label="Close guide" onClick={() => writeActiveGuideSession(null)}>
          <X aria-hidden="true" size={16} />
        </button>
      </div>
      <h3>{guide.title}</h3>
      <p><strong>{session.stepIndex + 1}. {step.title}</strong></p>
      <p>{step.helpText}</p>
      <p className="muted-line">Expected: {step.expectedResult}</p>
      {session.mode === "practice" ? (
        <p className="practice-banner">Demo data only. Completing this run rolls back the practice transaction.</p>
      ) : null}
      <div className="action-row">
        {!onTargetRoute ? (
          <Button type="button" variant="secondary" size="sm" onClick={() => void navigate({ to: step.routeTarget as never })}>
            Open screen
          </Button>
        ) : null}
        <Button type="button" onClick={() => void confirmStep()} disabled={busy}>
          <CheckCircle2 aria-hidden="true" size={18} />
          {session.stepIndex >= guide.steps.length - 1 ? "Finish" : "Confirm"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            toast.showToast({ title: "Step help", description: step.failureText });
          }}
        >
          <HelpCircle aria-hidden="true" size={16} />
          Help
        </Button>
      </div>
    </aside>
  );
}
