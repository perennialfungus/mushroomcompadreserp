CREATE TYPE "dashboard_role" AS ENUM ('owner_admin', 'production', 'qc', 'packing_fulfillment', 'sales_wholesale', 'purchasing');
CREATE TYPE "dashboard_widget_type" AS ENUM ('exception_list', 'production_queue', 'qc_queue', 'fulfillment_risk', 'sales_promises', 'purchasing_risk', 'shopify_health', 'sku_readiness', 'work_center_load');
CREATE TYPE "alert_rule_type" AS ENUM ('late_production', 'qc_overdue', 'expiring_lot', 'blocked_shopify_sync', 'low_stock', 'supplier_document_expiry', 'open_capa_due', 'overloaded_work_center', 'sku_readiness_gap');
CREATE TYPE "alert_severity" AS ENUM ('info', 'warning', 'critical');
CREATE TYPE "alert_event_status" AS ENUM ('open', 'acknowledged', 'snoozed', 'resolved');
CREATE TYPE "alert_digest_preference" AS ENUM ('none', 'daily', 'weekly');

CREATE TABLE "dashboard_widgets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "user_id" uuid REFERENCES "users"("id"),
  "role" "dashboard_role" NOT NULL,
  "widget_type" "dashboard_widget_type" NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "settings_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "cache_ttl_seconds" integer DEFAULT 120 NOT NULL,
  "cached_at" timestamp with time zone,
  "cache_key" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "alert_rules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "rule_type" "alert_rule_type" NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "severity" "alert_severity" NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "roles_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "threshold_days" integer,
  "threshold_quantity" numeric(18, 6),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "alert_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "rule_id" uuid NOT NULL REFERENCES "alert_rules"("id"),
  "rule_type" "alert_rule_type" NOT NULL,
  "severity" "alert_severity" NOT NULL,
  "status" "alert_event_status" DEFAULT 'open' NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "source_type" text NOT NULL,
  "source_id" text NOT NULL,
  "source_label" text NOT NULL,
  "dedupe_key" text NOT NULL,
  "action_href" text NOT NULL,
  "role_targets_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
  "due_at" timestamp with time zone,
  "acknowledged_at" timestamp with time zone,
  "acknowledged_by" uuid REFERENCES "users"("id"),
  "snoozed_until" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE "alert_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id"),
  "user_id" uuid NOT NULL REFERENCES "users"("id"),
  "role" "dashboard_role" NOT NULL,
  "rule_type" "alert_rule_type" NOT NULL,
  "in_app_enabled" boolean DEFAULT true NOT NULL,
  "digest_preference" "alert_digest_preference" DEFAULT 'daily' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_at" timestamp with time zone,
  "version" integer DEFAULT 1 NOT NULL
);

CREATE INDEX "dashboard_widgets_role_idx" ON "dashboard_widgets" ("organization_id", "role", "enabled");
CREATE UNIQUE INDEX "dashboard_widgets_user_widget_unique" ON "dashboard_widgets" ("organization_id", "user_id", "role", "widget_type");
CREATE UNIQUE INDEX "alert_rules_org_type_unique" ON "alert_rules" ("organization_id", "rule_type");
CREATE INDEX "alert_rules_enabled_idx" ON "alert_rules" ("organization_id", "enabled");
CREATE UNIQUE INDEX "alert_events_dedupe_unique" ON "alert_events" ("organization_id", "dedupe_key");
CREATE INDEX "alert_events_status_idx" ON "alert_events" ("organization_id", "status", "severity");
CREATE INDEX "alert_events_source_idx" ON "alert_events" ("organization_id", "source_type", "source_id");
CREATE UNIQUE INDEX "alert_subscriptions_user_rule_unique" ON "alert_subscriptions" ("organization_id", "user_id", "role", "rule_type");
CREATE INDEX "alert_subscriptions_user_idx" ON "alert_subscriptions" ("organization_id", "user_id");
