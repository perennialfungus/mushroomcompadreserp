import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { CheckCircle2, FileSpreadsheet, RotateCcw, Save, Upload, XCircle } from "lucide-react";
import { Badge, Button, EmptyState, Input, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import {
  applyImportBatch,
  approveImportBatch,
  bulkEditMasterData,
  createImportBatch,
  listImportBatches,
  listImportTemplates,
  listSkuReadiness,
  rollbackImportBatch
} from "./lib/api";
import type { ImportBatch, ImportTemplateDescriptor, ImportTemplateKind, SkuReadinessRow } from "./types";

export function ImportCenterScreen() {
  const auth = useAuth();
  const toast = useToast();
  const token = auth.session?.accessToken;
  const [templates, setTemplates] = useState<ImportTemplateDescriptor[]>([]);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [readiness, setReadiness] = useState<SkuReadinessRow[]>([]);
  const [selectedKind, setSelectedKind] = useState<ImportTemplateKind>("products");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState("");
  const [fileName, setFileName] = useState("products.csv");
  const [loading, setLoading] = useState(true);
  const canEdit = auth.isAdmin;

  async function refresh() {
    if (!token) return;
    const [templateResponse, batchResponse, readinessResponse] = await Promise.all([
      listImportTemplates(token),
      listImportBatches(token),
      listSkuReadiness(token)
    ]);
    setTemplates(templateResponse.templates);
    setBatches(batchResponse.batches);
    setReadiness(readinessResponse.readiness);
    setSelectedBatchId((current) => current ?? batchResponse.batches[0]?.id ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, [token]);

  const selectedTemplate = templates.find((template) => template.kind === selectedKind);
  const selectedBatch = batches.find((batch) => batch.id === selectedBatchId) ?? batches[0] ?? null;

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (file.name.toLowerCase().endsWith(".xlsx")) {
      setFileContents(`base64,${arrayBufferToBase64(await file.arrayBuffer())}`);
    } else {
      setFileContents(await file.text());
    }
  }

  async function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !canEdit || !fileContents.trim()) return;
    const response = await createImportBatch(token, {
      templateKind: selectedKind,
      fileName,
      contents: fileContents,
      format: fileName.toLowerCase().endsWith(".tsv") ? "tsv" : fileName.toLowerCase().endsWith(".xlsx") ? "xlsx" : "csv"
    });
    await refresh();
    setSelectedBatchId(response.batch.id);
    toast.showToast({
      title: "Import staged",
      description: `${response.batch.preview.errorCount} errors and ${response.batch.preview.warningCount} warnings found.`
    });
  }

  async function mutateBatch(action: "approve" | "apply" | "rollback") {
    if (!token || !selectedBatch) return;
    if (action === "approve") await approveImportBatch(token, selectedBatch.id);
    if (action === "apply") await applyImportBatch(token, selectedBatch.id);
    if (action === "rollback") await rollbackImportBatch(token, selectedBatch.id, "Admin rollback from import center");
    await refresh();
    toast.showToast({ title: `Batch ${action} complete`, description: selectedBatch.batchNumber });
  }

  if (loading) {
    return <EmptyState title="Loading import center" description="Fetching templates, staged batches, and SKU readiness." />;
  }

  return (
    <section className="screen-grid import-center-screen" aria-labelledby="import-center-title">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Master data onboarding</p>
          <h2 id="import-center-title">Import center</h2>
          <p>Stage spreadsheets, validate relationships, apply approved batches, and track SKU launch readiness.</p>
        </div>
        <Badge tone={canEdit ? "success" : "info"}>{canEdit ? "Admin tools" : "Read only"}</Badge>
      </div>

      <Tabs
        tabs={[
          {
            id: "upload",
            label: "Upload",
            content: (
              <div className="configurator-grid">
                <form className="editor-panel" onSubmit={handlePreview}>
                  <div className="panel-header">
                    <h3>Spreadsheet preview</h3>
                    <FileSpreadsheet aria-hidden="true" size={20} />
                  </div>
                  <label className="select-field">
                    <span>Template</span>
                    <select
                      value={selectedKind}
                      onChange={(event) => {
                        const nextKind = event.target.value as ImportTemplateKind;
                        setSelectedKind(nextKind);
                        setFileName(templates.find((template) => template.kind === nextKind)?.fileName ?? `${nextKind}.csv`);
                      }}
                    >
                      {templates.map((template) => (
                        <option key={template.kind} value={template.kind}>{template.label}</option>
                      ))}
                    </select>
                  </label>
                  <Input label="File name" name="fileName" value={fileName} onChange={(event) => setFileName(event.currentTarget.value)} />
                  <label className="file-drop">
                    <Upload aria-hidden="true" size={20} />
                    <span>{fileContents ? fileName : "Choose CSV, TSV, or XLSX file"}</span>
                    <input accept=".csv,.tsv,.xlsx" type="file" onChange={handleFile} />
                  </label>
                  {selectedTemplate ? (
                    <div className="detail-card flat">
                      <h4>{selectedTemplate.label}</h4>
                      <p className="muted">Required: {selectedTemplate.requiredColumns.join(", ")}</p>
                      <p className="muted">Optional: {selectedTemplate.optionalColumns.join(", ")}</p>
                    </div>
                  ) : null}
                  <Button disabled={!canEdit || !fileContents.trim()} type="submit">
                    <Upload aria-hidden="true" size={18} />
                    Preview import
                  </Button>
                </form>
                <BatchPreview batch={selectedBatch} onSelectBatch={setSelectedBatchId} batches={batches} />
              </div>
            )
          },
          {
            id: "batches",
            label: "Staged batches",
            content: (
              <BatchDetail
                batch={selectedBatch}
                batches={batches}
                canEdit={canEdit}
                onMutate={(action) => void mutateBatch(action)}
                onSelectBatch={setSelectedBatchId}
              />
            )
          },
          {
            id: "readiness",
            label: "SKU readiness",
            content: <ReadinessDashboard readiness={readiness} />
          },
          {
            id: "bulk",
            label: "Bulk edit",
            content: <BulkEditPanel canEdit={canEdit} onSaved={() => void refresh()} token={token} />
          }
        ]}
      />
    </section>
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(index, index + 0x8000));
  }
  return btoa(binary);
}

function BatchPreview(props: {
  batch: ImportBatch | null;
  batches: ImportBatch[];
  onSelectBatch: (batchId: string) => void;
}) {
  if (!props.batch) {
    return <EmptyState title="No staged import" description="Upload a template to review row validation before applying." />;
  }
  return (
    <aside className="detail-card">
      <div className="panel-header">
        <h3>Preview summary</h3>
        <Badge tone={props.batch.preview.errorCount > 0 ? "warning" : "success"}>{props.batch.status}</Badge>
      </div>
      <dl className="compact-definition">
        <div><dt>Batch</dt><dd>{props.batch.batchNumber}</dd></div>
        <div><dt>Rows</dt><dd>{props.batch.preview.validRows}/{props.batch.preview.totalRows} valid</dd></div>
        <div><dt>Errors</dt><dd>{props.batch.preview.errorCount}</dd></div>
        <div><dt>Warnings</dt><dd>{props.batch.preview.warningCount}</dd></div>
      </dl>
      <label className="select-field">
        <span>Open batch</span>
        <select value={props.batch.id} onChange={(event) => props.onSelectBatch(event.currentTarget.value)}>
          {props.batches.map((batch) => (
            <option key={batch.id} value={batch.id}>{batch.batchNumber} / {batch.fileName}</option>
          ))}
        </select>
      </label>
      <IssueList batch={props.batch} />
    </aside>
  );
}

function BatchDetail(props: {
  batch: ImportBatch | null;
  batches: ImportBatch[];
  canEdit: boolean;
  onSelectBatch: (batchId: string) => void;
  onMutate: (action: "approve" | "apply" | "rollback") => void;
}) {
  if (!props.batch) {
    return <EmptyState title="No import batches" description="Stage an import to see validation rows and lifecycle actions." />;
  }
  const canApprove = props.canEdit && props.batch.status === "staged" && props.batch.preview.errorCount === 0;
  const canApply = props.canEdit && props.batch.status === "approved";
  const canRollback = props.canEdit && props.batch.status === "applied";
  return (
    <div className="screen-grid">
      <div className="detail-card">
        <div className="panel-header">
          <h3>{props.batch.batchNumber}</h3>
          <Badge tone={props.batch.preview.errorCount > 0 ? "warning" : "success"}>{props.batch.status}</Badge>
          <div className="button-row">
            <Button disabled={!canApprove} size="sm" variant="secondary" onClick={() => props.onMutate("approve")}>
              <CheckCircle2 aria-hidden="true" size={16} />Approve
            </Button>
            <Button disabled={!canApply} size="sm" onClick={() => props.onMutate("apply")}>
              <Save aria-hidden="true" size={16} />Apply
            </Button>
            <Button disabled={!canRollback} size="sm" variant="secondary" onClick={() => props.onMutate("rollback")}>
              <RotateCcw aria-hidden="true" size={16} />Rollback
            </Button>
          </div>
        </div>
        <label className="select-field">
          <span>Batch</span>
          <select value={props.batch.id} onChange={(event) => props.onSelectBatch(event.currentTarget.value)}>
            {props.batches.map((batch) => (
              <option key={batch.id} value={batch.id}>{batch.batchNumber} / {batch.status}</option>
            ))}
          </select>
        </label>
        <table className="list-table">
          <thead>
            <tr><th>Row</th><th>Action</th><th>Key</th><th>Issues</th></tr>
          </thead>
          <tbody>
            {props.batch.preview.rows.map((row) => (
              <tr key={row.rowNumber}>
                <td>{row.rowNumber}</td>
                <td>{row.action}</td>
                <td>{row.key}</td>
                <td>{row.issues.length === 0 ? "Clean" : row.issues.map((issue) => issue.code).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <IssueList batch={props.batch} />
    </div>
  );
}

function IssueList({ batch }: { batch: ImportBatch }) {
  return (
    <div className="detail-card">
      <div className="panel-header">
        <h3>Validation issues</h3>
        <Badge tone={batch.preview.errorCount > 0 ? "warning" : "success"}>
          {batch.preview.errorCount} errors
        </Badge>
      </div>
      {batch.preview.issues.length === 0 ? (
        <p className="muted">No validation issues in this preview.</p>
      ) : (
        batch.preview.issues.map((issue, index) => (
          <article className="variant-card" key={`${issue.code}-${issue.rowNumber}-${index}`}>
            {issue.level === "error" ? <XCircle aria-hidden="true" size={18} /> : <CheckCircle2 aria-hidden="true" size={18} />}
            <span>
              <strong>{issue.code.replaceAll("_", " ")}</strong>
              <small>Row {issue.rowNumber ?? "-"} {issue.field ?? ""} / {issue.message}</small>
            </span>
            <Badge tone={issue.level === "error" ? "warning" : "info"}>{issue.level}</Badge>
          </article>
        ))
      )}
    </div>
  );
}

function ReadinessDashboard({ readiness }: { readiness: SkuReadinessRow[] }) {
  const counts = useMemo(() => ({
    ready: readiness.filter((row) => row.status === "ready").length,
    blocked: readiness.filter((row) => row.status === "blocked").length,
    attention: readiness.filter((row) => row.status === "attention").length
  }), [readiness]);
  return (
    <div className="detail-card">
      <div className="panel-header">
        <h3>SKU launch readiness</h3>
        <Badge tone="success">{counts.ready} ready</Badge>
        <Badge tone="warning">{counts.blocked} blocked</Badge>
        <Badge tone="info">{counts.attention} attention</Badge>
      </div>
      <table className="list-table readiness-table">
        <thead>
          <tr><th>SKU</th><th>Product</th><th>Status</th><th>Checks</th><th>Missing</th></tr>
        </thead>
        <tbody>
          {readiness.map((row) => (
            <tr key={row.variantId}>
              <td>{row.sku}</td>
              <td>{row.productName}</td>
              <td><Badge tone={row.status === "ready" ? "success" : "warning"}>{row.status}</Badge></td>
              <td>{row.readyCount}/{row.totalCount}</td>
              <td>{row.checks.filter((check) => !check.ready).map((check) => check.label).join(", ") || "None"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BulkEditPanel(props: { canEdit: boolean; token: string | undefined; onSaved: () => void }) {
  const toast = useToast();
  async function handleBulkEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!props.token || !props.canEdit) return;
    const form = new FormData(event.currentTarget);
    const ids = String(form.get("ids") ?? "").split(",").map((id) => id.trim()).filter(Boolean);
    const field = String(form.get("field") ?? "").trim();
    const value = String(form.get("value") ?? "").trim();
    await bulkEditMasterData(props.token, {
      entityType: String(form.get("entityType")) as "product_variants",
      ids,
      fields: { [field]: value }
    });
    props.onSaved();
    toast.showToast({ title: "Bulk edit saved", description: `${ids.length} records submitted.` });
  }
  return (
    <form className="editor-panel" onSubmit={handleBulkEdit}>
      <div className="panel-header">
        <h3>Bulk edit common fields</h3>
        <Badge tone={props.canEdit ? "success" : "info"}>{props.canEdit ? "Editable" : "Read only"}</Badge>
      </div>
      <div className="form-grid">
        <label className="select-field">
          <span>Entity type</span>
          <select name="entityType" defaultValue="product_variants">
            <option value="product_variants">Product variants</option>
            <option value="materials">Materials</option>
            <option value="packaging_components">Packaging components</option>
            <option value="suppliers">Suppliers</option>
            <option value="locations">Locations</option>
          </select>
        </label>
        <Input label="Record IDs" name="ids" placeholder="id-1, id-2" required />
        <Input label="Field" name="field" placeholder="status" required />
        <Input label="Value" name="value" placeholder="active" required />
      </div>
      <Button disabled={!props.canEdit} type="submit">
        <Save aria-hidden="true" size={18} />
        Save bulk edit
      </Button>
    </form>
  );
}
