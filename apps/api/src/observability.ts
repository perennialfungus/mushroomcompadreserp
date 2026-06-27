import type { FastifyRequest } from "fastify";
import type { ApiConfig } from "./config.js";

export type ErrorReporter = {
  report(error: unknown, context: Record<string, unknown>): Promise<void>;
};

export function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return {
    name: "UnknownError",
    message: String(error)
  };
}

export function createErrorReporter(config: Pick<ApiConfig, "OBSERVABILITY_ENDPOINT" | "SENTRY_DSN">): ErrorReporter {
  const endpoint = config.OBSERVABILITY_ENDPOINT ?? config.SENTRY_DSN;

  return {
    async report(error, context) {
      if (!endpoint) {
        return;
      }

      try {
        await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            level: "error",
            error: serializeError(error),
            context,
            occurredAt: new Date().toISOString()
          })
        });
      } catch {
        // Error reporting must never take down request handling.
      }
    }
  };
}

export function requestLogContext(request: FastifyRequest) {
  return {
    requestId: request.id,
    method: request.method,
    path: request.url,
    userId: request.userContext?.userId ?? null,
    organizationId: request.userContext?.organizationId ?? null,
    roles: request.userContext?.roles.map((role) => role.code) ?? []
  };
}
