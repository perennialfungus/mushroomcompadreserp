import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.string().default("development"),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.string().default("info"),
  OBSERVABILITY_ENDPOINT: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  POWERSYNC_URL: z.string().url().optional(),
  SUPABASE_JWT_SECRET: z.string().min(1).optional(),
  SUPABASE_JWKS_URL: z.string().url().optional(),
  SUPABASE_JWT_ISSUER: z.string().optional(),
  SUPABASE_JWT_AUDIENCE: z.string().optional(),
  SHOPIFY_APP_SECRET: z.string().min(1).optional(),
  SHOPIFY_ACCESS_TOKEN: z.string().min(1).optional(),
  SHOPIFY_SHOP_DOMAIN: z.string().min(1).optional(),
  SHOPIFY_ORGANIZATION_ID: z.string().min(1).default("org-mc")
});

type ParsedApiConfig = z.infer<typeof configSchema>;
export type ApiConfig = Omit<ParsedApiConfig, "SHOPIFY_ORGANIZATION_ID"> & {
  SHOPIFY_ORGANIZATION_ID?: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const parsed = configSchema.parse(env);

  if (parsed.NODE_ENV === "production" && !parsed.SUPABASE_JWT_SECRET && !parsed.SUPABASE_JWKS_URL) {
    throw new Error("SUPABASE_JWT_SECRET or SUPABASE_JWKS_URL is required");
  }

  return parsed;
}
