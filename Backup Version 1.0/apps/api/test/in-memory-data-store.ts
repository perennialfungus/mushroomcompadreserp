import { randomUUID } from "node:crypto";
import {
  defaultProductTemplates,
  defaultSkuRule,
  generateProductPackage
} from "@mushroom-compadres/domain";
import type {
  ApiDataStore,
  AdminUserRecord,
  AppUserRecord,
  AppUserUpdateInput,
  AuditEventInsert,
  AuditEventRecord,
  ProductConfigurationInput,
  ProductConfigurationRecord,
  InventoryBalanceRecord,
  LoadedUserContext,
  LocationInput,
  LocationRecord,
  MasterDataSnapshot,
  MaterialInput,
  MaterialRecord,
  OrganizationRecord,
  PackagingComponentInput,
  PackagingComponentRecord,
  ProductConfigurationResult,
  ProductInput,
  ProductTemplateRecord,
  ProductRecord,
  ProductVariantInput,
  ProductVariantRecord,
  RoleRecord,
  SkuRuleRecord,
  StockCountConflictRecord,
  StockCountLineRecord,
  StockCountPostInput,
  StockCountPostResult,
  StockCountSessionRecord,
  StockMovementRecord,
  TransactionClient,
  UserRoleAssignment
} from "../src/types.js";

export type InMemorySeed = {
  organizations: OrganizationRecord[];
  users: AppUserRecord[];
  roles: RoleRecord[];
  userRoles: Array<Omit<UserRoleAssignment, "role">>;
  locations?: LocationRecord[];
  products?: ProductRecord[];
  productVariants?: ProductVariantRecord[];
  skuRules?: SkuRuleRecord[];
  productTemplates?: ProductTemplateRecord[];
  productConfigurations?: ProductConfigurationRecord[];
  materials?: MaterialRecord[];
  packagingComponents?: PackagingComponentRecord[];
};

export class InMemoryApiDataStore implements ApiDataStore {
  public readonly auditEvents: AuditEventRecord[] = [];
  public transactionCount = 0;

  constructor(private readonly seed: InMemorySeed) {}

  async findUserContextByAuthUserId(authUserId: string): Promise<LoadedUserContext | null> {
    const user = this.seed.users.find((candidate) => candidate.authUserId === authUserId);
    if (!user) {
      return null;
    }

    const organization = this.seed.organizations.find((candidate) => candidate.id === user.organizationId);
    if (!organization) {
      return null;
    }

    const roles = this.seed.userRoles
      .filter((assignment) => assignment.userId === user.id)
      .map((assignment) => {
        const role = this.seed.roles.find((candidate) => candidate.id === assignment.roleId);
        const location = this.locations.find((candidate) => candidate.id === assignment.locationId);
        if (!role) {
          throw new Error(`Role ${assignment.roleId} not found`);
        }

        return { ...assignment, role, location: location ?? null };
      });

    return { user, organization, roles };
  }

  private get locations(): LocationRecord[] {
    return this.seed.locations ?? [];
  }

  private get products(): ProductRecord[] {
    return this.seed.products ?? [];
  }

  private get productVariants(): ProductVariantRecord[] {
    return this.seed.productVariants ?? [];
  }

  private get skuRules(): SkuRuleRecord[] {
    return this.seed.skuRules ?? [{ ...defaultSkuRule, organizationId: this.seed.organizations[0]?.id ?? "org-test" }];
  }

  private get productTemplates(): ProductTemplateRecord[] {
    const organizationId = this.seed.organizations[0]?.id ?? "org-test";
    return this.seed.productTemplates ?? defaultProductTemplates.map((template) => ({
      ...template,
      organizationId,
      isActive: true
    }));
  }

  private get productConfigurations(): ProductConfigurationRecord[] {
    return this.seed.productConfigurations ?? [];
  }

  private get materials(): MaterialRecord[] {
    return this.seed.materials ?? [];
  }

  private get packagingComponents(): PackagingComponentRecord[] {
    return this.seed.packagingComponents ?? [];
  }

  private rolesForUser(user: AppUserRecord): UserRoleAssignment[] {
    return this.seed.userRoles
      .filter((assignment) => assignment.userId === user.id)
      .map((assignment) => {
        const role = this.seed.roles.find((candidate) => candidate.id === assignment.roleId);
        if (!role) {
          throw new Error(`Role ${assignment.roleId} not found`);
        }

        return {
          ...assignment,
          role,
          location: this.locations.find((location) => location.id === assignment.locationId) ?? null
        };
      });
  }

  private adminUser(user: AppUserRecord): AdminUserRecord {
    return {
      ...user,
      roles: this.rolesForUser(user)
    };
  }

  async listAppUsers(organizationId: string): Promise<AdminUserRecord[]> {
    return this.seed.users
      .filter((user) => user.organizationId === organizationId)
      .map((user) => this.adminUser(user));
  }

  async getAppUser(organizationId: string, userId: string): Promise<AdminUserRecord | null> {
    const user = this.seed.users.find(
      (candidate) => candidate.id === userId && candidate.organizationId === organizationId
    );
    return user ? this.adminUser(user) : null;
  }

  async updateAppUser(
    organizationId: string,
    userId: string,
    input: AppUserUpdateInput
  ): Promise<AdminUserRecord | null> {
    const user = this.seed.users.find(
      (candidate) => candidate.id === userId && candidate.organizationId === organizationId
    );
    if (!user) {
      return null;
    }

    Object.assign(user, input);
    if (input.roleAssignments) {
      this.seed.userRoles = this.seed.userRoles.filter((assignment) => assignment.userId !== userId);
      this.seed.userRoles.push(
        ...input.roleAssignments.map((assignment) => ({
          id: randomUUID(),
          userId,
          roleId: assignment.roleId,
          locationId: assignment.locationId
        }))
      );
    }

    return this.adminUser(user);
  }

  async listRoles(organizationId: string): Promise<RoleRecord[]> {
    return this.seed.roles.filter((role) => role.organizationId === organizationId);
  }

  async listLocations(organizationId: string): Promise<LocationRecord[]> {
    return this.locations.filter((location) => location.organizationId === organizationId);
  }

  async listMasterData(organizationId: string): Promise<MasterDataSnapshot> {
    return {
      products: this.products.filter((product) => product.organizationId === organizationId),
      productVariants: this.productVariants.filter((variant) => variant.organizationId === organizationId),
      materials: this.materials.filter((material) => material.organizationId === organizationId),
      packagingComponents: this.packagingComponents.filter((component) => component.organizationId === organizationId),
      locations: this.locations.filter((location) => location.organizationId === organizationId)
    };
  }

  async listSkuRules(organizationId: string): Promise<SkuRuleRecord[]> {
    return this.skuRules.filter((rule) => rule.organizationId === organizationId);
  }

  async listProductTemplates(organizationId: string): Promise<ProductTemplateRecord[]> {
    return this.productTemplates.filter((template) => template.organizationId === organizationId && template.isActive);
  }

  async listProductConfigurations(organizationId: string): Promise<ProductConfigurationRecord[]> {
    return this.productConfigurations.filter((configuration) => configuration.organizationId === organizationId);
  }

  async previewProductConfiguration(organizationId: string, input: ProductConfigurationInput) {
    return generateProductPackage(input, {
      rule: (await this.listSkuRules(organizationId))[0] ?? { ...defaultSkuRule, organizationId },
      templates: await this.listProductTemplates(organizationId),
      existingSkus: this.productVariants.filter((variant) => variant.organizationId === organizationId).map((variant) => variant.sku)
    });
  }

  async generateProductConfiguration(
    organizationId: string,
    input: ProductConfigurationInput
  ): Promise<ProductConfigurationResult> {
    const productPackage = await this.previewProductConfiguration(organizationId, input);
    const now = new Date();
    const product: ProductRecord = {
      id: randomUUID(),
      organizationId,
      name: productPackage.productDraft.name,
      category: productPackage.productDraft.category,
      descriptionI18n: {},
      localizedNames: productPackage.productDraft.localizedNames,
      localizedDescriptions: {},
      status: "draft",
      brand: "Mushroom Compadres",
      defaultUom: productPackage.productDraft.defaultUom
    };
    const variant: ProductVariantRecord = {
      id: randomUUID(),
      organizationId,
      productId: product.id,
      sku: productPackage.sku,
      barcode: null,
      nameI18n: productPackage.variantDraft.localizedNames,
      localizedNames: productPackage.variantDraft.localizedNames,
      form: productPackage.variantDraft.form,
      trackLots: productPackage.variantDraft.trackLots,
      trackExpiry: productPackage.variantDraft.trackExpiry,
      inventoryUom: productPackage.variantDraft.inventoryUom,
      sellableUom: productPackage.variantDraft.sellableUom,
      netQuantity: productPackage.variantDraft.netQuantity,
      status: "draft",
      shopifyVariantGid: productPackage.variantDraft.shopifyVariantGid,
      shopifyInventoryItemGid: productPackage.variantDraft.shopifyInventoryItemGid
    };
    const configurationRecord: ProductConfigurationRecord = {
      id: randomUUID(),
      organizationId,
      templateId: input.templateId,
      productId: product.id,
      productVariantId: variant.id,
      sku: variant.sku,
      generatedSku: productPackage.generatedSku,
      skuEdited: productPackage.skuEdited,
      status: productPackage.readinessGaps.some((gap) => gap.severity === "blocker") ? "blocked" : "ready",
      market: input.market,
      language: input.language,
      channel: input.channel,
      packageJson: productPackage,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    this.seed.products = [...this.products, product];
    this.seed.productVariants = [...this.productVariants, variant];
    this.seed.productConfigurations = [...this.productConfigurations, configurationRecord];
    return { configurationRecord, product, variant, package: productPackage };
  }

  async getProduct(organizationId: string, productId: string): Promise<ProductRecord | null> {
    return this.products.find((product) => product.id === productId && product.organizationId === organizationId) ?? null;
  }

  async getProductVariant(organizationId: string, variantId: string): Promise<ProductVariantRecord | null> {
    return this.productVariants.find((variant) => variant.id === variantId && variant.organizationId === organizationId) ?? null;
  }

  async getMaterial(organizationId: string, materialId: string): Promise<MaterialRecord | null> {
    return this.materials.find((material) => material.id === materialId && material.organizationId === organizationId) ?? null;
  }

  async getPackagingComponent(organizationId: string, packagingComponentId: string): Promise<PackagingComponentRecord | null> {
    return this.packagingComponents.find(
      (component) => component.id === packagingComponentId && component.organizationId === organizationId
    ) ?? null;
  }

  async getLocation(organizationId: string, locationId: string): Promise<LocationRecord | null> {
    return this.locations.find((location) => location.id === locationId && location.organizationId === organizationId) ?? null;
  }

  async listGrowBatches(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async getGrowBatchDetail(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async createGrowBatch(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async updateGrowBatch(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async transitionGrowBatchStatus(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async createHarvest(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async createDryingRun(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async createProduct(organizationId: string, input: ProductInput): Promise<ProductRecord> {
    const product = { ...input, id: randomUUID(), organizationId };
    this.seed.products = [...this.products, product];
    return product;
  }

  async updateProduct(organizationId: string, productId: string, input: Partial<ProductInput>): Promise<ProductRecord | null> {
    const product = await this.getProduct(organizationId, productId);
    if (!product) {
      return null;
    }
    Object.assign(product, input);
    return product;
  }

  async createProductVariant(organizationId: string, input: ProductVariantInput): Promise<ProductVariantRecord> {
    const variant = { ...input, id: randomUUID(), organizationId };
    this.seed.productVariants = [...this.productVariants, variant];
    return variant;
  }

  async updateProductVariant(
    organizationId: string,
    variantId: string,
    input: Partial<ProductVariantInput>
  ): Promise<ProductVariantRecord | null> {
    const variant = await this.getProductVariant(organizationId, variantId);
    if (!variant) {
      return null;
    }
    Object.assign(variant, input);
    return variant;
  }

  async createMaterial(organizationId: string, input: MaterialInput): Promise<MaterialRecord> {
    const material = { ...input, id: randomUUID(), organizationId };
    this.seed.materials = [...this.materials, material];
    return material;
  }

  async updateMaterial(organizationId: string, materialId: string, input: Partial<MaterialInput>): Promise<MaterialRecord | null> {
    const material = await this.getMaterial(organizationId, materialId);
    if (!material) {
      return null;
    }
    Object.assign(material, input);
    return material;
  }

  async createPackagingComponent(
    organizationId: string,
    input: PackagingComponentInput
  ): Promise<PackagingComponentRecord> {
    const component = { ...input, id: randomUUID(), organizationId };
    this.seed.packagingComponents = [...this.packagingComponents, component];
    return component;
  }

  async updatePackagingComponent(
    organizationId: string,
    packagingComponentId: string,
    input: Partial<PackagingComponentInput>
  ): Promise<PackagingComponentRecord | null> {
    const component = await this.getPackagingComponent(organizationId, packagingComponentId);
    if (!component) {
      return null;
    }
    Object.assign(component, input);
    return component;
  }

  async createLocation(organizationId: string, input: LocationInput): Promise<LocationRecord> {
    const location = { ...input, id: randomUUID(), organizationId };
    this.seed.locations = [...this.locations, location];
    return location;
  }

  async updateLocation(organizationId: string, locationId: string, input: Partial<LocationInput>): Promise<LocationRecord | null> {
    const location = await this.getLocation(organizationId, locationId);
    if (!location) {
      return null;
    }
    Object.assign(location, input);
    return location;
  }

  async updateUserLocale(userId: string, locale: string): Promise<AppUserRecord | null> {
    const user = this.seed.users.find((candidate) => candidate.id === userId);
    if (!user) {
      return null;
    }

    user.locale = locale;
    return user;
  }

  async listSuppliers(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async getSupplier(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async createSupplier(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async updateSupplier(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async listPurchaseOrders(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async getPurchaseOrder(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async createPurchaseOrder(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async updatePurchaseOrder(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async createPurchaseOrderLine(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async updatePurchaseOrderLine(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async receivePurchaseOrder(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async listReceipts(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async getReceipt(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async correctReceiptLine(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async listDocumentTemplates(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async createDocumentTemplate(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async approveDocumentTemplate(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async listGeneratedDocuments(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async generateCoaDocument(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async generateLotReleasePacket(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async approveGeneratedDocument(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async voidGeneratedDocument(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async downloadGeneratedDocument(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async insertAuditEvent(event: AuditEventInsert): Promise<AuditEventRecord> {
    const auditEvent = normalizeAuditEvent(event);
    this.auditEvents.push(auditEvent);
    return auditEvent;
  }

  async withTransaction<T>(work: (tx: TransactionClient) => Promise<T>): Promise<T> {
    this.transactionCount += 1;
    const staged: AuditEventRecord[] = [];
    const tx: TransactionClient = {
      insertAuditEvent: async (event) => {
        const auditEvent = normalizeAuditEvent(event);
        staged.push(auditEvent);
        return auditEvent;
      }
    };

    const result = await work(tx);
    this.auditEvents.push(...staged);
    return result;
  }
}

function normalizeAuditEvent(event: AuditEventInsert): AuditEventRecord {
  return {
    id: event.id ?? randomUUID(),
    organizationId: event.organizationId,
    actorUserId: event.actorUserId,
    eventType: event.eventType,
    subjectType: event.subjectType,
    subjectId: event.subjectId,
    beforeJson: event.beforeJson ?? null,
    afterJson: event.afterJson ?? null,
    occurredAt: event.occurredAt ?? new Date(),
    requestId: event.requestId ?? null
  };
}
