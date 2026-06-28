import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import { explainPermission, type PermissionLevel } from "@mushroom-compadres/domain";
import type { RoleCode, UserContext } from "./types.js";

export type RoleGuardOptions = {
  anyOf: RoleCode[];
  locationId?: string | null;
  allowOwnerAdmin?: boolean;
};

export type PermissionGuardOptions = {
  permissionCode: string;
  level: PermissionLevel;
  locationId?: string | null | ((request: FastifyRequest) => string | null | undefined);
  scope?: (request: FastifyRequest) => Record<string, string | undefined | null>;
};

export function hasRole(
  userContext: UserContext,
  requiredRole: RoleCode,
  locationId?: string | null
): boolean {
  return userContext.roles.some((role) => {
    if (role.code !== requiredRole) {
      return false;
    }

    return role.locationId === null || locationId === undefined || locationId === null || role.locationId === locationId;
  });
}

export function hasAnyRole(userContext: UserContext, roles: RoleCode[], locationId?: string | null): boolean {
  return roles.some((role) => hasRole(userContext, role, locationId));
}

export function canAccessLocation(userContext: UserContext, locationId: string): boolean {
  return userContext.roles.some((role) => role.locationId === null || role.locationId === locationId);
}

export function requireRoles(options: RoleGuardOptions): preHandlerHookHandler {
  const allowOwnerAdmin = options.allowOwnerAdmin ?? true;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userContext) {
      await reply.code(500).send({
        error: "server_error",
        message: "RBAC guard requires request.userContext"
      });
      return;
    }

    const authorized =
      (allowOwnerAdmin && hasRole(request.userContext, "owner_admin", options.locationId)) ||
      hasAnyRole(request.userContext, options.anyOf, options.locationId);

    if (!authorized) {
      await reply.code(403).send({
        error: "forbidden",
        code: "role_required",
        message: "User does not have the required role",
        reason: "The signed-in user is missing one of the roles required by this endpoint."
      });
    }
  };
}

export function requirePermission(options: PermissionGuardOptions): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userContext) {
      await reply.code(500).send({
        error: "server_error",
        code: "missing_user_context",
        message: "Permission guard requires request.userContext"
      });
      return;
    }

    const locationId = typeof options.locationId === "function" ? options.locationId(request) : options.locationId;
    const rawScope = options.scope?.(request) ?? {};
    const scope = Object.fromEntries(
      Object.entries(rawScope).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0)
    );
    const resolution = explainPermission({
      effectivePermissions: request.userContext.effectivePermissions ?? [],
      permissionCode: options.permissionCode,
      requiredLevel: options.level,
      ...(locationId !== undefined ? { locationId } : {}),
      scope
    });

    if (!resolution.allowed) {
      await reply.code(403).send({
        error: "permission_denied",
        code: resolution.reasonCode,
        permissionCode: resolution.permissionCode,
        requiredLevel: resolution.requiredLevel,
        effectiveLevel: resolution.effectiveLevel,
        reason: resolution.reason,
        message: "You do not have access to perform this action."
      });
    }
  };
}
