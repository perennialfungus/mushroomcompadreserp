import { Calculator, Download, Factory, FileJson, Percent, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import { useI18n } from "./i18n/I18nProvider";
import { exportCostingCsv, exportCostingJson, getCostingDashboard } from "./lib/api";
import type { CostingDashboard } from "./types";

function toneForVariance(value: number): "success" | "warning" | "neutral" {
  if (value < 0) {
    return "success";
  }
  if (value > 0) {
    return "warning";
  }
  return "neutral";
}

export function CostingScreen() {
  const auth = useAuth();
  const { formatCurrency, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<CostingDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCosts() {
    if (!auth.session) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getCostingDashboard(auth.session.accessToken);
      setDashboard(response.dashboard);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Cost data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCosts();
  }, [auth.session]);

  async function exportCosts(kind: "csv" | "json") {
    if (!auth.session) {
      return;
    }
    const content = kind === "csv"
      ? await exportCostingCsv(auth.session.accessToken)
      : await exportCostingJson(auth.session.accessToken);
    showToast({
      title: kind === "csv" ? "CSV export ready" : "JSON export ready",
      description: `${formatNumber(content.length)} characters generated for external accounting tools.`
    });
  }

  const rollup = dashboard?.rollups[0] ?? null;
  const estimate = dashboard?.productionOrderCosts[0] ?? null;
  const actual = dashboard?.batchActualCosts[0] ?? null;
  const variance = dashboard?.varianceReports[0] ?? null;

  return (
    <section className="screen-grid" aria-labelledby="costing-title">
      <div className="screen-heading">
        <p className="eyebrow">Manufacturing costs</p>
        <h2 id="costing-title">Standard cost rollups and batch actuals</h2>
        <p>Formula, production, batch, variance, and margin cost visibility for export.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="metric-grid">
        <article className="metric-panel">
          <span>Formula unit cost</span>
          <strong>{rollup ? formatCurrency(rollup.unitCost, rollup.currency) : "-"}</strong>
        </article>
        <article className="metric-panel">
          <span>Estimated unit cost</span>
          <strong>{estimate ? formatCurrency(estimate.unitCost, estimate.currency) : "-"}</strong>
        </article>
        <article className="metric-panel">
          <span>Actual batch unit cost</span>
          <strong>{actual ? formatCurrency(actual.unitCost, actual.currency) : "-"}</strong>
        </article>
      </div>

      <div className="toolbar-row">
        <Button variant="secondary" size="sm" onClick={() => void loadCosts()}>
          <RefreshCw aria-hidden="true" size={16} />
          Refresh
        </Button>
        <Button variant="secondary" size="sm" onClick={() => void exportCosts("csv")}>
          <Download aria-hidden="true" size={16} />
          Export CSV
        </Button>
        <Button variant="secondary" size="sm" onClick={() => void exportCosts("json")}>
          <FileJson aria-hidden="true" size={16} />
          Export JSON
        </Button>
      </div>

      {loading || !dashboard ? (
        <div className="table-panel">Loading cost data...</div>
      ) : (
        <Tabs
          tabs={[
            {
              id: "settings",
              label: "Cost settings",
              content: (
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Standard costs and rates</h3>
                    <Badge tone="info"><Calculator aria-hidden="true" size={16} /> Export only</Badge>
                  </div>
                  <table className="list-table">
                    <thead>
                      <tr><th>Cost item</th><th>Category</th><th>Rate</th><th>Metadata</th></tr>
                    </thead>
                    <tbody>
                      {dashboard.settings.standardCosts.map((cost) => (
                        <tr key={cost.id}>
                          <td>{cost.itemName}<div className="muted-line">{cost.itemType} / {cost.itemId}</div></td>
                          <td><Badge>{cost.category}</Badge></td>
                          <td>{formatCurrency(cost.unitCost, cost.currency)} / {cost.uom}</td>
                          <td>{Object.entries(cost.metadataJson ?? {}).map(([key, value]) => `${key}: ${String(value)}`).join(", ") || "None"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            },
            {
              id: "rollup",
              label: "Formula rollup",
              content: (
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Formula revision {rollup?.revisionCode}</h3>
                    <Badge tone="success">{rollup ? formatCurrency(rollup.summary.totalCost, rollup.currency) : "-"}</Badge>
                  </div>
                  <table className="list-table">
                    <thead>
                      <tr><th>Component</th><th>Category</th><th>Quantity</th><th>Line cost</th></tr>
                    </thead>
                    <tbody>
                      {rollup?.lines.map((line) => (
                        <tr key={line.lineId}>
                          <td>{line.componentName}<div className="muted-line">{line.componentType}</div></td>
                          <td>{line.category}</td>
                          <td>{formatNumber(line.costQuantity)} {line.uom}</td>
                          <td>{formatCurrency(line.lineCost, line.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            },
            {
              id: "production",
              label: "Production detail",
              content: (
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Estimated vs actual production cost</h3>
                    <Badge tone="info"><Factory aria-hidden="true" size={16} /> Batch cost</Badge>
                  </div>
                  <dl className="sync-metrics">
                    <div><dt>Estimated total</dt><dd>{estimate ? formatCurrency(estimate.summary.totalCost, estimate.currency) : "-"}</dd></div>
                    <div><dt>Actual total</dt><dd>{actual ? formatCurrency(actual.summary.totalCost, actual.currency) : "-"}</dd></div>
                    <div><dt>Output quantity</dt><dd>{actual ? `${formatNumber(actual.outputQuantity)} ${actual.outputUom}` : "-"}</dd></div>
                    <div><dt>Scrap / rework</dt><dd>{actual ? `${formatNumber(actual.scrapQuantity)} / ${formatNumber(actual.reworkQuantity)}` : "-"}</dd></div>
                  </dl>
                  <table className="list-table">
                    <thead><tr><th>Consumed lot</th><th>Category</th><th>Quantity</th><th>Cost</th></tr></thead>
                    <tbody>
                      {actual?.consumedLots.map((lot) => (
                        <tr key={lot.lotId}>
                          <td>{lot.itemName}<div className="muted-line">{lot.lotId}</div></td>
                          <td>{lot.category}</td>
                          <td>{formatNumber(lot.quantity)} {lot.uom}</td>
                          <td>{formatCurrency(lot.quantity * lot.unitCost, lot.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            },
            {
              id: "variance",
              label: "Variance report",
              content: (
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Standard vs estimated vs actual</h3>
                    <Badge tone={toneForVariance(variance?.lines.find((line) => line.category === "total")?.varianceCost ?? 0)}>
                      {variance ? formatCurrency(variance.lines.find((line) => line.category === "total")?.varianceCost ?? 0, variance.currency) : "-"}
                    </Badge>
                  </div>
                  <table className="list-table">
                    <thead><tr><th>Variance</th><th>Standard</th><th>Estimated</th><th>Actual</th><th>Explanation</th></tr></thead>
                    <tbody>
                      {variance?.lines.map((line) => (
                        <tr key={line.category}>
                          <td><Badge tone={toneForVariance(line.varianceCost)}>{line.category}</Badge></td>
                          <td>{formatCurrency(line.standardCost, variance.currency)}</td>
                          <td>{formatCurrency(line.estimatedCost, variance.currency)}</td>
                          <td>{formatCurrency(line.actualCost, variance.currency)}</td>
                          <td>{line.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            },
            {
              id: "margin",
              label: "Margin simulator",
              content: (
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>B2B and retail margin</h3>
                    <Badge tone="info"><Percent aria-hidden="true" size={16} /> Unit margin</Badge>
                  </div>
                  <table className="list-table">
                    <thead><tr><th>Channel</th><th>Unit price</th><th>Batch unit cost</th><th>Gross margin</th><th>Margin %</th></tr></thead>
                    <tbody>
                      {dashboard.marginSimulation.rows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.label}<div className="muted-line">{row.channel}</div></td>
                          <td>{formatCurrency(row.unitPrice, row.currency)}</td>
                          <td>{formatCurrency(row.unitCost, row.currency)}</td>
                          <td>{formatCurrency(row.grossMargin, row.currency)}</td>
                          <td>{formatNumber(row.marginPercent)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          ]}
        />
      )}
    </section>
  );
}
