import { useMemo, useState, type FormEvent } from "react";
import { Barcode, CalendarClock, GitBranch, PackagePlus, Save, Search, Wand2 } from "lucide-react";
import {
  defaultInventoryClassHierarchy,
  defaultSubitemDimensions,
  generateMatrixItems,
  previewItemClassDefaultImpact,
  rankAbcItems,
  resolveItemClassDefaults,
  resolveItemCrossReference,
  suggestCycleCountProgram,
  type CycleCountProgram,
  type InventoryItemClassNode,
  type ItemCrossReference,
  type MatrixGeneratedItem
} from "@mushroom-compadres/domain";
import { Badge, Button, EmptyState, Input, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";

const assignedItems = [
  { itemId: "variant-lm-50", itemName: "Lion's Mane Tincture 50 ml", sku: "LM-TINC-50", itemClassId: "class-tinctures" },
  { itemId: "variant-lm-100", itemName: "Lion's Mane Tincture 100 ml", sku: "LM-TINC-100", itemClassId: "class-tinctures" },
  { itemId: "material-reishi-dry", itemName: "Dried Reishi", sku: "MAT-RE-DRY", itemClassId: "class-raw-mushrooms" },
  { itemId: "pack-bottle-50", itemName: "Amber bottle 50 ml", sku: "PKG-BOT-50", itemClassId: "class-packaging" }
];

const demoCrossReferences: ItemCrossReference[] = [
  { id: "xref-supplier-lm", itemType: "material", itemId: "material-reishi-dry", referenceType: "supplier_sku", code: "SUP-RE-DRY", partnerId: "supplier-herdade", active: true, priority: 10 },
  { id: "xref-customer-lm", itemType: "product_variant", itemId: "variant-lm-50", referenceType: "customer_sku", code: "WHOLESALE-LM50", partnerId: "customer-b2b", active: true, priority: 8 },
  { id: "xref-shopify-lm", itemType: "product_variant", itemId: "variant-lm-50", referenceType: "shopify_sku", code: "shop-lm-tinc-50", active: true, priority: 7 },
  { id: "xref-barcode-lm", itemType: "product_variant", itemId: "variant-lm-50", referenceType: "barcode_alias", code: "5600000000012", active: true, priority: 6 },
  { id: "xref-gs1-lm", itemType: "product_variant", itemId: "variant-lm-100", referenceType: "gs1_code", code: "(01)05600000001002", active: true, priority: 6 },
  { id: "xref-legacy-lm", itemType: "product_variant", itemId: "variant-lm-100", referenceType: "legacy_code", code: "OLD-LM-100", active: true, priority: 4 }
];

const demoCountPrograms: CycleCountProgram[] = [
  {
    id: "program-finished",
    name: "Finished goods high-control",
    itemClassIds: ["class-tinctures"],
    locationIds: ["loc-main"],
    abcFrequencies: { A: 14, B: 30, C: 60 },
    riskMultiplier: 2,
    expiryWindowDays: 45
  },
  {
    id: "program-raw",
    name: "Raw materials expiry-sensitive",
    itemClassIds: ["class-raw-mushrooms"],
    locationIds: ["loc-main"],
    abcFrequencies: { A: 7, B: 14, C: 30 },
    riskMultiplier: 2,
    expiryWindowDays: 60
  },
  {
    id: "program-packaging",
    name: "Packaging control",
    itemClassIds: ["class-packaging"],
    locationIds: ["loc-main"],
    abcFrequencies: { A: 30, B: 60, C: 90 },
    riskMultiplier: 1.5,
    expiryWindowDays: 0
  }
];

const demoAbcInputs = [
  { itemId: "variant-lm-50", itemType: "product_variant" as const, itemClassId: "class-tinctures", sku: "LM-TINC-50", name: "Lion's Mane Tincture 50 ml", annualUsageValue: 12000, annualVelocity: 800, riskScore: 8, daysUntilNearestExpiry: 12, lotHoldCount: 1, lastCountedAt: "2026-05-01" },
  { itemId: "variant-lm-100", itemType: "product_variant" as const, itemClassId: "class-tinctures", sku: "LM-TINC-100", name: "Lion's Mane Tincture 100 ml", annualUsageValue: 9000, annualVelocity: 510, riskScore: 6, daysUntilNearestExpiry: 38, lotHoldCount: 0, lastCountedAt: "2026-06-03" },
  { itemId: "material-reishi-dry", itemType: "material" as const, itemClassId: "class-raw-mushrooms", sku: "MAT-RE-DRY", name: "Dried Reishi", annualUsageValue: 5000, annualVelocity: 500, riskScore: 9, daysUntilNearestExpiry: 25, lotHoldCount: 2, lastCountedAt: null },
  { itemId: "pack-bottle-50", itemType: "packaging_component" as const, itemClassId: "class-packaging", sku: "PKG-BOT-50", name: "Amber bottle 50 ml", annualUsageValue: 600, annualVelocity: 120, riskScore: 2, daysUntilNearestExpiry: null, lotHoldCount: 0, lastCountedAt: "2026-06-01" }
];

export function InventoryFrameworkScreen() {
  const auth = useAuth();
  const toast = useToast();
  const [classes, setClasses] = useState<InventoryItemClassNode[]>(defaultInventoryClassHierarchy);
  const [selectedClassId, setSelectedClassId] = useState("class-tinctures");
  const [draftTrackExpiry, setDraftTrackExpiry] = useState(true);
  const [draftFrequency, setDraftFrequency] = useState("21");
  const [matrixItems, setMatrixItems] = useState<MatrixGeneratedItem[]>([]);
  const [xrefQuery, setXrefQuery] = useState("5600000000012");

  const selectedClass = useMemo(() => resolveItemClassDefaults(selectedClassId, classes), [classes, selectedClassId]);
  const impact = useMemo(
    () =>
      previewItemClassDefaultImpact({
        classes,
        itemClassId: selectedClassId,
        newDefaults: {
          trackExpiry: draftTrackExpiry,
          cycleCountFrequencyDays: Number(draftFrequency) || selectedClass.inheritedDefaults.cycleCountFrequencyDays
        },
        assignedItems
      }),
    [classes, draftFrequency, draftTrackExpiry, selectedClass.inheritedDefaults.cycleCountFrequencyDays, selectedClassId]
  );
  const classDefaultsById = useMemo(
    () => new Map(classes.map((itemClass) => [itemClass.id, resolveItemClassDefaults(itemClass.id, classes).inheritedDefaults])),
    [classes]
  );
  const rankings = useMemo(() => rankAbcItems(demoAbcInputs, classDefaultsById), [classDefaultsById]);
  const countSuggestions = useMemo(
    () => suggestCycleCountProgram({ rankings, programs: demoCountPrograms, today: "2026-06-27" }),
    [rankings]
  );
  const xrefResult = resolveItemCrossReference(demoCrossReferences, { code: xrefQuery });

  function saveDefaults(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cycleCountFrequencyDays = Number(draftFrequency);
    setClasses((current) =>
      current.map((itemClass) =>
        itemClass.id === selectedClassId
          ? {
              ...itemClass,
              defaults: {
                ...itemClass.defaults,
                trackExpiry: draftTrackExpiry,
                cycleCountFrequencyDays: Number.isFinite(cycleCountFrequencyDays)
                  ? cycleCountFrequencyDays
                  : selectedClass.inheritedDefaults.cycleCountFrequencyDays
              }
            }
          : itemClass
      )
    );
    toast.showToast({ title: "Item class defaults saved", description: `${impact.length} inherited item(s) reviewed.` });
  }

  function generateMatrix() {
    const generated = generateMatrixItems({
      template: {
        id: "matrix-lm-tincture",
        familyCode: "LM-TINC",
        productName: "Lion's Mane Tincture",
        itemClassId: "class-tinctures",
        baseSku: "LM-TINC",
        dimensionIds: ["dim-size", "dim-language", "dim-channel"]
      },
      dimensions: defaultSubitemDimensions,
      itemClass: resolveItemClassDefaults("class-tinctures", classes),
      existingSkus: assignedItems.map((item) => item.sku ?? "")
    });
    setMatrixItems(generated);
    toast.showToast({ title: "Matrix SKUs generated", description: `${generated.length} related SKU(s) checked.` });
  }

  return (
    <section className="screen-grid inventory-framework-screen" aria-labelledby="inventory-framework-title">
      <div className="screen-heading">
        <div>
          <p className="eyebrow">Inventory framework</p>
          <h2 id="inventory-framework-title">Item classes and SKU controls</h2>
          <p>Acumatica-style class defaults, variant matrices, barcode aliases, and cycle count programs.</p>
        </div>
        <Badge tone={auth.isAdmin ? "success" : "info"}>{auth.isAdmin ? "Editable" : "View only"}</Badge>
      </div>

      <Tabs
        tabs={[
          {
            id: "classes",
            label: "Item classes",
            content: (
              <div className="master-grid">
                <div className="record-list">
                  <div className="panel-header">
                    <h3>Hierarchy</h3>
                    <GitBranch aria-hidden="true" size={20} />
                  </div>
                  {classes.map((itemClass) => (
                    <button className="record-row" key={itemClass.id} onClick={() => setSelectedClassId(itemClass.id)} type="button">
                      <GitBranch aria-hidden="true" size={18} />
                      <span>
                        <strong>{itemClass.name}</strong>
                        <small>{itemClass.parentId ? "Inherited class" : "Root class"} / {itemClass.itemType}</small>
                      </span>
                    </button>
                  ))}
                </div>

                <form className="editor-panel" onSubmit={saveDefaults}>
                  <div className="panel-header">
                    <h3>{selectedClass.name}</h3>
                    <Badge tone="info">{selectedClass.path.join(" / ")}</Badge>
                  </div>
                  <div className="form-grid">
                    <label className="select-field">
                      <span>Item class</span>
                      <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.currentTarget.value)}>
                        {classes.map((itemClass) => <option key={itemClass.id} value={itemClass.id}>{itemClass.name}</option>)}
                      </select>
                    </label>
                    <Input label="Inventory UOM" value={selectedClass.inheritedDefaults.inventoryUom} readOnly />
                    <Input label="Label template" value={selectedClass.inheritedDefaults.labelTemplate} readOnly />
                    <Input label="Cycle frequency days" value={draftFrequency} onChange={(event) => setDraftFrequency(event.currentTarget.value)} />
                    <label className="checkbox-row">
                      <input type="checkbox" checked={draftTrackExpiry} onChange={(event) => setDraftTrackExpiry(event.currentTarget.checked)} />
                      <span>Expiry tracking inherited by child items</span>
                    </label>
                  </div>
                  <dl className="class-defaults">
                    <div><dt>Lot tracking</dt><dd>{selectedClass.inheritedDefaults.trackLots ? "On" : "Off"}</dd></div>
                    <div><dt>QC</dt><dd>{selectedClass.inheritedDefaults.qcRequired ? "Required" : "Optional"}</dd></div>
                    <div><dt>Storage</dt><dd>{selectedClass.inheritedDefaults.storageRules.temperature}</dd></div>
                    <div><dt>Valuation</dt><dd>{selectedClass.inheritedDefaults.valuation.valuationMethod}</dd></div>
                  </dl>
                  <Button type="submit" disabled={!auth.isAdmin}>
                    <Save aria-hidden="true" size={18} />
                    Save default changes
                  </Button>
                </form>

                <div className="detail-card">
                  <div className="panel-header">
                    <h3>Impact before save</h3>
                    <Badge tone={impact.length > 0 ? "warning" : "success"}>{impact.length} item(s)</Badge>
                  </div>
                  {impact.length === 0 ? (
                    <p className="muted">No inherited item defaults would change.</p>
                  ) : (
                    impact.map((item) => (
                      <article className="variant-card" key={item.itemId}>
                        <span>
                          <strong>{item.sku} / {item.itemName}</strong>
                          <small>{item.changedFields.join(", ")}</small>
                        </span>
                        <Badge tone="warning">{item.afterDefaults.trackExpiry ? "Expiry on" : "Expiry off"}</Badge>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )
          },
          {
            id: "matrix",
            label: "Matrix generator",
            content: (
              <div className="screen-grid">
                <div className="detail-card">
                  <div className="panel-header">
                    <h3>Lion's Mane tincture family</h3>
                    <Button onClick={generateMatrix}>
                      <Wand2 aria-hidden="true" size={18} />
                      Generate matrix
                    </Button>
                  </div>
                  <p className="muted">Dimensions: size, language, channel. Defaults inherit from Tinctures.</p>
                </div>
                {matrixItems.length === 0 ? (
                  <EmptyState title="No matrix generated" description="Generate related SKUs to preview readiness checks." />
                ) : (
                  <table className="list-table">
                    <thead>
                      <tr><th>SKU</th><th>Name</th><th>Attributes</th><th>Readiness</th></tr>
                    </thead>
                    <tbody>
                      {matrixItems.map((item) => (
                        <tr key={item.sku}>
                          <td>{item.sku}</td>
                          <td>{item.name}</td>
                          <td>{Object.entries(item.attributes).map(([key, value]) => `${key}: ${value}`).join(", ")}</td>
                          <td><Badge tone={item.ready ? "success" : "warning"}>{item.ready ? "Ready" : "Blocked"}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )
          },
          {
            id: "crossrefs",
            label: "Cross-references",
            content: (
              <div className="configurator-grid">
                <div className="editor-panel">
                  <div className="panel-header">
                    <h3>Alias lookup</h3>
                    <Barcode aria-hidden="true" size={20} />
                  </div>
                  <Input label="Scan or alias code" value={xrefQuery} onChange={(event) => setXrefQuery(event.currentTarget.value)} />
                  <Button variant="secondary" type="button">
                    <Search aria-hidden="true" size={18} />
                    Resolve code
                  </Button>
                  {xrefResult ? (
                    <dl className="compact-definition">
                      <div><dt>Item</dt><dd>{assignedItems.find((item) => item.itemId === xrefResult.itemId)?.itemName ?? xrefResult.itemId}</dd></div>
                      <div><dt>Type</dt><dd>{xrefResult.referenceType.replaceAll("_", " ")}</dd></div>
                      <div><dt>Flow</dt><dd>Scan and receiving resolve to {xrefResult.itemType}</dd></div>
                    </dl>
                  ) : <p className="form-error">No item alias matched.</p>}
                </div>
                <table className="list-table">
                  <thead>
                    <tr><th>Code</th><th>Type</th><th>Item</th><th>Partner</th></tr>
                  </thead>
                  <tbody>
                    {demoCrossReferences.map((reference) => (
                      <tr key={reference.id}>
                        <td>{reference.code}</td>
                        <td>{reference.referenceType.replaceAll("_", " ")}</td>
                        <td>{assignedItems.find((item) => item.itemId === reference.itemId)?.sku ?? reference.itemId}</td>
                        <td>{reference.partnerId ?? "Any"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          },
          {
            id: "cycle",
            label: "ABC cycle counts",
            content: (
              <div className="screen-grid">
                <div className="metric-grid">
                  <article className="metric-panel"><span>A ranked</span><strong>{rankings.filter((ranking) => ranking.abcClass === "A").length}</strong></article>
                  <article className="metric-panel"><span>Due today</span><strong>{countSuggestions.filter((suggestion) => suggestion.suggestedCountDate === "2026-06-27").length}</strong></article>
                  <article className="metric-panel"><span>Programs</span><strong>{demoCountPrograms.length}</strong></article>
                </div>
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Count calendar</h3>
                    <CalendarClock aria-hidden="true" size={20} />
                  </div>
                  <table className="list-table">
                    <thead>
                      <tr><th>Date</th><th>SKU</th><th>ABC</th><th>Frequency</th><th>Reasons</th></tr>
                    </thead>
                    <tbody>
                      {countSuggestions.map((suggestion) => (
                        <tr key={`${suggestion.itemId}-${suggestion.programId}`}>
                          <td>{suggestion.suggestedCountDate}</td>
                          <td>{suggestion.sku}</td>
                          <td><Badge tone={suggestion.abcClass === "A" ? "warning" : "info"}>{suggestion.abcClass}</Badge></td>
                          <td>{suggestion.recommendedFrequencyDays} days</td>
                          <td>{suggestion.reasons.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }
        ]}
      />

      <div className="action-row">
        <Badge tone="info"><PackagePlus aria-hidden="true" size={14} /> Matrix items create product_variants</Badge>
        <Badge tone="info">Cross-references support supplier, customer, Shopify, barcode, GS1, and legacy codes</Badge>
      </div>
    </section>
  );
}
