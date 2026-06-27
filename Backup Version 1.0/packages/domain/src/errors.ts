export type DomainErrorCategory =
  | "validation"
  | "authorization"
  | "conflict"
  | "idempotency"
  | "external_integration";

export type DomainErrorCode =
  | "VALIDATION_FAILED"
  | "AUTHORIZATION_FAILED"
  | "CONFLICT"
  | "IDEMPOTENCY_CONFLICT"
  | "EXTERNAL_INTEGRATION_FAILED"
  | "INVALID_LIFECYCLE_TRANSITION"
  | "REGULATED_METADATA_REQUIRED"
  | "UNSUPPORTED_UNIT_CONVERSION";

export interface DomainErrorOptions {
  readonly code: DomainErrorCode;
  readonly category: DomainErrorCategory;
  readonly message: string;
  readonly details?: Record<string, unknown> | undefined;
  readonly cause?: unknown;
}

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly category: DomainErrorCategory;
  readonly details: Record<string, unknown> | undefined;

  constructor(options: DomainErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = new.target.name;
    this.code = options.code;
    this.category = options.category;
    this.details = options.details;
  }
}

export class DomainValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ code: "VALIDATION_FAILED", category: "validation", message, details });
  }
}

export class DomainAuthorizationError extends DomainError {
  constructor(message = "The actor is not authorized for this action.", details?: Record<string, unknown>) {
    super({ code: "AUTHORIZATION_FAILED", category: "authorization", message, details });
  }
}

export class DomainConflictError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ code: "CONFLICT", category: "conflict", message, details });
  }
}

export class DomainIdempotencyError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ code: "IDEMPOTENCY_CONFLICT", category: "idempotency", message, details });
  }
}

export class DomainExternalIntegrationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super({
      code: "EXTERNAL_INTEGRATION_FAILED",
      category: "external_integration",
      message,
      details,
      cause
    });
  }
}

export class InvalidLifecycleTransitionError extends DomainError {
  constructor(entity: string, from: string, to: string) {
    super({
      code: "INVALID_LIFECYCLE_TRANSITION",
      category: "conflict",
      message: `Cannot transition ${entity} from ${from} to ${to}.`,
      details: { entity, from, to }
    });
    this.name = "InvalidLifecycleTransitionError";
  }
}

export class RegulatedTransitionMetadataError extends DomainError {
  constructor(entity: string, from: string, to: string) {
    super({
      code: "REGULATED_METADATA_REQUIRED",
      category: "validation",
      message: `Transition ${entity} from ${from} to ${to} requires actor and reason metadata.`,
      details: { entity, from, to }
    });
    this.name = "RegulatedTransitionMetadataError";
  }
}
