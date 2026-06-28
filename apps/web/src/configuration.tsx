import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FileCog, Hash, ListChecks, PlusCircle, Save, SlidersHorizontal, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge, Button, EmptyState, Input, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import {
  generateConfiguredNumber,
  getConfiguration,
  previewConfiguredFieldBehavior,
  saveAttributeDefinition,
  saveAttributeSet,
  saveDocumentType,
  saveFieldBehaviorRule,
  saveNumberingSequence,
  saveReasonCode,
  validateConfiguredOperationalRecord
} from "./lib/api";
import type { ConfigurationSnapshot, DocumentType, FieldBehavior } from "./types";

const emptyConfiguration: ConfigurationSnapshot = {
  documentTypes: [],
  numberingSequences: [],
  reasonCodes: [],
  attributeDefinitions: [],
  attributeSets: [],
  attributeValues: [],
  fieldBehaviorRules: []
};

function field(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

function nullableField(form: FormData, name: string): string | null {
  const value = field(form, name);
  return value.length > 0 ? value : null;
}

function checked(form: FormData, name: string): boolean {
  return form.get(name) === "on";
}

export function ConfigurationScreen() {
  const auth = useAuth();
  const toast = useToast();
  const token = auth.session?.accessToken;
  const [configuration, setConfiguration] = useState<ConfigurationSnapshot>(emptyConfiguration);
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState("doc-type-standard-receipt");
  const [fieldPreview, setFieldPreview] = useState<FieldBehavior[]>([]);
  const [validationText, setValidationText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedDocumentType =
    configuration.documentTypes.find((type) => type.id === selectedDocumentTypeId) ?? configuration.documentTypes[0] ?? null;
  const selectedSequence = configuration.numberingSequences.find(
    (sequence) => sequence.id === selectedDocumentType?.numberingSequenceId || sequence.documentTypeId === selectedDocumentType?.id
  );

  async function refresh() {
    if (!token) return;
    try {
      const response = await getConfiguration(token);
      setConfiguration(response.configuration);
      setSelectedDocumentTypeId((current) =>
        response.configuration.documentTypes.some((type) => type.id === current)
          ? current
          : response.configuration.documentTypes[0]?.id ?? ""
      );
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Configuration could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [token]);

  async function submitDocumentType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    const response = await saveDocumentType(token, {
      category: field(form, "category") as DocumentType["category"],
      code: field(form, "code"),
      name: field(form, "name"),
      status: field(form, "status") as "active" | "inactive",
      description: nullableField(form, "description"),
      numberingSequenceId: nullableField(form, "numberingSequenceId"),
      defaultStatus: nullableField(form, "defaultStatus"),
      defaultLocationId: nullableField(form, "defaultLocationId"),
      defaultReasonCodeId: nullableField(form, "defaultReasonCodeId"),
      requireAttributes: checked(form, "requireAttributes"),
      settingsJson: { operationalForm: field(form, "operationalForm") || "purchasing.receipt" }
    });
    toast.showToast({ title: "Document type saved", description: response.documentType.name });
    await refresh();
    setSelectedDocumentTypeId(response.documentType.id);
  }

  async function submitNumbering(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedDocumentType) return;
    const form = new FormData(event.currentTarget);
    const response = await saveNumberingSequence(token, {
      documentTypeId: selectedDocumentType.id,
      code: field(form, "code"),
      description: nullableField(form, "description"),
      prefix: field(form, "prefix"),
      suffix: field(form, "suffix"),
      padLength: Number(field(form, "padLength") || "4"),
      nextNumber: Number(field(form, "nextNumber") || "1"),
      incrementBy: Number(field(form, "incrementBy") || "1"),
      scopeOrganization: true,
      scopeYear: checked(form, "scopeYear"),
      scopeMonth: checked(form, "scopeMonth"),
      scopeLocation: checked(form, "scopeLocation"),
      resetPolicy: field(form, "resetPolicy") as "never" | "yearly" | "monthly",
      lastScopeKey: null,
      active: checked(form, "active")
    });
    toast.showToast({ title: "Numbering saved", description: response.numberingSequence.code });
    await refresh();
  }

  async function submitReason(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    const response = await saveReasonCode(token, {
      catalog: field(form, "catalog") as never,
      code: field(form, "code"),
      label: field(form, "label"),
      description: nullableField(form, "description"),
      requiresComment: checked(form, "requiresComment"),
      active: checked(form, "active")
    });
    toast.showToast({ title: "Reason code saved", description: response.reasonCode.label });
    await refresh();
  }

  async function submitAttribute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedDocumentType) return;
    const form = new FormData(event.currentTarget);
    const attribute = await saveAttributeDefinition(token, {
      code: field(form, "code"),
      label: field(form, "label"),
      dataType: field(form, "dataType") as never,
      required: checked(form, "required"),
      options: field(form, "options").split(",").map((value) => value.trim()).filter(Boolean),
      validationExpression: nullableField(form, "validationExpression"),
      active: true
    });
    await saveAttributeSet(token, {
      code: `${selectedDocumentType.code}-ATTRS`,
      name: `${selectedDocumentType.name} attributes`,
      appliesTo: "document_type",
      appliesToValue: selectedDocumentType.id,
      attributeDefinitionIds: [
        ...new Set([
          ...(configuration.attributeSets.find((set) => set.appliesToValue === selectedDocumentType.id)?.attributeDefinitionIds ?? []),
          attribute.attributeDefinition.id
        ])
      ],
      active: true
    });
    toast.showToast({ title: "Attribute assigned", description: attribute.attributeDefinition.label });
    await refresh();
  }

  async function submitFieldRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedDocumentType) return;
    const form = new FormData(event.currentTarget);
    const response = await saveFieldBehaviorRule(token, {
      documentTypeId: selectedDocumentType.id,
      targetEntity: field(form, "targetEntity"),
      fieldName: field(form, "fieldName"),
      workflowState: nullableField(form, "workflowState"),
      visible: !checked(form, "hidden"),
      readOnly: checked(form, "readOnly"),
      required: checked(form, "required"),
      defaultValue: nullableField(form, "defaultValue"),
      validationExpression: nullableField(form, "validationExpression"),
      permissionCode: nullableField(form, "permissionCode"),
      priority: Number(field(form, "priority") || "100"),
      active: true
    });
    toast.showToast({ title: "Field rule saved", description: response.fieldBehaviorRule.fieldName });
    await refresh();
  }

  async function previewNumber() {
    if (!token || !selectedDocumentType) return;
    const response = await generateConfiguredNumber(token, {
      documentTypeId: selectedDocumentType.id,
      locationId: selectedDocumentType.defaultLocationId,
      commit: true
    });
    toast.showToast({ title: "Generated number", description: response.generated.documentNumber });
    await refresh();
  }

  async function previewFields() {
    if (!token || !selectedDocumentType) return;
    const response = await previewConfiguredFieldBehavior(token, {
      targetEntity: "receipt",
      documentTypeId: selectedDocumentType.id,
      workflowState: "draft"
    });
    setFieldPreview(response.fields);
  }

  async function runValidation() {
    if (!token || !selectedDocumentType) return;
    const response = await validateConfiguredOperationalRecord(token, {
      targetEntity: "receipt",
      documentTypeId: selectedDocumentType.id,
      workflowState: "draft",
      values: { receiptNumber: "RCPT-TEST-001" },
      attributeValues: {},
      appliesTo: { document_type: selectedDocumentType.id }
    });
    setValidationText(
      response.validation.valid
        ? "Validation passed"
        : response.validation.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n")
    );
  }

  const metrics = useMemo(
    () => [
      ["Document types", configuration.documentTypes.length],
      ["Sequences", configuration.numberingSequences.length],
      ["Reason codes", configuration.reasonCodes.length],
      ["Attribute sets", configuration.attributeSets.length]
    ],
    [configuration]
  );

  if (loading) {
    return <EmptyState title="Loading configuration" description="Fetching document types, numbering, reasons, and field rules." />;
  }

  return (
    <section className="screen-grid" aria-labelledby="configuration-title">
      <div className="screen-heading master-heading">
        <div>
          <p className="eyebrow">Configuration</p>
          <h2 id="configuration-title">Document types and numbering</h2>
          <p>Define ERP entry behavior, custom attributes, reason catalogs, and required fields.</p>
        </div>
        <div className="action-row">
          <Badge tone="success">Audited</Badge>
          <Button variant="secondary" onClick={() => void refresh()}>
            <FileCog aria-hidden="true" size={18} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="metric-grid">
        {metrics.map(([label, value]) => (
          <article className="metric-panel" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <Tabs
        tabs={[
          {
            id: "document-types",
            label: "Document types",
            content: (
              <div className="master-grid">
                <RecordList
                  icon={FileCog}
                  rows={configuration.documentTypes.map((type) => ({
                    id: type.id,
                    title: type.name,
                    meta: `${type.category} / ${type.code}`,
                    selected: type.id === selectedDocumentType?.id
                  }))}
                  onSelect={setSelectedDocumentTypeId}
                  title="Configured types"
                />
                <DocumentTypeForm documentType={selectedDocumentType} onSubmit={submitDocumentType} />
              </div>
            )
          },
          {
            id: "numbering",
            label: "Numbering",
            content: (
              <div className="master-grid">
                <RecordList
                  icon={Hash}
                  rows={configuration.numberingSequences.map((sequence) => ({
                    id: sequence.id,
                    title: sequence.code,
                    meta: `${sequence.prefix}0001 / next ${sequence.nextNumber}`,
                    selected: sequence.id === selectedSequence?.id
                  }))}
                  title="Sequences"
                />
                <NumberingForm sequence={selectedSequence} onPreview={previewNumber} onSubmit={submitNumbering} />
              </div>
            )
          },
          {
            id: "reasons",
            label: "Reason codes",
            content: (
              <div className="master-grid">
                <RecordList
                  icon={ListChecks}
                  rows={configuration.reasonCodes.map((reason) => ({
                    id: reason.id,
                    title: reason.label,
                    meta: `${reason.catalog} / ${reason.code}`,
                    selected: false
                  }))}
                  title="Reason catalog"
                />
                <ReasonForm onSubmit={submitReason} />
              </div>
            )
          },
          {
            id: "attributes",
            label: "Attributes",
            content: (
              <div className="master-grid">
                <RecordList
                  icon={Tags}
                  rows={configuration.attributeDefinitions.map((attribute) => ({
                    id: attribute.id,
                    title: attribute.label,
                    meta: `${attribute.code} / ${attribute.required ? "required" : "optional"}`,
                    selected: false
                  }))}
                  title="Attribute definitions"
                />
                <AttributeForm documentType={selectedDocumentType} onSubmit={submitAttribute} />
              </div>
            )
          },
          {
            id: "field-behavior",
            label: "Field behavior",
            content: (
              <div className="master-grid">
                <RecordList
                  icon={SlidersHorizontal}
                  rows={configuration.fieldBehaviorRules.map((rule) => ({
                    id: rule.id,
                    title: rule.fieldName,
                    meta: `${rule.targetEntity} / ${rule.workflowState ?? "any state"} / ${rule.required ? "required" : "optional"}`,
                    selected: false
                  }))}
                  title="Rules"
                />
                <FieldBehaviorPanel
                  fieldPreview={fieldPreview}
                  onPreview={previewFields}
                  onSubmit={submitFieldRule}
                  onValidate={runValidation}
                  validationText={validationText}
                />
              </div>
            )
          }
        ]}
      />
    </section>
  );
}

function RecordList(props: {
  icon: LucideIcon;
  title: string;
  rows: Array<{ id: string; title: string; meta: string; selected: boolean }>;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="record-list">
      <div className="panel-header">
        <h3>{props.title}</h3>
        <Badge tone="info">{props.rows.length}</Badge>
      </div>
      {props.rows.map((row) => (
        <button
          className={`record-row${row.selected ? " selected" : ""}`}
          key={row.id}
          onClick={() => props.onSelect?.(row.id)}
          type="button"
        >
          <props.icon aria-hidden="true" size={18} />
          <span>
            <strong>{row.title}</strong>
            <small>{row.meta}</small>
          </span>
        </button>
      ))}
    </div>
  );
}

function DocumentTypeForm(props: { documentType: DocumentType | null; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="editor-panel" onSubmit={props.onSubmit}>
      <h3>Document type editor</h3>
      <div className="form-grid">
        <Input label="Code" name="code" required defaultValue={props.documentType?.code ?? "RCPT-QC"} />
        <Input label="Name" name="name" required defaultValue={props.documentType?.name ?? "QC receipt"} />
        <Input label="Category" name="category" required defaultValue={props.documentType?.category ?? "receipt"} />
        <Input label="Default status" name="defaultStatus" defaultValue={props.documentType?.defaultStatus ?? "posted"} />
        <Input label="Default location ID" name="defaultLocationId" defaultValue={props.documentType?.defaultLocationId ?? "loc-pack"} />
        <Input label="Default reason code ID" name="defaultReasonCodeId" defaultValue={props.documentType?.defaultReasonCodeId ?? ""} />
        <Input label="Numbering sequence ID" name="numberingSequenceId" defaultValue={props.documentType?.numberingSequenceId ?? ""} />
        <Input label="Operational form" name="operationalForm" defaultValue={String(props.documentType?.settingsJson.operationalForm ?? "purchasing.receipt")} />
        <Input label="Description" name="description" defaultValue={props.documentType?.description ?? ""} />
        <label className="select-field">
          <span>Status</span>
          <select name="status" defaultValue={props.documentType?.status ?? "active"}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <div className="checkbox-grid">
          <label><input name="requireAttributes" type="checkbox" defaultChecked={props.documentType?.requireAttributes ?? true} /> Require attributes</label>
        </div>
      </div>
      <Button type="submit"><Save aria-hidden="true" size={18} />Save document type</Button>
    </form>
  );
}

function NumberingForm(props: {
  sequence: ConfigurationSnapshot["numberingSequences"][number] | undefined;
  onPreview: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="editor-panel" onSubmit={props.onSubmit}>
      <h3>Numbering sequence editor</h3>
      <div className="form-grid">
        <Input label="Code" name="code" required defaultValue={props.sequence?.code ?? "RCPT-YM-LOC"} />
        <Input label="Prefix" name="prefix" defaultValue={props.sequence?.prefix ?? "RCPT-{YYYY}{MM}-{LOC}-"} />
        <Input label="Suffix" name="suffix" defaultValue={props.sequence?.suffix ?? ""} />
        <Input label="Pad length" name="padLength" type="number" defaultValue={props.sequence?.padLength ?? 4} />
        <Input label="Next number" name="nextNumber" type="number" defaultValue={props.sequence?.nextNumber ?? 1} />
        <Input label="Increment by" name="incrementBy" type="number" defaultValue={props.sequence?.incrementBy ?? 1} />
        <Input label="Description" name="description" defaultValue={props.sequence?.description ?? ""} />
        <label className="select-field">
          <span>Reset policy</span>
          <select name="resetPolicy" defaultValue={props.sequence?.resetPolicy ?? "monthly"}>
            <option value="never">Never</option>
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <div className="checkbox-grid">
          <label><input name="scopeYear" type="checkbox" defaultChecked={props.sequence?.scopeYear ?? true} /> Year scope</label>
          <label><input name="scopeMonth" type="checkbox" defaultChecked={props.sequence?.scopeMonth ?? true} /> Month scope</label>
          <label><input name="scopeLocation" type="checkbox" defaultChecked={props.sequence?.scopeLocation ?? true} /> Location scope</label>
          <label><input name="active" type="checkbox" defaultChecked={props.sequence?.active ?? true} /> Active</label>
        </div>
      </div>
      <div className="action-row">
        <Button type="submit"><Save aria-hidden="true" size={18} />Save sequence</Button>
        <Button type="button" variant="secondary" onClick={() => void props.onPreview()}>
          <Hash aria-hidden="true" size={18} />Generate number
        </Button>
      </div>
    </form>
  );
}

function ReasonForm(props: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="editor-panel" onSubmit={props.onSubmit}>
      <h3>Reason code editor</h3>
      <div className="form-grid">
        <Input label="Catalog" name="catalog" required defaultValue="receipt_disposition" />
        <Input label="Code" name="code" required defaultValue="REWORK" />
        <Input label="Label" name="label" required defaultValue="Rework required" />
        <Input label="Description" name="description" defaultValue="Material needs rework before release." />
        <div className="checkbox-grid">
          <label><input name="requiresComment" type="checkbox" defaultChecked /> Requires comment</label>
          <label><input name="active" type="checkbox" defaultChecked /> Active</label>
        </div>
      </div>
      <Button type="submit"><PlusCircle aria-hidden="true" size={18} />Save reason code</Button>
    </form>
  );
}

function AttributeForm(props: { documentType: DocumentType | null; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="editor-panel" onSubmit={props.onSubmit}>
      <h3>Attribute set editor</h3>
      <p className="muted-line">Assigns this attribute to {props.documentType?.name ?? "the selected document type"}.</p>
      <div className="form-grid">
        <Input label="Code" name="code" required defaultValue="temperature_at_receipt" />
        <Input label="Label" name="label" required defaultValue="Temperature at receipt" />
        <Input label="Data type" name="dataType" required defaultValue="number" />
        <Input label="Options" name="options" defaultValue="" />
        <Input label="Validation expression" name="validationExpression" defaultValue="^-?[0-9]+(\\.[0-9]+)?$" />
        <div className="checkbox-grid">
          <label><input name="required" type="checkbox" defaultChecked /> Required</label>
        </div>
      </div>
      <Button type="submit"><Tags aria-hidden="true" size={18} />Assign attribute</Button>
    </form>
  );
}

function FieldBehaviorPanel(props: {
  fieldPreview: FieldBehavior[];
  validationText: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPreview: () => void;
  onValidate: () => void;
}) {
  return (
    <div className="editor-panel">
      <form onSubmit={props.onSubmit}>
        <h3>Required-field rule editor</h3>
        <div className="form-grid">
          <Input label="Target entity" name="targetEntity" required defaultValue="receipt" />
          <Input label="Field name" name="fieldName" required defaultValue="supplierLotNumber" />
          <Input label="Workflow state" name="workflowState" defaultValue="draft" />
          <Input label="Default value" name="defaultValue" defaultValue="" />
          <Input label="Validation expression" name="validationExpression" defaultValue="^[A-Za-z0-9][A-Za-z0-9._-]{2,79}$" />
          <Input label="Permission code" name="permissionCode" defaultValue="" />
          <Input label="Priority" name="priority" type="number" defaultValue="10" />
          <div className="checkbox-grid">
            <label><input name="required" type="checkbox" defaultChecked /> Required</label>
            <label><input name="readOnly" type="checkbox" /> Read-only</label>
            <label><input name="hidden" type="checkbox" /> Hidden</label>
          </div>
        </div>
        <div className="action-row">
          <Button type="submit"><Save aria-hidden="true" size={18} />Save rule</Button>
          <Button type="button" variant="secondary" onClick={() => void props.onPreview()}>Preview</Button>
          <Button type="button" variant="secondary" onClick={() => void props.onValidate()}>Validate sample</Button>
        </div>
      </form>
      <table className="list-table">
        <thead><tr><th>Field</th><th>Required</th><th>Read-only</th><th>Visible</th></tr></thead>
        <tbody>
          {props.fieldPreview.map((field) => (
            <tr key={field.fieldName}>
              <td>{field.fieldName}</td>
              <td>{field.required ? "Yes" : "No"}</td>
              <td>{field.readOnly ? "Yes" : "No"}</td>
              <td>{field.visible ? "Yes" : "No"}</td>
            </tr>
          ))}
          {props.fieldPreview.length === 0 ? <tr><td colSpan={4}>Run preview to resolve field behavior.</td></tr> : null}
        </tbody>
      </table>
      {props.validationText ? <pre className="workflow-export">{props.validationText}</pre> : null}
    </div>
  );
}
