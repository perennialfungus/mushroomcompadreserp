import { randomUUID } from "node:crypto";
import {
  defaultFieldPermissionRules,
  defaultPermissionSets,
  explainPermission,
  permissionCatalog,
  resolveEffectivePermissions,
  defaultProductTemplates,
  defaultWorkspacePreferences,
  defaultColorRules,
  defaultSkuRule,
  generateProductPackage,
  mergeWorkspacePreferences,
  ensureAccessibleColorRule,
  filterNavigationForRole
} from "@mushroom-compadres/domain";
import type {
  ApiDataStore,
  AdminUserRecord,
  AppUserRecord,
  AppUserUpdateInput,
  AuditEventInsert,
  AuditEventRecord,
  AccessScopeRule,
  ColorRuleInput,
  ColorRuleRecord,
  FieldPermissionRule,
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
  PinnedItemInput,
  PinnedItemRecord,
  ProductConfigurationResult,
  ProductInput,
  ProductTemplateRecord,
  ProductRecord,
  ProductVariantInput,
  ProductVariantRecord,
  RoleRecord,
  RolePermissionSetAssignmentRecord,
  SavedViewInput,
  SavedViewRecord,
  PermissionSet,
  PermissionPreviewInput,
  UserPermissionOverride,
  UserPermissionOverrideInput,
  SkuRuleRecord,
  StockCountConflictRecord,
  StockCountLineRecord,
  StockCountPostInput,
  StockCountPostResult,
  StockCountSessionRecord,
  StockMovementRecord,
  TransactionClient,
  UserContext,
  UserPreferenceRecord,
  UserPreferenceUpdateInput,
  UserRoleAssignment
} from "../src/types.js";

export type InMemorySeed = {
  organizations: OrganizationRecord[];
  users: AppUserRecord[];
  roles: RoleRecord[];
  userRoles: Array<Omit<UserRoleAssignment, "role">>;
  permissionSets?: PermissionSet[];
  rolePermissionSets?: RolePermissionSetAssignmentRecord[];
  userPermissionOverrides?: UserPermissionOverride[];
  fieldPermissionRules?: FieldPermissionRule[];
  accessScopeRules?: AccessScopeRule[];
  locations?: LocationRecord[];
  products?: ProductRecord[];
  productVariants?: ProductVariantRecord[];
  skuRules?: SkuRuleRecord[];
  productTemplates?: ProductTemplateRecord[];
  productConfigurations?: ProductConfigurationRecord[];
  materials?: MaterialRecord[];
  packagingComponents?: PackagingComponentRecord[];
  userPreferences?: UserPreferenceRecord[];
  pinnedItems?: PinnedItemRecord[];
  savedViews?: SavedViewRecord[];
  colorRules?: ColorRuleRecord[];
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

  private get userPreferences(): UserPreferenceRecord[] {
    this.seed.userPreferences ??= [];
    return this.seed.userPreferences;
  }

  private get pinnedItems(): PinnedItemRecord[] {
    this.seed.pinnedItems ??= [];
    return this.seed.pinnedItems;
  }

  private get savedViews(): SavedViewRecord[] {
    this.seed.savedViews ??= [];
    return this.seed.savedViews;
  }

  private get colorRules(): ColorRuleRecord[] {
    const organizationId = this.seed.organizations[0]?.id ?? "org-test";
    this.seed.colorRules ??= defaultColorRules.map((rule) => ({
      ...rule,
      organizationId,
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    }));
    return this.seed.colorRules;
  }

  private get permissionSets(): PermissionSet[] {
    return this.seed.permissionSets ?? defaultPermissionSets(this.seed.organizations[0]?.id ?? "org-test");
  }

  private get rolePermissionSets(): RolePermissionSetAssignmentRecord[] {
    if (this.seed.rolePermissionSets) {
      return this.seed.rolePermissionSets;
    }
    const defaultSetByCode = new Map(this.permissionSets.map((set) => [set.code, set.id]));
    return this.seed.roles.flatMap((role) => {
      const setCodeByRole: Record<string, string> = {
        owner_admin: "owner-admin-full",
        production_farm: "production-workflows",
        qc: "quality-approval",
        packing_fulfillment: "packing-fulfillment",
        sales_wholesale: "sales-wholesale",
        purchasing: "purchasing",
        auditor: "auditor-read-export"
      };
      const setId = defaultSetByCode.get(setCodeByRole[role.code] ?? "");
      return setId ? [{ id: `rps-${role.id}-${setId}`, roleId: role.id, permissionSetId: setId }] : [];
    });
  }

  private get userPermissionOverrides(): UserPermissionOverride[] {
    return this.seed.userPermissionOverrides ?? [];
  }

  private get fieldPermissionRules(): FieldPermissionRule[] {
    const organizationId = this.seed.organizations[0]?.id ?? "org-test";
    return this.seed.fieldPermissionRules ?? defaultFieldPermissionRules.map((rule) => ({ ...rule, organizationId }));
  }

  private get accessScopeRules(): AccessScopeRule[] {
    return this.seed.accessScopeRules ?? [];
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

  private effectivePermissionsForUser(user: AppUserRecord) {
    const permissionSets = this.permissionSets.filter((set) => set.organizationId === user.organizationId);
    const setById = new Map(permissionSets.map((set) => [set.id, set.code]));
    const rolePermissionSetCodes = Object.fromEntries(
      this.seed.roles
        .filter((role) => role.organizationId === user.organizationId)
        .map((role) => [
          role.code,
          this.rolePermissionSets
            .filter((assignment) => assignment.roleId === role.id)
            .map((assignment) => setById.get(assignment.permissionSetId))
            .filter((code): code is string => Boolean(code))
        ])
    );
    const locationScope = this.seed.userRoles
      .filter((assignment) => assignment.userId === user.id)
      .map((assignment) => assignment.locationId)
      .filter((locationId): locationId is string => Boolean(locationId));
    return resolveEffectivePermissions({
      roleCodes: this.rolesForUser(user).map((assignment) => assignment.role.code),
      permissionSets,
      rolePermissionSetCodes,
      userOverrides: this.userPermissionOverrides.filter((override) => override.userId === user.id),
      accessScopeRules: [
        ...this.accessScopeRules.filter((rule) => rule.subjectType === "user" && rule.subjectId === user.id),
        ...(locationScope.length > 0
          ? [{
              id: `role-location-scope-${user.id}`,
              organizationId: user.organizationId,
              subjectType: "user" as const,
              subjectId: user.id,
              dimension: "location" as const,
              allowedIds: [...new Set(locationScope)]
            }]
          : [])
      ],
      userId: user.id
    });
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

  async getEffectivePermissionsForUser(organizationId: string, userId: string) {
    const user = this.seed.users.find((candidate) => candidate.id === userId && candidate.organizationId === organizationId);
    return user ? this.effectivePermissionsForUser(user) : [];
  }

  async listPermissionMatrix(organizationId: string) {
    const roles = this.seed.roles.filter((role) => role.organizationId === organizationId);
    return {
      catalog: permissionCatalog,
      permissionSets: this.permissionSets.filter((set) => set.organizationId === organizationId),
      rolePermissionSets: this.rolePermissionSets.filter((assignment) => roles.some((role) => role.id === assignment.roleId)),
      userOverrides: this.userPermissionOverrides.filter((override) => override.organizationId === organizationId),
      fieldRules: this.fieldPermissionRules.filter((rule) => rule.organizationId === organizationId),
      accessScopeRules: this.accessScopeRules.filter((rule) => rule.organizationId === organizationId),
      effectiveByRole: Object.fromEntries(
        roles.map((role) => [
          role.id,
          resolveEffectivePermissions({
            roleCodes: [role.code],
            permissionSets: this.permissionSets.filter((set) => set.organizationId === organizationId),
            rolePermissionSetCodes: Object.fromEntries(
              roles.map((candidate) => [
                candidate.code,
                this.rolePermissionSets
                  .filter((assignment) => assignment.roleId === candidate.id)
                  .map((assignment) => this.permissionSets.find((set) => set.id === assignment.permissionSetId)?.code)
                  .filter((code): code is string => Boolean(code))
              ])
            )
          })
        ])
      ),
      conflictWarnings: this.userPermissionOverrides
        .filter((override) => override.organizationId === organizationId && override.level === "deny")
        .map((override) => ({
          subjectType: "user" as const,
          subjectId: override.userId,
          permissionCode: override.permissionCode,
          message: `Explicit deny overrides role grants: ${override.reason}`
        }))
    };
  }

  async updateRolePermissionSets(userContext: { organizationId: string; userId: string }, roleId: string, permissionSetIds: string[], requestId: string) {
    const before = await this.listPermissionMatrix(userContext.organizationId);
    this.seed.rolePermissionSets = [
      ...this.rolePermissionSets.filter((assignment) => assignment.roleId !== roleId),
      ...permissionSetIds.map((permissionSetId) => ({ id: randomUUID(), roleId, permissionSetId }))
    ];
    const after = await this.listPermissionMatrix(userContext.organizationId);
    await this.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "permission.role_sets.updated",
      subjectType: "roles",
      subjectId: roleId,
      beforeJson: before.rolePermissionSets.filter((assignment) => assignment.roleId === roleId),
      afterJson: after.rolePermissionSets.filter((assignment) => assignment.roleId === roleId),
      requestId
    });
    return after;
  }

  async upsertUserPermissionOverride(userContext: { organizationId: string; userId: string }, input: UserPermissionOverrideInput, requestId: string) {
    const before = await this.listPermissionMatrix(userContext.organizationId);
    const overrides = [...this.userPermissionOverrides];
    const existing = overrides.find(
      (override) => override.userId === input.userId && override.permissionCode === input.permissionCode
    );
    if (existing) {
      Object.assign(existing, input);
    } else {
      overrides.push({
        id: randomUUID(),
        organizationId: userContext.organizationId,
        userId: input.userId,
        permissionCode: input.permissionCode,
        level: input.level,
        reason: input.reason,
        scope: input.scope
      });
    }
    this.seed.userPermissionOverrides = overrides;
    const after = await this.listPermissionMatrix(userContext.organizationId);
    await this.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "permission.user_override.updated",
      subjectType: "users",
      subjectId: input.userId,
      beforeJson: before.userOverrides.filter((override) => override.userId === input.userId),
      afterJson: after.userOverrides.filter((override) => override.userId === input.userId),
      requestId
    });
    return after;
  }

  async previewUserAccess(organizationId: string, subjectUserId: string, input: PermissionPreviewInput) {
    const user = this.seed.users.find((candidate) => candidate.id === subjectUserId && candidate.organizationId === organizationId);
    if (!user) {
      return null;
    }
    const effective = this.effectivePermissionsForUser(user);
    return {
      subjectUserId,
      action: input,
      resolution: explainPermission({
        effectivePermissions: effective,
        permissionCode: input.permissionCode,
        requiredLevel: input.requiredLevel,
        locationId: input.locationId,
        scope: input.scope
      }),
      effective
    };
  }

  async listPermissionChangeHistory(organizationId: string) {
    return this.auditEvents
      .filter((event) => event.organizationId === organizationId && event.eventType.startsWith("permission."))
      .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());
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

  async getWorkspaceSnapshot(userContext: UserContext, previewRoleCode: string | null = null) {
    const preferences = this.workspacePreferencesFor(userContext);
    const roleCodes = userContext.roles.map((role) => role.code);
    const canPreview = roleCodes.includes("owner_admin");
    const navigation = filterNavigationForRole(
      [
        { id: "inventory", label: "Inventory", href: "/inventory", requiredRoles: ["owner_admin", "packing_fulfillment"] },
        { id: "admin", label: "Admin", href: "/admin/roles", requiredRoles: ["owner_admin"] }
      ],
      roleCodes,
      canPreview ? previewRoleCode : null
    );
    return {
      preferences,
      pinnedItems: this.pinnedItems.filter((pin) => pin.organizationId === userContext.organizationId && pin.userId === userContext.userId),
      savedViews: this.savedViews.filter(
        (view) =>
          view.organizationId === userContext.organizationId &&
          (view.ownerUserId === userContext.userId || view.sharedRoleCodes.some((roleCode) => roleCodes.includes(roleCode)))
      ),
      colorRules: this.colorRules.filter((rule) => rule.organizationId === userContext.organizationId),
      navigation,
      previewRoleCode: canPreview ? previewRoleCode : null
    };
  }

  async updateUserPreferences(
    userContext: UserContext,
    input: UserPreferenceUpdateInput,
    requestId: string
  ): Promise<UserPreferenceRecord> {
    const preference = this.workspacePreferencesFor(userContext);
    const beforeJson = structuredClone(preference);
    Object.assign(preference, mergeWorkspacePreferences(preference, input), {
      savedFilters: input.savedFilters ?? preference.savedFilters,
      updatedAt: new Date(),
      version: preference.version + 1
    });
    await this.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "workspace.preferences.updated",
      subjectType: "user_preferences",
      subjectId: preference.id,
      beforeJson,
      afterJson: preference,
      requestId
    });
    return preference;
  }

  async pinWorkspaceItem(userContext: UserContext, input: PinnedItemInput, requestId: string): Promise<PinnedItemRecord> {
    const now = new Date();
    const pin: PinnedItemRecord = {
      id: randomUUID(),
      organizationId: userContext.organizationId,
      userId: userContext.userId,
      pinKind: input.pinKind,
      targetType: input.targetType,
      targetId: input.targetId,
      label: input.label,
      href: input.href,
      metadataJson: input.metadataJson ?? {},
      sortOrder: input.sortOrder ?? this.pinnedItems.length + 1,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    this.pinnedItems.push(pin);
    await this.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "workspace.pin.created",
      subjectType: "pinned_items",
      subjectId: pin.id,
      afterJson: pin,
      requestId
    });
    return pin;
  }

  async unpinWorkspaceItem(userContext: UserContext, pinId: string, requestId: string): Promise<boolean> {
    const before = this.pinnedItems.length;
    const pin = this.pinnedItems.find((candidate) => candidate.id === pinId);
    this.seed.pinnedItems = this.pinnedItems.filter(
      (candidate) => !(candidate.id === pinId && candidate.organizationId === userContext.organizationId && candidate.userId === userContext.userId)
    );
    if (this.pinnedItems.length === before) {
      return false;
    }
    await this.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "workspace.pin.deleted",
      subjectType: "pinned_items",
      subjectId: pinId,
      beforeJson: pin ?? null,
      requestId
    });
    return true;
  }

  async saveGridView(userContext: UserContext, input: SavedViewInput, requestId: string): Promise<SavedViewRecord> {
    if (input.scope === "role_shared" && !userContext.roles.some((role) => role.code === "owner_admin")) {
      throw new Error("admin_required_for_shared_view");
    }
    const now = new Date();
    const view: SavedViewRecord = {
      id: randomUUID(),
      organizationId: userContext.organizationId,
      ownerUserId: userContext.userId,
      gridKey: input.gridKey,
      name: input.name,
      scope: input.scope ?? "private",
      sharedRoleCodes: input.sharedRoleCodes ?? [],
      filters: input.filters ?? {},
      sort: input.sort ?? [],
      grouping: input.grouping ?? [],
      columns: input.columns ?? [],
      colorRuleIds: input.colorRuleIds ?? [],
      isDefault: input.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    this.savedViews.push(view);
    await this.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "workspace.saved_view.created",
      subjectType: "saved_views",
      subjectId: view.id,
      afterJson: view,
      requestId
    });
    return view;
  }

  async deleteGridView(userContext: UserContext, savedViewId: string, requestId: string): Promise<boolean> {
    const before = this.savedViews.length;
    this.seed.savedViews = this.savedViews.filter(
      (view) => !(view.id === savedViewId && view.organizationId === userContext.organizationId && view.ownerUserId === userContext.userId)
    );
    if (this.savedViews.length === before) {
      return false;
    }
    await this.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "workspace.saved_view.deleted",
      subjectType: "saved_views",
      subjectId: savedViewId,
      requestId
    });
    return true;
  }

  async saveColorRule(userContext: UserContext, input: ColorRuleInput, requestId: string): Promise<ColorRuleRecord> {
    const now = new Date();
    const accessible = ensureAccessibleColorRule({ id: randomUUID(), ...input });
    const rule: ColorRuleRecord = {
      ...accessible,
      id: randomUUID(),
      organizationId: userContext.organizationId,
      userId: userContext.userId,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    this.colorRules.push(rule);
    await this.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "workspace.color_rule.created",
      subjectType: "color_rules",
      subjectId: rule.id,
      afterJson: rule,
      requestId
    });
    return rule;
  }

  async deleteColorRule(userContext: UserContext, colorRuleId: string, requestId: string): Promise<boolean> {
    const before = this.colorRules.length;
    this.seed.colorRules = this.colorRules.filter(
      (rule) => !(rule.id === colorRuleId && rule.organizationId === userContext.organizationId && rule.userId === userContext.userId)
    );
    if (this.colorRules.length === before) {
      return false;
    }
    await this.insertAuditEvent({
      organizationId: userContext.organizationId,
      actorUserId: userContext.userId,
      eventType: "workspace.color_rule.deleted",
      subjectType: "color_rules",
      subjectId: colorRuleId,
      requestId
    });
    return true;
  }

  private workspacePreferencesFor(userContext: UserContext): UserPreferenceRecord {
    const existing = this.userPreferences.find(
      (preference) => preference.organizationId === userContext.organizationId && preference.userId === userContext.userId
    );
    if (existing) {
      return existing;
    }
    const now = new Date();
    const preference: UserPreferenceRecord = {
      id: randomUUID(),
      organizationId: userContext.organizationId,
      userId: userContext.userId,
      ...defaultWorkspacePreferences,
      savedFilters: {},
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    this.userPreferences.push(preference);
    return preference;
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

  async getComplianceDashboard(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async recordSanitationCheck(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async recordTrainingCompletion(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async evaluateComplianceGate(): Promise<never> {
    throw new Error("Not implemented in this test store");
  }

  async generateAuditPacket(): Promise<never> {
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
