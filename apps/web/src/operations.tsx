import { Link, useParams } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ClipboardCheck, PackageCheck, Printer, Route, Save, ScanLine, Send, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Badge, Button, EmptyState, Input, useToast } from "./components/ui";
import { Scanner } from "./components/Scanner";
import { useAuth } from "./auth";
import {
  balanceToPrintableLabel,
  containerToPrintableLabel,
  decodeLabelPayload,
  encodeLabelPayload,
  locationToPrintableLabel,
  renderBarcodeSvg,
  stagingToPrintableLabel,
  variantToPrintableLabel,
  type LabelPayload,
  type LabelSymbology,
  type PrintableLabel
} from "./labels";
import {
  getStockCountSession,
  getWmsDashboard,
  executeWmsScanCommand,
  listInventoryBalances,
  listLocations,
  listMasterData,
  listPendingStockCounts,
  listStockCountSessions,
  postStockCountSession,
  syncPendingStockCounts
} from "./lib/api";
import { useI18n } from "./i18n/I18nProvider";
import type {
  InventoryBalance,
  Location,
  ProductVariant,
  StockCountSession,
  StockCountSessionDetail,
  WmsDashboard,
  WmsScanCommandResult,
  WmsScanMode
} from "./types";

export function ScanScreen() {
  const auth = useAuth();
  const { formatNumber } = useI18n();
  const { showToast } = useToast();
  const [manualCode, setManualCode] = useState("");
  const [active, setActive] = useState(false);
  const [payload, setPayload] = useState<LabelPayload | null>(null);
  const [message, setMessage] = useState("No scan captured.");
  const [dashboard, setDashboard] = useState<WmsDashboard | null>(null);
  const [scanMode, setScanMode] = useState<WmsScanMode>("storage_lookup");
  const [quantity, setQuantity] = useState("2");
  const [fromLocationId, setFromLocationId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [commandResult, setCommandResult] = useState<WmsScanCommandResult | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);

  function acceptCode(value: string) {
    setManualCode(value);
    const decoded = decodeLabelPayload(value);
    setPayload(decoded);
    setMessage(decoded ? `${decoded.type} ${decoded.code}` : "Code captured as a manual lookup value.");
  }

  async function loadWms() {
    if (!auth.session) {
      return;
    }
    const response = await getWmsDashboard(auth.session.accessToken);
    setDashboard(response.dashboard);
    setFromLocationId((current) => current || response.dashboard.containers[0]?.locationId || "");
    setToLocationId((current) => current || response.dashboard.putawayTasks[0]?.suggestedLocationId || response.dashboard.containers[0]?.locationId || "");
  }

  useEffect(() => {
    void loadWms();
  }, [auth.session]);

  async function submitCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }
    setCommandError(null);
    try {
      const selectedBalance = dashboard?.pickSuggestion?.suggestions[0] ?? null;
      const response = await executeWmsScanCommand(auth.session.accessToken, {
        mode: scanMode,
        code: manualCode || payload?.code || dashboard?.putawayTasks[0]?.containerCode || dashboard?.pickTasks[0]?.taskNumber || "LP-PAL-LM-001",
        quantity: quantity ? Number(quantity) : null,
        uom: dashboard?.putawayTasks[0]?.uom ?? selectedBalance?.uom ?? null,
        fromLocationId: ["transfer", "issue", "count", "pick", "put_away"].includes(scanMode) ? fromLocationId || null : null,
        toLocationId: ["transfer", "put_away"].includes(scanMode) ? toLocationId || null : null,
        overrideReason: overrideReason || null,
        clientTransactionId: crypto.randomUUID()
      });
      setCommandResult(response.result);
      showToast({ title: "WMS command complete", description: response.result.message });
      await loadWms();
    } catch (error) {
      setCommandError(error instanceof Error ? error.message : "WMS command failed.");
    }
  }

  return (
    <section className="screen-grid" aria-labelledby="scan-title">
      <div className="screen-heading">
        <p className="eyebrow">Mobile scan</p>
        <h2 id="scan-title">WMS scan command center</h2>
        <p>Receive, put away, transfer, count, pick, pack, ship, and look up warehouse records from the same scan-first surface.</p>
      </div>

      <div className="scan-layout">
        <Scanner active={active} onResult={acceptCode} />
        <aside className="detail-panel">
          <h3>Manual fallback</h3>
          <form className="stack" onSubmit={(event) => {
            event.preventDefault();
            acceptCode(manualCode);
          }}>
            <Input
              label="Label or barcode"
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder="Paste MC:{...} or type the fallback code"
            />
            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => setActive((current) => !current)}>
                <ScanLine aria-hidden="true" size={18} />
                {active ? "Pause camera" : "Start camera"}
              </Button>
              <Button type="submit">
                <CheckCircle2 aria-hidden="true" size={18} />
                Use code
              </Button>
            </div>
          </form>
          <div className="scan-result" aria-live="polite">
            <Badge tone={payload ? "success" : "info"}>{payload ? "Decoded" : "Manual"}</Badge>
            <strong>{message}</strong>
            {payload ? (
              <dl className="balance-detail-list">
                <div>
                  <dt>Type</dt>
                  <dd>{payload.type}</dd>
                </div>
                <div>
                  <dt>Code</dt>
                  <dd>{payload.code}</dd>
                </div>
                <div>
                  <dt>SKU</dt>
                  <dd>{payload.sku ?? "None"}</dd>
                </div>
                <div>
                  <dt>Expiry</dt>
                  <dd>{payload.expiry ? new Date(payload.expiry).toLocaleDateString() : "None"}</dd>
                </div>
              </dl>
            ) : null}
            {auth.session ? <span className="muted-line">Ready for stock count, lot, item, or location workflows.</span> : null}
          </div>
        </aside>
      </div>

      <form className="table-panel compact-form-grid" onSubmit={submitCommand}>
        <div className="panel-heading">
          <h3>Scan command</h3>
          <Badge tone="info">{dashboard?.scanModes.length ?? 0} modes</Badge>
        </div>
        <label className="select-field">
          <span>Mode</span>
          <select value={scanMode} onChange={(event) => setScanMode(event.target.value as WmsScanMode)}>
            {[
              ["receive", "Receive"],
              ["put_away", "Put away"],
              ["transfer", "Transfer"],
              ["issue", "Issue"],
              ["count", "Count"],
              ["pick", "Pick"],
              ["pack", "Pack"],
              ["ship", "Ship"],
              ["storage_lookup", "Storage lookup"],
              ["item_lookup", "Item lookup"],
              ["container_lookup", "Container lookup"]
            ].map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <Input label="Quantity" inputMode="decimal" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        <label className="select-field">
          <span>From</span>
          <select value={fromLocationId} onChange={(event) => setFromLocationId(event.target.value)}>
            <option value="">Select source</option>
            {(dashboard ? uniqueLocations(dashboard) : []).map((location) => (
              <option key={location.id} value={location.id}>{location.name}</option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span>To</span>
          <select value={toLocationId} onChange={(event) => setToLocationId(event.target.value)}>
            <option value="">Select destination</option>
            {(dashboard ? uniqueLocations(dashboard) : []).map((location) => (
              <option key={location.id} value={location.id}>{location.name}</option>
            ))}
          </select>
        </label>
        <Input label="Override reason" value={overrideReason} onChange={(event) => setOverrideReason(event.target.value)} placeholder="Required when bypassing FEFO/FIFO suggestion" />
        <Button type="submit" disabled={!auth.session}>
          <Send aria-hidden="true" size={18} />
          Execute
        </Button>
        {commandError ? <p className="form-error">{commandError}</p> : null}
        {commandResult ? (
          <div className="scan-result">
            <Badge tone={commandResult.warnings.length > 0 ? "warning" : "success"}>{commandResult.mode}</Badge>
            <strong>{commandResult.message}</strong>
            <span>{commandResult.warnings[0] ?? `${commandResult.lookup.balances.length} balance match(es)`}</span>
          </div>
        ) : null}
      </form>

      {dashboard ? (
        <>
          <div className="metric-grid">
            <article className="metric-panel">
              <span>Open put-away</span>
              <strong>{formatNumber(dashboard.putawayTasks.filter((task) => task.status !== "complete").length)}</strong>
            </article>
            <article className="metric-panel">
              <span>Wave picks</span>
              <strong>{formatNumber(dashboard.pickTasks.length)}</strong>
            </article>
            <article className="metric-panel">
              <span>Containers</span>
              <strong>{formatNumber(dashboard.containers.length)}</strong>
            </article>
          </div>

          <div className="table-panel">
            <div className="panel-heading">
              <h3>Put-away queue</h3>
              <PackageCheck aria-hidden="true" size={18} />
            </div>
            <table className="list-table">
              <thead><tr><th>Task</th><th>Container</th><th>Lot</th><th>Suggestion</th><th>Status</th></tr></thead>
              <tbody>
                {dashboard.putawayTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.taskNumber}</td>
                    <td>{task.containerCode ?? "-"}</td>
                    <td>{task.lotCode ?? task.itemId}</td>
                    <td>{task.suggestions[0]?.locationName ?? task.suggestedLocationId ?? "None"}</td>
                    <td><Badge tone={task.status === "complete" ? "success" : "warning"}>{task.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-panel">
            <div className="panel-heading">
              <h3>Wave pick board</h3>
              <Route aria-hidden="true" size={18} />
            </div>
            <table className="list-table">
              <thead><tr><th>Seq</th><th>Task</th><th>Lot</th><th>Tote</th><th>Suggestion</th><th>Status</th></tr></thead>
              <tbody>
                {dashboard.pickTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.sequence}</td>
                    <td>{task.taskNumber}</td>
                    <td>{task.lotCode ?? task.itemId}</td>
                    <td>{task.toteCode ?? "-"}</td>
                    <td>{task.suggestionReason}</td>
                    <td><Badge tone={task.status === "complete" ? "success" : "info"}>{task.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-panel">
            <div className="panel-heading">
              <h3>Pack verification</h3>
              <ClipboardCheck aria-hidden="true" size={18} />
            </div>
            <table className="list-table">
              <thead><tr><th>Session</th><th>Status</th><th>Verified</th><th>Exception</th></tr></thead>
              <tbody>
                {dashboard.packSessions.map((session) => (
                  <tr key={session.id}>
                    <td>{session.sessionNumber}</td>
                    <td><Badge tone={session.status === "verified" || session.status === "shipped" ? "success" : session.status === "exception" ? "warning" : "info"}>{session.status}</Badge></td>
                    <td>{formatNumber(session.verifiedLineCount)}</td>
                    <td>{session.exceptionReason ?? "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}

function uniqueLocations(dashboard: WmsDashboard): Location[] {
  const locations = new Map<string, Location>();
  for (const container of dashboard.containers) {
    locations.set(container.locationId, {
      id: container.locationId,
      code: container.locationId,
      name: container.locationName ?? container.locationId,
      type: "warehouse",
      isActive: true
    });
  }
  for (const task of dashboard.putawayTasks) {
    for (const suggestion of task.suggestions) {
      locations.set(suggestion.locationId, {
        id: suggestion.locationId,
        code: suggestion.locationId,
        name: suggestion.locationName,
        type: suggestion.zoneType,
        isActive: true
      });
    }
  }
  return [...locations.values()];
}

export function LabelPrintScreen() {
  const auth = useAuth();
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [wms, setWms] = useState<WmsDashboard | null>(null);
  const [symbology, setSymbology] = useState<LabelSymbology>("qrcode");

  useEffect(() => {
    if (!auth.session) {
      return;
    }
    Promise.all([
      listInventoryBalances(auth.session.accessToken),
      listLocations(auth.session.accessToken),
      listMasterData(auth.session.accessToken),
      getWmsDashboard(auth.session.accessToken)
    ]).then(([balanceResponse, locationResponse, masterData, wmsResponse]) => {
      setBalances(balanceResponse.balances);
      setLocations(locationResponse.locations);
      setVariants(masterData.productVariants);
      setWms(wmsResponse.dashboard);
    });
  }, [auth.session]);

  const labels = useMemo<PrintableLabel[]>(() => {
    return [
      ...balances.slice(0, 6).map(balanceToPrintableLabel),
      ...variants.slice(0, 3).map(variantToPrintableLabel),
      ...locations.slice(0, 4).map(locationToPrintableLabel),
      ...(wms?.containers.slice(0, 4).map(containerToPrintableLabel) ?? []),
      ...(wms?.packSessions.slice(0, 2).map(stagingToPrintableLabel) ?? [])
    ];
  }, [balances, locations, variants, wms]);

  return (
    <section className="screen-grid" aria-labelledby="labels-title">
      <div className="screen-heading print-hidden">
        <p className="eyebrow">Labels</p>
        <h2 id="labels-title">Printable labels</h2>
        <p>QR, Data Matrix, and Code128 templates include item, lot, expiry, and readable fallback text.</p>
      </div>

      <div className="label-toolbar print-hidden">
        <label className="select-field">
          <span>Barcode</span>
          <select value={symbology} onChange={(event) => setSymbology(event.target.value as LabelSymbology)}>
            <option value="qrcode">QR</option>
            <option value="datamatrix">Data Matrix</option>
            <option value="code128">Code128</option>
          </select>
        </label>
        <Button type="button" onClick={() => window.print()}>
          <Printer aria-hidden="true" size={18} />
          Print
        </Button>
      </div>

      <div className="label-sheet">
        {labels.map((label) => {
          const encoded = encodeLabelPayload(label.payload);
          const svg = renderBarcodeSvg(symbology === "code128" ? label.humanCode : encoded, symbology);
          return (
            <article className="print-label" key={`${label.id}-${symbology}`}>
              <div className="label-barcode" dangerouslySetInnerHTML={{ __html: svg }} />
              <div>
                <strong>{label.title}</strong>
                <span>{label.subtitle}</span>
                <span>Code: {label.humanCode}</span>
                <span>Expiry: {label.expiry ? new Date(label.expiry).toLocaleDateString() : "None"}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function StockCountListScreen() {
  const auth = useAuth();
  const { formatNumber, formatDateTime } = useI18n();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<StockCountSession[]>([]);
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [selectedBalanceId, setSelectedBalanceId] = useState("");
  const [countedQuantity, setCountedQuantity] = useState("120");
  const [pendingCount, setPendingCount] = useState(() => listPendingStockCounts().length);
  const [postCorrections, setPostCorrections] = useState(false);
  const selectedBalance = balances.find((balance) => balance.id === selectedBalanceId) ?? balances[0] ?? null;

  async function load() {
    if (!auth.session) {
      return;
    }
    const synced = await syncPendingStockCounts(auth.session.accessToken);
    if (synced > 0) {
      showToast({ title: "Offline counts synced", description: `${synced} session(s)` });
    }
    const [sessionResponse, balanceResponse] = await Promise.all([
      listStockCountSessions(auth.session.accessToken),
      listInventoryBalances(auth.session.accessToken)
    ]);
    setSessions(sessionResponse.sessions);
    setBalances(balanceResponse.balances);
    setSelectedBalanceId((current) => current || balanceResponse.balances[0]?.id || "");
    setPendingCount(listPendingStockCounts().length);
  }

  useEffect(() => {
    if (!auth.session) {
      return;
    }
    void load();
    const onOnline = () => void load();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [auth.session]);

  async function submitCount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedBalance) {
      return;
    }
    const quantity = Number(countedQuantity);
    if (!Number.isFinite(quantity) || quantity < 0) {
      return;
    }
    const sessionCode = `CNT-${new Date().toISOString().slice(0, 10)}-${String(Date.now()).slice(-4)}`;
    const response = await postStockCountSession(auth.session.accessToken, {
      id: crypto.randomUUID(),
      sessionCode,
      locationId: selectedBalance.locationId,
      startedAt: new Date().toISOString(),
      createdOffline: !navigator.onLine,
      lines: [
        {
          id: crypto.randomUUID(),
          itemType: selectedBalance.itemType,
          itemId: selectedBalance.itemId,
          lotId: selectedBalance.lotId,
          countedQuantity: quantity,
          uom: selectedBalance.uom,
          clientTransactionId: crypto.randomUUID()
        }
      ],
      postCorrections
    });
    showToast({
      title: navigator.onLine ? "Count uploaded" : "Count saved offline",
      description: response.session.sessionCode
    });
    await load();
  }

  return (
    <section className="screen-grid" aria-labelledby="counts-title">
      <div className="screen-heading">
        <p className="eyebrow">Cycle counts</p>
        <h2 id="counts-title">Stock count sessions</h2>
        <p>Offline entries sync on reconnect; overlapping counts are held for review before corrections post.</p>
      </div>

      <div className="metric-grid">
        <article className="metric-panel">
          <span>Open/review</span>
          <strong>{sessions.filter((session) => ["open", "review"].includes(session.status)).length}</strong>
        </article>
        <article className="metric-panel">
          <span>Pending sync</span>
          <strong>{pendingCount}</strong>
        </article>
      </div>

      <form className="table-panel compact-form-grid" onSubmit={submitCount}>
        <h3>Mobile count entry</h3>
        <label className="select-field">
          <span>Item/lot/location</span>
          <select value={selectedBalance?.id ?? ""} onChange={(event) => setSelectedBalanceId(event.target.value)}>
            {balances.map((balance) => (
              <option key={balance.id} value={balance.id}>
                {balance.lotCode ?? balance.itemSku} at {balance.locationName}
              </option>
            ))}
          </select>
        </label>
        <Input label="Counted quantity" inputMode="decimal" value={countedQuantity} onChange={(event) => setCountedQuantity(event.target.value)} />
        <label className="checkbox-row">
          <input type="checkbox" checked={postCorrections} onChange={(event) => setPostCorrections(event.target.checked)} />
          <span>Post correction when clear</span>
        </label>
        <Button type="submit" disabled={!selectedBalance}>
          <Save aria-hidden="true" size={18} />
          Save count
        </Button>
      </form>

      <div className="table-panel">
        <div className="panel-heading">
          <h3>Sessions</h3>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            <UploadCloud aria-hidden="true" size={16} />
            Sync
          </Button>
        </div>
        {sessions.length === 0 ? (
          <EmptyState title="No counts yet" description="Create a mobile count entry to start." />
        ) : (
          <table className="list-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Location</th>
                <th>Status</th>
                <th>Started</th>
                <th>Conflicts</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <Link to="/stock-counts/$sessionId" params={{ sessionId: session.id }}>
                      {session.sessionCode}
                    </Link>
                    <div className="muted-line">{session.createdOffline ? "Started offline" : "Online"}</div>
                  </td>
                  <td>{session.locationName ?? session.locationId}</td>
                  <td><Badge tone={session.status === "closed" ? "success" : session.status === "review" ? "warning" : "info"}>{session.status}</Badge></td>
                  <td>{formatDateTime(new Date(session.startedAt))}</td>
                  <td>{formatNumber(session.conflictCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export function StockCountDetailScreen() {
  const auth = useAuth();
  const params = useParams({ strict: false }) as { sessionId: string };
  const { formatNumber } = useI18n();
  const [detail, setDetail] = useState<StockCountSessionDetail | null>(null);

  useEffect(() => {
    if (!auth.session) {
      return;
    }
    getStockCountSession(auth.session.accessToken, params.sessionId).then(setDetail);
  }, [auth.session, params.sessionId]);

  if (!detail) {
    return <EmptyState title="Loading count" description="Fetching session lines." />;
  }

  return (
    <section className="screen-grid" aria-labelledby="count-detail-title">
      <div className="screen-heading">
        <p className="eyebrow">Stock count detail</p>
        <h2 id="count-detail-title">{detail.session.sessionCode}</h2>
        <p>{detail.session.locationName ?? detail.session.locationId}</p>
      </div>
      {detail.conflicts.length > 0 || detail.session.status === "review" ? (
        <div className="conflict-banner">
          <AlertTriangle aria-hidden="true" size={18} />
          <span>Overlapping count session detected before correction movement posting.</span>
        </div>
      ) : null}
      <div className="table-panel">
        <div className="panel-heading">
          <h3>Count lines</h3>
          <Badge tone={detail.session.status === "closed" ? "success" : "warning"}>{detail.session.status}</Badge>
        </div>
        <table className="list-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Expected</th>
              <th>Counted</th>
              <th>Variance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {detail.lines.map((line) => (
              <tr key={line.id}>
                <td>
                  {line.lotCode ?? line.itemSku ?? line.itemId}
                  <div className="muted-line">{line.itemName}</div>
                </td>
                <td>{formatNumber(line.expectedQuantity)} {line.uom}</td>
                <td>{formatNumber(line.countedQuantity)} {line.uom}</td>
                <td>{formatNumber(line.varianceQuantity)} {line.uom}</td>
                <td><Badge tone={line.conflict ? "warning" : line.status === "posted" ? "success" : "info"}>{line.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
