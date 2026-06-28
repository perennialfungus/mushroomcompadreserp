import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  ClipboardCheck,
  GripVertical,
  Factory,
  GitCompare,
  PackagePlus,
  RefreshCw,
  ShieldCheck,
  ShoppingCart
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Input, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import { useI18n } from "./i18n/I18nProvider";
import { convertMrpSuggestion, listLocations, regenerateFiniteSchedule, resequenceScheduleOperation, runMrp } from "./lib/api";
import type {
  CapacityLoadLine,
  CtpResult,
  DispatchBoardLine,
  Location,
  MaterialAvailabilityConstraint,
  MrpBucketLine,
  MrpPlan,
  MrpShortage,
  MrpSuggestion,
  RoughCutCapacityLine
} from "./types";

function suggestionTone(type: MrpSuggestion["suggestionType"]): "info" | "success" {
  return type === "production_order" ? "info" : "success";
}

function sourceLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function promiseTone(status: CtpResult["promiseStatus"]): "success" | "warning" | "info" {
  if (status === "available_now" || status === "available_by_date") {
    return "success";
  }
  return status === "late_risk" ? "warning" : "info";
}

function defaultHorizonDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

export function MrpScreen() {
  const auth = useAuth();
  const { formatDate, formatDateTime, formatNumber } = useI18n();
  const toast = useToast();
  const [plan, setPlan] = useState<MrpPlan | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [horizonDate, setHorizonDate] = useState(defaultHorizonDate);
  const [locationId, setLocationId] = useState("loc-pack");
  const [bucketGranularity, setBucketGranularity] = useState<"day" | "week">("day");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedShortage = useMemo(
    () => plan?.shortages.find((shortage) => shortage.key === selectedKey) ?? plan?.shortages[0] ?? null,
    [plan, selectedKey]
  );

  async function loadMrp() {
    if (!auth.session) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const horizonEnd = new Date(`${horizonDate}T23:59:59.000Z`).toISOString();
      const [locationResponse, planResponse] = await Promise.all([
        listLocations(auth.session.accessToken),
        runMrp(auth.session.accessToken, {
          horizonEnd,
          bucket: bucketGranularity,
          ...(locationId ? { locationId } : {})
        })
      ]);
      setLocations(locationResponse.locations);
      setPlan(planResponse.plan);
      setSelectedKey((current) => {
        if (current && planResponse.plan.shortages.some((shortage) => shortage.key === current)) {
          return current;
        }
        return planResponse.plan.shortages[0]?.key ?? null;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "MRP could not be calculated.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMrp();
  }, [auth.session]);

  async function convertSuggestion(suggestion: MrpSuggestion) {
    if (!auth.session) {
      return;
    }
    setConvertingId(suggestion.id);
    setError(null);
    try {
      const response = await convertMrpSuggestion(auth.session.accessToken, suggestion);
      const title =
        response.result.suggestionType === "purchase_order"
          ? `Draft PO ${response.result.purchaseOrder.poNumber}`
          : `Planned order ${response.result.productionOrder.orderNumber}`;
      toast.showToast({ title: "Suggestion converted", description: title });
      await loadMrp();
    } catch (convertError) {
      setError(convertError instanceof Error ? convertError.message : "Suggestion could not be converted.");
    } finally {
      setConvertingId(null);
    }
  }

  async function regenerateSchedule() {
    if (!auth.session) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const horizonEnd = new Date(`${horizonDate}T23:59:59.000Z`).toISOString();
      const response = await regenerateFiniteSchedule(auth.session.accessToken, {
        horizonEnd,
        bucket: bucketGranularity,
        ...(locationId ? { locationId } : {})
      });
      setPlan(response.plan);
      toast.showToast({
        title: "Schedule regenerated",
        description: `${response.plan.scheduleRun.operationCount} operations recalculated`
      });
    } catch (scheduleError) {
      setError(scheduleError instanceof Error ? scheduleError.message : "Schedule could not be regenerated.");
    } finally {
      setLoading(false);
    }
  }

  async function resequenceOperation(operationId: string, afterOperationId: string | null) {
    if (!auth.session) {
      return;
    }
    setError(null);
    try {
      const horizonEnd = new Date(`${horizonDate}T23:59:59.000Z`).toISOString();
      const response = await resequenceScheduleOperation(auth.session.accessToken, {
        operationId,
        afterOperationId,
        reason: "Planner drag/resequence from dispatch board",
        horizonEnd
      });
      setPlan(response.plan);
      toast.showToast({ title: "Operation resequenced", description: "Dependent operations and warnings recalculated" });
    } catch (scheduleError) {
      setError(scheduleError instanceof Error ? scheduleError.message : "Operation could not be resequenced.");
    }
  }

  return (
    <section className="screen-grid" aria-labelledby="mrp-title">
      <div className="screen-heading">
        <p className="eyebrow">Planning</p>
        <h2 id="mrp-title">MRP dashboard</h2>
        <p>Demand, released supply, shortages, and draft order suggestions.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <form
        className="table-panel compact-form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          void loadMrp();
        }}
      >
        <Input
          label="Planning horizon"
          type="date"
          value={horizonDate}
          onChange={(event) => setHorizonDate(event.target.value)}
        />
        <label className="select-field">
          <span>Location</span>
          <select value={locationId} onChange={(event) => setLocationId(event.target.value)}>
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span>Bucket</span>
          <select value={bucketGranularity} onChange={(event) => setBucketGranularity(event.target.value as "day" | "week")}>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
          </select>
        </label>
        <div className="form-actions">
          <Button type="button" variant="secondary" disabled={loading || !plan} onClick={() => void regenerateSchedule()}>
            <CalendarClock aria-hidden="true" size={18} />
            Regenerate schedule
          </Button>
          <Button type="submit" disabled={loading} data-guide="mrp.run">
            <RefreshCw aria-hidden="true" size={18} />
            {loading ? "Calculating" : "Run MRP"}
          </Button>
        </div>
      </form>

      <div className="metric-grid">
        <article className="metric-panel">
          <span>Shortage lines</span>
          <strong>{formatNumber(plan?.shortages.length ?? 0)}</strong>
        </article>
        <article className="metric-panel">
          <span>Suggestions</span>
          <strong>{formatNumber(plan?.suggestions.length ?? 0)}</strong>
        </article>
        <article className="metric-panel">
          <span>Demand rows</span>
          <strong>{formatNumber(plan?.demandCount ?? 0)}</strong>
        </article>
        <article className="metric-panel">
          <span>Supply rows</span>
          <strong>{formatNumber(plan?.supplyCount ?? 0)}</strong>
        </article>
        <article className="metric-panel">
          <span>Overloaded centers</span>
          <strong>{formatNumber(plan?.capacityLoads.filter((load) => load.overloadMinutes > 0).length ?? 0)}</strong>
        </article>
        <article className="metric-panel">
          <span>Late risks</span>
          <strong>{formatNumber(plan?.alerts.filter((alert) => alert.type === "late_promise" || alert.type === "expedite").length ?? 0)}</strong>
        </article>
      </div>

      <Tabs
        tabs={[
          {
            id: "shortages",
            label: "Shortages",
            content: (
              <div className="table-panel" data-guide="mrp.review-table">
                <div className="panel-heading">
                  <h3>Shortage report</h3>
                  <Badge tone="warning">
                    <CalendarClock aria-hidden="true" size={16} />
                    {plan ? formatDate(new Date(plan.horizonEnd)) : horizonDate}
                  </Badge>
                </div>
                {loading ? (
                  <p>Calculating MRP...</p>
                ) : (
                  <table className="list-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Demand</th>
                        <th>Supply</th>
                        <th>Shortage</th>
                        <th>Suggestion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(plan?.shortages ?? []).map((shortage) => (
                        <tr key={shortage.key}>
                          <td>
                            <button
                              className="link-button"
                              type="button"
                              onClick={() => setSelectedKey(shortage.key)}
                            >
                              {shortage.name}
                            </button>
                            <div className="muted-line">{shortage.sku ?? shortage.itemId}</div>
                          </td>
                          <td>{formatNumber(shortage.quantityDemanded)} {shortage.uom}</td>
                          <td>{formatNumber(shortage.quantitySupplied)} {shortage.uom}</td>
                          <td><strong>{formatNumber(shortage.shortageQuantity)} {shortage.uom}</strong></td>
                          <td>
                            {shortage.suggestions.map((suggestion) => (
                              <Badge key={suggestion.id} tone={suggestionTone(suggestion.suggestionType)}>
                                {sourceLabel(suggestion.suggestionType)}
                              </Badge>
                            ))}
                          </td>
                        </tr>
                      ))}
                      {(plan?.shortages.length ?? 0) === 0 ? (
                        <tr><td colSpan={5}>No shortages within the selected horizon.</td></tr>
                      ) : null}
                    </tbody>
                  </table>
                )}
              </div>
            )
          },
          {
            id: "drilldown",
            label: "Drilldown",
            content: <MrpDrilldown shortage={selectedShortage} formatNumber={formatNumber} formatDateTime={formatDateTime} />
          },
          {
            id: "time-phased",
            label: "Time phase",
            content: <TimePhasedView lines={plan?.bucketLines ?? []} formatNumber={formatNumber} formatDate={formatDate} />
          },
          {
            id: "capacity",
            label: "Capacity",
            content: (
              <CapacityView
                loads={plan?.capacityLoads ?? []}
                suggestions={plan?.finiteCapacitySuggestions ?? []}
                formatNumber={formatNumber}
                formatDateTime={formatDateTime}
              />
            )
          },
          {
            id: "finite-board",
            label: "Finite board",
            content: (
              <FiniteScheduleBoard
                plan={plan}
                formatNumber={formatNumber}
                formatDateTime={formatDateTime}
              />
            )
          },
          {
            id: "dispatch",
            label: "Dispatch",
            content: (
              <DispatchBoard
                rows={plan?.dispatchBoard ?? []}
                formatNumber={formatNumber}
                formatDateTime={formatDateTime}
                onResequence={(operationId, afterOperationId) => void resequenceOperation(operationId, afterOperationId)}
              />
            )
          },
          {
            id: "rough-cut",
            label: "Rough cut",
            content: <RoughCutCapacityView lines={plan?.roughCutCapacity ?? []} formatNumber={formatNumber} formatDate={formatDate} />
          },
          {
            id: "materials",
            label: "Materials",
            content: <MaterialConstraintView rows={plan?.materialConstraints ?? []} formatNumber={formatNumber} formatDateTime={formatDateTime} />
          },
          {
            id: "ctp",
            label: "CTP",
            content: <CapableToPromiseView rows={plan?.capableToPromise ?? []} formatNumber={formatNumber} formatDateTime={formatDateTime} />
          },
          {
            id: "history",
            label: "Run history",
            content: <ScheduleRunHistory plan={plan} formatDateTime={formatDateTime} />
          },
          {
            id: "scenarios",
            label: "Scenarios",
            content: (
              <ScenarioView
                plan={plan}
                formatNumber={formatNumber}
                formatDateTime={formatDateTime}
              />
            )
          },
          {
            id: "suggestions",
            label: "Review",
            content: (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Suggested drafts</h3>
                  <Badge tone="info"><ClipboardCheck aria-hidden="true" size={16} /> Review</Badge>
                </div>
                <table className="list-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Due</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(plan?.suggestions ?? []).map((suggestion) => (
                      <tr key={suggestion.id}>
                        <td>
                          <Badge tone={suggestionTone(suggestion.suggestionType)}>
                            {suggestion.suggestionType === "purchase_order" ? (
                              <ShoppingCart aria-hidden="true" size={16} />
                            ) : (
                              <Factory aria-hidden="true" size={16} />
                            )}
                            {sourceLabel(suggestion.suggestionType)}
                          </Badge>
                        </td>
                        <td>
                          {suggestion.name}
                          <div className="muted-line">{suggestion.reason}</div>
                        </td>
                        <td>{formatNumber(suggestion.quantity)} {suggestion.uom}</td>
                        <td>{suggestion.dueAt ? formatDate(new Date(suggestion.dueAt)) : "As soon as possible"}</td>
                        <td>
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => void convertSuggestion(suggestion)}
                            disabled={convertingId === suggestion.id}
                            data-guide="mrp.create-draft"
                          >
                            <PackagePlus aria-hidden="true" size={16} />
                            {convertingId === suggestion.id ? "Converting" : "Create draft"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {(plan?.suggestions.length ?? 0) === 0 ? (
                      <tr><td colSpan={5}>No draft suggestions for this run.</td></tr>
                    ) : null}
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

function TimePhasedView({
  lines,
  formatNumber,
  formatDate
}: {
  lines: MrpBucketLine[];
  formatNumber: (value: number) => string;
  formatDate: (value: Date) => string;
}) {
  return (
    <div className="table-panel">
      <div className="panel-heading">
        <h3>MRP time-phased view</h3>
        <Badge tone="info"><CalendarClock aria-hidden="true" size={16} /> {formatNumber(lines.length)} buckets</Badge>
      </div>
      <table className="list-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th>Demand</th>
            <th>Supply</th>
            <th>Projected</th>
            <th>Shortage</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id}>
              <td>{formatDate(new Date(line.bucketStart))}</td>
              <td>
                {line.name}
                <div className="muted-line">{line.sku ?? line.itemId}</div>
              </td>
              <td>{formatNumber(line.demandQuantity)} {line.uom}</td>
              <td>{formatNumber(line.supplyQuantity)} {line.uom}</td>
              <td>{formatNumber(line.projectedAvailableQuantity)} {line.uom}</td>
              <td>
                {line.shortageQuantity > 0 ? (
                  <Badge tone="warning">{formatNumber(line.shortageQuantity)} {line.uom}</Badge>
                ) : (
                  <Badge tone="success">Clear</Badge>
                )}
              </td>
            </tr>
          ))}
          {lines.length === 0 ? <tr><td colSpan={6}>No bucket activity in this horizon.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function CapacityView({
  loads,
  suggestions,
  formatNumber,
  formatDateTime
}: {
  loads: CapacityLoadLine[];
  suggestions: MrpPlan["finiteCapacitySuggestions"];
  formatNumber: (value: number) => string;
  formatDateTime: (value: Date) => string;
}) {
  return (
    <div className="split-grid">
      <div className="table-panel">
        <div className="panel-heading">
          <h3>Capacity load chart</h3>
          <Badge tone="warning"><BarChart3 aria-hidden="true" size={16} /> {formatNumber(loads.filter((load) => load.overloadMinutes > 0).length)} overloads</Badge>
        </div>
        <table className="list-table">
          <thead><tr><th>Resource</th><th>Date</th><th>Load</th><th>Overload</th></tr></thead>
          <tbody>
            {loads.map((load) => (
              <tr key={load.id}>
                <td>
                  {load.resourceName}
                  <div className="muted-line">{sourceLabel(load.resourceType)}</div>
                </td>
                <td>{formatDateTime(new Date(load.bucketStart))}</td>
                <td>{formatNumber(load.scheduledMinutes)} / {formatNumber(load.availableMinutes)} min ({formatNumber(load.loadPercent)}%)</td>
                <td>{load.overloadMinutes > 0 ? <Badge tone="warning">{formatNumber(load.overloadMinutes)} min</Badge> : <Badge tone="success">Clear</Badge>}</td>
              </tr>
            ))}
            {loads.length === 0 ? <tr><td colSpan={4}>No capacity calendar rows in scope.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div className="table-panel">
        <div className="panel-heading">
          <h3>Finite-capacity suggestions</h3>
          <Badge tone="info"><Factory aria-hidden="true" size={16} /> {formatNumber(suggestions.length)} moves</Badge>
        </div>
        <table className="list-table">
          <thead><tr><th>Operation</th><th>Resource</th><th>Suggested slot</th></tr></thead>
          <tbody>
            {suggestions.map((suggestion) => (
              <tr key={suggestion.id}>
                <td>
                  {suggestion.orderNumber} / {suggestion.operationCode}
                  <div className="muted-line">{suggestion.reason}</div>
                </td>
                <td>{suggestion.resourceName}</td>
                <td>{formatDateTime(new Date(suggestion.suggestedStartAt))}</td>
              </tr>
            ))}
            {suggestions.length === 0 ? <tr><td colSpan={3}>No finite-capacity moves suggested.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FiniteScheduleBoard({
  plan,
  formatNumber,
  formatDateTime
}: {
  plan: MrpPlan | null;
  formatNumber: (value: number) => string;
  formatDateTime: (value: Date) => string;
}) {
  const operations = plan?.scheduleOperations ?? [];
  return (
    <div className="split-grid">
      <div className="table-panel">
        <div className="panel-heading">
          <h3>Finite schedule board</h3>
          <Badge tone={(plan?.scheduleRun.overloadCount ?? 0) > 0 ? "warning" : "success"}>
            <CalendarClock aria-hidden="true" size={16} />
            {plan?.scheduleRun.runNumber ?? "No run"}
          </Badge>
        </div>
        <table className="list-table">
          <thead><tr><th>Operation</th><th>Finite slot</th><th>Resources</th><th>Warnings</th></tr></thead>
          <tbody>
            {operations.map((operation) => (
              <tr key={operation.id}>
                <td>
                  {operation.orderNumber} / {operation.operationCode}
                  <div className="muted-line">{operation.description}</div>
                </td>
                <td>
                  {operation.finiteStartAt ? formatDateTime(new Date(operation.finiteStartAt)) : "Unscheduled"}
                  <div className="muted-line">{formatNumber(operation.blockMinutes)} min block</div>
                </td>
                <td>
                  {operation.workCenterName}
                  <div className="muted-line">{[operation.equipmentName, operation.laborRoleName].filter(Boolean).join(" / ")}</div>
                </td>
                <td>
                  {operation.warnings.length > 0 ? (
                    <>
                      {operation.warnings.map((warning) => (
                        <Badge key={`${operation.id}-${warning.type}`} tone={warning.severity === "critical" ? "warning" : "info"}>
                          {sourceLabel(warning.type)}
                        </Badge>
                      ))}
                      <div className="muted-line">{operation.warnings.map((warning) => warning.message).join(" ")}</div>
                    </>
                  ) : (
                    <Badge tone="success">Clear</Badge>
                  )}
                </td>
              </tr>
            ))}
            {operations.length === 0 ? <tr><td colSpan={4}>No operations scheduled in this horizon.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div className="table-panel">
        <div className="panel-heading">
          <h3>Promise-date explanation</h3>
          <Badge tone="info"><ShieldCheck aria-hidden="true" size={16} /> CTP</Badge>
        </div>
        {(plan?.capableToPromise ?? []).slice(0, 3).map((row) => (
          <div key={row.id} className="stacked-summary-row">
            <strong>{row.orderNumber}</strong>
            <span>{row.promisedAt ? formatDateTime(new Date(row.promisedAt)) : "No promise inside horizon"}</span>
            <p className="muted-line">{row.explanation.join(" ")}</p>
          </div>
        ))}
        {(plan?.capableToPromise.length ?? 0) === 0 ? <p>No CTP rows in scope.</p> : null}
      </div>
    </div>
  );
}

function DispatchBoard({
  rows,
  formatNumber,
  formatDateTime,
  onResequence
}: {
  rows: DispatchBoardLine[];
  formatNumber: (value: number) => string;
  formatDateTime: (value: Date) => string;
  onResequence: (operationId: string, afterOperationId: string | null) => void;
}) {
  return (
    <div className="table-panel">
      <div className="panel-heading">
        <h3>Dispatch board</h3>
        <Badge tone="info"><GripVertical aria-hidden="true" size={16} /> Resequence</Badge>
      </div>
      <table className="list-table">
        <thead><tr><th>Rank</th><th>Operation</th><th>Ready</th><th>Priority</th><th>Action</th></tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td>{row.dispatchRank}</td>
              <td>
                {row.orderNumber} / {row.operationCode}
                <div className="muted-line">{row.constraintSummary}</div>
              </td>
              <td>{row.readyAt ? formatDateTime(new Date(row.readyAt)) : "Open"}</td>
              <td>{formatNumber(row.dispatchPriority)}</td>
              <td>
                <Button
                  size="sm"
                  type="button"
                  variant="secondary"
                  disabled={row.status === "completed"}
                  onClick={() => onResequence(row.id, rows[Math.max(0, index - 1)]?.id ?? null)}
                >
                  <GripVertical aria-hidden="true" size={16} />
                  Move here
                </Button>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? <tr><td colSpan={5}>No dispatch rows in this horizon.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function RoughCutCapacityView({
  lines,
  formatNumber,
  formatDate
}: {
  lines: RoughCutCapacityLine[];
  formatNumber: (value: number) => string;
  formatDate: (value: Date) => string;
}) {
  return (
    <div className="table-panel">
      <div className="panel-heading">
        <h3>Rough-cut capacity</h3>
        <Badge tone="warning"><BarChart3 aria-hidden="true" size={16} /> {formatNumber(lines.filter((line) => line.overloadMinutes > 0).length)} overloads</Badge>
      </div>
      <table className="list-table">
        <thead><tr><th>Resource</th><th>Date</th><th>Planned</th><th>Open</th><th>Utilization</th></tr></thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id}>
              <td>
                {line.resourceName}
                <div className="muted-line">{sourceLabel(line.resourceType)}</div>
              </td>
              <td>{formatDate(new Date(line.bucketStart))}</td>
              <td>{formatNumber(line.plannedMinutes)} min</td>
              <td>{formatNumber(line.openMinutes)} min</td>
              <td>
                <Badge tone={line.overloadMinutes > 0 ? "warning" : "success"}>{formatNumber(line.utilizationPercent)}%</Badge>
              </td>
            </tr>
          ))}
          {lines.length === 0 ? <tr><td colSpan={5}>No rough-cut capacity in scope.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function MaterialConstraintView({
  rows,
  formatNumber,
  formatDateTime
}: {
  rows: MaterialAvailabilityConstraint[];
  formatNumber: (value: number) => string;
  formatDateTime: (value: Date) => string;
}) {
  return (
    <div className="table-panel">
      <div className="panel-heading">
        <h3>Material constraints</h3>
        <Badge tone={rows.length > 0 ? "warning" : "success"}><AlertTriangle aria-hidden="true" size={16} /> {formatNumber(rows.length)} holds</Badge>
      </div>
      <table className="list-table">
        <thead><tr><th>Item</th><th>Shortage</th><th>Constrained start</th><th>Explanation</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                {row.name}
                <div className="muted-line">{row.sku ?? row.itemId}</div>
              </td>
              <td>{formatNumber(row.shortageQuantity)} {row.uom}</td>
              <td>{row.constrainedStartAt ? formatDateTime(new Date(row.constrainedStartAt)) : "Open"}</td>
              <td>{row.explanation}</td>
            </tr>
          ))}
          {rows.length === 0 ? <tr><td colSpan={4}>No material constraints on open production starts.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleRunHistory({
  plan,
  formatDateTime
}: {
  plan: MrpPlan | null;
  formatDateTime: (value: Date) => string;
}) {
  return (
    <div className="split-grid">
      <div className="table-panel">
        <div className="panel-heading">
          <h3>Schedule run history</h3>
          <Badge tone="info"><CalendarClock aria-hidden="true" size={16} /> {plan?.scheduleRun.status ?? "No run"}</Badge>
        </div>
        {plan?.scheduleRun ? (
          <table className="list-table">
            <thead><tr><th>Run</th><th>Generated</th><th>Operations</th><th>Warnings</th></tr></thead>
            <tbody>
              <tr>
                <td>{plan.scheduleRun.runNumber}</td>
                <td>{formatDateTime(new Date(plan.scheduleRun.generatedAt))}</td>
                <td>{plan.scheduleRun.operationCount}</td>
                <td>
                  {plan.scheduleRun.overloadCount} overloads / {plan.scheduleRun.materialConstraintCount} material holds / {plan.scheduleRun.lateOperationCount} late
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>No schedule runs in scope.</p>
        )}
        <div className="muted-line">{plan?.scheduleRun.explanation.join(" ")}</div>
      </div>
      <div className="table-panel">
        <div className="panel-heading">
          <h3>Schedule audit trail</h3>
          <Badge tone="info">{plan?.scheduleAudits.length ?? 0}</Badge>
        </div>
        <table className="list-table">
          <thead><tr><th>Event</th><th>Subject</th><th>Occurred</th></tr></thead>
          <tbody>
            {(plan?.scheduleAudits ?? []).map((audit) => (
              <tr key={audit.id}>
                <td>{sourceLabel(audit.eventType)}</td>
                <td>{audit.subjectId}</td>
                <td>{formatDateTime(new Date(audit.occurredAt))}</td>
              </tr>
            ))}
            {(plan?.scheduleAudits.length ?? 0) === 0 ? <tr><td colSpan={3}>No schedule audit events in scope.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CapableToPromiseView({
  rows,
  formatNumber,
  formatDateTime
}: {
  rows: CtpResult[];
  formatNumber: (value: number) => string;
  formatDateTime: (value: Date) => string;
}) {
  return (
    <div className="table-panel">
      <div className="panel-heading">
        <h3>Capable-to-promise panel</h3>
        <Badge tone="info"><ShieldCheck aria-hidden="true" size={16} /> {formatNumber(rows.length)} orders</Badge>
      </div>
      <table className="list-table">
        <thead><tr><th>Order</th><th>Item</th><th>Promise</th><th>Explanation</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                {row.orderNumber}
                <div className="muted-line">{formatNumber(row.requestedQuantity)} {row.uom}</div>
              </td>
              <td>{row.name}</td>
              <td>
                <Badge tone={promiseTone(row.promiseStatus)}>{sourceLabel(row.promiseStatus)}</Badge>
                <div className="muted-line">{row.promisedAt ? formatDateTime(new Date(row.promisedAt)) : "No promise inside horizon"}</div>
              </td>
              <td>
                {row.explanation.join(" ")}
                <div className="muted-line">
                  {row.contributingSupplies.map((supply) => `${sourceLabel(supply.sourceType)} ${formatNumber(supply.quantity)}`).join(" / ")}
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? <tr><td colSpan={4}>No open sales or wholesale lines to promise.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function ScenarioView({
  plan,
  formatNumber,
  formatDateTime
}: {
  plan: MrpPlan | null;
  formatNumber: (value: number) => string;
  formatDateTime: (value: Date) => string;
}) {
  return (
    <div className="split-grid">
      <div className="table-panel">
        <div className="panel-heading">
          <h3>Planning scenario snapshots</h3>
          <Badge tone="info"><GitCompare aria-hidden="true" size={16} /> Compare</Badge>
        </div>
        <table className="list-table">
          <thead><tr><th>Scenario</th><th>Shortages</th><th>Capacity</th><th>Late promises</th></tr></thead>
          <tbody>
            {(plan?.scenarioSnapshots ?? []).map((snapshot) => (
              <tr key={snapshot.id}>
                <td>
                  {snapshot.name}
                  <div className="muted-line">{formatDateTime(new Date(snapshot.createdAt))}</div>
                </td>
                <td>{formatNumber(snapshot.shortageCount)} / {formatNumber(snapshot.totalShortageQuantity)}</td>
                <td>{formatNumber(snapshot.overloadedResourceCount)} overloaded</td>
                <td>{formatNumber(snapshot.latePromiseCount)}</td>
              </tr>
            ))}
            {(plan?.scenarioSnapshots.length ?? 0) === 0 ? <tr><td colSpan={4}>No scenario snapshots saved.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div className="table-panel">
        <div className="panel-heading">
          <h3>Expedite and late risk alerts</h3>
          <Badge tone="warning"><AlertTriangle aria-hidden="true" size={16} /> {formatNumber(plan?.alerts.length ?? 0)} alerts</Badge>
        </div>
        <table className="list-table">
          <thead><tr><th>Alert</th><th>Due</th></tr></thead>
          <tbody>
            {(plan?.alerts ?? []).map((alert) => (
              <tr key={alert.id}>
                <td>
                  <Badge tone={alert.severity === "critical" ? "warning" : "info"}>{sourceLabel(alert.type)}</Badge>
                  <div className="muted-line">{alert.message}</div>
                </td>
                <td>{alert.dueAt ? formatDateTime(new Date(alert.dueAt)) : "Open"}</td>
              </tr>
            ))}
            {(plan?.alerts.length ?? 0) === 0 ? <tr><td colSpan={2}>No planning alerts in scope.</td></tr> : null}
          </tbody>
        </table>
        {(plan?.scenarioComparisons ?? []).map((comparison) => (
          <p className="muted-line" key={`${comparison.baselineId}-${comparison.compareId}`}>{comparison.summary}</p>
        ))}
      </div>
    </div>
  );
}

function MrpDrilldown({
  shortage,
  formatNumber,
  formatDateTime
}: {
  shortage: MrpShortage | null;
  formatNumber: (value: number) => string;
  formatDateTime: (value: Date) => string;
}) {
  if (!shortage) {
    return <div className="table-panel"><p>No shortage selected.</p></div>;
  }

  return (
    <div className="table-panel">
      <div className="panel-heading">
        <h3>{shortage.name}</h3>
        <Badge tone="warning">{formatNumber(shortage.shortageQuantity)} {shortage.uom} short</Badge>
      </div>
      <div className="split-grid">
        <div>
          <h4>Demand</h4>
          <table className="list-table">
            <thead><tr><th>Source</th><th>Quantity</th><th>Needed</th></tr></thead>
            <tbody>
              {shortage.demands.map((demand) => (
                <tr key={demand.id}>
                  <td>
                    {sourceLabel(demand.sourceType)}
                    <div className="muted-line">{demand.description}</div>
                  </td>
                  <td>{formatNumber(demand.quantity)} {demand.uom}</td>
                  <td>{demand.neededAt ? formatDateTime(new Date(demand.neededAt)) : "Unscheduled"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4>Supply</h4>
          <table className="list-table">
            <thead><tr><th>Source</th><th>Quantity</th><th>Available</th></tr></thead>
            <tbody>
              {shortage.supplies.map((supply) => (
                <tr key={supply.id}>
                  <td>
                    {sourceLabel(supply.sourceType)}
                    <div className="muted-line">{supply.description}</div>
                  </td>
                  <td>{formatNumber(supply.quantity)} {supply.uom}</td>
                  <td>{supply.availableAt ? formatDateTime(new Date(supply.availableAt)) : "On hand"}</td>
                </tr>
              ))}
              {shortage.supplies.length === 0 ? (
                <tr><td colSpan={3}>No usable supply in scope.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
