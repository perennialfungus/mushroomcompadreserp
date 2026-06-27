import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import type { RoleCode, UserContext } from "./types.js";

export type RoleGuardOptions = {
  anyOf: RoleCode[];
  locationId?: string | null;
  allowOwnerAdmin?: boolean;
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
        message: "User does not have the required role"
      });
    }
  };
}
