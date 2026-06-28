export const documentTypeCategories = [
  "purchase_order",
  "receipt",
  "production_order",
  "processing_batch",
  "qc_task",
  "quality_event",
  "stock_movement",
  "change_request",
  "sales_order",
  "wholesale_order"
] as const;

export type DocumentTypeCategory = (typeof documentTypeCategories)[number];

export type DocumentTypeDefinition = {
  id: string;
  organizationId: string;
  category: DocumentTypeCategory;
  code: string;
  name: string;
  status: "active" | "inactive";
  description: string | null;
  numberingSequenceId: string | null;
  defaultStatus: string | null;
  defaultLocationId: string | null;
  defaultReasonCodeId: string | null;
  requireAttributes: boolean;
  settingsJson: Record<string, unknown>;
};

export type NumberingSequenceDefinition = {
  id: string;
  organizationId: string;
  documentTypeId: string;
  code: string;
  description: string | null;
  prefix: string;
  suffix: string;
  padLength: number;
  nextNumber: number;
  incrementBy: number;
  scopeOrganization: boolean;
  scopeYear: boolean;
  scopeMonth: boolean;
  scopeLocation: boolean;
  resetPolicy: "never" | "yearly" | "monthly";
  lastScopeKey: string | null;
  active: boolean;
};

export type NumberingContext = {
  organizationId: string;
  documentType: Pick<DocumentTypeDefinition, "id" | "category" | "code">;
  now?: Date;
  locationCode?: string | null;
};

export type NumberingGeneration = {
  documentNumber: string;
  scopeKey: string;
  nextNumber: number;
  renderedPrefix: string;
};

export type ReasonCodeDefinition = {
  id: string;
  organizationId: string;
  catalog:
    | "receipt_disposition"
    | "inventory_adjustment"
    | "hold"
    | "release"
    | "reject"
    | "rework"
    | "scrap"
    | "return"
    | "cycle_count"
    | "admin_override";
  code: string;
  label: string;
  description: string | null;
  requiresComment: boolean;
  active: boolean;
};

export type AttributeDefinition = {
  id: string;
  organizationId: string;
  code: string;
  label: string;
  dataType: "text" | "number" | "date" | "boolean" | "select";
  required: boolean;
  options: string[];
  validationExpression: string | null;
  active: boolean;
};

export type AttributeSetDefinition = {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  appliesTo:
    | "item_class"
    | "supplier_class"
    | "product_family"
    | "lot_type"
    | "document_type"
    | "qc_spec";
  appliesToValue: string;
  attributeDefinitionIds: string[];
  active: boolean;
};

export type AttributeValueRecord = {
  id: string;
  organizationId: string;
  subjectType: string;
  subjectId: string;
  attributeDefinitionId: string;
  value: string | number | boolean | null;
};

export type FieldBehaviorRuleDefinition = {
  id: string;
  organizationId: string;
  documentTypeId: string | null;
  targetEntity: string;
  fieldName: string;
  workflowState: string | null;
  visible: boolean;
  readOnly: boolean;
  required: boolean;
  defaultValue: string | number | boolean | null;
  validationExpression: string | null;
  permissionCode: string | null;
  priority: number;
  active: boolean;
};

export type FieldBehaviorContext = {
  documentTypeId?: string | null;
  targetEntity: string;
  workflowState?: string | null;
  permissionCodes?: string[];
};

export type ResolvedFieldBehavior = {
  fieldName: string;
  visible: boolean;
  hidden: boolean;
  readOnly: boolean;
  required: boolean;
  defaultValue: string | number | boolean | null;
  validationExpression: string | null;
  appliedRuleIds: string[];
};

export type ConfigurationValidationIssue = {
  field: string;
  code: string;
  message: string;
};

export type ConfigurationValidationResult = {
  valid: boolean;
  issues: ConfigurationValidationIssue[];
  resolvedFields: ResolvedFieldBehavior[];
};

function tokenDateParts(date: Date) {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return { year, month };
}

export function numberingScopeKey(sequence: NumberingSequenceDefinition, context: NumberingContext): string {
  const parts = [sequence.scopeOrganization ? context.organizationId : "global", context.documentType.id];
  const { year, month } = tokenDateParts(context.now ?? new Date());
  if (sequence.scopeYear || sequence.resetPolicy === "yearly" || sequence.resetPolicy === "monthly") {
    parts.push(year);
  }
  if (sequence.scopeMonth || sequence.resetPolicy === "monthly") {
    parts.push(month);
  }
  if (sequence.scopeLocation) {
    parts.push(context.locationCode?.trim() || "no-location");
  }
  return parts.join(":");
}

export function renderNumberingPrefix(sequence: NumberingSequenceDefinition, context: NumberingContext): string {
  const { year, month } = tokenDateParts(context.now ?? new Date());
  return sequence.prefix
    .replaceAll("{ORG}", context.organizationId.toUpperCase())
    .replaceAll("{DOCTYPE}", context.documentType.code.toUpperCase())
    .replaceAll("{CATEGORY}", context.documentType.category.toUpperCase())
    .replaceAll("{YYYY}", year)
    .replaceAll("{YY}", year.slice(-2))
    .replaceAll("{MM}", month)
    .replaceAll("{LOC}", (context.locationCode ?? "").toUpperCase());
}

export function generateDocumentNumber(
  sequence: NumberingSequenceDefinition,
  context: NumberingContext
): NumberingGeneration {
  const scopeKey = numberingScopeKey(sequence, context);
  const currentNumber = sequence.lastScopeKey && sequence.lastScopeKey !== scopeKey ? 1 : sequence.nextNumber;
  const renderedPrefix = renderNumberingPrefix(sequence, context);
  const documentNumber = `${renderedPrefix}${String(currentNumber).padStart(sequence.padLength, "0")}${sequence.suffix}`;
  return {
    documentNumber,
    scopeKey,
    nextNumber: currentNumber + sequence.incrementBy,
    renderedPrefix
  };
}

export function resolveFieldBehavior(
  rules: FieldBehaviorRuleDefinition[],
  context: FieldBehaviorContext
): ResolvedFieldBehavior[] {
  const permissionCodes = new Set(context.permissionCodes ?? []);
  const byField = new Map<string, ResolvedFieldBehavior>();
  const matchingRules = rules
    .filter((rule) => rule.active)
    .filter((rule) => rule.targetEntity === context.targetEntity)
    .filter((rule) => !rule.documentTypeId || rule.documentTypeId === context.documentTypeId)
    .filter((rule) => !rule.workflowState || rule.workflowState === context.workflowState)
    .sort((left, right) => left.priority - right.priority);

  for (const rule of matchingRules) {
    const permissionAllows = !rule.permissionCode || permissionCodes.has(rule.permissionCode);
    const existing = byField.get(rule.fieldName) ?? {
      fieldName: rule.fieldName,
      visible: true,
      hidden: false,
      readOnly: false,
      required: false,
      defaultValue: null,
      validationExpression: null,
      appliedRuleIds: []
    };
    existing.visible = permissionAllows ? rule.visible : false;
    existing.hidden = !existing.visible;
    existing.readOnly = rule.readOnly || !permissionAllows;
    existing.required = permissionAllows && rule.required;
    existing.defaultValue = rule.defaultValue;
    existing.validationExpression = rule.validationExpression;
    existing.appliedRuleIds = [...existing.appliedRuleIds, rule.id];
    byField.set(rule.fieldName, existing);
  }

  return [...byField.values()].sort((left, right) => left.fieldName.localeCompare(right.fieldName));
}

export function requiredAttributeDefinitionsForContext(
  attributeSets: AttributeSetDefinition[],
  attributes: AttributeDefinition[],
  appliesTo: Partial<Record<AttributeSetDefinition["appliesTo"], string>>
): AttributeDefinition[] {
  const attributeById = new Map(attributes.filter((attribute) => attribute.active).map((attribute) => [attribute.id, attribute]));
  const requiredIds = new Set<string>();
  for (const set of attributeSets.filter((candidate) => candidate.active)) {
    if (appliesTo[set.appliesTo] !== set.appliesToValue) {
      continue;
    }
    for (const attributeId of set.attributeDefinitionIds) {
      const attribute = attributeById.get(attributeId);
      if (attribute?.required) {
        requiredIds.add(attributeId);
      }
    }
  }
  return [...requiredIds].map((id) => attributeById.get(id)).filter((attribute): attribute is AttributeDefinition => Boolean(attribute));
}

export function validateConfiguredRecord(input: {
  values: Record<string, unknown>;
  attributeValues?: Record<string, unknown>;
  resolvedFields: ResolvedFieldBehavior[];
  requiredAttributes?: AttributeDefinition[];
}): ConfigurationValidationResult {
  const issues: ConfigurationValidationIssue[] = [];
  for (const field of input.resolvedFields) {
    if (field.required && isEmptyValue(input.values[field.fieldName])) {
      issues.push({
        field: field.fieldName,
        code: "field_required",
        message: `${field.fieldName} is required by configuration.`
      });
    }
    if (field.readOnly && Object.prototype.hasOwnProperty.call(input.values, field.fieldName)) {
      issues.push({
        field: field.fieldName,
        code: "field_read_only",
        message: `${field.fieldName} is read-only for this state or permission.`
      });
    }
    if (field.validationExpression && !isEmptyValue(input.values[field.fieldName])) {
      const pattern = new RegExp(field.validationExpression);
      if (!pattern.test(String(input.values[field.fieldName]))) {
        issues.push({
          field: field.fieldName,
          code: "field_validation_failed",
          message: `${field.fieldName} does not match the configured validation rule.`
        });
      }
    }
  }

  for (const attribute of input.requiredAttributes ?? []) {
    if (isEmptyValue(input.attributeValues?.[attribute.code])) {
      issues.push({
        field: `attributes.${attribute.code}`,
        code: "attribute_required",
        message: `${attribute.label} is required by configuration.`
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    resolvedFields: input.resolvedFields
  };
}

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === "string" && value.trim().length === 0);
}
