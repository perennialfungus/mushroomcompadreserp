import { DomainConflictError, DomainValidationError } from "./errors.js";

export const productionOperationStatuses = [
  "pending",
  "ready",
  "in_progress",
  "paused",
  "completed",
  "cancelled"
] as const;

export type ProductionOperationStatus = (typeof productionOperationStatuses)[number];
export type ProductionOperationAction = "start" | "pause" | "resume" | "complete" | "cancel";

export type ProductionOperationRunState = {
  status: ProductionOperationStatus;
  startedAt: Date | null;
  pausedAt: Date | null;
  completedAt: Date | null;
  outputQuantity: number;
  scrapQuantity: number;
  reworkQuantity: number;
};

export type ProductionOperationTransitionInput = {
  run: ProductionOperationRunState;
  action: ProductionOperationAction;
  at?: Date;
  outputQuantity?: number | null | undefined;
  scrapQuantity?: number | null | undefined;
  reworkQuantity?: number | null | undefined;
};

export type ProductionOperationTransitionResult = ProductionOperationRunState & {
  changedAt: Date;
};

const allowedTransitions: Record<ProductionOperationAction, ProductionOperationStatus[]> = {
  start: ["ready", "pending"],
  pause: ["in_progress"],
  resume: ["paused"],
  complete: ["in_progress", "paused"],
  cancel: ["pending", "ready", "in_progress", "paused"]
};

export function transitionProductionOperationRun(
  input: ProductionOperationTransitionInput
): ProductionOperationTransitionResult {
  const changedAt = input.at ?? new Date();
  const allowedFrom = allowedTransitions[input.action];
  if (!allowedFrom.includes(input.run.status)) {
    throw new DomainConflictError("Production operation cannot transition from its current status.", {
      action: input.action,
      status: input.run.status,
      allowedFrom
    });
  }

  const next: ProductionOperationTransitionResult = {
    ...input.run,
    changedAt
  };

  switch (input.action) {
    case "start":
      next.status = "in_progress";
      next.startedAt = input.run.startedAt ?? changedAt;
      next.pausedAt = null;
      break;
    case "pause":
      next.status = "paused";
      next.pausedAt = changedAt;
      break;
    case "resume":
      next.status = "in_progress";
      next.pausedAt = null;
      break;
    case "cancel":
      next.status = "cancelled";
      break;
    case "complete": {
      const outputQuantity = input.outputQuantity ?? input.run.outputQuantity;
      const scrapQuantity = input.scrapQuantity ?? input.run.scrapQuantity;
      const reworkQuantity = input.reworkQuantity ?? input.run.reworkQuantity;
      assertNonNegativeQuantity(outputQuantity, "outputQuantity");
      assertNonNegativeQuantity(scrapQuantity, "scrapQuantity");
      assertNonNegativeQuantity(reworkQuantity, "reworkQuantity");
      if (outputQuantity + scrapQuantity + reworkQuantity <= 0) {
        throw new DomainValidationError("Completed operations require output, scrap, or rework quantity.", {
          outputQuantity,
          scrapQuantity,
          reworkQuantity
        });
      }
      next.status = "completed";
      next.outputQuantity = outputQuantity;
      next.scrapQuantity = scrapQuantity;
      next.reworkQuantity = reworkQuantity;
      next.completedAt = changedAt;
      next.pausedAt = null;
      break;
    }
  }

  return next;
}

export function calculateOperationDurationMinutes(startedAt: Date | null, endedAt: Date | null): number {
  if (!startedAt || !endedAt || endedAt.getTime() <= startedAt.getTime()) {
    return 0;
  }
  return Math.round(((endedAt.getTime() - startedAt.getTime()) / 60000) * 100) / 100;
}

export function operationRunIsOpen(status: ProductionOperationStatus): boolean {
  return status === "in_progress" || status === "paused";
}

function assertNonNegativeQuantity(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new DomainValidationError("Operation quantities must be non-negative numbers.", { field, value });
  }
}
