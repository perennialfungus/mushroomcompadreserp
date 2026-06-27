import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, ClipboardCheck, PackagePlus, Save, Settings2, Wand2, XCircle } from "lucide-react";
import { Badge, Button, EmptyState, Input, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import {
  generateProductConfiguration,
  listProductConfigurator,
  previewProductConfiguration
} from "./lib/api";
import type {
  GeneratedProductPackage,
  ProductConfigurationInput,
  ProductConfiguratorSnapshot
} from "./types";

const defaultLabelData = {
  product_name: "",
  net_quantity: "",
  ingredients: "",
  directions: "",
  warnings: "",
  storage: "",
  lot_code: "Applied at packing",
  expiry_date: "Applied at packing",
  business_operator: "Mushroom Compadres",
  country_of_origin: "Portugal",
  language_compliance: "English label",
  food_business_operator: "Mushroom Compadres",
  eu_contact_address: "Rogil, Portugal",
  retail_barcode: "",
  online_title: "",
  online_description: ""
};

const defaultShopifyFields = {
  shopifyProductGid: "",
  shopifyVariantGid: "",
  shopifyInventoryItemGid: "",
  seoTitle: "",
  seoDescription: ""
};

const defaultPreviewLayout = {
  bomLayout: "operation_tree",
  density: "standard",
  showOperationRuntimes: true,
  showMaterialIssue: true,
  showEquipment: true
} satisfies GeneratedProductPackage["previewLayout"];

function formText(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

function formChecked(form: FormData, name: string): boolean {
  return form.get(name) === "on";
}

function previewBomLayout(value: string): GeneratedProductPackage["previewLayout"]["bomLayout"] {
  return value === "materials_first" ? "materials_first" : "operation_tree";
}

function previewDensity(value: string): GeneratedProductPackage["previewLayout"]["density"] {
  if (value === "compact" || value === "expanded") {
    return value;
  }
  return "standard";
}

function optionalText(form: FormData, name: string): string | null {
  const value = formText(form, name);
  return value.length > 0 ? value : null;
}

export function ProductConfiguratorScreen() {
  const auth = useAuth();
  const toast = useToast();
  const token = auth.session?.accessToken;
  const [snapshot, setSnapshot] = useState<ProductConfiguratorSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<GeneratedProductPackage | null>(null);
  const [generated, setGenerated] = useState<GeneratedProductPackage | null>(null);
  const [templateId, setTemplateId] = useState("template-tincture");
  const canGenerate = auth.isAdmin;

  useEffect(() => {
    if (!token) {
      return;
    }
    listProductConfigurator(token)
      .then((result) => {
        setSnapshot(result);
        setTemplateId(result.productTemplates[0]?.id ?? "template-tincture");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const selectedTemplate = snapshot?.productTemplates.find((template) => template.id === templateId);
  const lastPackage = generated ?? preview;

  function inputFromForm(form: FormData): ProductConfigurationInput {
    const labelData = { ...defaultLabelData };
    const shopifyFields = { ...defaultShopifyFields };
    for (const key of Object.keys(labelData)) {
      labelData[key as keyof typeof labelData] = formText(form, `label_${key}`);
    }
    for (const key of Object.keys(shopifyFields)) {
      shopifyFields[key as keyof typeof shopifyFields] = formText(form, `shopify_${key}`);
    }

    return {
      templateId: formText(form, "templateId"),
      productName: formText(form, "productName"),
      family: formText(form, "family") as ProductConfigurationInput["family"],
      speciesBlend: formText(form, "speciesBlend"),
      format: formText(form, "format"),
      strength: formText(form, "strength"),
      size: formText(form, "size"),
      packCount: Number(formText(form, "packCount") || "1"),
      market: formText(form, "market") as ProductConfigurationInput["market"],
      language: formText(form, "language") as ProductConfigurationInput["language"],
      channel: formText(form, "channel") as ProductConfigurationInput["channel"],
      previewLayout: {
        bomLayout: previewBomLayout(formText(form, "previewLayout_bomLayout")),
        density: previewDensity(formText(form, "previewLayout_density")),
        showOperationRuntimes: formChecked(form, "previewLayout_showOperationRuntimes"),
        showMaterialIssue: formChecked(form, "previewLayout_showMaterialIssue"),
        showEquipment: formChecked(form, "previewLayout_showEquipment")
      },
      skuOverride: optionalText(form, "skuOverride"),
      adminOverrideReason: optionalText(form, "adminOverrideReason"),
      labelData,
      shopifyFields
    };
  }

  async function handlePreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }
    const input = inputFromForm(new FormData(event.currentTarget));
    const result = await previewProductConfiguration(token, input);
    setPreview(result.package);
    setGenerated(null);
    toast.showToast({ title: "Draft package previewed", description: "Preview is ready." });
  }

  async function handleGenerate() {
    const form = document.querySelector<HTMLFormElement>("#product-configurator-form");
    if (!token || !form || !canGenerate) {
      return;
    }
    const input = inputFromForm(new FormData(form));
    const result = await generateProductConfiguration(token, input);
    setGenerated(result.package);
    setPreview(result.package);
    setSnapshot((current) =>
      current
        ? {
            ...current,
            productConfigurations: [result.configurationRecord, ...current.productConfigurations]
          }
        : current
    );
    toast.showToast({ title: "Draft product package generated", description: result.variant.sku });
  }

  if (loading) {
    return <EmptyState title="Loading product configurator" description="Fetching SKU rules and templates." />;
  }

  if (!snapshot || snapshot.productTemplates.length === 0) {
    return <EmptyState title="No product templates" description="Create a product template before generating variants." />;
  }

  return (
    <section className="screen-grid configurator-screen" aria-labelledby="configurator-title">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Product configurator</p>
          <h2 id="configurator-title">SKU builder and label rules</h2>
          <p>Generate controlled draft variants from templates and see launch gaps before production or Shopify mapping.</p>
        </div>
        <Badge tone={canGenerate ? "success" : "info"}>{canGenerate ? "Admin generation" : "Preview only"}</Badge>
      </div>

      <Tabs
        tabs={[
          {
            id: "wizard",
            label: "Wizard",
            content: (
              <div className="configurator-grid">
                <ConfiguratorForm
                  key={templateId}
                  canGenerate={canGenerate}
                  onGenerate={() => void handleGenerate()}
                  onPreview={handlePreview}
                  selectedTemplate={selectedTemplate}
                  setTemplateId={setTemplateId}
                  snapshot={snapshot}
                  templateId={templateId}
                />
                <PackageReview productPackage={lastPackage} generated={Boolean(generated)} />
              </div>
            )
          },
          {
            id: "rules",
            label: "SKU rules",
            content: <SkuRuleSettings snapshot={snapshot} />
          },
          {
            id: "labels",
            label: "Label checklist",
            content: <LabelChecklist productPackage={lastPackage} />
          },
          {
            id: "history",
            label: "Generated",
            content: <GeneratedConfigurations snapshot={snapshot} />
          }
        ]}
      />
    </section>
  );
}

function ConfiguratorForm(props: {
  snapshot: ProductConfiguratorSnapshot;
  selectedTemplate: ProductConfiguratorSnapshot["productTemplates"][number] | undefined;
  templateId: string;
  setTemplateId: (templateId: string) => void;
  canGenerate: boolean;
  onPreview: (event: FormEvent<HTMLFormElement>) => void;
  onGenerate: () => void;
}) {
  const template = props.selectedTemplate;
  const defaults = useMemo(
    () => ({
      productName: template?.family === "tincture" ? "Reishi Tincture" : template?.name ?? "New Product",
      speciesBlend: template?.family === "merch" ? "shirt" : "reishi",
      format: template?.defaultFormat ?? "tincture",
      family: template?.family ?? "tincture",
      size: template?.family === "capsules" ? "60 ct" : template?.family === "merch" ? "M" : "50 ml"
    }),
    [template]
  );

  return (
    <form className="editor-panel" id="product-configurator-form" onSubmit={props.onPreview}>
      <div className="panel-header">
        <h3>Configurator wizard</h3>
        <Badge tone="info">{template?.name ?? "Template"}</Badge>
      </div>
      <div className="form-grid">
        <label className="select-field">
          <span>Product template</span>
          <select name="templateId" value={props.templateId} onChange={(event) => props.setTemplateId(event.target.value)}>
            {props.snapshot.productTemplates.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <Input label="Product name" name="productName" required defaultValue={defaults.productName} />
        <label className="select-field">
          <span>Product family</span>
          <select name="family" defaultValue={defaults.family}>
            <option value={defaults.family}>{defaults.family}</option>
          </select>
        </label>
        <Input label="Mushroom species or blend" name="speciesBlend" required defaultValue={defaults.speciesBlend} />
        <Input label="Format" name="format" required defaultValue={defaults.format} />
        <Input label="Strength" name="strength" required defaultValue="dual extract" />
        <Input label="Size" name="size" required defaultValue={defaults.size} />
        <Input label="Pack count" name="packCount" required type="number" min="1" defaultValue="1" />
        <label className="select-field">
          <span>Market</span>
          <select name="market" defaultValue="EU">
            <option value="EU">EU</option>
            <option value="UK">UK</option>
            <option value="US">US</option>
            <option value="INTL">International</option>
          </select>
        </label>
        <label className="select-field">
          <span>Language</span>
          <select name="language" defaultValue="en">
            <option value="en">English</option>
            <option value="pt">Portuguese</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </label>
        <label className="select-field">
          <span>Channel</span>
          <select name="channel" defaultValue="shopify">
            <option value="shopify">Shopify</option>
            <option value="dtc">DTC</option>
            <option value="wholesale">Wholesale</option>
            <option value="marketplace">Marketplace</option>
          </select>
        </label>
        <Input label="SKU override" name="skuOverride" />
        <Input label="Admin override reason" name="adminOverrideReason" />
      </div>

      <h4>Preview layout</h4>
      <div className="form-grid">
        <label className="select-field">
          <span>BOM layout</span>
          <select name="previewLayout_bomLayout" defaultValue={defaultPreviewLayout.bomLayout}>
            <option value="operation_tree">Operation tree</option>
            <option value="materials_first">Materials first</option>
          </select>
        </label>
        <label className="select-field">
          <span>Density</span>
          <select name="previewLayout_density" defaultValue={defaultPreviewLayout.density}>
            <option value="compact">Compact</option>
            <option value="standard">Standard</option>
            <option value="expanded">Expanded</option>
          </select>
        </label>
      </div>
      <div className="checkbox-grid">
        <label>
          <input
            type="checkbox"
            name="previewLayout_showOperationRuntimes"
            defaultChecked={defaultPreviewLayout.showOperationRuntimes}
          />
          Runtime
        </label>
        <label>
          <input
            type="checkbox"
            name="previewLayout_showMaterialIssue"
            defaultChecked={defaultPreviewLayout.showMaterialIssue}
          />
          Issue method
        </label>
        <label>
          <input type="checkbox" name="previewLayout_showEquipment" defaultChecked={defaultPreviewLayout.showEquipment} />
          Equipment
        </label>
      </div>

      <h4>Label data</h4>
      <div className="form-grid">
        {Object.entries(defaultLabelData).map(([key, value]) => (
          <Input
            key={key}
            label={key === "product_name" ? "Label display name" : key.replaceAll("_", " ")}
            name={`label_${key}`}
            defaultValue={key === "product_name" ? defaults.productName : key === "net_quantity" ? defaults.size : value}
          />
        ))}
      </div>

      <h4>Shopify placeholders</h4>
      <div className="form-grid">
        {Object.keys(defaultShopifyFields).map((key) => (
          <Input key={key} label={key} name={`shopify_${key}`} />
        ))}
      </div>

      <div className="button-row">
        <Button type="submit" variant="secondary">
          <Wand2 aria-hidden="true" size={18} />
          Preview package
        </Button>
        {props.canGenerate ? (
          <Button type="button" onClick={props.onGenerate}>
            <Save aria-hidden="true" size={18} />
            Generate draft
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function PackageReview({ productPackage, generated }: { productPackage: GeneratedProductPackage | null; generated: boolean }) {
  if (!productPackage) {
    return <EmptyState title="No generated preview" description="Complete the wizard to review SKU, formula, QC, and label gaps." />;
  }
  const bomDraft = resolvedBomDraft(productPackage);
  const blockers = productPackage.readinessGaps.filter((gap) => gap.severity === "blocker").length;
  const warnings = productPackage.readinessGaps.filter((gap) => gap.severity === "warning").length;
  return (
    <aside className="detail-card">
      <div className="panel-header">
        <h3>Generated variant review</h3>
        <Badge tone={blockers > 0 ? "warning" : warnings > 0 ? "warning" : "success"}>
          {blockers > 0 ? `${blockers} blockers` : warnings > 0 ? `${warnings} warnings` : "Ready"}
        </Badge>
      </div>
      <dl className="compact-definition">
        <div><dt>SKU</dt><dd>{productPackage.sku}</dd></div>
        <div><dt>Variant</dt><dd>{productPackage.variantDraft.localizedNames.en}</dd></div>
        <div><dt>BOM ops</dt><dd>{bomDraft.operations.length}</dd></div>
        <div><dt>QC tests</dt><dd>{productPackage.qcSpecification.tests.length}</dd></div>
        <div><dt>Package state</dt><dd>{generated ? "Generated draft" : "Preview"}</dd></div>
      </dl>
      <BomPreview productPackage={productPackage} />
      <div className="variant-section">
        <h4>Readiness gaps</h4>
        {productPackage.readinessGaps.length === 0 ? (
          <p className="muted">No launch gaps in this draft package.</p>
        ) : (
          productPackage.readinessGaps.map((gap) => (
            <article className="variant-card" key={`${gap.code}-${gap.field ?? gap.message}`}>
              {gap.severity === "blocker" ? <XCircle aria-hidden="true" size={18} /> : <ClipboardCheck aria-hidden="true" size={18} />}
              <span>
                <strong>{gap.code.replaceAll("_", " ")}</strong>
                <small>{gap.message}</small>
              </span>
              <Badge tone="warning">{gap.severity}</Badge>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}

function BomPreview({ productPackage }: { productPackage: GeneratedProductPackage }) {
  const bomDraft = resolvedBomDraft(productPackage);
  const previewLayout = productPackage.previewLayout ?? defaultPreviewLayout;
  const operations = previewLayout.density === "compact" ? bomDraft.operations.slice(0, 2) : bomDraft.operations;
  const materialRows = bomDraft.operations.flatMap((operation) =>
    operation.materials.map((material) => ({
      ...material,
      operationName: operation.name
    }))
  );
  const materials = previewLayout.density === "compact" ? materialRows.slice(0, 4) : materialRows;
  return (
    <div className="bom-preview">
      <div className="panel-header">
        <h4>BOM draft</h4>
        <Badge tone="info">{bomDraft.bom.versionCode}</Badge>
      </div>
      <dl className="compact-definition bom-summary">
        <div><dt>Yield</dt><dd>{bomDraft.bom.yieldQuantity} {bomDraft.bom.yieldUom}</dd></div>
        <div><dt>Materials</dt><dd>{materialRows.length}</dd></div>
        <div><dt>Elapsed</dt><dd>{Math.round(bomDraft.productionPlan.totalElapsedMinutes)} min</dd></div>
      </dl>
      {previewLayout.bomLayout === "materials_first" ? (
        <>
          <BomMaterialList materials={materials} showIssueMethod={previewLayout.showMaterialIssue ?? true} />
          <BomOperationList operations={operations} previewLayout={previewLayout} />
        </>
      ) : (
        <>
          <BomOperationList operations={operations} previewLayout={previewLayout} />
          <BomMaterialList materials={materials} showIssueMethod={previewLayout.showMaterialIssue ?? true} />
        </>
      )}
    </div>
  );
}

function resolvedBomDraft(productPackage: GeneratedProductPackage): GeneratedProductPackage["bomDraft"] {
  if (productPackage.bomDraft) {
    return productPackage.bomDraft;
  }
  const materials = productPackage.formulaRevision.lines.map((line, index) => ({
    ...line,
    id: `legacy-bom-material-${index + 1}`,
    operationId: "legacy-packout",
    issueMethod: line.lineType === "packaging" ? "backflush" as const : "manual" as const,
    quantityWithWaste: line.quantity * (1 + (line.wastePercent ?? 0) / 100)
  }));
  const elapsedMinutes = Math.max(15, materials.length * 8);
  const runtime = {
    bomOperationId: "legacy-packout",
    operationId: "packout",
    targetQuantity: Math.max(productPackage.configuration.packCount, 1),
    targetUom: productPackage.variantDraft.sellableUom,
    setupMinutes: 5,
    manualRunMinutes: elapsedMinutes,
    machineRunMinutes: 0,
    queueMinutes: 0,
    moveMinutes: 0,
    finishMinutes: 5,
    equipmentSetupMinutes: 0,
    equipmentCleaningMinutes: 0,
    totalManualMinutes: elapsedMinutes + 10,
    totalMachineMinutes: 0,
    totalElapsedMinutes: elapsedMinutes + 10
  };
  return {
    bom: {
      id: `bom-${productPackage.sku.toLowerCase()}`,
      versionCode: `${productPackage.sku}-BOM-DRAFT`,
      status: "draft",
      yieldQuantity: Math.max(productPackage.configuration.packCount, 1),
      yieldUom: productPackage.variantDraft.sellableUom,
      formulaRevisionCode: productPackage.formulaRevision.revisionCode
    },
    operations: [
      {
        id: "legacy-packout",
        sequence: 10,
        operationId: "packout",
        name: "Pack and label",
        runtimeBasis: "manual",
        controlPoint: true,
        steps: [
          { id: "legacy-packout-stage", sequence: 10, name: "Stage components", kind: "setup", required: true },
          { id: "legacy-packout-release", sequence: 20, name: "Label verification", kind: "qc", required: true }
        ],
        materials,
        equipment: [],
        runtime
      }
    ],
    productionPlan: {
      bomId: `bom-${productPackage.sku.toLowerCase()}`,
      targetQuantity: Math.max(productPackage.configuration.packCount, 1),
      targetUom: productPackage.variantDraft.sellableUom,
      operationRuntimes: [runtime],
      totalManualMinutes: runtime.totalManualMinutes,
      totalMachineMinutes: runtime.totalMachineMinutes,
      totalElapsedMinutes: runtime.totalElapsedMinutes,
      backflushedMaterialCount: materials.filter((material) => material.issueMethod === "backflush").length,
      manualIssueMaterialCount: materials.filter((material) => material.issueMethod === "manual").length
    }
  };
}

function BomOperationList({
  operations,
  previewLayout
}: {
  operations: GeneratedProductPackage["bomDraft"]["operations"];
  previewLayout: GeneratedProductPackage["previewLayout"];
}) {
  const showSteps = previewLayout.density !== "compact";
  return (
    <div className="bom-operation-list">
      {operations.map((operation) => (
        <article className="bom-operation" key={operation.id}>
          <div className="bom-operation-heading">
            <span>
              <strong>{operation.sequence}. {operation.name}</strong>
              <small>{operation.operationId} / {operation.runtimeBasis}{operation.controlPoint ? " / control point" : ""}</small>
            </span>
            {previewLayout.showOperationRuntimes ? (
              <Badge tone="info">{Math.round(operation.runtime.totalElapsedMinutes)} min</Badge>
            ) : null}
          </div>
          {showSteps ? (
            <div className="bom-step-row">
              {operation.steps.map((step) => (
                <Badge key={step.id} tone={step.kind === "qc" ? "warning" : "success"}>{step.name}</Badge>
              ))}
            </div>
          ) : null}
          {previewLayout.showEquipment && operation.equipment.length > 0 ? (
            <div className="bom-equipment-row">
              {operation.equipment.map((item) => (
                <span key={item.id}>{item.name}</span>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function BomMaterialList({
  materials,
  showIssueMethod
}: {
  materials: Array<GeneratedProductPackage["bomDraft"]["operations"][number]["materials"][number] & { operationName: string }>;
  showIssueMethod: boolean;
}) {
  if (materials.length === 0) {
    return <p className="muted">No BOM materials in this draft.</p>;
  }
  return (
    <div className="bom-material-list">
      {materials.map((material) => (
        <div className="bom-material-row" key={material.id}>
          <span>
            <strong>{material.componentName}</strong>
            <small>{material.operationName}</small>
          </span>
          <span>{material.quantityWithWaste} {material.uom}</span>
          {showIssueMethod ? <Badge tone={material.issueMethod === "backflush" ? "success" : "info"}>{material.issueMethod}</Badge> : null}
        </div>
      ))}
    </div>
  );
}

function SkuRuleSettings({ snapshot }: { snapshot: ProductConfiguratorSnapshot }) {
  return (
    <div className="detail-card">
      <div className="panel-header">
        <h3>SKU rule settings</h3>
        <Settings2 aria-hidden="true" size={20} />
      </div>
      {snapshot.skuRules.map((rule) => (
        <article className="variant-card" key={rule.id}>
          <span>
            <strong>{rule.name}</strong>
            <small>{rule.segmentOrder.join(" -> ")}</small>
          </span>
          <Badge tone="info">Separator {rule.separator}</Badge>
          <Badge tone={rule.editableWithAdminOverride ? "warning" : "success"}>
            {rule.editableWithAdminOverride ? "Admin override" : "Locked"}
          </Badge>
        </article>
      ))}
    </div>
  );
}

function LabelChecklist({ productPackage }: { productPackage: GeneratedProductPackage | null }) {
  if (!productPackage) {
    return <EmptyState title="No label checklist" description="Preview a package to see market, language, and channel requirements." />;
  }
  return (
    <div className="detail-card">
      <div className="panel-header">
        <h3>Label rule checklist</h3>
        <Badge tone="info">{productPackage.configuration.market} / {productPackage.configuration.language} / {productPackage.configuration.channel}</Badge>
      </div>
      <table className="list-table">
        <thead>
          <tr><th>Field</th><th>Requirement</th><th>Value</th><th>Status</th></tr>
        </thead>
        <tbody>
          {productPackage.labelChecklist.map((requirement) => (
            <tr key={requirement.field}>
              <td>{requirement.label}</td>
              <td>{requirement.market} {requirement.language} {requirement.channel}</td>
              <td>{requirement.value ?? "-"}</td>
              <td>{requirement.value ? <CheckCircle2 aria-label="Complete" size={18} /> : <XCircle aria-label="Missing" size={18} />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GeneratedConfigurations({ snapshot }: { snapshot: ProductConfiguratorSnapshot }) {
  return (
    <div className="detail-card">
      <div className="panel-header">
        <h3>Generated draft packages</h3>
        <PackagePlus aria-hidden="true" size={20} />
      </div>
      {snapshot.productConfigurations.length === 0 ? (
        <p className="muted">No draft packages generated yet.</p>
      ) : (
        snapshot.productConfigurations.map((configuration) => (
          <article className="variant-card" key={configuration.id}>
            <span>
              <strong>{configuration.sku}</strong>
              <small>{configuration.market} / {configuration.language} / {configuration.channel}</small>
            </span>
            <Badge tone={configuration.status === "ready" ? "success" : "warning"}>{configuration.status}</Badge>
          </article>
        ))
      )}
    </div>
  );
}
