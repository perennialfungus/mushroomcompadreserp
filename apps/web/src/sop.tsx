import {
  CheckCircle2,
  ClipboardCheck,
  GitCompare,
  PackageSearch,
  Play,
  RefreshCw,
  ShieldAlert,
  TrendingUp
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth";
import { Badge, Button, Input, Tabs, useToast } from "./components/ui";
import { useI18n } from "./i18n/I18nProvider";
import {
  approveDemandForecast,
  createPlanningScenario,
  getSopDashboard,
  listDemandForecasts,
  listPlanningScenarios
} from "./lib/api";
import type { DemandForecast, PlanningScenario, ScenarioRiskItem, SopDashboard } from "./types";

function sourceLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function riskTone(severity: ScenarioRiskItem["severity"]): "info" | "warning" | "success" {
  return severity === "critical" || severity === "warning" ? "warning" : "info";
}

function defaultDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function SopScreen() {
  const auth = useAuth();
  const toast = useToast();
  const { formatDate, formatDateTime, formatNumber } = useI18n();
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [scenarios, setScenarios] = useState<PlanningScenario[]>([]);
  const [dashboard, setDashboard] = useState<SopDashboard | null>(null);
  const [selectedForecastId, setSelectedForecastId] = useState("forecast-july-boost");
  const [scenarioName, setScenarioName] = useState("July promotion S&OP");
  const [horizonStart, setHorizonStart] = useState(defaultDate(1));
  const [horizonEnd, setHorizonEnd] = useState(defaultDate(31));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedForecast = useMemo(
    () => forecasts.find((forecast) => forecast.id === selectedForecastId) ?? forecasts[0] ?? null,
    [forecasts, selectedForecastId]
  );
  const latestScenario = scenarios[0] ?? dashboard?.scenarios[0] ?? null;
  const risks = latestScenario?.riskItems ?? [];

  async function loadPlanning() {
    if (!auth.session) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [forecastResponse, scenarioResponse, dashboardResponse] = await Promise.all([
        listDemandForecasts(auth.session.accessToken),
        listPlanningScenarios(auth.session.accessToken),
        getSopDashboard(auth.session.accessToken)
      ]);
      setForecasts(forecastResponse.forecasts);
      setScenarios(scenarioResponse.scenarios);
      setDashboard(dashboardResponse.dashboard);
      setSelectedForecastId((current) => forecastResponse.forecasts.some((forecast) => forecast.id === current)
        ? current
        : forecastResponse.forecasts[0]?.id ?? "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "S&OP planning could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlanning();
  }, [auth.session]);

  async function approveForecast() {
    if (!auth.session || !selectedForecast) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await approveDemandForecast(
        auth.session.accessToken,
        selectedForecast.id,
        "Approved for forecast-to-MRP planning handoff."
      );
      setForecasts((current) => current.map((forecast) => forecast.id === response.forecast.id ? response.forecast : forecast));
      toast.showToast({ title: "Forecast approved", description: "Forecast demand is available to MRP." });
      await loadPlanning();
    } catch (approvalError) {
      setError(approvalError instanceof Error ? approvalError.message : "Forecast could not be approved.");
    } finally {
      setSaving(false);
    }
  }

  async function createScenario() {
    if (!auth.session) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await createPlanningScenario(auth.session.accessToken, {
        name: scenarioName,
        forecastId: selectedForecastId || null,
        horizonStart: `${horizonStart}T00:00:00.000Z`,
        horizonEnd: `${horizonEnd}T23:59:59.000Z`,
        notes: "Management review scenario for forecast, supply, capacity, expiry, purchasing, and service risk.",
        serviceLevelTarget: 0.98
      });
      setScenarios((current) => [response.scenario, ...current.filter((scenario) => scenario.id !== response.scenario.id)]);
      toast.showToast({ title: "Scenario created", description: response.scenario.name });
      await loadPlanning();
    } catch (scenarioError) {
      setError(scenarioError instanceof Error ? scenarioError.message : "Scenario could not be created.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="screen-grid" aria-labelledby="sop-title">
      <div className="screen-heading">
        <p className="eyebrow">Planning</p>
        <h2 id="sop-title">S&OP dashboard</h2>
        <p>Forecast demand, supply scenarios, and management review decisions.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="metric-grid">
        <article className="metric-panel">
          <span>Forecast scenarios</span>
          <strong>{formatNumber(forecasts.length)}</strong>
        </article>
        <article className="metric-panel">
          <span>Approved forecasts</span>
          <strong>{formatNumber(forecasts.filter((forecast) => forecast.status === "approved").length)}</strong>
        </article>
        <article className="metric-panel">
          <span>Scenario risks</span>
          <strong>{formatNumber(risks.length)}</strong>
        </article>
        <article className="metric-panel">
          <span>Now decisions</span>
          <strong>{formatNumber(dashboard?.managementReview.find((section) => section.horizon === "now")?.decisionCount ?? 0)}</strong>
        </article>
      </div>

      <Tabs
        tabs={[
          {
            id: "forecast",
            label: "Forecast editor",
            content: (
              <div className="split-grid">
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Forecast editor</h3>
                    <Badge tone={selectedForecast?.status === "approved" ? "success" : "info"}>
                      <TrendingUp aria-hidden="true" size={16} />
                      {selectedForecast ? sourceLabel(selectedForecast.status) : "Loading"}
                    </Badge>
                  </div>
                  <label className="select-field">
                    <span>Forecast</span>
                    <select
                      aria-label="Forecast scenario"
                      value={selectedForecastId}
                      onChange={(event) => setSelectedForecastId(event.target.value)}
                    >
                      {forecasts.map((forecast) => (
                        <option key={forecast.id} value={forecast.id}>{forecast.name}</option>
                      ))}
                    </select>
                  </label>
                  <table className="list-table">
                    <thead><tr><th>SKU</th><th>Region</th><th>Period</th><th>Forecast</th><th>Drivers</th></tr></thead>
                    <tbody>
                      {(selectedForecast?.aggregatedLines ?? []).map((line) => (
                        <tr key={line.key}>
                          <td>
                            {line.productName}
                            <div className="muted-line">{line.sku} / {line.productFamily}</div>
                          </td>
                          <td>{line.region}<div className="muted-line">{line.shopifyChannel ? sourceLabel(line.shopifyChannel) : "All channels"}</div></td>
                          <td>{formatDate(new Date(line.periodStart))}</td>
                          <td><strong>{formatNumber(line.quantity)} {line.uom}</strong></td>
                          <td>
                            Historical {formatNumber(line.driverBreakdown.historical_sales)} / Promo {formatNumber(line.driverBreakdown.promotion)}
                            {line.manualOverrideReason ? <div className="muted-line">{line.manualOverrideReason}</div> : null}
                          </td>
                        </tr>
                      ))}
                      {loading ? <tr><td colSpan={5}>Loading forecasts...</td></tr> : null}
                    </tbody>
                  </table>
                </div>
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Forecast-to-MRP approval</h3>
                    <Badge tone="info"><ClipboardCheck aria-hidden="true" size={16} /> Handoff</Badge>
                  </div>
                  <p className="muted-line">{selectedForecast?.notes}</p>
                  <Button type="button" onClick={() => void approveForecast()} disabled={!selectedForecast || selectedForecast.status === "approved" || saving}>
                    <CheckCircle2 aria-hidden="true" size={18} />
                    {selectedForecast?.status === "approved" ? "Approved" : "Approve to MRP"}
                  </Button>
                  {selectedForecast?.approvedAt ? (
                    <p className="muted-line">Approved {formatDateTime(new Date(selectedForecast.approvedAt))}</p>
                  ) : null}
                </div>
              </div>
            )
          },
          {
            id: "planner",
            label: "Scenario planner",
            content: (
              <div className="table-panel compact-form-grid">
                <Input label="Scenario name" value={scenarioName} onChange={(event) => setScenarioName(event.target.value)} />
                <Input label="Horizon start" type="date" value={horizonStart} onChange={(event) => setHorizonStart(event.target.value)} />
                <Input label="Horizon end" type="date" value={horizonEnd} onChange={(event) => setHorizonEnd(event.target.value)} />
                <label className="select-field">
                  <span>Forecast</span>
                  <select
                    aria-label="Scenario forecast"
                    value={selectedForecastId}
                    onChange={(event) => setSelectedForecastId(event.target.value)}
                  >
                    {forecasts.map((forecast) => (
                      <option key={forecast.id} value={forecast.id}>{forecast.name}</option>
                    ))}
                  </select>
                </label>
                <div className="form-actions">
                  <Button type="button" onClick={() => void createScenario()} disabled={saving}>
                    <Play aria-hidden="true" size={18} />
                    {saving ? "Creating" : "Create scenario"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => void loadPlanning()} disabled={loading}>
                    <RefreshCw aria-hidden="true" size={18} />
                    Refresh
                  </Button>
                </div>
              </div>
            )
          },
          {
            id: "comparison",
            label: "Comparison report",
            content: (
              <div className="split-grid">
                <ScenarioTable scenarios={scenarios.length > 0 ? scenarios : dashboard?.scenarios ?? []} formatNumber={formatNumber} formatDateTime={formatDateTime} />
                <RiskTable risks={risks} formatNumber={formatNumber} />
              </div>
            )
          },
          {
            id: "review",
            label: "Management review",
            content: (
              <div className="split-grid">
                {(dashboard?.managementReview ?? []).map((section) => (
                  <div className="table-panel" key={section.horizon}>
                    <div className="panel-heading">
                      <h3>{sourceLabel(section.horizon)}</h3>
                      <Badge tone={section.criticalCount > 0 ? "warning" : "success"}>
                        <ShieldAlert aria-hidden="true" size={16} />
                        {formatNumber(section.decisionCount)} decisions
                      </Badge>
                    </div>
                    <table className="list-table">
                      <thead><tr><th>Risk</th><th>Impact</th></tr></thead>
                      <tbody>
                        {section.topRisks.map((risk) => (
                          <tr key={risk.id}>
                            <td><Badge tone={riskTone(risk.severity)}>{sourceLabel(risk.riskType)}</Badge><div className="muted-line">{risk.title}</div></td>
                            <td>{risk.impact}</td>
                          </tr>
                        ))}
                        {section.topRisks.length === 0 ? <tr><td colSpan={2}>No decisions in this horizon.</td></tr> : null}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )
          }
        ]}
      />
    </section>
  );
}

function ScenarioTable({
  scenarios,
  formatNumber,
  formatDateTime
}: {
  scenarios: PlanningScenario[];
  formatNumber: (value: number) => string;
  formatDateTime: (value: Date) => string;
}) {
  return (
    <div className="table-panel">
      <div className="panel-heading">
        <h3>Scenario comparison report</h3>
        <Badge tone="info"><GitCompare aria-hidden="true" size={16} /> {formatNumber(scenarios.length)} scenarios</Badge>
      </div>
      <table className="list-table">
        <thead><tr><th>Scenario</th><th>Shortages</th><th>Capacity</th><th>Risks</th></tr></thead>
        <tbody>
          {scenarios.map((scenario) => (
            <tr key={scenario.id}>
              <td>
                {scenario.name}
                <div className="muted-line">{formatDateTime(new Date(scenario.createdAt))}</div>
              </td>
              <td>{formatNumber(scenario.supplyDemandLines.reduce((total, line) => total + line.shortageQuantity, 0))}</td>
              <td>{formatNumber(scenario.capacityLines.filter((line) => line.overloadMinutes > 0).length)} overloads</td>
              <td>{formatNumber(scenario.riskItems.length)}</td>
            </tr>
          ))}
          {scenarios.length === 0 ? <tr><td colSpan={4}>No scenarios created yet.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function RiskTable({ risks, formatNumber }: { risks: ScenarioRiskItem[]; formatNumber: (value: number) => string }) {
  return (
    <div className="table-panel">
      <div className="panel-heading">
        <h3>Risk scorecard</h3>
        <Badge tone="warning"><PackageSearch aria-hidden="true" size={16} /> {formatNumber(risks.length)} risks</Badge>
      </div>
      <table className="list-table">
        <thead><tr><th>Risk</th><th>Impact</th><th>Horizon</th></tr></thead>
        <tbody>
          {risks.map((risk) => (
            <tr key={risk.id}>
              <td><Badge tone={riskTone(risk.severity)}>{sourceLabel(risk.riskType)}</Badge><div className="muted-line">{risk.title}</div></td>
              <td>{risk.impact}</td>
              <td>{sourceLabel(risk.managementHorizon)}</td>
            </tr>
          ))}
          {risks.length === 0 ? <tr><td colSpan={3}>Create a scenario to compare risks.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}
