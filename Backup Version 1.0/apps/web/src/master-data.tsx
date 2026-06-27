import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Download, Edit3, MapPin, Package, PackagePlus, Save } from "lucide-react";
import { Badge, Button, EmptyState, Input, Tabs, useToast } from "./components/ui";
import { useAuth } from "./auth";
import {
  createLocation,
  createMaterial,
  createPackagingComponent,
  createProduct,
  createProductVariant,
  exportMasterDataCsv,
  listMasterData,
  updateLocation,
  updateMaterial,
  updatePackagingComponent,
  updateProduct,
  updateProductVariant
} from "./lib/api";
import type {
  Location,
  MasterDataSnapshot,
  Material,
  PackagingComponent,
  Product,
  ProductVariant
} from "./types";

const emptyData: MasterDataSnapshot = {
  products: [],
  productVariants: [],
  materials: [],
  packagingComponents: [],
  locations: []
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

function downloadText(filename: string, contents: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function localizedName(record: { localizedNames?: Record<string, string>; name?: string; sku?: string }) {
  return record.localizedNames?.en ?? record.name ?? record.sku ?? "Untitled";
}

function shopifyStatus(variant: ProductVariant) {
  return variant.shopifyVariantGid && variant.shopifyInventoryItemGid ? "Mapped" : "Needs mapping";
}

export function MasterDataScreen() {
  const auth = useAuth();
  const toast = useToast();
  const [data, setData] = useState<MasterDataSnapshot>(emptyData);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | "new" | null>(null);
  const [editingVariantId, setEditingVariantId] = useState<string | "new" | null>(null);
  const [editingMaterialId, setEditingMaterialId] = useState<string | "new" | null>(null);
  const [editingPackagingId, setEditingPackagingId] = useState<string | "new" | null>(null);
  const [editingLocationId, setEditingLocationId] = useState<string | "new" | null>(null);
  const canEdit = auth.isAdmin;
  const token = auth.session?.accessToken;

  async function refresh() {
    if (!token) {
      return;
    }

    const snapshot = await listMasterData(token);
    setData(snapshot);
    setSelectedProductId((current) => current ?? snapshot.products[0]?.id ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, [token]);

  const selectedProduct = data.products.find((product) => product.id === selectedProductId) ?? data.products[0];
  const selectedProductVariants = data.productVariants.filter(
    (variant) => variant.productId === selectedProduct?.id
  );

  async function handleExportCsv() {
    if (!token) {
      return;
    }

    const csv = await exportMasterDataCsv(token);
    downloadText("mushroom-compadres-master-data.csv", csv);
    toast.showToast({
      title: "CSV export ready",
      description: "Master data was exported in the import-ready format."
    });
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !canEdit) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const input: Omit<Product, "id" | "organizationId"> = {
      name: field(form, "name"),
      category: field(form, "category"),
      descriptionI18n: { en: field(form, "descriptionEn"), pt: field(form, "descriptionPt") },
      localizedNames: { en: field(form, "nameEn"), pt: field(form, "namePt") },
      localizedDescriptions: { en: field(form, "descriptionEn"), pt: field(form, "descriptionPt") },
      status: field(form, "status") as Product["status"],
      brand: field(form, "brand"),
      defaultUom: field(form, "defaultUom")
    };

    const response =
      editingProductId && editingProductId !== "new"
        ? await updateProduct(token, editingProductId, input)
        : await createProduct(token, input);
    await refresh();
    setSelectedProductId(response.product.id);
    setEditingProductId(response.product.id);
    toast.showToast({ title: "Product saved", description: response.product.name });
  }

  async function saveVariant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !canEdit || !selectedProduct) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const netQuantity = Number(field(form, "netQuantity"));
    const input: Omit<ProductVariant, "id" | "organizationId"> = {
      productId: selectedProduct.id,
      sku: field(form, "sku"),
      barcode: nullableField(form, "barcode"),
      nameI18n: { en: field(form, "nameEn"), pt: field(form, "namePt") },
      localizedNames: { en: field(form, "nameEn"), pt: field(form, "namePt") },
      form: field(form, "form"),
      trackLots: checked(form, "trackLots"),
      trackExpiry: checked(form, "trackExpiry"),
      inventoryUom: field(form, "inventoryUom"),
      sellableUom: field(form, "sellableUom"),
      netQuantity: Number.isFinite(netQuantity) ? netQuantity : null,
      status: field(form, "status") as ProductVariant["status"],
      shopifyVariantGid: nullableField(form, "shopifyVariantGid"),
      shopifyInventoryItemGid: nullableField(form, "shopifyInventoryItemGid")
    };

    const response =
      editingVariantId && editingVariantId !== "new"
        ? await updateProductVariant(token, editingVariantId, input)
        : await createProductVariant(token, input);
    await refresh();
    setEditingVariantId(response.variant.id);
    toast.showToast({ title: "Variant saved", description: response.variant.sku });
  }

  async function saveMaterial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !canEdit) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const input: Omit<Material, "id" | "organizationId"> = {
      name: field(form, "name"),
      category: field(form, "category"),
      sku: nullableField(form, "sku"),
      barcode: nullableField(form, "barcode"),
      uom: field(form, "uom"),
      supplierPartNumber: nullableField(form, "supplierPartNumber"),
      trackLots: checked(form, "trackLots"),
      trackExpiry: checked(form, "trackExpiry"),
      localizedNames: { en: field(form, "nameEn"), pt: field(form, "namePt") },
      localizedDescriptions: { en: field(form, "descriptionEn"), pt: field(form, "descriptionPt") }
    };

    const response =
      editingMaterialId && editingMaterialId !== "new"
        ? await updateMaterial(token, editingMaterialId, input)
        : await createMaterial(token, input);
    await refresh();
    setEditingMaterialId(response.material.id);
    toast.showToast({ title: "Material saved", description: response.material.name });
  }

  async function savePackaging(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !canEdit) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const input: Omit<PackagingComponent, "id" | "organizationId"> = {
      name: field(form, "name"),
      uom: field(form, "uom"),
      sku: field(form, "sku"),
      barcode: nullableField(form, "barcode"),
      trackLots: checked(form, "trackLots"),
      localizedNames: { en: field(form, "nameEn"), pt: field(form, "namePt") },
      localizedDescriptions: { en: field(form, "descriptionEn"), pt: field(form, "descriptionPt") }
    };

    const response =
      editingPackagingId && editingPackagingId !== "new"
        ? await updatePackagingComponent(token, editingPackagingId, input)
        : await createPackagingComponent(token, input);
    await refresh();
    setEditingPackagingId(response.packagingComponent.id);
    toast.showToast({ title: "Packaging saved", description: response.packagingComponent.sku });
  }

  async function saveLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !canEdit) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const input: Omit<Location, "id" | "organizationId"> = {
      code: field(form, "code"),
      name: field(form, "name"),
      type: field(form, "type"),
      addressLine1: nullableField(form, "addressLine1"),
      addressLine2: nullableField(form, "addressLine2"),
      city: nullableField(form, "city"),
      region: nullableField(form, "region"),
      postalCode: nullableField(form, "postalCode"),
      countryCode: nullableField(form, "countryCode"),
      shopifyLocationGid: nullableField(form, "shopifyLocationGid"),
      isActive: checked(form, "isActive")
    };

    const response =
      editingLocationId && editingLocationId !== "new"
        ? await updateLocation(token, editingLocationId, input)
        : await createLocation(token, input);
    await refresh();
    setEditingLocationId(response.location.id);
    toast.showToast({ title: "Location saved", description: response.location.code });
  }

  if (loading) {
    return <EmptyState title="Loading master data" description="Fetching products, materials, and locations." />;
  }

  return (
    <section className="screen-grid" aria-labelledby="master-data-title">
      <div className="screen-heading master-heading">
        <div>
          <p className="eyebrow">Master data</p>
          <h2 id="master-data-title">Products and locations</h2>
          <p>Maintain product, material, packaging, and location records used by production and fulfillment.</p>
        </div>
        <div className="master-toolbar">
          <Badge tone={canEdit ? "success" : "info"}>{canEdit ? "Editable" : "View only"}</Badge>
          <Button variant="secondary" onClick={() => void handleExportCsv()}>
            <Download aria-hidden="true" size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          {
            id: "products",
            label: "Products",
            content: (
              <ProductsPanel
                canEdit={canEdit}
                data={data}
                editingProductId={editingProductId}
                editingVariantId={editingVariantId}
                onEditProduct={setEditingProductId}
                onEditVariant={setEditingVariantId}
                onSaveProduct={saveProduct}
                onSaveVariant={saveVariant}
                onSelectProduct={setSelectedProductId}
                selectedProduct={selectedProduct}
                selectedProductVariants={selectedProductVariants}
              />
            )
          },
          {
            id: "materials",
            label: "Materials",
            content: (
              <SupplyPanel
                canEdit={canEdit}
                editingMaterialId={editingMaterialId}
                editingPackagingId={editingPackagingId}
                materials={data.materials}
                onEditMaterial={setEditingMaterialId}
                onEditPackaging={setEditingPackagingId}
                onSaveMaterial={saveMaterial}
                onSavePackaging={savePackaging}
                packagingComponents={data.packagingComponents}
              />
            )
          },
          {
            id: "locations",
            label: "Locations",
            content: (
              <LocationsPanel
                canEdit={canEdit}
                editingLocationId={editingLocationId}
                locations={data.locations}
                onEditLocation={setEditingLocationId}
                onSaveLocation={saveLocation}
              />
            )
          }
        ]}
      />
    </section>
  );
}

function ProductsPanel(props: {
  canEdit: boolean;
  data: MasterDataSnapshot;
  selectedProduct: Product | undefined;
  selectedProductVariants: ProductVariant[];
  editingProductId: string | "new" | null;
  editingVariantId: string | "new" | null;
  onSelectProduct: (productId: string) => void;
  onEditProduct: (productId: string | "new") => void;
  onEditVariant: (variantId: string | "new") => void;
  onSaveProduct: (event: FormEvent<HTMLFormElement>) => void;
  onSaveVariant: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const editingProduct =
    props.editingProductId === "new"
      ? null
      : props.data.products.find((product) => product.id === props.editingProductId);
  const editingVariant =
    props.editingVariantId === "new"
      ? null
      : props.data.productVariants.find((variant) => variant.id === props.editingVariantId);

  return (
    <div className="master-grid">
      <div className="record-list" aria-label="Product list">
        <div className="panel-header">
          <h3>Product list</h3>
          {props.canEdit ? (
            <Button size="sm" variant="secondary" onClick={() => props.onEditProduct("new")}>
              <PackagePlus aria-hidden="true" size={16} />
              New
            </Button>
          ) : null}
        </div>
        {props.data.products.map((product) => (
          <button
            className="record-row"
            key={product.id}
            onClick={() => props.onSelectProduct(product.id)}
            type="button"
          >
            <Package aria-hidden="true" size={18} />
            <span>
              <strong>{product.name}</strong>
              <small>{product.category} · {product.defaultUom}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="detail-card">
        <div className="panel-header">
          <h3>{props.selectedProduct?.name ?? "Product detail"}</h3>
          {props.canEdit && props.selectedProduct ? (
            <Button size="sm" variant="secondary" onClick={() => props.onEditProduct(props.selectedProduct!.id)}>
              <Edit3 aria-hidden="true" size={16} />
              Edit
            </Button>
          ) : null}
        </div>
        <dl className="compact-definition">
          <div><dt>Status</dt><dd>{props.selectedProduct?.status ?? "-"}</dd></div>
          <div><dt>Brand</dt><dd>{props.selectedProduct?.brand ?? "-"}</dd></div>
          <div><dt>PT name</dt><dd>{props.selectedProduct?.localizedNames.pt ?? "-"}</dd></div>
        </dl>

        <div className="variant-section">
          <div className="panel-header">
            <h4>Variants</h4>
            {props.canEdit && props.selectedProduct ? (
              <Button size="sm" variant="secondary" onClick={() => props.onEditVariant("new")}>
                <PackagePlus aria-hidden="true" size={16} />
                New variant
              </Button>
            ) : null}
          </div>
          {props.selectedProductVariants.map((variant) => (
            <article className="variant-card" key={variant.id}>
              <div>
                <strong>{localizedName(variant)}</strong>
                <small>{variant.barcode ? `Barcode ${variant.barcode}` : "No barcode"}</small>
              </div>
              {!props.canEdit ? <Badge tone="info">{variant.sku}</Badge> : null}
              <Badge tone={variant.trackLots ? "success" : "warning"}>
                Lots {variant.trackLots ? "tracked" : "off"}
              </Badge>
              <Badge tone={variant.trackExpiry ? "success" : "warning"}>
                Expiry {variant.trackExpiry ? "tracked" : "off"}
              </Badge>
              <Badge tone={shopifyStatus(variant) === "Mapped" ? "success" : "warning"}>
                Shopify {shopifyStatus(variant)}
              </Badge>
              {props.canEdit ? (
                <Button size="sm" variant="ghost" onClick={() => props.onEditVariant(variant.id)}>
                  <Edit3 aria-hidden="true" size={16} />
                  Edit
                </Button>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      {props.canEdit && props.editingProductId ? (
        <ProductForm key={props.editingProductId} product={editingProduct ?? undefined} onSubmit={props.onSaveProduct} />
      ) : null}

      {props.canEdit && props.editingVariantId ? (
        <VariantForm key={props.editingVariantId} variant={editingVariant ?? undefined} onSubmit={props.onSaveVariant} />
      ) : null}
    </div>
  );
}

function ProductForm({ product, onSubmit }: { product: Product | undefined; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="editor-panel" onSubmit={onSubmit}>
      <h3>{product ? "Edit product" : "Create product"}</h3>
      <div className="form-grid">
        <Input label="Name" name="name" required defaultValue={product?.name ?? ""} />
        <Input label="Category" name="category" required defaultValue={product?.category ?? "tincture"} />
        <Input label="Brand" name="brand" required defaultValue={product?.brand ?? "Mushroom Compadres"} />
        <Input label="Default UOM" name="defaultUom" required defaultValue={product?.defaultUom ?? "bottle"} />
        <Input label="English title" name="nameEn" required defaultValue={product?.localizedNames.en ?? ""} />
        <Input label="Portuguese title" name="namePt" defaultValue={product?.localizedNames.pt ?? ""} />
        <Input label="Description EN" name="descriptionEn" defaultValue={product?.localizedDescriptions.en ?? ""} />
        <Input label="Description PT" name="descriptionPt" defaultValue={product?.localizedDescriptions.pt ?? ""} />
        <label className="select-field">
          <span>Status</span>
          <select name="status" defaultValue={product?.status ?? "active"}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>
      <Button type="submit"><Save aria-hidden="true" size={18} />Save product</Button>
    </form>
  );
}

function VariantForm({ variant, onSubmit }: { variant: ProductVariant | undefined; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="editor-panel" onSubmit={onSubmit}>
      <h3>Variant editor</h3>
      <div className="form-grid">
        <Input label="SKU" name="sku" required defaultValue={variant?.sku ?? ""} />
        <Input label="Barcode" name="barcode" defaultValue={variant?.barcode ?? ""} />
        <Input label="Variant name EN" name="nameEn" required defaultValue={variant?.localizedNames.en ?? ""} />
        <Input label="Variant name PT" name="namePt" defaultValue={variant?.localizedNames.pt ?? ""} />
        <Input label="Form" name="form" required defaultValue={variant?.form ?? "tincture"} />
        <Input label="Inventory UOM" name="inventoryUom" required defaultValue={variant?.inventoryUom ?? "bottle"} />
        <Input label="Sellable UOM" name="sellableUom" required defaultValue={variant?.sellableUom ?? "bottle"} />
        <Input label="Net quantity" name="netQuantity" type="number" min="0" step="0.001" defaultValue={variant?.netQuantity ?? ""} />
        <Input label="Shopify variant GID" name="shopifyVariantGid" defaultValue={variant?.shopifyVariantGid ?? ""} />
        <Input label="Shopify inventory item GID" name="shopifyInventoryItemGid" defaultValue={variant?.shopifyInventoryItemGid ?? ""} />
        <label className="select-field">
          <span>Status</span>
          <select name="status" defaultValue={variant?.status ?? "active"}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <div className="checkbox-grid">
          <label><input name="trackLots" type="checkbox" defaultChecked={variant?.trackLots ?? true} /> Lot tracking</label>
          <label><input name="trackExpiry" type="checkbox" defaultChecked={variant?.trackExpiry ?? true} /> Expiry tracking</label>
        </div>
      </div>
      <Button type="submit"><Save aria-hidden="true" size={18} />Save variant</Button>
    </form>
  );
}

function SupplyPanel(props: {
  canEdit: boolean;
  materials: Material[];
  packagingComponents: PackagingComponent[];
  editingMaterialId: string | "new" | null;
  editingPackagingId: string | "new" | null;
  onEditMaterial: (materialId: string | "new") => void;
  onEditPackaging: (packagingId: string | "new") => void;
  onSaveMaterial: (event: FormEvent<HTMLFormElement>) => void;
  onSavePackaging: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const material = props.editingMaterialId === "new" ? null : props.materials.find((item) => item.id === props.editingMaterialId);
  const packaging = props.editingPackagingId === "new" ? null : props.packagingComponents.find((item) => item.id === props.editingPackagingId);

  return (
    <div className="master-grid">
      <RecordTable
        actionLabel="New material"
        canEdit={props.canEdit}
        onNew={() => props.onEditMaterial("new")}
        rows={props.materials.map((item) => ({
          id: item.id,
          title: item.name,
          meta: `${item.category} · ${item.sku ?? "No SKU"} · ${item.uom}`,
          onEdit: () => props.onEditMaterial(item.id)
        }))}
        title="Material list"
      />
      <RecordTable
        actionLabel="New packaging"
        canEdit={props.canEdit}
        onNew={() => props.onEditPackaging("new")}
        rows={props.packagingComponents.map((item) => ({
          id: item.id,
          title: item.name,
          meta: `${item.sku} · ${item.uom} · ${item.trackLots ? "Lot tracked" : "Untracked"}`,
          onEdit: () => props.onEditPackaging(item.id)
        }))}
        title="Packaging components"
      />
      {props.canEdit && props.editingMaterialId ? (
        <MaterialForm key={props.editingMaterialId} material={material ?? undefined} onSubmit={props.onSaveMaterial} />
      ) : null}
      {props.canEdit && props.editingPackagingId ? (
        <PackagingForm key={props.editingPackagingId} packaging={packaging ?? undefined} onSubmit={props.onSavePackaging} />
      ) : null}
    </div>
  );
}

function MaterialForm({ material, onSubmit }: { material: Material | undefined; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="editor-panel" onSubmit={onSubmit}>
      <h3>{material ? "Edit material" : "Create material"}</h3>
      <SupplyFields record={material} skuRequired={false} />
      <Button type="submit"><Save aria-hidden="true" size={18} />Save material</Button>
    </form>
  );
}

function PackagingForm({ packaging, onSubmit }: { packaging: PackagingComponent | undefined; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="editor-panel" onSubmit={onSubmit}>
      <h3>{packaging ? "Edit packaging" : "Create packaging"}</h3>
      <SupplyFields record={packaging} skuRequired />
      <Button type="submit"><Save aria-hidden="true" size={18} />Save packaging</Button>
    </form>
  );
}

function SupplyFields({ record, skuRequired }: { record: Material | PackagingComponent | undefined; skuRequired: boolean }) {
  const material = "category" in (record ?? {}) ? (record as Material) : null;
  return (
    <div className="form-grid">
      <Input label="Name" name="name" required defaultValue={record?.name ?? ""} />
      {material || !skuRequired ? <Input label="Category" name="category" required defaultValue={material?.category ?? "ingredient"} /> : null}
      <Input label="SKU" name="sku" required={skuRequired} defaultValue={record && "sku" in record ? record.sku ?? "" : ""} />
      <Input label="Barcode" name="barcode" defaultValue={record && "barcode" in record ? record.barcode ?? "" : ""} />
      <Input label="UOM" name="uom" required defaultValue={record?.uom ?? "each"} />
      {material || !skuRequired ? <Input label="Supplier part number" name="supplierPartNumber" defaultValue={material?.supplierPartNumber ?? ""} /> : null}
      <Input label="Localized name EN" name="nameEn" required defaultValue={record?.localizedNames.en ?? ""} />
      <Input label="Localized name PT" name="namePt" defaultValue={record?.localizedNames.pt ?? ""} />
      <Input label="Description EN" name="descriptionEn" defaultValue={record?.localizedDescriptions.en ?? ""} />
      <Input label="Description PT" name="descriptionPt" defaultValue={record?.localizedDescriptions.pt ?? ""} />
      <div className="checkbox-grid">
        <label><input name="trackLots" type="checkbox" defaultChecked={record?.trackLots ?? true} /> Lot tracking</label>
        {!skuRequired ? <label><input name="trackExpiry" type="checkbox" defaultChecked={material?.trackExpiry ?? false} /> Expiry tracking</label> : null}
      </div>
    </div>
  );
}

function LocationsPanel(props: {
  canEdit: boolean;
  locations: Location[];
  editingLocationId: string | "new" | null;
  onEditLocation: (locationId: string | "new") => void;
  onSaveLocation: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const location = props.editingLocationId === "new" ? null : props.locations.find((item) => item.id === props.editingLocationId);
  const activeCount = useMemo(() => props.locations.filter((item) => item.isActive).length, [props.locations]);

  return (
    <div className="master-grid">
      <div className="detail-card">
        <div className="panel-header">
          <h3>Location list</h3>
          <Badge tone="info">{activeCount} active</Badge>
          {props.canEdit ? (
            <Button size="sm" variant="secondary" onClick={() => props.onEditLocation("new")}>
              <MapPin aria-hidden="true" size={16} />
              New location
            </Button>
          ) : null}
        </div>
        <table className="list-table">
          <thead>
            <tr><th>Code</th><th>Name</th><th>Type</th><th>Status</th><th>Shopify</th><th></th></tr>
          </thead>
          <tbody>
            {props.locations.map((item) => (
              <tr key={item.id}>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{item.type}</td>
                <td>{item.isActive ? "Active" : "Inactive"}</td>
                <td>{item.shopifyLocationGid ? "Mapped" : "Not mapped"}</td>
                <td>
                  {props.canEdit ? (
                    <Button size="sm" variant="ghost" onClick={() => props.onEditLocation(item.id)}>
                      <Edit3 aria-hidden="true" size={16} />Edit
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {props.canEdit && props.editingLocationId ? (
        <LocationForm key={props.editingLocationId} location={location ?? undefined} onSubmit={props.onSaveLocation} />
      ) : null}
    </div>
  );
}

function LocationForm({ location, onSubmit }: { location: Location | undefined; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="editor-panel" onSubmit={onSubmit}>
      <h3>{location ? "Edit location" : "Create location"}</h3>
      <div className="form-grid">
        <Input label="Code" name="code" required defaultValue={location?.code ?? ""} />
        <Input label="Name" name="name" required defaultValue={location?.name ?? ""} />
        <Input label="Type" name="type" required defaultValue={location?.type ?? "warehouse"} />
        <Input label="Address line 1" name="addressLine1" defaultValue={location?.addressLine1 ?? ""} />
        <Input label="Address line 2" name="addressLine2" defaultValue={location?.addressLine2 ?? ""} />
        <Input label="City" name="city" defaultValue={location?.city ?? ""} />
        <Input label="Region" name="region" defaultValue={location?.region ?? ""} />
        <Input label="Postal code" name="postalCode" defaultValue={location?.postalCode ?? ""} />
        <Input label="Country code" name="countryCode" defaultValue={location?.countryCode ?? "PT"} />
        <Input label="Shopify location GID" name="shopifyLocationGid" defaultValue={location?.shopifyLocationGid ?? ""} />
        <div className="checkbox-grid">
          <label><input name="isActive" type="checkbox" defaultChecked={location?.isActive ?? true} /> Active</label>
        </div>
      </div>
      <Button type="submit"><Save aria-hidden="true" size={18} />Save location</Button>
    </form>
  );
}

function RecordTable(props: {
  title: string;
  actionLabel: string;
  canEdit: boolean;
  onNew: () => void;
  rows: Array<{ id: string; title: string; meta: string; onEdit: () => void }>;
}) {
  return (
    <div className="record-list">
      <div className="panel-header">
        <h3>{props.title}</h3>
        {props.canEdit ? (
          <Button size="sm" variant="secondary" onClick={props.onNew}>
            <PackagePlus aria-hidden="true" size={16} />
            {props.actionLabel}
          </Button>
        ) : null}
      </div>
      {props.rows.map((row) => (
        <article className="record-row static" key={row.id}>
          <CheckCircle2 aria-hidden="true" size={18} />
          <span>
            <strong>{row.title}</strong>
            <small>{row.meta}</small>
          </span>
          {props.canEdit ? (
            <Button size="sm" variant="ghost" onClick={row.onEdit}>
              <Edit3 aria-hidden="true" size={16} />
              Edit
            </Button>
          ) : null}
        </article>
      ))}
    </div>
  );
}
