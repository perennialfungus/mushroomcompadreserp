import { CalendarClock, History, MessageSquarePlus, PlusCircle, RefreshCw, Users } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Badge, Button, EmptyState, Input, useToast } from "./components/ui";
import { useAuth } from "./auth";
import {
  createCrmInteraction,
  createLead,
  getCrmDashboard,
  getLeadDetail,
  listCrmOwners,
  listLeads,
} from "./lib/api";
import { useI18n } from "./i18n/I18nProvider";
import type { AdminUser, CrmDashboard, CrmFilters, CrmInteraction, Lead, LeadDetail, LeadStatus } from "./types";

const leadStatuses: LeadStatus[] = ["new", "contacted", "qualified", "unqualified", "converted", "lost"];
const leadSources = ["expo", "referral", "shopify", "reseller", "website"];

function dateInputToIso(value: string): string | undefined {
  return value ? new Date(`${value}T23:59:59.999Z`).toISOString() : undefined;
}

function ownerName(users: AdminUser[], ownerUserId: string | null): string {
  return users.find((user) => user.id === ownerUserId)?.displayName ?? "Unassigned";
}

function interactionTone(type: CrmInteraction["type"]): "neutral" | "success" | "warning" | "info" {
  if (type === "follow_up" || type === "task") {
    return "warning";
  }
  if (type === "call" || type === "meeting") {
    return "info";
  }
  if (type === "email") {
    return "success";
  }
  return "neutral";
}

export function CrmScreen() {
  const auth = useAuth();
  const toast = useToast();
  const { formatDateTime } = useI18n();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dashboard, setDashboard] = useState<CrmDashboard | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>("lead-bio-lisbon");
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerFilter, setOwnerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [nextActionTo, setNextActionTo] = useState("");
  const [leadName, setLeadName] = useState("New retail lead");
  const [leadCompany, setLeadCompany] = useState("Neighborhood Apothecary");
  const [leadEmail, setLeadEmail] = useState("buyer@example.test");
  const [interactionSummary, setInteractionSummary] = useState("Shared wholesale terms and agreed to send samples.");
  const [followUpDate, setFollowUpDate] = useState("2026-06-30");

  const canMutate = Boolean(
    auth.isAdmin || auth.userContext?.roles.some((role) => role.code === "sales_wholesale")
  );
  const filters = useMemo<CrmFilters>(
    () => {
      const nextFilters: CrmFilters = {};
      if (ownerFilter) nextFilters.ownerUserId = ownerFilter;
      if (statusFilter) nextFilters.status = statusFilter as LeadStatus;
      if (sourceFilter) nextFilters.source = sourceFilter;
      const nextActionIso = dateInputToIso(nextActionTo);
      if (nextActionIso) nextFilters.nextActionTo = nextActionIso;
      return nextFilters;
    },
    [nextActionTo, ownerFilter, sourceFilter, statusFilter]
  );

  async function loadCrm() {
    if (!auth.session) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [userResponse, leadResponse, dashboardResponse] = await Promise.all([
        listCrmOwners(auth.session.accessToken),
        listLeads(auth.session.accessToken, filters),
        getCrmDashboard(auth.session.accessToken, filters)
      ]);
      setUsers(userResponse.owners);
      setLeads(leadResponse.leads);
      setDashboard(dashboardResponse);
      const nextSelected = selectedLeadId ?? leadResponse.leads[0]?.id ?? null;
      setSelectedLeadId(nextSelected);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "CRM data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCrm();
  }, [auth.session, filters]);

  useEffect(() => {
    if (!auth.session || !selectedLeadId) {
      setSelectedLead(null);
      return;
    }
    getLeadDetail(auth.session.accessToken, selectedLeadId)
      .then((detail) => setSelectedLead(detail))
      .catch(() => setSelectedLead(null));
  }, [auth.session, selectedLeadId]);

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !canMutate) {
      return;
    }
    try {
      const response = await createLead(auth.session.accessToken, {
        name: leadName,
        company: leadCompany,
        email: leadEmail,
        status: "new",
        source: "website",
        ownerUserId: ownerFilter || auth.userContext?.userId || null,
        notes: "Captured from sales workspace."
      });
      setSelectedLeadId(response.lead.id);
      toast.showToast({ title: "Lead created", description: response.lead.name });
      await loadCrm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Lead could not be created.");
    }
  }

  async function submitInteraction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !canMutate || !selectedLeadId) {
      return;
    }
    try {
      await createCrmInteraction(auth.session.accessToken, {
        leadId: selectedLeadId,
        type: "follow_up",
        summary: interactionSummary,
        occurredAt: new Date().toISOString(),
        ownerUserId: ownerFilter || auth.userContext?.userId || null,
        nextActionAt: followUpDate ? new Date(`${followUpDate}T09:00:00.000Z`).toISOString() : null
      });
      toast.showToast({ title: "Interaction logged", description: selectedLead?.lead.name ?? "CRM timeline updated" });
      await loadCrm();
      if (selectedLeadId) {
        setSelectedLead(await getLeadDetail(auth.session.accessToken, selectedLeadId));
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Interaction could not be logged.");
    }
  }

  return (
    <section className="screen-grid" aria-labelledby="crm-title">
      <div className="screen-heading">
        <p className="eyebrow">Sales CRM</p>
        <h2 id="crm-title">Sales follow-up dashboard</h2>
        <p>Lead activity, reseller touchpoints, and next actions stay visible for the sales team.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="filter-bar" aria-label="CRM filters">
        <label>
          <span>Owner</span>
          <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
            <option value="">All owners</option>
            {users.map((user) => (
              <option value={user.id} key={user.id}>
                {user.displayName}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            {leadStatuses.map((status) => (
              <option value={status} key={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Source</span>
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
            <option value="">All sources</option>
            {leadSources.map((source) => (
              <option value={source} key={source}>
                {source}
              </option>
            ))}
          </select>
        </label>
        <Input label="Next action by" type="date" value={nextActionTo} onChange={(event) => setNextActionTo(event.target.value)} />
        <Button variant="secondary" onClick={() => void loadCrm()} type="button">
          <RefreshCw aria-hidden="true" size={18} />
          Refresh
        </Button>
      </div>

      <div className="metric-grid">
        <article className="metric-panel">
          <span>Upcoming follow-ups</span>
          <strong>{dashboard?.upcomingFollowUps.length ?? 0}</strong>
        </article>
        <article className="metric-panel">
          <span>Open leads</span>
          <strong>{leads.length}</strong>
        </article>
        <article className="metric-panel">
          <span>Recent interactions</span>
          <strong>{dashboard?.recentInteractions.length ?? 0}</strong>
        </article>
      </div>

      <div className="split-grid">
        <div className="table-panel">
          <div className="panel-heading">
            <h3>Upcoming follow-ups</h3>
            <Badge tone="warning">
              <CalendarClock aria-hidden="true" size={16} />
              Date filtered
            </Badge>
          </div>
          {loading ? (
            <p>Loading CRM...</p>
          ) : (
            <table className="list-table">
              <thead>
                <tr><th>Next action</th><th>Owner</th><th>Summary</th></tr>
              </thead>
              <tbody>
                {(dashboard?.upcomingFollowUps ?? []).map((interaction) => (
                  <tr key={interaction.id}>
                    <td>{interaction.nextActionAt ? formatDateTime(new Date(interaction.nextActionAt)) : "-"}</td>
                    <td>{ownerName(users, interaction.ownerUserId)}</td>
                    <td>{interaction.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Recent interactions</h3>
            <Badge tone="info">
              <History aria-hidden="true" size={16} />
              Timeline
            </Badge>
          </div>
          <div className="timeline-list">
            {(dashboard?.recentInteractions ?? []).map((interaction) => (
              <article key={interaction.id}>
                <Badge tone={interactionTone(interaction.type)}>{interaction.type}</Badge>
                <div>
                  <strong>{interaction.summary}</strong>
                  <span>{formatDateTime(new Date(interaction.occurredAt))} by {ownerName(users, interaction.ownerUserId)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="split-grid">
        <div className="table-panel">
          <div className="panel-heading">
            <h3>Leads</h3>
            <Badge tone="info">
              <Users aria-hidden="true" size={16} />
              {leads.length}
            </Badge>
          </div>
          <table className="list-table">
            <thead>
              <tr><th>Name</th><th>Status</th><th>Source</th><th>Owner</th></tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <button className="link-button" type="button" onClick={() => setSelectedLeadId(lead.id)}>
                      {lead.name}
                    </button>
                    <div className="muted-line">{lead.company ?? lead.email ?? "No company"}</div>
                  </td>
                  <td><Badge>{lead.status}</Badge></td>
                  <td>{lead.source ?? "-"}</td>
                  <td>{ownerName(users, lead.ownerUserId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Interaction timeline</h3>
            <Badge tone="neutral">{selectedLead?.lead.name ?? "No lead selected"}</Badge>
          </div>
          {selectedLead ? (
            <div className="timeline-list" aria-label="Lead interaction timeline">
              {selectedLead.interactions.map((interaction) => (
                <article key={interaction.id}>
                  <Badge tone={interactionTone(interaction.type)}>{interaction.type}</Badge>
                  <div>
                    <strong>{interaction.summary}</strong>
                    <span>
                      {formatDateTime(new Date(interaction.occurredAt))}
                      {interaction.nextActionAt ? ` | Next: ${formatDateTime(new Date(interaction.nextActionAt))}` : ""}
                    </span>
                  </div>
                </article>
              ))}
              {selectedLead.interactions.length === 0 ? (
                <EmptyState title="No interactions" description="This lead has no logged activity yet." />
              ) : null}
            </div>
          ) : (
            <EmptyState title="Select a lead" description="Lead timeline will appear here." />
          )}
        </div>
      </div>

      {canMutate ? (
        <div className="split-grid">
          <form className="table-panel stack" onSubmit={submitLead}>
            <div className="panel-heading">
              <h3>Add lead</h3>
              <PlusCircle aria-hidden="true" size={18} />
            </div>
            <Input label="Name" value={leadName} onChange={(event) => setLeadName(event.target.value)} />
            <Input label="Company" value={leadCompany} onChange={(event) => setLeadCompany(event.target.value)} />
            <Input label="Email" type="email" value={leadEmail} onChange={(event) => setLeadEmail(event.target.value)} />
            <Button type="submit">
              <PlusCircle aria-hidden="true" size={18} />
              Create lead
            </Button>
          </form>

          <form className="table-panel stack" onSubmit={submitInteraction}>
            <div className="panel-heading">
              <h3>Log follow-up</h3>
              <MessageSquarePlus aria-hidden="true" size={18} />
            </div>
            <Input
              label="Summary"
              value={interactionSummary}
              onChange={(event) => setInteractionSummary(event.target.value)}
            />
            <Input label="Next action date" type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} />
            <Button type="submit" disabled={!selectedLeadId}>
              <MessageSquarePlus aria-hidden="true" size={18} />
              Log interaction
            </Button>
          </form>
        </div>
      ) : (
        <EmptyState title="CRM is read-only" description="Only sales users and admins can change CRM records." />
      )}
    </section>
  );
}
