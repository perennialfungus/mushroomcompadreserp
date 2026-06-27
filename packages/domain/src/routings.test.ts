import { describe, expect, it } from "vitest";
import { DomainConflictError, DomainValidationError } from "./errors.js";
import { calculateOperationDurationMinutes, transitionProductionOperationRun } from "./routings.js";

const baseRun = {
  status: "ready" as const,
  startedAt: null,
  pausedAt: null,
  completedAt: null,
  outputQuantity: 0,
  scrapQuantity: 0,
  reworkQuantity: 0
};

describe("production operation transitions", () => {
  it("starts, pauses, resumes, and completes an operation with output capture", () => {
    const started = transitionProductionOperationRun({
      run: baseRun,
      action: "start",
      at: new Date("2026-06-26T08:00:00.000Z")
    });
    const paused = transitionProductionOperationRun({
      run: started,
      action: "pause",
      at: new Date("2026-06-26T08:15:00.000Z")
    });
    const resumed = transitionProductionOperationRun({
      run: paused,
      action: "resume",
      at: new Date("2026-06-26T08:20:00.000Z")
    });
    const completed = transitionProductionOperationRun({
      run: resumed,
      action: "complete",
      at: new Date("2026-06-26T09:00:00.000Z"),
      outputQuantity: 44,
      scrapQuantity: 2,
      reworkQuantity: 1
    });

    expect(completed.status).toBe("completed");
    expect(completed.startedAt?.toISOString()).toBe("2026-06-26T08:00:00.000Z");
    expect(completed.completedAt?.toISOString()).toBe("2026-06-26T09:00:00.000Z");
    expect(completed.outputQuantity).toBe(44);
    expect(completed.scrapQuantity).toBe(2);
    expect(completed.reworkQuantity).toBe(1);
  });

  it("rejects invalid status transitions", () => {
    expect(() =>
      transitionProductionOperationRun({
        run: { ...baseRun, status: "completed" },
        action: "start"
      })
    ).toThrow(DomainConflictError);
  });

  it("requires output, scrap, or rework on completion", () => {
    expect(() =>
      transitionProductionOperationRun({
        run: { ...baseRun, status: "in_progress", startedAt: new Date("2026-06-26T08:00:00.000Z") },
        action: "complete",
        outputQuantity: 0,
        scrapQuantity: 0,
        reworkQuantity: 0
      })
    ).toThrow(DomainValidationError);
  });

  it("calculates positive duration in minutes", () => {
    expect(
      calculateOperationDurationMinutes(
        new Date("2026-06-26T08:00:00.000Z"),
        new Date("2026-06-26T09:30:30.000Z")
      )
    ).toBe(90.5);
  });
});
