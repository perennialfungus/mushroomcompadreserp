import { Beaker, CheckCircle2, FlaskConical, PackageCheck, PlusCircle, RefreshCw, RotateCcw, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "./auth";
import { Badge, Button, EmptyState, Input, useToast } from "./components/ui";
import { useI18n } from "./i18n/I18nProvider";
import {
  createStabilityStudy,
  enterLimsResult,
  generateLimsSamples,
  getLimsDashboard,
  pullRetainedSample,
  reviewLimsResult
} from "./lib/api";
import type { LimsDashboard } from "./types";

export function LimsScreen() {
  const auth = useAuth();
  const { formatDate, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<LimsDashboard | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState("sample-lm-2026-06-release");
  const [valueNumber, setValueNumber] = useState("8.8");
  const [retestValue, setRetestValue] = useState("8.4");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!auth.session) return;
    const response = await getLimsDashboard(auth.session.accessToken);
    setDashboard(response.dashboard);
    setSelectedSampleId((current) => current || response.dashboard.sampleQueue[0]?.id || "");
  }

  useEffect(() => {
    if (!auth.session) return;
    void load();
  }, [auth.session]);

  const selectedSample = useMemo(
    () => dashboard?.sampleQueue.find((sample) => sample.id === selectedSampleId) ?? dashboard?.sampleQueue[0] ?? null,
    [dashboard, selectedSampleId]
  );
  const selectedTest = selectedSample?.tests[0] ?? null;
  const failedResult = selectedTest?.results.find((result) => result.evaluatedStatus === "fail" && !result.invalidatedAt) ?? null;

  async function generateFinishedGoodSamples() {
    if (!auth.session) return;
    setBusy(true);
    try {
      await generateLimsSamples(auth.session.accessToken, {
        sourceType: "lot",
        sourceId: "lot-lm-2026-06",
        lotId: "lot-lm-2026-06",
        inspectionType: "finished_good",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        productVariantId: "var-lions-mane-50",
        riskLevel: "medium",
        batchSize: 120,
        testMethodIds: ["qctm-moisture"]
      });
      showToast({ title: "Samples generated", description: "Finished good plan selected." });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function submitResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedTest) return;
    setBusy(true);
    try {
      const response = await enterLimsResult(auth.session.accessToken, {
        sampleTestId: selectedTest.id,
        valueNumber: Number(valueNumber),
        unit: selectedTest.unit,
        comments: "Moisture result entered from LIMS bench.",
        evidence: [{ filePath: "lab/moisture-entry.pdf", fileName: "moisture-entry.pdf", contentType: "application/pdf" }]
      });
      showToast({
        title: response.labResult.evaluatedStatus === "pass" ? "Result entered" : "OOS triggered",
        description: response.qualityEvent?.eventNumber ?? response.labResult.resultNumber
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function submitRetest() {
    if (!auth.session || !selectedTest || !failedResult) return;
    setBusy(true);
    try {
      await enterLimsResult(auth.session.accessToken, {
        sampleTestId: selectedTest.id,
        retestOfResultId: failedResult.id,
        valueNumber: Number(retestValue),
        unit: selectedTest.unit,
        reason: "Documented retest after instrument check.",
        comments: "Retest entered with evidence and original preserved.",
        evidence: [{ filePath: "lab/retest-entry.pdf", fileName: "retest-entry.pdf", contentType: "application/pdf" }]
      });
      showToast({ title: "Retest entered", description: failedResult.resultNumber });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function approveLatestResult() {
    if (!auth.session || !selectedTest?.results[0]) return;
    await reviewLimsResult(auth.session.accessToken, selectedTest.results[0].id, "approved");
    showToast({ title: "Result approved", description: selectedTest.results[0].resultNumber });
    await load();
  }

  async function pullRetain() {
    if (!auth.session || !dashboard?.retainedSamples[0]) return;
    await pullRetainedSample(auth.session.accessToken, dashboard.retainedSamples[0].id, {
      quantity: 1,
      purpose: "Customer complaint reserve pull",
      createSample: true
    });
    showToast({ title: "Retained sample pulled", description: dashboard.retainedSamples[0].retainedSampleNumber });
    await load();
  }

  async function addStabilityStudy() {
    if (!auth.session) return;
    await createStabilityStudy(auth.session.accessToken, {
      lotId: "lot-lm-2026-06",
      protocolName: "Accelerated ambient verification",
      storageCondition: "30C / ambient humidity",
      startDate: new Date().toISOString(),
      intervalsDays: [0, 30, 90],
      testMethodIds: ["qctm-moisture"],
      windowDays: 7
    });
    showToast({ title: "Stability study planned", description: "Pull points scheduled." });
    await load();
  }

  if (!dashboard) {
    return <EmptyState title="Loading LIMS" description="Fetching samples, retained inventory, stability pulls, and lab trends." />;
  }

  return (
    <section className="screen-grid" aria-labelledby="lims-title">
      <div className="screen-heading">
        <p className="eyebrow">LIMS</p>
        <h2 id="lims-title">Samples, lab results, retains, and stability</h2>
        <p>Incoming, in-process, finished good, retained, retest, and stability testing stay traceable to lots and quality events.</p>
      </div>

      <div className="metric-grid">
        <Metric label="Open samples" value={dashboard.openSamples} />
        <Metric label="Awaiting review" value={dashboard.awaitingReview} />
        <Metric label="Failed results" value={dashboard.failedResults} />
        <Metric label="Stability due" value={dashboard.stabilityDue} />
      </div>

      <div className="table-panel">
        <div className="panel-heading">
          <h3>Sample queue</h3>
          <Button type="button" size="sm" onClick={() => void generateFinishedGoodSamples()} disabled={busy} data-testid="generate-lims-samples">
            <PlusCircle aria-hidden="true" size={16} />
            Generate
          </Button>
        </div>
        <table className="list-table">
          <thead><tr><th>Sample</th><th>Source</th><th>Status</th><th>Due</th><th>Test</th></tr></thead>
          <tbody>
            {dashboard.sampleQueue.map((sample) => (
              <tr key={sample.id} onClick={() => setSelectedSampleId(sample.id)} className={sample.id === selectedSample?.id ? "selected-row" : undefined}>
                <td>{sample.sampleNumber}<div className="muted-line">{sample.lot?.lotCode ?? sample.sourceId}</div></td>
                <td>{sample.inspectionType}</td>
                <td><Badge tone={sample.status === "failed" ? "warning" : sample.status === "approved" ? "success" : "info"}>{sample.status}</Badge></td>
                <td>{sample.dueAt ? formatDate(new Date(sample.dueAt)) : "not set"}</td>
                <td>{sample.tests[0]?.testMethod?.name ?? "No panel"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="table-panel compact-form-grid" onSubmit={submitResult} data-testid="lims-result-form">
        <div className="panel-heading">
          <h3>Lab result entry</h3>
          <Badge tone="info"><Beaker aria-hidden="true" size={16} /> {selectedSample?.sampleNumber ?? "No sample"}</Badge>
        </div>
        <label className="select-field">
          <span>Sample</span>
          <select value={selectedSample?.id ?? ""} onChange={(event) => setSelectedSampleId(event.target.value)}>
            {dashboard.sampleQueue.map((sample) => <option key={sample.id} value={sample.id}>{sample.sampleNumber}</option>)}
          </select>
        </label>
        <Input label={`Result ${selectedTest?.unit ?? ""}`} value={valueNumber} onChange={(event) => setValueNumber(event.target.value)} />
        <Button type="submit" disabled={busy || !selectedTest}>
          <FlaskConical aria-hidden="true" size={18} />
          Enter result
        </Button>
        <Button type="button" variant="secondary" disabled={!selectedTest?.results[0]} onClick={() => void approveLatestResult()}>
          <CheckCircle2 aria-hidden="true" size={18} />
          Approve latest
        </Button>
      </form>

      <div className="table-panel compact-form-grid" data-testid="lims-retest-panel">
        <div className="panel-heading">
          <h3>Retest workflow</h3>
          <Badge tone={failedResult ? "warning" : "success"}><RotateCcw aria-hidden="true" size={16} /> {failedResult ? "OOS" : "Clear"}</Badge>
        </div>
        <Input label="Retest value" value={retestValue} onChange={(event) => setRetestValue(event.target.value)} />
        <Button type="button" disabled={!failedResult || busy} onClick={() => void submitRetest()} data-testid="enter-lims-retest">
          <RotateCcw aria-hidden="true" size={18} />
          Enter retest
        </Button>
        <div className="result-list">
          {(selectedTest?.results ?? []).map((result) => (
            <div className="inline-record" key={result.id}>
              <span>{result.resultNumber}</span>
              <Badge tone={result.evaluatedStatus === "pass" ? "success" : "warning"}>{result.evaluatedStatus}</Badge>
              {result.retestOfResultId ? <span className="muted-line">Retest of {result.retestOfResultId}</span> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="table-panel">
        <div className="panel-heading">
          <h3>Retained sample inventory</h3>
          <Button type="button" size="sm" variant="secondary" onClick={() => void pullRetain()} data-testid="pull-retained-sample">
            <PackageCheck aria-hidden="true" size={16} />
            Pull
          </Button>
        </div>
        <table className="list-table">
          <thead><tr><th>Retain</th><th>Lot</th><th>Remaining</th><th>Status</th><th>Expiry</th></tr></thead>
          <tbody>
            {dashboard.retainedSamples.map((sample) => (
              <tr key={sample.id}>
                <td>{sample.retainedSampleNumber}</td>
                <td>{sample.lot?.lotCode ?? sample.lotId}</td>
                <td>{formatNumber(sample.remainingQuantity)} {sample.uom}</td>
                <td><Badge tone={sample.status === "available" ? "success" : "info"}>{sample.status}</Badge></td>
                <td>{sample.expiresAt ? formatDate(new Date(sample.expiresAt)) : "not set"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-panel">
        <div className="panel-heading">
          <h3>Stability planner</h3>
          <Button type="button" size="sm" variant="secondary" onClick={() => void addStabilityStudy()} data-testid="create-stability-study">
            <RefreshCw aria-hidden="true" size={16} />
            Schedule
          </Button>
        </div>
        {dashboard.stabilityStudies.map((study) => (
          <article className="inline-record" key={study.id}>
            <strong>{study.studyNumber}</strong>
            <span>{study.protocolName}</span>
            <span>{study.storageCondition}</span>
            <div className="trend-strip">
              {study.pullPoints.map((pull) => (
                <Badge key={pull.id} tone={pull.status === "missed" ? "warning" : pull.status === "tested" ? "success" : "info"}>
                  {pull.intervalDays}d {pull.status}
                </Badge>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="table-panel">
        <div className="panel-heading">
          <h3>QC trend analytics</h3>
          <Badge tone="info"><TrendingUp aria-hidden="true" size={16} /> {dashboard.trends.length} groups</Badge>
        </div>
        <table className="list-table">
          <thead><tr><th>Group</th><th>Results</th><th>Pass rate</th><th>Average</th></tr></thead>
          <tbody>
            {dashboard.trends.map((trend) => (
              <tr key={trend.groupKey}>
                <td>{trend.groupKey}</td>
                <td>{formatNumber(trend.resultCount)}</td>
                <td>{formatNumber(Math.round(trend.passRate * 100))}%</td>
                <td>{trend.averageValue === null ? "n/a" : formatNumber(trend.averageValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  const { formatNumber } = useI18n();
  return (
    <article className="metric-panel">
      <span>{label}</span>
      <strong>{formatNumber(value)}</strong>
    </article>
  );
}
