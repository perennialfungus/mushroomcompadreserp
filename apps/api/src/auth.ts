import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyOptions } from "jose";
import type { ApiConfig } from "./config.js";
import type { ApiDataStore, SupabaseAuthClaims } from "./types.js";
import { toUserContext } from "./user-context.js";

const bearerPrefix = "Bearer ";

export type AuthVerifier = {
  verify(token: string): Promise<SupabaseAuthClaims>;
};

export function createDevelopmentTokenVerifier(): AuthVerifier {
  const tokenMap = new Map([
    ["test-owner", "auth-owner"],
    ["owner-token", "auth-owner"],
    ["test-staff", "auth-staff"],
    ["staff-token", "auth-staff"]
  ]);

  return {
    async verify(token: string): Promise<SupabaseAuthClaims> {
      const mappedAuthUserId = tokenMap.get(token) ?? (token.startsWith("dev:") ? token.slice(4) : null);

      if (!mappedAuthUserId) {
        throw new Error("Unknown development token");
      }

      return {
        authUserId: mappedAuthUserId,
        email: null
      };
    }
  };
}

export function createSupabaseJwtVerifier(config: Pick<ApiConfig, "SUPABASE_JWT_SECRET" | "SUPABASE_JWKS_URL" | "SUPABASE_JWT_ISSUER" | "SUPABASE_JWT_AUDIENCE">): AuthVerifier {
  if (!config.SUPABASE_JWT_SECRET && !config.SUPABASE_JWKS_URL) {
    return createDevelopmentTokenVerifier();
  }

  return {
    async verify(token: string): Promise<SupabaseAuthClaims> {
      const verifyOptions: JWTVerifyOptions = {};

      if (config.SUPABASE_JWT_ISSUER) {
        verifyOptions.issuer = config.SUPABASE_JWT_ISSUER;
      }

      if (config.SUPABASE_JWT_AUDIENCE) {
        verifyOptions.audience = config.SUPABASE_JWT_AUDIENCE;
      }

      const { payload } = config.SUPABASE_JWKS_URL
        ? await jwtVerify(token, createRemoteJWKSet(new URL(config.SUPABASE_JWKS_URL)), verifyOptions)
        : await jwtVerify(token, new TextEncoder().encode(config.SUPABASE_JWT_SECRET ?? ""), verifyOptions);

      if (!payload.sub) {
        throw new Error("Supabase JWT is missing subject");
      }

      return {
        authUserId: payload.sub,
        email: typeof payload.email === "string" ? payload.email : null
      };
    }
  };
}

export function extractBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;

  if (!header || !header.startsWith(bearerPrefix)) {
    return null;
  }

  const token = header.slice(bearerPrefix.length).trim();
  return token.length > 0 ? token : null;
}

export function requireUserContext(deps: {
  dataStore: ApiDataStore;
  verifier: AuthVerifier;
}): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const token = extractBearerToken(request);

    if (!token) {
      await reply.code(401).send({
        error: "unauthenticated",
        message: "Bearer token is required"
      });
      return;
    }

    let claims: SupabaseAuthClaims;
    try {
      claims = await deps.verifier.verify(token);
    } catch (error) {
      request.log.warn({ error }, "JWT verification failed");
      await reply.code(401).send({
        error: "unauthenticated",
        message: "Bearer token is invalid"
      });
      return;
    }

    const loaded = await deps.dataStore.findUserContextByAuthUserId(claims.authUserId);

    if (!loaded || loaded.user.status !== "active") {
      await reply.code(403).send({
        error: "unauthorized",
        message: "Authenticated user is not active in this application"
      });
      return;
    }

    request.userContext = toUserContext(loaded);
  };
}
