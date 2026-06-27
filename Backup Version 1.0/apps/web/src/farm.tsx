import { CheckCircle2, ClipboardList, FlameKindling, History, Sprout } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Badge, Button, EmptyState, Input, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import {
  createGrowBatch,
  listGrowBatches,
  listLocations,
  recordDryingRun,
  recordHarvest,
  transitionGrowBatch
} from "./lib/api";
import { useI18n } from "./i18n/I18nProvider";
import type { GrowBatch, GrowBatchDetail, Location } from "./types";

const statusOrder: GrowBatch["status"][] = ["planned", "inoculated", "fruiting", "harvested", "closed"];

function nextStatus(status: GrowBatch["status"]): GrowBatch["status"] | null {
  const index = statusOrder.indexOf(status);
  return index >= 0 && index < statusOrder.length - 1 ? statusOrder[index + 1] ?? null : null;
}

function statusTone(status: GrowBatch["status"]): "neutral" | "success" | "warning" | "info" {
  if (status === "closed") {
    return "success";
  }
  if (status === "fruiting" || status === "harvested") {
    return "info";
  }
  if (status === "planned") {
    return "warning";
  }
  return "neutral";
}

function localDateTimeValue(date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function isoFromLocal(value: string): string {
  return new Date(value).toISOString();
}

export function FarmScreen() {
  const auth = useAuth();
  const { formatDate, formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [growBatches, setGrowBatches] = useState<GrowBatchDetail[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedGrowBatchId, setSelectedGrowBatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [batchCode, setBatchCode] = useState(`GB-${new Date().getFullYear()}-`);
  const [species, setSpecies] = useState("Hericium erinaceus");
  const [strain, setStrain] = useState("Lion's Mane house culture");
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(localDateTimeValue());
  const [batchNotes, setBatchNotes] = useState("");

  const selectedDetail = useMemo(
    () => growBatches.find((detail) => detail.growBatch.id === selectedGrowBatchId) ?? growBatches[0] ?? null,
    [growBatches, selectedGrowBatchId]
  );
  const farmLocation = locations.find((location) => location.type === "farm") ?? locations[0];
  const outputLocation = locations.find((location) => ["packing", "drying", "warehouse"].includes(location.type)) ?? locations[0];

  const [harvestCode, setHarvestCode] = useState(`HV-${new Date().getFullYear()}-`);
  const [harvestedAt, setHarvestedAt] = useState(localDateTimeValue());
  const [wetWeight, setWetWeight] = useState("12.5");
  const [dryWeight, setDryWeight] = useState("1.2");
  const [harvestNotes, setHarvestNotes] = useState("");

  const latestHarvest = selectedDetail?.harvests[0] ?? null;
  const [dryingCode, setDryingCode] = useState(`DRY-${new Date().getFullYear()}-`);
  const [dryStartedAt, setDryStartedAt] = useState(localDateTimeValue());
  const [dryEndedAt, setDryEndedAt] = useState(localDateTimeValue(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [dryMethod, setDryMethod] = useState("rack_dehydrator");
  const [dryInputWeight, setDryInputWeight] = useState("12.5");
  const [dryOutputWeight, setDryOutputWeight] = useState("1.15");
  const [moisturePercent, setMoisturePercent] = useState("8.5");
  const [outputLotCode, setOutputLotCode] = useState(`DH-${new Date().getFullYear()}-`);

  async function loadFarm() {
    if (!auth.session) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [farmResponse, locationResponse] = await Promise.all([
        listGrowBatches(auth.session.accessToken),
        listLocations(auth.session.accessToken)
      ]);
      setGrowBatches(farmResponse.growBatches);
      setLocations(locationResponse.locations);
      if (!selectedGrowBatchId && farmResponse.growBatches[0]) {
        setSelectedGrowBatchId(farmResponse.growBatches[0].growBatch.id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Farm workflows could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!auth.session) {
      return;
    }
    void loadFarm();
  }, [auth.session]);

  async function submitGrowBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }

    try {
      const response = await createGrowBatch(auth.session.accessToken, {
        batchCode,
        species,
        strain,
        locationId: farmLocation?.id ?? null,
        expectedHarvestDate: isoFromLocal(expectedHarvestDate),
        notes: batchNotes,
        attachmentsMetadataJson: { mobileFieldNotes: Boolean(batchNotes.trim()) }
      });
      setSelectedGrowBatchId(response.growBatch.id);
      showToast({ title: "Grow batch created", description: response.growBatch.batchCode });
      await loadFarm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Grow batch create failed.");
    }
  }

  async function advanceStatus() {
    if (!auth.session || !selectedDetail) {
      return;
    }
    const next = nextStatus(selectedDetail.growBatch.status);
    if (!next) {
      return;
    }

    try {
      await transitionGrowBatch(auth.session.accessToken, selectedDetail.growBatch.id, next);
      showToast({ title: "Batch updated", description: `${selectedDetail.growBatch.batchCode} -> ${next}` });
      await loadFarm();
    } catch (transitionError) {
      setError(transitionError instanceof Error ? transitionError.message : "Status transition failed.");
    }
  }

  async function submitHarvest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedDetail) {
      return;
    }

    const wet = Number(wetWeight);
    const dry = Number(dryWeight);
    if (!Number.isFinite(wet) || wet <= 0 || !Number.isFinite(dry) || dry < 0) {
      setError("Harvest weights must be valid numbers.");
      return;
    }

    try {
      const response = await recordHarvest(auth.session.accessToken, {
        harvestCode,
        growBatchId: selectedDetail.growBatch.id,
        harvestedAt: isoFromLocal(harvestedAt),
        wetWeight: wet,
        dryWeight: dry,
        uom: "kg",
        locationId: selectedDetail.growBatch.locationId ?? farmLocation?.id ?? null,
        qcObservations: harvestNotes,
        attachmentsMetadataJson: { fieldPhotoCount: 0 }
      });
      setDryInputWeight(String(response.harvest.wetWeight));
      showToast({ title: "Harvest recorded", description: response.harvest.harvestCode });
      await loadFarm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Harvest recording failed.");
    }
  }

  async function submitDryingRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !latestHarvest || !outputLocation) {
      setError("Record a harvest before accepting dried output.");
      return;
    }

    const inputWeight = Number(dryInputWeight);
    const outputWeight = Number(dryOutputWeight);
    const moisture = Number(moisturePercent);
    if (!Number.isFinite(inputWeight) || inputWeight <= 0 || !Number.isFinite(outputWeight) || outputWeight <= 0) {
      setError("Drying weights must be greater than zero.");
      return;
    }

    try {
      const response = await recordDryingRun(auth.session.accessToken, {
        dryingCode,
        harvestId: latestHarvest.id,
        startedAt: isoFromLocal(dryStartedAt),
        endedAt: isoFromLocal(dryEndedAt),
        method: dryMethod,
        inputWeight,
        outputWeight,
        moisturePercent: Number.isFinite(moisture) ? moisture : null,
        status: "completed",
        notes: "Accepted from mobile farm workflow.",
        acceptOutput: {
          lotCode: outputLotCode,
          locationId: outputLocation.id,
          clientTransactionId: crypto.randomUUID()
        }
      });
      showToast({ title: "Dried output accepted", description: response.lot?.lotCode ?? dryingCode });
      await loadFarm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Drying run failed.");
    }
  }

  return (
    <section className="screen-grid farm-screen" aria-labelledby="farm-title">
      <div className="screen-heading">
        <p className="eyebrow">Farm production</p>
        <h2 id="farm-title">Cultivation workflows</h2>
        <p>Grow batches, harvests, drying output, and traceable dried harvest lots.</p>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="farm-dashboard">
        <article className="metric-panel">
          <span>Open batches</span>
          <strong>{formatNumber(growBatches.filter((detail) => detail.growBatch.status !== "closed").length)}</strong>
        </article>
        <article className="metric-panel">
          <span>Wet harvest</span>
          <strong>{formatNumber(growBatches.reduce((total, detail) => total + detail.calculations.wetWeightTotal, 0))} kg</strong>
        </article>
        <article className="metric-panel">
          <span>Dried output</span>
          <strong>{formatNumber(growBatches.reduce((total, detail) => total + detail.calculations.driedOutputTotal, 0))} kg</strong>
        </article>
      </div>

      <div className="farm-layout">
        <div className="table-panel farm-list">
          <div className="panel-heading">
            <h3>Grow batches</h3>
            <Button variant="secondary" size="sm" onClick={() => void loadFarm()}>
              <History aria-hidden="true" size={16} />
              Refresh
            </Button>
          </div>
          {loading ? (
            <p>Loading farm work...</p>
          ) : growBatches.length === 0 ? (
            <EmptyState title="No grow batches" description="Create the first planned batch below." />
          ) : (
            <div className="farm-card-list">
              {growBatches.map((detail) => (
                <button
                  type="button"
                  className={detail.growBatch.id === selectedDetail?.growBatch.id ? "farm-card selected-row" : "farm-card"}
                  key={detail.growBatch.id}
                  onClick={() => setSelectedGrowBatchId(detail.growBatch.id)}
                >
                  <span>
                    <strong>{detail.growBatch.batchCode}</strong>
                    <small>{detail.growBatch.species}</small>
                  </span>
                  <Badge tone={statusTone(detail.growBatch.status)}>{detail.growBatch.status}</Badge>
                  <span>{formatNumber(detail.calculations.wetWeightTotal)} kg wet</span>
                  <span>{detail.growBatch.expectedHarvestDate ? formatDate(new Date(detail.growBatch.expectedHarvestDate)) : "No target"}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="detail-panel farm-detail" aria-label="Grow batch detail">
          {selectedDetail ? (
            <>
              <div className="panel-heading">
                <h3>{selectedDetail.growBatch.batchCode}</h3>
                <Badge tone={statusTone(selectedDetail.growBatch.status)}>{selectedDetail.growBatch.status}</Badge>
              </div>
              <dl className="balance-detail-list">
                <div>
                  <dt>Species</dt>
                  <dd>{selectedDetail.growBatch.species}</dd>
                </div>
                <div>
                  <dt>Wet harvest</dt>
                  <dd>{formatNumber(selectedDetail.calculations.wetWeightTotal)} kg</dd>
                </div>
                <div>
                  <dt>Dry yield</dt>
                  <dd>
                    {selectedDetail.calculations.harvestDryYieldPercent === null
                      ? "Pending"
                      : `${formatNumber(selectedDetail.calculations.harvestDryYieldPercent)}%`}
                  </dd>
                </div>
                <div>
                  <dt>Drying loss</dt>
                  <dd>
                    {selectedDetail.calculations.dryingLossPercent === null
                      ? "Pending"
                      : `${formatNumber(selectedDetail.calculations.dryingLossPercent)}%`}
                  </dd>
                </div>
                <div>
                  <dt>Last harvest</dt>
                  <dd>{latestHarvest ? formatDateTime(new Date(latestHarvest.harvestedAt)) : "None"}</dd>
                </div>
              </dl>
              <Button onClick={() => void advanceStatus()} disabled={!nextStatus(selectedDetail.growBatch.status)}>
                <CheckCircle2 aria-hidden="true" size={18} />
                {nextStatus(selectedDetail.growBatch.status) ? `Move to ${nextStatus(selectedDetail.growBatch.status)}` : "Closed"}
              </Button>
            </>
          ) : (
            <p>Select or create a grow batch.</p>
          )}
        </aside>
      </div>

      <Tabs
        tabs={[
          {
            id: "batch",
            label: "Batch",
            content: (
              <form className="farm-form-grid" onSubmit={submitGrowBatch}>
                <Input label="Batch code" value={batchCode} onChange={(event) => setBatchCode(event.target.value)} />
                <Input label="Species" value={species} onChange={(event) => setSpecies(event.target.value)} />
                <Input label="Strain" value={strain} onChange={(event) => setStrain(event.target.value)} />
                <Input
                  label="Expected harvest"
                  type="datetime-local"
                  value={expectedHarvestDate}
                  onChange={(event) => setExpectedHarvestDate(event.target.value)}
                />
                <Input label="Notes" value={batchNotes} onChange={(event) => setBatchNotes(event.target.value)} />
                <Button type="submit">
                  <Sprout aria-hidden="true" size={18} />
                  Create batch
                </Button>
              </form>
            )
          },
          {
            id: "harvest",
            label: "Harvest",
            content: (
              <form className="farm-form-grid" onSubmit={submitHarvest}>
                <Input label="Harvest code" value={harvestCode} onChange={(event) => setHarvestCode(event.target.value)} />
                <Input
                  label="Harvested at"
                  type="datetime-local"
                  value={harvestedAt}
                  onChange={(event) => setHarvestedAt(event.target.value)}
                />
                <Input label="Wet weight kg" inputMode="decimal" value={wetWeight} onChange={(event) => setWetWeight(event.target.value)} />
                <Input label="Dry weight kg" inputMode="decimal" value={dryWeight} onChange={(event) => setDryWeight(event.target.value)} />
                <Input label="QC observations" value={harvestNotes} onChange={(event) => setHarvestNotes(event.target.value)} />
                <Button type="submit" disabled={!selectedDetail}>
                  <ClipboardList aria-hidden="true" size={18} />
                  Record harvest
                </Button>
              </form>
            )
          },
          {
            id: "drying",
            label: "Drying",
            content: (
              <form className="farm-form-grid" onSubmit={submitDryingRun}>
                <label className="select-field">
                  <span>Harvest</span>
                  <select value={latestHarvest?.id ?? ""} disabled>
                    <option>{latestHarvest ? latestHarvest.harvestCode : "Record a harvest first"}</option>
                  </select>
                </label>
                <Input label="Drying code" value={dryingCode} onChange={(event) => setDryingCode(event.target.value)} />
                <Input label="Started" type="datetime-local" value={dryStartedAt} onChange={(event) => setDryStartedAt(event.target.value)} />
                <Input label="Ended" type="datetime-local" value={dryEndedAt} onChange={(event) => setDryEndedAt(event.target.value)} />
                <Input label="Method" value={dryMethod} onChange={(event) => setDryMethod(event.target.value)} />
                <Input label="Input kg" inputMode="decimal" value={dryInputWeight} onChange={(event) => setDryInputWeight(event.target.value)} />
                <Input label="Output kg" inputMode="decimal" value={dryOutputWeight} onChange={(event) => setDryOutputWeight(event.target.value)} />
                <Input label="Moisture %" inputMode="decimal" value={moisturePercent} onChange={(event) => setMoisturePercent(event.target.value)} />
                <Input label="Output lot" value={outputLotCode} onChange={(event) => setOutputLotCode(event.target.value)} />
                <Button type="submit" disabled={!latestHarvest}>
                  <FlameKindling aria-hidden="true" size={18} />
                  Accept dried output
                </Button>
              </form>
            )
          }
        ]}
      />
    </section>
  );
}
