import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AuthenticatedRequest } from "../types.js";
import { applyPowerSyncUpload, parsePowerSyncUploadBody } from "../powersync-upload.js";

type PowerSyncRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

export async function powerSyncRoutes(app: FastifyInstance, options: PowerSyncRoutesOptions): Promise<void> {
  const canUploadOperationalWrites = requireRoles({
    anyOf: ["production_farm", "packing_fulfillment"]
  });

  app.post(
    "/api/powersync/upload",
    {
      preHandler: [options.requireUserContext, canUploadOperationalWrites],
      schema: {
        tags: ["powersync"],
        summary: "Apply PowerSync upload queue operations",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = parsePowerSyncUploadBody((request as AuthenticatedRequest).body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: "bad_request",
          message: "Invalid PowerSync upload payload"
        });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const response = await applyPowerSyncUpload(
        options.dataStore,
        userContext,
        parsed.data,
        request.id,
        (payload) => request.log.warn({ conflict: payload }, "PowerSync upload command was not applied")
      );

      return reply.code(200).send(response);
    }
  );
}
