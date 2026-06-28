import { ClipboardCheck, Download, FileJson, FileSpreadsheet, RefreshCw, Scale } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Badge, Button, Input, LoadingState, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import { useI18n } from "./i18n/I18nProvider";
import {
  allocateFinanceLandedCost,
  createFinanceExportBatch,
  createFinanceValuationSnapshot,
  getFinanceDashboard,
  runFinancePeriodClose
} from "./lib/api";
import type { FinanceDashboard, FinanceExportSourceType } from "./types";

const exportSourceTypes: FinanceExportSourceType[] = [
  "purchase",
  "receipt",
  "sale",
  "shipment",
  "inventory_adjustment",
  "production_variance",
  "landed_cost"
];

function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

export function FinanceScreen() {
  const auth = useAuth();
  const { formatCurrency, formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(currentPeriod());
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [exportSources, setExportSources] = useState<FinanceExportSourceType[]>(exportSourceTypes);

  async function loadFinance() {
    if (!auth.session) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getFinanceDashboard(auth.session.accessToken);
      setDashboard(response.dashboard);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Finance bridge data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFinance();
  }, [auth.session]);

  async function allocateDemoLandedCost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }
    const response = await allocateFinanceLandedCost(auth.session.accessToken, {
      landedCostNumber: `LC-${period}-WEB`,
      supplierId: "supplier-bio-farms",
      sourceDocumentNumber: "WEB-FREIGHT-001",
      components: [
        { id: "freight-web", category: "freight", description: "Inbound freight", amount: 45, currency: "EUR", allocationBasis: "quantity" },
        { id: "duty-web", category: "duty", description: "Import duty", amount: 18, currency: "EUR", allocationBasis: "value" },
        { id: "handling-web", category: "handling", description: "Port handling", amount: 12, currency: "EUR", allocationBasis: "manual" }
      ],
      receiptLines: [
        { receiptLineId: "receipt-line-alcohol-web", receiptId: "receipt-web-001", itemType: "material", itemId: "mat-organic-cane-alcohol", lotId: "lot-alcohol-web", quantity: 60, uom: "l", unitCost: 2.4, currency: "EUR", manualBasis: 3 },
        { receiptLineId: "receipt-line-bottle-web", receiptId: "receipt-web-001", itemType: "packaging_component", itemId: "pkg-amber-50", lotId: "lot-bottle-web", quantity: 120, uom: "each", unitCost: 0.42, currency: "EUR", manualBasis: 1 }
      ]
    });
    setDashboard((current) => current ? { ...current, landedCosts: [response.allocation, ...current.landedCosts] } : current);
    showToast({ title: "Landed cost allocated", description: `${formatCurrency(response.allocation.totalAmount, response.allocation.currency)} added to receipt cost analysis.` });
  }

  async function createSnapshot() {
    if (!auth.session) {
      return;
    }
    const response = await createFinanceValuationSnapshot(auth.session.accessToken, {
      period,
      snapshotNumber: `VAL-${period}-WEB`,
      valuationMethod: "standard_plus_landed",
      currency: "EUR",
      asOf: new Date().toISOString()
    });
    setDashboard((current) => current ? { ...current, valuationSnapshots: [response.snapshot, ...current.valuationSnapshots] } : current);
    showToast({ title: "Valuation snapshot created", description: `${formatCurrency(response.snapshot.totalValue, response.snapshot.currency)} captured for ${period}.` });
  }

  async function runClose() {
    if (!auth.session) {
      return;
    }
    const response = await runFinancePeriodClose(auth.session.accessToken, { period });
    setDashboard((current) => current ? { ...current, latestPeriodClose: response.run } : current);
    showToast({ title: response.run.status === "blocked" ? "Close blockers found" : "Period ready to close", description: `${response.run.results.filter((result) => result.status === "blocked").length} blocker checks require review.` });
  }

  async function exportPacket() {
    if (!auth.session) {
      return;
    }
    const previous = dashboard?.exportBatches[0]?.id ?? null;
    const response = await createFinanceExportBatch(auth.session.accessToken, {
      format: exportFormat,
      mappingTemplateId: dashboard?.mappingTemplates[0]?.id ?? null,
      sourceTypes: exportSources,
      repeatedFromBatchId: previous
    });
    setDashboard((current) => current ? { ...current, exportBatches: [response.batch, ...current.exportBatches] } : current);
    showToast({ title: "Finance export generated", description: `${response.batch.batchNumber} includes ${formatNumber(response.batch.rowCount)} rows and checksum ${response.batch.audit.checksum}.` });
  }

  const latestClose = dashboard?.latestPeriodClose ?? null;
  const blockerCount = latestClose?.results.reduce((total, result) => total + (result.status === "blocked" ? result.count : 0), 0) ?? 0;
  const latestSnapshot = dashboard?.valuationSnapshots[0] ?? null;
  const latestBatch = dashboard?.exportBatches[0] ?? null;
  const landedTotal = dashboard?.landedCosts.reduce((total, cost) => total + cost.totalAmount, 0) ?? 0;

  return (
    <section className="screen-grid" aria-labelledby="finance-title">
      <div className="screen-heading">
        <p className="eyebrow">Finance bridge</p>
        <h2 id="finance-title">Export packs and inventory valuation controls</h2>
        <p>Landed costs, close checks, reconciliations, valuation snapshots, and accounting-system files without GL posting.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="metric-grid">
        <article className="metric-panel">
          <span>Landed cost allocated</span>
          <strong>{formatCurrency(landedTotal, "EUR")}</strong>
        </article>
        <article className="metric-panel">
          <span>Latest valuation</span>
          <strong>{latestSnapshot ? formatCurrency(latestSnapshot.totalValue, latestSnapshot.currency) : "-"}</strong>
        </article>
        <article className="metric-panel">
          <span>Close blockers</span>
          <strong>{formatNumber(blockerCount)}</strong>
        </article>
      </div>

      <div className="toolbar-row">
        <Input label="Period" type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
        <Button variant="secondary" size="sm" onClick={() => void loadFinance()}>
          <RefreshCw aria-hidden="true" size={16} />
          Refresh
        </Button>
      </div>

      {loading || !dashboard ? (
        <LoadingState title="Loading finance bridge" description="Preparing allocation, valuation, close, export, and reconciliation records." />
      ) : (
        <Tabs
          tabs={[
            {
              id: "landed-cost",
              label: "Landed cost",
              content: (
                <div className="two-column-grid">
                  <form className="table-panel" onSubmit={(event) => void allocateDemoLandedCost(event)}>
                    <div className="panel-heading">
                      <h3>Receipt allocation</h3>
                      <Badge tone="info"><Scale aria-hidden="true" size={16} /> Freight + duty + handling</Badge>
                    </div>
                    <dl className="compact-definition">
                      <div><dt>Basis</dt><dd>Quantity, value, weight, manual</dd></div>
                      <div><dt>Currency</dt><dd>EUR only per allocation</dd></div>
                      <div><dt>Posting</dt><dd>External export only</dd></div>
                    </dl>
                    <div className="form-actions">
                      <Button type="submit">
                        <ClipboardCheck aria-hidden="true" size={16} />
                        Allocate landed cost
                      </Button>
                    </div>
                  </form>
                  <div className="table-panel">
                    <div className="panel-heading">
                      <h3>Allocated costs</h3>
                      <Badge tone="success">{formatNumber(dashboard.landedCosts.length)} batches</Badge>
                    </div>
                    <table className="list-table">
                      <thead><tr><th>Allocation</th><th>Receipts</th><th>Total</th><th>Lines</th></tr></thead>
                      <tbody>
                        {dashboard.landedCosts.map((cost) => (
                          <tr key={cost.id}>
                            <td>{cost.landedCostNumber}<div className="muted-line">{formatDateTime(new Date(cost.allocatedAt))}</div></td>
                            <td>{cost.receiptIds.join(", ")}</td>
                            <td>{formatCurrency(cost.totalAmount, cost.currency)}</td>
                            <td>{formatNumber(cost.allocations.length)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            },
            {
              id: "valuation",
              label: "Valuation snapshot",
              content: (
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Inventory valuation snapshots</h3>
                    <Button variant="secondary" size="sm" onClick={() => void createSnapshot()}>
                      <FileSpreadsheet aria-hidden="true" size={16} />
                      Create snapshot
                    </Button>
                  </div>
                  <table className="list-table">
                    <thead><tr><th>Snapshot</th><th>Method</th><th>Lines</th><th>Total value</th></tr></thead>
                    <tbody>
                      {dashboard.valuationSnapshots.map((snapshot) => (
                        <tr key={snapshot.id}>
                          <td>{snapshot.snapshotNumber}<div className="muted-line">{snapshot.period} / {formatDateTime(new Date(snapshot.asOf))}</div></td>
                          <td>{snapshot.valuationMethod}</td>
                          <td>{formatNumber(snapshot.lines.length)}</td>
                          <td>{formatCurrency(snapshot.totalValue, snapshot.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {dashboard.latestValuationComparison ? (
                    <p className="muted-line">Latest comparison change: {formatCurrency(dashboard.latestValuationComparison.totalValueChange, latestSnapshot?.currency ?? "EUR")}</p>
                  ) : null}
                </div>
              )
            },
            {
              id: "period-close",
              label: "Period close",
              content: (
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Close checklist</h3>
                    <Button variant="secondary" size="sm" onClick={() => void runClose()}>
                      <ClipboardCheck aria-hidden="true" size={16} />
                      Run close checks
                    </Button>
                  </div>
                  <table className="list-table">
                    <thead><tr><th>Check</th><th>Status</th><th>Records</th><th>Message</th></tr></thead>
                    <tbody>
                      {dashboard.latestPeriodClose.results.map((result) => (
                        <tr key={result.code}>
                          <td>{result.code.replaceAll("_", " ")}</td>
                          <td><Badge tone={result.status === "passed" ? "success" : "warning"}>{result.status}</Badge></td>
                          <td>{formatNumber(result.count)}</td>
                          <td>{result.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            },
            {
              id: "exports",
              label: "Export center",
              content: (
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>AP / AR / inventory packet</h3>
                    <Badge tone="info">Versioned + audited</Badge>
                  </div>
                  <div className="filter-bar">
                    <label className="select-field">
                      <span>Format</span>
                      <select value={exportFormat} onChange={(event) => setExportFormat(event.target.value as "csv" | "json")}>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                      </select>
                    </label>
                    <div className="checkbox-grid">
                      {exportSourceTypes.map((source) => (
                        <label key={source}>
                          <input
                            checked={exportSources.includes(source)}
                            type="checkbox"
                            onChange={(event) => {
                              setExportSources((current) => event.target.checked ? [...current, source] : current.filter((candidate) => candidate !== source));
                            }}
                          />
                          {source.replaceAll("_", " ")}
                        </label>
                      ))}
                    </div>
                    <Button type="button" onClick={() => void exportPacket()}>
                      {exportFormat === "json" ? <FileJson aria-hidden="true" size={16} /> : <Download aria-hidden="true" size={16} />}
                      Generate export
                    </Button>
                  </div>
                  <table className="list-table">
                    <thead><tr><th>Batch</th><th>Format</th><th>Rows</th><th>Audit</th></tr></thead>
                    <tbody>
                      {dashboard.exportBatches.map((batch) => (
                        <tr key={batch.id}>
                          <td>{batch.batchNumber}<div className="muted-line">v{batch.version} / {formatDateTime(new Date(batch.generatedAt))}</div></td>
                          <td>{batch.format.toUpperCase()}</td>
                          <td>{formatNumber(batch.rowCount)}</td>
                          <td>{batch.audit.checksum}<div className="muted-line">{batch.audit.sourceRecordIds.length} source records</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {latestBatch ? <p className="muted-line">Latest content preview: {latestBatch.content.slice(0, 140)}</p> : null}
                </div>
              )
            },
            {
              id: "reconciliation",
              label: "Reconciliation",
              content: (
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Reconciliation reports</h3>
                    <Badge tone="info">Ledger, PO, shipment, production</Badge>
                  </div>
                  <table className="list-table">
                    <thead><tr><th>Report</th><th>Status</th><th>Rows</th><th>Variance</th></tr></thead>
                    <tbody>
                      {dashboard.reconciliations.map((report) => (
                        <tr key={report.id}>
                          <td>{report.title}</td>
                          <td><Badge tone={report.status === "matched" ? "success" : "warning"}>{report.status}</Badge></td>
                          <td>{formatNumber(report.rows.length)}</td>
                          <td>{formatNumber(report.rows.reduce((total, row) => total + Math.abs(row.variance), 0))}</td>
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
