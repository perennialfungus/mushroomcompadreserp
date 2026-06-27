import type { LoadedUserContext, UserContext } from "./types.js";

export function toUserContext(loaded: LoadedUserContext): UserContext {
  const roles = loaded.roles.map((assignment) => ({
    code: assignment.role.code,
    name: assignment.role.name,
    locationId: assignment.locationId
  }));

  return {
    authUserId: loaded.user.authUserId,
    userId: loaded.user.id,
    email: loaded.user.email,
    displayName: loaded.user.displayName,
    locale: loaded.user.locale ?? loaded.organization.defaultLocale,
    organization: loaded.organization,
    organizationId: loaded.organization.id,
    roles,
    locationPermissions: roles.map((role) => ({
      roleCode: role.code,
      locationId: role.locationId
    }))
  };
}
