import { describe, expect, it } from "vitest";
import {
  defaultFieldPermissionRules,
  defaultPermissionSets,
  explainPermission,
  fieldControlState,
  redactFieldsForPermissions,
  resolveEffectivePermissions,
  type UserPermissionOverride
} from "./permissions.js";

describe("permission resolution", () => {
  const permissionSets = defaultPermissionSets("org-test");

  it("resolves role permission sets to the highest effective grant", () => {
    const effective = resolveEffectivePermissions({
      roleCodes: ["production_farm", "auditor"],
      permissionSets
    });

    expect(effective.find((grant) => grant.permissionCode === "production.orders")?.level).toBe("manage");
    expect(effective.find((grant) => grant.permissionCode === "reports.exports")?.level).toBe("export");
  });

  it("lets explicit user denies override role grants", () => {
    const overrides: UserPermissionOverride[] = [
      {
        id: "override-deny-qc",
        organizationId: "org-test",
        userId: "user-qc",
        permissionCode: "quality.release.approve",
        level: "deny",
        reason: "Training not complete"
      }
    ];
    const effective = resolveEffectivePermissions({
      roleCodes: ["qc"],
      permissionSets,
      userOverrides: overrides,
      userId: "user-qc"
    });

    const resolution = explainPermission({
      effectivePermissions: effective,
      permissionCode: "quality.release.approve",
      requiredLevel: "approve"
    });

    expect(resolution.allowed).toBe(false);
    expect(resolution.reasonCode).toBe("permission_level_insufficient");
    expect(resolution.effectiveLevel).toBe("deny");
    expect(resolution.sources).toContain("user_override:override-deny-qc");
  });

  it("denies actions outside row/location scope", () => {
    const effective = resolveEffectivePermissions({
      roleCodes: ["packing_fulfillment"],
      permissionSets,
      accessScopeRules: [
        {
          id: "scope-pack",
          organizationId: "org-test",
          subjectType: "user",
          subjectId: "user-pack",
          dimension: "location",
          allowedIds: ["loc-pack"]
        }
      ],
      userId: "user-pack"
    });

    expect(
      explainPermission({
        effectivePermissions: effective,
        permissionCode: "inventory.stock",
        requiredLevel: "use",
        locationId: "loc-pack"
      }).allowed
    ).toBe(true);
    expect(
      explainPermission({
        effectivePermissions: effective,
        permissionCode: "inventory.stock",
        requiredLevel: "use",
        locationId: "loc-farm"
      })
    ).toMatchObject({
      allowed: false,
      reasonCode: "permission_scope_mismatch"
    });
  });

  it("redacts hidden fields and reports read-only field groups", () => {
    const effective = resolveEffectivePermissions({
      roleCodes: ["packing_fulfillment"],
      permissionSets
    });

    const redacted = redactFieldsForPermissions(
      {
        sku: "MC-TIN-001",
        shopifyVariantGid: "gid://shopify/ProductVariant/1",
        shopifyInventoryItemGid: "gid://shopify/InventoryItem/1"
      },
      defaultFieldPermissionRules,
      effective
    );

    expect(redacted).toEqual({
      sku: "MC-TIN-001",
      shopifyVariantGid: null,
      shopifyInventoryItemGid: null
    });
    expect(
      fieldControlState({
        fieldGroup: "customer_pricing",
        rules: defaultFieldPermissionRules,
        effectivePermissions: effective
      })
    ).toMatchObject({
      hidden: true,
      readOnly: true
    });
  });
});
