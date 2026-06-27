import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, FileClock, GitPullRequest, ShieldCheck, XCircle } from "lucide-react";
import { Badge, Button, EmptyState, Input, LoadingState, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import { useI18n } from "./i18n/I18nProvider";
import {
  applyChangeRequest,
  createChangeRequest,
  decideChangeRequest,
  listChangeRequests,
  submitChangeRequest
} from "./lib/api";
import type { ChangeRequestDetail, ChangeReviewerCategory, ChangeRequestType, ChangeRiskLevel } from "./types";

const seededFormulaDraftId = "formula-lm-tincture-v2-draft";
const seededFormulaCurrentId = "formula-lm-tincture-v1";

export function ChangeControlScreen() {
  const auth = useAuth();
  const { formatDate, formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<ChangeRequestDetail[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<ChangeRequestType>("formula");
  const [riskLevel, setRiskLevel] = useState<ChangeRiskLevel>("medium");
  const [reason, setReason] = useState("Increase Lion's Mane beta-glucan target for July production.");
  const [effectiveDate, setEffectiveDate] = useState("2026-07-01");
  const [approvalCategory, setApprovalCategory] = useState<ChangeReviewerCategory>("production");
  const [approvalReason, setApprovalReason] = useState("Reviewed impact and approve controlled release.");

  const selected = requests.find((request) => request.changeRequest.id === selectedId) ?? requests[0] ?? null;
  const approvedCategories = new Set(
    selected?.approvals.filter((approval) => approval.decision === "approved").map((approval) => approval.category) ?? []
  );
  const missingCategories = selected
    ? selected.changeRequest.requiredReviewerCategories.filter((category) => !approvedCategories.has(category))
    : [];

  useEffect(() => {
    if (!auth.session) {
      return;
    }
    void load();
  }, [auth.session]);

  async function load(nextSelectedId?: string) {
    if (!auth.session) {
      return;
    }
    setLoading(true);
    try {
      const response = await listChangeRequests(auth.session.accessToken);
      setRequests(response.changeRequests);
      setSelectedId(nextSelectedId ?? response.changeRequests[0]?.changeRequest.id ?? "");
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Change requests could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function createRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }
    setBusy(true);
    try {
      const response = await createChangeRequest(auth.session.accessToken, {
        type,
        riskLevel,
        reason,
        proposedEffectiveDate: effectiveDate ? new Date(`${effectiveDate}T00:00:00.000Z`).toISOString() : null,
        items: [
          {
            entityType: "formula_revision",
            entityId: seededFormulaDraftId,
            action: "create_revision",
            currentRevisionId: seededFormulaCurrentId,
            afterJson: { revisionCode: `v2-${String(Date.now()).slice(-4)}` }
          }
        ]
      });
      showToast({ title: "Change request created", description: response.changeRequest.changeRequest.changeNumber });
      await load(response.changeRequest.changeRequest.id);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Change request could not be created.");
    } finally {
      setBusy(false);
    }
  }

  async function submitSelected() {
    if (!auth.session || !selected) {
      return;
    }
    await runAction("Submitted for review", () => submitChangeRequest(auth.session!.accessToken, selected.changeRequest.id));
  }

  async function approveSelected(decision: "approved" | "rejected") {
    if (!auth.session || !selected) {
      return;
    }
    await runAction(decision === "approved" ? "Decision recorded" : "Change rejected", () =>
      decideChangeRequest(auth.session!.accessToken, selected.changeRequest.id, {
        category: approvalCategory,
        decision,
        reason: approvalReason
      })
    );
  }

  async function applySelected() {
    if (!auth.session || !selected) {
      return;
    }
    await runAction("Approved change applied", () => applyChangeRequest(auth.session!.accessToken, selected.changeRequest.id));
  }

  async function runAction(title: string, action: () => Promise<{ changeRequest: ChangeRequestDetail }>) {
    setBusy(true);
    try {
      const response = await action();
      showToast({ title, description: response.changeRequest.changeRequest.changeNumber });
      await load(response.changeRequest.changeRequest.id);
      setError(null);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Change request action failed.");
    } finally {
      setBusy(false);
    }
  }

  const impactMetrics = useMemo(() => {
    if (!selected) {
      return [];
    }
    return [
      ["Open production", selected.impact.openProductionOrders.length],
      ["Open POs", selected.impact.openPurchaseOrders.length],
      ["Existing lots", selected.impact.existingLots.length],
      ["Labels", selected.impact.labels.length],
      ["QC specs", selected.impact.qcSpecifications.length],
      ["Shopify SKUs", selected.impact.shopifySkus.length],
      ["Wholesale quotes", selected.impact.pendingWholesaleQuotes.length]
    ] as const;
  }, [selected]);

  if (loading) {
    return <LoadingState title="Loading change control" description="Fetching current change requests." />;
  }

  return (
    <section className="screen-grid" aria-labelledby="change-control-title">
      <div className="screen-heading">
        <p className="eyebrow">Engineering control</p>
        <h2 id="change-control-title">Change requests</h2>
        <p>Formulas, BOMs, routings, QC specs, labels, and product master data.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <form className="table-panel compact-form-grid" onSubmit={createRequest}>
        <div className="panel-heading">
          <h3>Propose change</h3>
          <Badge tone="info">Formula draft</Badge>
        </div>
        <label className="select-field">
          <span>Type</span>
          <select value={type} onChange={(event) => setType(event.target.value as ChangeRequestType)}>
            <option value="formula">Formula</option>
            <option value="bom">BOM</option>
            <option value="qc_spec">QC spec</option>
            <option value="label">Label</option>
            <option value="product_master">Product master</option>
          </select>
        </label>
        <label className="select-field">
          <span>Risk</span>
          <select value={riskLevel} onChange={(event) => setRiskLevel(event.target.value as ChangeRiskLevel)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </label>
        <Input label="Effective date" type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
        <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
        <Button type="submit" disabled={busy}>
          <GitPullRequest aria-hidden="true" size={18} />
          Create request
        </Button>
      </form>

      <div className="screen-grid two-column-grid">
        <div className="table-panel">
          <div className="panel-heading">
            <h3>Requests</h3>
            <Badge tone="info">{formatNumber(requests.length)} records</Badge>
          </div>
          <div className="record-list" aria-label="Change request list">
            {requests.map((request) => (
              <button
                className={`record-card ${selected?.changeRequest.id === request.changeRequest.id ? "selected" : ""}`}
                key={request.changeRequest.id}
                type="button"
                onClick={() => setSelectedId(request.changeRequest.id)}
              >
                <strong>{request.changeRequest.changeNumber}</strong>
                <span>{request.changeRequest.reason}</span>
                <Badge tone={statusTone(request.changeRequest.status)}>{request.changeRequest.status}</Badge>
              </button>
            ))}
            {requests.length === 0 ? (
              <EmptyState title="No change requests" description="Create a controlled change before altering production definitions." />
            ) : null}
          </div>
        </div>

        {selected ? (
          <div className="detail-panel">
            <div className="panel-heading">
              <h3>{selected.changeRequest.changeNumber}</h3>
              <Badge tone={statusTone(selected.changeRequest.status)}>{selected.changeRequest.status}</Badge>
            </div>
            <p>{selected.changeRequest.reason}</p>
            <dl className="sync-metrics">
              <div><dt>Type</dt><dd>{selected.changeRequest.type}</dd></div>
              <div><dt>Risk</dt><dd>{selected.changeRequest.riskLevel}</dd></div>
              <div><dt>Effective</dt><dd>{selected.changeRequest.proposedEffectiveDate ? formatDate(new Date(selected.changeRequest.proposedEffectiveDate)) : "Not set"}</dd></div>
            </dl>

            <Tabs
              tabs={[
                {
                  id: "impact",
                  label: "Impact",
                  content: (
                    <div className="stack">
                      <div className="metric-grid">
                        {impactMetrics.map(([label, value]) => (
                          <article className="metric-panel" key={label}>
                            <span>{label}</span>
                            <strong>{formatNumber(value)}</strong>
                          </article>
                        ))}
                      </div>
                      <ImpactTable selected={selected} />
                    </div>
                  )
                },
                {
                  id: "approval",
                  label: "Approval",
                  content: (
                    <div className="stack">
                      <div className="approval-strip">
                        {selected.changeRequest.requiredReviewerCategories.map((category) => (
                          <Badge key={category} tone={approvedCategories.has(category) ? "success" : "warning"}>
                            <ShieldCheck aria-hidden="true" size={16} />
                            {category}
                          </Badge>
                        ))}
                      </div>
                      <label className="select-field">
                        <span>Reviewer category</span>
                        <select value={approvalCategory} onChange={(event) => setApprovalCategory(event.target.value as ChangeReviewerCategory)}>
                          {selected.changeRequest.requiredReviewerCategories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </label>
                      <Input label="Decision reason" value={approvalReason} onChange={(event) => setApprovalReason(event.target.value)} />
                      <div className="inline-actions">
                        <Button type="button" onClick={submitSelected} disabled={busy || selected.changeRequest.status !== "draft"}>
                          <FileClock aria-hidden="true" size={18} />
                          Submit
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => approveSelected("approved")} disabled={busy || selected.changeRequest.status !== "in_review"}>
                          <CheckCircle2 aria-hidden="true" size={18} />
                          Approve
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => approveSelected("rejected")} disabled={busy || selected.changeRequest.status !== "in_review"}>
                          <XCircle aria-hidden="true" size={18} />
                          Reject
                        </Button>
                        <Button type="button" onClick={applySelected} disabled={busy || selected.changeRequest.status !== "approved"}>
                          <CheckCircle2 aria-hidden="true" size={18} />
                          Apply
                        </Button>
                      </div>
                      <p className="muted-line">
                        Missing approvals: {missingCategories.length > 0 ? missingCategories.join(", ") : "none"}
                      </p>
                    </div>
                  )
                },
                {
                  id: "history",
                  label: "History",
                  content: (
                    <div className="timeline-list" aria-label="Change history timeline">
                      {selected.history.map((event) => (
                        <article key={event.id}>
                          <strong>{event.eventType}</strong>
                          <span>{formatDateTime(new Date(event.occurredAt))}</span>
                        </article>
                      ))}
                      {selected.history.length === 0 ? <p className="muted-line">No audit events yet.</p> : null}
                    </div>
                  )
                }
              ]}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ImpactTable({ selected }: { selected: ChangeRequestDetail }) {
  return (
    <table className="list-table">
      <thead>
        <tr><th>Area</th><th>Affected active work</th></tr>
      </thead>
      <tbody>
        <tr><td>Production orders</td><td>{selected.impact.openProductionOrders.map((order) => order.orderNumber).join(", ") || "None"}</td></tr>
        <tr><td>Purchase orders</td><td>{selected.impact.openPurchaseOrders.map((order) => order.poNumber).join(", ") || "None"}</td></tr>
        <tr><td>Lots</td><td>{selected.impact.existingLots.map((lot) => lot.lotCode).join(", ") || "None"}</td></tr>
        <tr><td>Labels</td><td>{selected.impact.labels.map((label) => `${label.labelCode} ${label.revisionCode}`).join(", ") || "None"}</td></tr>
        <tr><td>QC specs</td><td>{selected.impact.qcSpecifications.map((spec) => `${spec.specCode ?? spec.id} ${spec.versionCode ?? ""}`).join(", ") || "None"}</td></tr>
        <tr><td>Shopify SKUs</td><td>{selected.impact.shopifySkus.map((variant) => variant.sku).join(", ") || "None"}</td></tr>
        <tr><td>Wholesale quotes</td><td>{selected.impact.pendingWholesaleQuotes.map((quote) => quote.quoteNumber).join(", ") || "None"}</td></tr>
      </tbody>
    </table>
  );
}

function statusTone(status: ChangeRequestDetail["changeRequest"]["status"]) {
  if (status === "approved" || status === "applied") {
    return "success";
  }
  if (status === "rejected" || status === "cancelled") {
    return "warning";
  }
  return "info";
}
