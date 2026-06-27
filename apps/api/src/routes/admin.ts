import type { FastifyInstance, preHandlerHookHandler } from "fastify";
import { z } from "zod";
import { writeAuditEvent } from "../audit.js";
import { requireRoles } from "../rbac.js";
import type { ApiDataStore, AppUserUpdateInput, AuthenticatedRequest, RoleCode } from "../types.js";

type AdminRoutesOptions = {
  dataStore: ApiDataStore;
  requireUserContext: preHandlerHookHandler;
};

const bearerSecurity = [{ bearerAuth: [] }];

const roleAssignmentInputSchema = z.object({
  roleId: z.string().min(1),
  locationId: z.string().min(1).nullable()
});

const userUpdateSchema = z.object({
  displayName: z.string().trim().min(1).max(160).optional(),
  status: z.enum(["active", "invited", "disabled"]).optional(),
  locale: z.enum(["en", "pt"]).nullable().optional(),
  roleAssignments: z.array(roleAssignmentInputSchema).optional()
});

const profileUpdateSchema = z.object({
  locale: z.enum(["en", "pt"])
});

function serializeUser(user: Awaited<ReturnType<ApiDataStore["getAppUser"]>>) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    authUserId: user.authUserId,
    organizationId: user.organizationId,
    email: user.email,
    displayName: user.displayName,
    status: user.status,
    locale: user.locale,
    roles: user.roles.map((assignment) => ({
      id: assignment.id,
      roleId: assignment.roleId,
      roleCode: assignment.role.code,
      roleName: assignment.role.name,
      locationId: assignment.locationId,
      locationName: assignment.location?.name ?? null
    }))
  };
}

export async function adminRoutes(app: FastifyInstance, options: AdminRoutesOptions): Promise<void> {
  const adminOnly = requireRoles({ anyOf: ["owner_admin"] });

  app.get(
    "/api/me",
    {
      preHandler: [options.requireUserContext],
      schema: {
        tags: ["auth"],
        summary: "Current authenticated app user context",
        security: bearerSecurity
      }
    },
    async (request) => ({
      userContext: (request as AuthenticatedRequest).userContext
    })
  );

  app.patch(
    "/api/me/profile",
    {
      preHandler: [options.requireUserContext],
      schema: {
        tags: ["auth"],
        summary: "Update current user's profile preferences",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = profileUpdateSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "bad_request",
          message: "Invalid profile update"
        });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const updated = await options.dataStore.updateUserLocale(userContext.userId, parsed.data.locale);

      if (!updated) {
        return reply.code(404).send({
          error: "not_found",
          message: "User was not found"
        });
      }

      return {
        user: updated
      };
    }
  );

  app.get(
    "/api/admin/users",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: {
        tags: ["admin"],
        summary: "List app users",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const users = await options.dataStore.listAppUsers(userContext.organizationId);
      return {
        users: users.map((user) => serializeUser(user))
      };
    }
  );

  app.get(
    "/api/admin/users/:userId",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: {
        tags: ["admin"],
        summary: "Get app user detail",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { userId: string };
      const user = await options.dataStore.getAppUser(userContext.organizationId, params.userId);

      if (!user) {
        return reply.code(404).send({
          error: "not_found",
          message: "User was not found"
        });
      }

      return { user: serializeUser(user) };
    }
  );

  app.patch(
    "/api/admin/users/:userId",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: {
        tags: ["admin"],
        summary: "Update app user profile and role assignments",
        security: bearerSecurity
      }
    },
    async (request, reply) => {
      const parsed = userUpdateSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "bad_request",
          message: "Invalid user update"
        });
      }

      const userContext = (request as AuthenticatedRequest).userContext;
      const params = request.params as { userId: string };
      const beforeUser = await options.dataStore.getAppUser(userContext.organizationId, params.userId);

      if (!beforeUser) {
        return reply.code(404).send({
          error: "not_found",
          message: "User was not found"
        });
      }

      const updateInput: AppUserUpdateInput = {};

      if (parsed.data.displayName !== undefined) {
        updateInput.displayName = parsed.data.displayName;
      }

      if (parsed.data.status !== undefined) {
        updateInput.status = parsed.data.status;
      }

      if (parsed.data.locale !== undefined) {
        updateInput.locale = parsed.data.locale;
      }

      if (parsed.data.roleAssignments !== undefined) {
        updateInput.roleAssignments = parsed.data.roleAssignments;
      }

      let updated;
      try {
        updated = await options.dataStore.updateAppUser(userContext.organizationId, params.userId, updateInput);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("Unknown ")) {
          return reply.code(400).send({
            error: "bad_request",
            message: error.message
          });
        }

        throw error;
      }

      if (!updated) {
        return reply.code(404).send({
          error: "not_found",
          message: "User was not found"
        });
      }

      await options.dataStore.withTransaction((tx) =>
        writeAuditEvent(tx, userContext, {
          eventType: "user.updated",
          subjectType: "users",
          subjectId: params.userId,
          beforeJson: serializeUser(beforeUser),
          afterJson: serializeUser(updated),
          requestId: request.id
        })
      );

      return { user: serializeUser(updated) };
    }
  );

  app.get(
    "/api/admin/roles",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: {
        tags: ["admin"],
        summary: "List roles",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const roles = await options.dataStore.listRoles(userContext.organizationId);
      return {
        roles: roles.map((role) => ({
          ...role,
          code: role.code as RoleCode
        }))
      };
    }
  );

  app.get(
    "/api/admin/locations",
    {
      preHandler: [options.requireUserContext, adminOnly],
      schema: {
        tags: ["admin"],
        summary: "List locations for scoped role assignment",
        security: bearerSecurity
      }
    },
    async (request) => {
      const userContext = (request as AuthenticatedRequest).userContext;
      const locations = await options.dataStore.listLocations(userContext.organizationId);
      return { locations };
    }
  );
}
