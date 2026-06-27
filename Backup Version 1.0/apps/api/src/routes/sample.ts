import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { writeAuditEvent } from "../audit.js";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";

type SampleRouteOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const userContextResponseSchema = {
  type: "object",
  required: ["userContext"],
  properties: {
    userContext: {
      type: "object",
      required: ["userId", "organizationId", "roles", "locationPermissions"],
      properties: {
        authUserId: { type: "string" },
        userId: { type: "string" },
        email: { type: "string" },
        displayName: { type: "string" },
        locale: { type: "string" },
        organizationId: { type: "string" },
        organization: { type: "object", additionalProperties: true },
        roles: {
          type: "array",
          items: {
            type: "object",
            required: ["code", "name"],
            properties: {
              code: { type: "string" },
              name: { type: "string" },
              locationId: { type: ["string", "null"] }
            }
          }
        },
        locationPermissions: {
          type: "array",
          items: {
            type: "object",
            required: ["roleCode"],
            properties: {
              roleCode: { type: "string" },
              locationId: { type: ["string", "null"] }
            }
          }
        }
      }
    }
  }
};

export async function sampleRoutes(app: FastifyInstance, options: SampleRouteOptions): Promise<void> {
  app.get(
    "/api/sample/protected",
    {
      preHandler: [options.requireUserContext],
      schema: {
        tags: ["sample"],
        summary: "Sample protected route",
        security: bearerSecurity,
        response: {
          200: userContextResponseSchema
        }
      }
    },
    async (request) => ({
      userContext: (request as AuthenticatedRequest).userContext
    })
  );

  app.get(
    "/api/sample/admin",
    {
      preHandler: [options.requireUserContext, requireRoles({ anyOf: ["owner_admin"] })],
      schema: {
        tags: ["sample"],
        summary: "Sample owner/admin route",
        security: bearerSecurity,
        response: {
          200: userContextResponseSchema
        }
      }
    },
    async (request) => ({
      userContext: (request as AuthenticatedRequest).userContext
    })
  );

  app.post(
    "/api/sample/audit-events",
    {
      preHandler: [options.requireUserContext, requireRoles({ anyOf: ["owner_admin"] })],
      schema: {
        tags: ["sample"],
        summary: "Sample audit event writer",
        security: bearerSecurity,
        body: {
          type: "object",
          required: ["eventType", "subjectType", "subjectId"],
          properties: {
            eventType: { type: "string", minLength: 1 },
            subjectType: { type: "string", minLength: 1 },
            subjectId: { type: "string", minLength: 1 },
            beforeJson: {},
            afterJson: {}
          }
        },
        response: {
          201: {
            type: "object",
            required: ["auditEvent"],
            properties: {
              auditEvent: {
                type: "object",
                required: ["id", "organizationId", "actorUserId", "eventType", "subjectType", "subjectId"],
                properties: {
                  id: { type: "string" },
                  organizationId: { type: "string" },
                  actorUserId: { type: "string" },
                  eventType: { type: "string" },
                  subjectType: { type: "string" },
                  subjectId: { type: "string" },
                  beforeJson: {},
                  afterJson: {},
                  occurredAt: { type: "string", format: "date-time" },
                  requestId: { type: ["string", "null"] }
                }
              }
            }
          }
        }
      }
    },
    async (request, reply) => {
      const body = request.body as {
        eventType: string;
        subjectType: string;
        subjectId: string;
        beforeJson?: unknown;
        afterJson?: unknown;
      };

      const auditEvent = await options.dataStore.withTransaction((tx) =>
        writeAuditEvent(tx, (request as AuthenticatedRequest).userContext, {
          ...body,
          requestId: request.id
        })
      );

      return reply.code(201).send({ auditEvent });
    }
  );
}
