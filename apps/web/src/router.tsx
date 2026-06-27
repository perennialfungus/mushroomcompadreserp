import {
  Link,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
  useParams
} from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Barcode,
  CalendarClock,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  Factory,
  FileText,
  FileSpreadsheet,
  FlaskConical,
  GitBranch,
  GitPullRequest,
  History,
  Home,
  LogIn,
  LogOut,
  MapPin,
  MessageSquarePlus,
  Package,
  PackageCheck,
  PackagePlus,
  PackageSearch,
  PauseCircle,
  PlusCircle,
  Printer,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Store,
  Sprout,
  Upload,
  Users,
  Wand2,
  Wrench,
  Wifi,
  WifiOff,
  XCircle
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
  type ReactNode
} from "react";
import { Badge, Button, Dialog, EmptyState, ErrorState, Input, LoadingState, Tabs, useToast } from "./components/ui";
import { LocaleSettings } from "./components/LocaleSettings";
import { UpdatePrompt } from "./components/UpdatePrompt";
import { useAuth } from "./auth";
import { MasterDataScreen } from "./master-data";
import { ImportCenterScreen } from "./import-center";
import { ProductConfiguratorScreen } from "./product-configurator";
import {
  LabelPrintScreen,
  ScanScreen,
  StockCountDetailScreen,
  StockCountListScreen
} from "./operations";
import { FarmScreen } from "./farm";
import { ProductionScreen } from "./production";
import { CostingScreen } from "./costing";
import { ChangeControlScreen } from "./change-control";
import { RoutingsScreen } from "./routings";
import { EquipmentScreen } from "./equipment";
import { PurchasingScreen } from "./purchasing";
import { MrpScreen } from "./mrp";
import { CrmScreen } from "./crm";
import { WholesaleScreen } from "./wholesale";
import { QualityScreen } from "./quality";
import {
  addBacklogItemsToRelease,
  completeCoaUpload,
  allocateShopifyOrderLine,
  approveGeneratedDocument,
  approveQcSpecification,
  createBacklogItem,
  createMaterial,
  createPackagingComponent,
  createDocumentTemplate,
  createProduct,
  createProductVariant,
  createQcResult,
  acknowledgeAlert,
  createQcSpecification,
  createQcTestMethod,
  createLot,
  createLotQcRecord,
  createMockRecallRun,
  createRoadmapRelease,
  deleteReportPreset,
  exportMockRecallContactsCsv,
  exportMockRecallPacketJson,
  exportOperationalReportCsv,
  exportOperationalReportJson,
  exportRoadmapCodexPrompt,
  exportRecallReportCsv,
  generateCoaDocument,
  generateReleasePacket,
  getCoaDownloadUrl,
  getGeneratedDocumentDownloadUrl,
  getMockRecallDashboard,
  getOperationalReport,
  getOperationalHealth,
  getOperationalDashboard,
  getAlertSettings,
  getRoadmapSnapshot,
  getRecallReport,
  getSalesOrder,
  getShopifyDashboard,
  getShopifyFulfillmentOrder,
  getShopifyInventoryPushStatus,
  getShopifyStatus,
  getLotDetail,
  getLotReleaseChecklist,
  getTraceabilityGraph,
  getUser,
  createReleaseNote,
  exportFeedbackCsv,
  exportFeedbackJson,
  listInventoryBalances,
  listAdminReleaseNotes,
  listDocumentTemplates,
  listFeedback,
  listMasterData,
  listAlerts,
  listGeneratedDocuments,
  listLots,
  listLocations,
  listQcSpecifications,
  listQcTasks,
  listQcTestMethods,
  listReportPresets,
  listReports,
  listReleaseNotes,
  listRoles,
  listSalesOrders,
  listShopifyFulfillmentQueue,
  listStockMovements,
  listUsers,
  pickPackSalesOrder,
  postInventoryAdjustment,
  postInventoryTransfer,
  recordMockRecallAction,
  packShopifyOrder,
  pickShopifyOrder,
  pushShopifyInventory,
  reconcileShopifyInventory,
  reviewQcResult,
  runShopifyOrderReconciliation,
  generateRoadmapReleaseNote,
  saveReportPreset,
  searchTraceability,
  signCoaUpload,
  shipShopifyOrder,
  snoozeAlert,
  completeMockRecallRun,
  submitFeedback,
  transitionLotQc,
  voidGeneratedDocument,
  updateBacklogItem,
  updateFeedback,
  updateAlertSettings,
  updateDashboardWidgets,
  updateLot,
  updateUser
} from "./lib/api";
import {
  defaultUomForItemClass,
  generateInventorySku,
  inventoryItemClasses,
  itemClassByCode
} from "./inventory-item-classes";
import { useI18n } from "./i18n/I18nProvider";
import type {
  AdminUser,
  AlertEvent,
  AlertRule,
  AlertSubscription,
  BacklogItem,
  BacklogStatus,
  DashboardWidget,
  DocumentTemplate,
  FeedbackCategory,
  FeedbackItem,
  FeedbackSeverity,
  FeedbackStatus,
  InventoryBalance,
  GeneratedDocument,
  Location,
  LotDetail,
  MockRecallDashboard,
  MockRecallRunDetail,
  MasterDataSnapshot,
  OperationalDashboard,
  OperationalHealth,
  LotReleaseChecklist,
  QcRecord,
  QcSpecification,
  QcTask,
  QcTestMethod,
  RecallReport,
  OperationalReport,
  ReportDefinition,
  ReportFilters,
  ReportPreset,
  ReleaseNote,
  RoadmapSnapshot,
  Role,
  SalesOrderDetail,
  SalesOrderSummary,
  ShopifyIntegrationStatus,
  ShopifyFulfillmentOrderDetail,
  ShopifyFulfillmentQueueItem,
  ShopifyInventoryDriftRow,
  ShopifyInventoryPushRow,
  ShopifySyncDashboard,
  ShopifySyncEvent,
  StockMovement,
  TraceDirection,
  TraceGraph,
  TraceSearchResult
} from "./types";
import {
  clearSyncConflict,
  flushPowerSyncUploads,
  getSyncStatusSnapshot,
  listPendingOfflineCommands,
  notifyOnlineStatusChanged,
  retrySyncConflict,
  subscribeToSyncStatus
} from "./lib/powersync/sync";

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", notifyOnlineStatusChanged);
    window.addEventListener("offline", notifyOnlineStatusChanged);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", notifyOnlineStatusChanged);
      window.removeEventListener("offline", notifyOnlineStatusChanged);
    };
  }, []);

  return isOnline;
}

function useSyncStatus() {
  return useSyncExternalStore(subscribeToSyncStatus, getSyncStatusSnapshot, getSyncStatusSnapshot);
}

function getNavSection(path: string): string | null {
  if (path === "/" || path === "/login") {
    return null;
  }

  if (["/farm", "/production", "/change-control", "/routings", "/equipment", "/costing", "/mrp"].includes(path)) {
    return "Production";
  }

  if (["/inventory", "/purchasing", "/scan", "/labels", "/stock-counts"].includes(path)) {
    return "Inventory";
  }

  if (["/lots", "/qc", "/documents", "/quality", "/traceability", "/mock-recalls", "/reports"].includes(path)) {
    return "Quality";
  }

  if (["/crm", "/wholesale", "/release-notes", "/sync"].includes(path)) {
    return "Sales";
  }

  if (["/master-data", "/import-center", "/product-configurator"].includes(path)) {
    return "Foundation";
  }

  if (path.startsWith("/admin")) {
    return "Admin";
  }

  return null;
}

const rootRoute = createRootRoute({
  component: AppShell,
  notFoundComponent: NotFoundRoute
});

function AppShell() {
  const { t, formatDateTime, locale, setLocale } = useI18n();
  const auth = useAuth();
  const isOnline = useOnlineStatus();
  const syncStatus = useSyncStatus();
  const navItems = auth.session
    ? [
        { to: "/", label: t("nav.dashboard"), icon: Home },
        { to: "/production", label: "Production", icon: Factory },
        { to: "/inventory", label: t("nav.inventory"), icon: Package },
        { to: "/quality", label: "Quality", icon: ShieldCheck },
        { to: "/wholesale", label: "Commerce", icon: Store },
        { to: "/master-data", label: "Foundation", icon: PackageSearch },
        ...(auth.isAdmin
          ? [
              { to: "/admin/health", label: "Admin", icon: Activity }
            ]
          : []),
        { to: "/settings", label: t("nav.settings"), icon: Settings }
      ]
    : [{ to: "/login", label: t("nav.login"), icon: LogIn }];
  const lastSync = useMemo(
    () => (syncStatus.lastSyncedAt ? new Date(syncStatus.lastSyncedAt) : null),
    [syncStatus.lastSyncedAt]
  );
  const userInitials =
    auth.userContext?.displayName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "MC";
  const primaryRole = auth.userContext?.roles[0]?.name ?? (auth.isAdmin ? "Owner / Admin" : "Staff");
  const navWithSections = navItems.map((item, index) => {
    const section = getNavSection(item.to);
    const previousSection = index > 0 ? getNavSection(navItems[index - 1]?.to ?? "") : null;

    return { ...item, section: section !== previousSection ? section : null };
  });

  useEffect(() => {
    if (auth.userContext?.locale && auth.userContext.locale !== locale) {
      setLocale(auth.userContext.locale);
    }
  }, [auth.userContext?.locale, locale, setLocale]);

  useEffect(() => {
    if (auth.session && isOnline) {
      void flushPowerSyncUploads(auth.session.accessToken);
    }
  }, [auth.session, isOnline]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="desktop-sidebar" aria-label={t("layout.primaryNav")}>
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <Sprout size={24} />
          </span>
          <img src="/brand/compadres-logo.png" alt="Mushroom Compadres" />
        </div>

        <nav className="nav-list">
          {navWithSections.map((item) => (
            <div key={item.to}>
              {item.section ? <div className="nav-section-label">{item.section}</div> : null}
              <Link
                to={item.to}
                className="nav-link"
                activeProps={{ className: "nav-link active" }}
              >
                <item.icon aria-hidden="true" size={20} />
                <span>{item.label}</span>
              </Link>
            </div>
          ))}
        </nav>

        {auth.session ? (
          <div className="sidebar-footer">
            <Link to="/settings" className="nav-link sidebar-settings">
              <Settings aria-hidden="true" size={20} />
              <span>Settings</span>
            </Link>
            <div className="sidebar-user">
              <span className="user-avatar">{userInitials}</span>
              <span>
                <strong>{auth.userContext?.displayName ?? "Mushroom Compadres"}</strong>
                <small>{primaryRole}</small>
              </span>
            </div>
          </div>
        ) : null}
      </aside>

      <div className="app-main">
        <header className="top-status">
          <div className="location-control">
            <MapPin aria-hidden="true" size={16} />
            <span>Rogil HQ</span>
          </div>

          <label className="global-search">
            <Search aria-hidden="true" size={17} />
            <span className="sr-only">Search batches, lots, SKUs, and orders</span>
            <input placeholder="Search batches, lots, SKUs, orders..." />
          </label>

          <Link to="/scan" className="mc-cta top-scan-action">
            <Barcode aria-hidden="true" size={17} />
            Scan
          </Link>

          <div className="topbar-divider" aria-hidden="true" />

          <div className="top-sync">
            <Badge tone={isOnline ? "success" : "warning"}>
              {isOnline ? (
                <Wifi aria-hidden="true" size={16} />
              ) : (
                <WifiOff aria-hidden="true" size={16} />
              )}
              {isOnline ? t("status.online") : t("status.offline")}
            </Badge>
            <span className="sync-copy">
              {syncStatus.pendingUploads > 0
                ? "Uploads pending"
                : lastSync
                  ? t("status.lastSync", { value: formatDateTime(lastSync) })
                  : "Synced"}
            </span>
          </div>

          <div className="status-actions">
            {auth.session ? <ProfileMenu /> : null}
            {auth.session && syncStatus.pendingUploads > 0 ? (
              <Badge tone={syncStatus.pendingUploads > 0 ? "warning" : "success"}>
                <Upload aria-hidden="true" size={16} />
                {syncStatus.pendingUploads} pending
              </Badge>
            ) : null}
            <button className="icon-button" type="button" aria-label="Notifications">
              <Bell aria-hidden="true" size={18} />
              <span aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="content-area" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <nav className="mobile-bottom-nav" aria-label={t("layout.primaryNav")}>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="mobile-nav-link"
            activeProps={{ className: "mobile-nav-link active" }}
          >
            <item.icon aria-hidden="true" size={22} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {auth.session ? <FeedbackCaptureButton /> : null}
      <UpdatePrompt />
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    if (!auth.loading && !auth.session) {
      void navigate({ to: "/login", replace: true });
    }
  }, [auth.loading, auth.session, navigate]);

  if (auth.loading) {
    return <EmptyState title="Loading" description="Restoring your staff session." />;
  }

  if (!auth.session) {
    return null;
  }

  if (adminOnly && !auth.isAdmin) {
    return (
      <EmptyState
        icon={<ShieldCheck aria-hidden="true" />}
        title={t("admin.accessDenied.title")}
        description={t("admin.accessDenied.description")}
      />
    );
  }

  return children;
}

function ProfileMenu() {
  const auth = useAuth();
  const { t, locale, setLocale } = useI18n();

  async function handleLocaleChange(nextLocale: "en" | "pt") {
    setLocale(nextLocale);
    await auth.setProfileLocale(nextLocale);
  }

  return (
    <div className="profile-menu">
      <label className="compact-select">
        <span className="sr-only">{t("settings.locale")}</span>
        <select
          value={locale}
          onChange={(event) => void handleLocaleChange(event.target.value as "en" | "pt")}
          aria-label={t("settings.locale")}
        >
          <option value="en">EN</option>
          <option value="pt">PT</option>
        </select>
      </label>
      <Button variant="ghost" size="sm" onClick={() => void auth.signOut()} aria-label={t("auth.signOut")} title={t("auth.signOut")}>
        <LogOut aria-hidden="true" size={16} />
      </Button>
    </div>
  );
}

const moduleByPath: Array<[string, string]> = [
  ["/farm", "production"],
  ["/production", "production"],
  ["/equipment", "production"],
  ["/purchasing", "inventory"],
  ["/mrp", "production"],
  ["/inventory", "inventory"],
  ["/stock-counts", "inventory"],
  ["/lots", "qc"],
  ["/traceability", "reporting"],
  ["/reports", "reporting"],
  ["/crm", "wholesale"],
  ["/wholesale", "wholesale"],
  ["/admin/shopify", "shopify"],
  ["/sales-orders", "shopify"],
  ["/sync", "offline_sync"]
];

function inferFeedbackModule(path: string): string {
  return moduleByPath.find(([prefix]) => path.startsWith(prefix))?.[1] ?? "general";
}

function FeedbackCaptureButton() {
  const auth = useAuth();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [workflow, setWorkflow] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [severity, setSeverity] = useState<FeedbackSeverity>("medium");
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState<{ fileName: string; contentType: string; dataUrl: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const screen = typeof window === "undefined" ? "/" : `${window.location.pathname}${window.location.search}`;
  const module = inferFeedbackModule(screen);
  const roleCode = auth.userContext?.roles[0]?.code ?? "staff";

  function handleScreenshot(file: File | null) {
    if (!file) {
      setScreenshot(null);
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setScreenshot({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        dataUrl: typeof reader.result === "string" ? reader.result : ""
      });
    });
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitFeedback(auth.session.accessToken, {
        screen,
        workflow: workflow.trim() || document.title || screen,
        module,
        category,
        severity,
        roleCode,
        device: navigator.userAgent,
        notes,
        reproductionContextJson: {
          route: screen,
          online: navigator.onLine,
          viewport: { width: window.innerWidth, height: window.innerHeight },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attachment: screenshot
      });
      showToast({ title: "Feedback submitted", description: "Thanks. Admins can triage it from the feedback dashboard." });
      setOpen(false);
      setWorkflow("");
      setNotes("");
      setScreenshot(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Feedback could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button className="feedback-fab" onClick={() => setOpen(true)} type="button">
        <MessageSquarePlus aria-hidden="true" size={18} />
        Feedback
      </Button>
      <Dialog title="Send feedback" open={open} onClose={() => setOpen(false)}>
        <form className="stack" onSubmit={handleSubmit}>
          <div className="compact-form-grid">
            <Input label="Screen" value={screen} readOnly />
            <Input label="Workflow" value={workflow} onChange={(event) => setWorkflow(event.target.value)} placeholder="What were you trying to do?" />
            <label className="select-field">
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)}>
                <option value="bug">Bug</option>
                <option value="missing_data">Missing data</option>
                <option value="confusing_workflow">Confusing workflow</option>
                <option value="speed_performance">Speed/performance</option>
                <option value="offline_sync">Offline/sync</option>
                <option value="shopify">Shopify</option>
                <option value="qc">QC</option>
                <option value="production">Production</option>
                <option value="inventory">Inventory</option>
                <option value="wholesale">Wholesale</option>
                <option value="reporting">Reporting</option>
              </select>
            </label>
            <label className="select-field">
              <span>Severity</span>
              <select value={severity} onChange={(event) => setSeverity(event.target.value as FeedbackSeverity)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <Input label="Role" value={roleCode} readOnly />
            <Input label="Device" value={navigator.userAgent} readOnly />
          </div>
          <label className="input-field">
            <span>Notes</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} required />
          </label>
          <Input label="Screenshot" type="file" accept="image/*" onChange={(event) => handleScreenshot(event.target.files?.[0] ?? null)} />
          {screenshot ? <p className="muted-line">Attached {screenshot.fileName}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          <Button type="submit" disabled={submitting || !notes.trim()}>
            <MessageSquarePlus aria-hidden="true" size={18} />
            {submitting ? "Submitting" : "Submit feedback"}
          </Button>
        </form>
      </Dialog>
    </>
  );
}

function SyncStatusPanel({ compact = false }: { compact?: boolean }) {
  const status = useSyncStatus();
  const { formatDateTime } = useI18n();
  const lastSynced = status.lastSyncedAt ? formatDateTime(new Date(status.lastSyncedAt)) : "Not synced yet";
  const pendingCommands = listPendingOfflineCommands();

  return (
    <section className={compact ? "sync-panel sync-panel-compact" : "sync-panel"} aria-label="Sync status">
      <div className="panel-heading">
        <h3>Sync status</h3>
        <Badge tone={status.online ? "success" : "warning"}>
          {status.online ? <Wifi aria-hidden="true" size={16} /> : <WifiOff aria-hidden="true" size={16} />}
          {status.online ? "Sync online" : "Sync paused"}
        </Badge>
      </div>
      <dl className="sync-metrics">
        <div>
          <dt>Pending uploads</dt>
          <dd>{status.pendingUploads}</dd>
        </div>
        <div>
          <dt>Last synced</dt>
          <dd>{lastSynced}</dd>
        </div>
        <div>
          <dt>Errors</dt>
          <dd>{status.lastError ?? "None"}</dd>
        </div>
      </dl>
      {status.pendingUploads > 0 ? (
        <div className="conflict-banner">
          <AlertTriangle aria-hidden="true" size={18} />
          <span>Uploads are pending. Do not treat inventory, production, or fulfillment stock as synced yet.</span>
        </div>
      ) : null}
      {!compact && pendingCommands.length > 0 ? (
        <table className="list-table">
          <thead>
            <tr>
              <th>Pending command</th>
              <th>Status</th>
              <th>Attempts</th>
            </tr>
          </thead>
          <tbody>
            {pendingCommands.map((command) => (
              <tr key={command.id}>
                <td>
                  {command.table}
                  <div className="muted-line">{command.id}</div>
                </td>
                <td><Badge tone={command.status === "error" ? "warning" : "info"}>{command.status}</Badge></td>
                <td>{command.attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {status.conflicts.length > 0 ? (
        <div className="sync-conflicts">
          {status.conflicts.map((conflict) => (
            <article key={conflict.id}>
              <XCircle aria-hidden="true" size={18} />
              <div>
                <strong>{conflict.table}</strong>
                <span>{conflict.message}</span>
                <small>
                  {conflict.area ?? "sync"} / {conflict.action ?? "retry"} / {conflict.code ?? conflict.clientTransactionId}
                </small>
              </div>
              <Button
                aria-label={`Retry conflict ${conflict.clientTransactionId}`}
                onClick={() => retrySyncConflict(conflict.id)}
                size="sm"
                type="button"
                variant="secondary"
              >
                <RefreshCw aria-hidden="true" size={16} />
              </Button>
              <Button
                aria-label={`Resolve conflict ${conflict.clientTransactionId}`}
                onClick={() => clearSyncConflict(conflict.id)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <XCircle aria-hidden="true" size={16} />
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <p className="muted-line">
          <CheckCircle2 aria-hidden="true" size={16} /> No sync conflicts.
        </p>
      )}
    </section>
  );
}

function SyncDiagnosticsRoute() {
  const auth = useAuth();

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="sync-title">
        <div className="screen-heading">
          <p className="eyebrow">Offline operations</p>
          <h2 id="sync-title">Conflict queue and sync diagnostics</h2>
          <p>{auth.userContext?.displayName ?? "Current device"} / {auth.userContext?.email ?? "signed in"}</p>
        </div>

        <SyncStatusPanel />

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Device and user diagnostics</h3>
            <Badge tone="info">{navigator.onLine ? "Online" : "Offline"}</Badge>
          </div>
          <dl className="sync-metrics">
            <div>
              <dt>User</dt>
              <dd>{auth.userContext?.displayName ?? "Unknown"}</dd>
            </div>
            <div>
              <dt>Roles</dt>
              <dd>{auth.userContext?.roles.map((role) => role.code).join(", ") ?? "None"}</dd>
            </div>
            <div>
              <dt>Device</dt>
              <dd>{navigator.userAgent}</dd>
            </div>
          </dl>
        </div>
      </section>
    </ProtectedRoute>
  );
}

function DashboardRoute() {
  const auth = useAuth();
  const { t, formatNumber, formatDateTime } = useI18n();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<OperationalDashboard | null>(null);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [subscriptions, setSubscriptions] = useState<AlertSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState("operations_overview");

  async function loadDashboard() {
    if (!auth.session) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [dashboardResponse, alertsResponse, settingsResponse] = await Promise.all([
        getOperationalDashboard(auth.session.accessToken),
        listAlerts(auth.session.accessToken, true),
        getAlertSettings(auth.session.accessToken)
      ]);
      setDashboard(dashboardResponse.dashboard);
      setAlerts(alertsResponse.alerts);
      setRules(settingsResponse.rules);
      setSubscriptions(settingsResponse.subscriptions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Dashboard could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, [auth.session]);

  async function acknowledge(alert: AlertEvent) {
    if (!auth.session) {
      return;
    }
    const response = await acknowledgeAlert(auth.session.accessToken, alert.id);
    setAlerts((current) => current.map((candidate) => (candidate.id === alert.id ? response.alert : candidate)));
    setDashboard((current) =>
      current
        ? { ...current, alerts: current.alerts.map((candidate) => (candidate.id === alert.id ? response.alert : candidate)) }
        : current
    );
    showToast({ title: "Alert acknowledged", description: response.alert.sourceLabel });
  }

  async function snooze(alert: AlertEvent) {
    if (!auth.session) {
      return;
    }
    const snoozedUntil = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    const response = await snoozeAlert(auth.session.accessToken, alert.id, snoozedUntil);
    setAlerts((current) => current.map((candidate) => (candidate.id === alert.id ? response.alert : candidate)));
    setDashboard((current) =>
      current
        ? { ...current, alerts: current.alerts.filter((candidate) => candidate.id !== alert.id) }
        : current
    );
    showToast({ title: "Alert snoozed", description: `Until ${formatDateTime(new Date(snoozedUntil))}` });
  }

  async function toggleSubscription(subscription: AlertSubscription) {
    if (!auth.session) {
      return;
    }
    const next = {
      ruleType: subscription.ruleType,
      role: subscription.role,
      inAppEnabled: !subscription.inAppEnabled,
      digestPreference: subscription.digestPreference
    };
    const response = await updateAlertSettings(auth.session.accessToken, [next]);
    setSubscriptions(response.subscriptions);
    showToast({ title: "Alert setting updated", description: subscription.ruleType.replaceAll("_", " ") });
  }

  async function toggleWidget(widget: DashboardWidget) {
    if (!auth.session) {
      return;
    }
    await updateDashboardWidgets(auth.session.accessToken, [{ ...widget, enabled: !widget.enabled }]);
    await loadDashboard();
    showToast({ title: "Widget setting updated", description: widget.title });
  }

  async function saveDashboardCustomization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !dashboard) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const ttl = Number(formValue(form, "cacheTtlSeconds"));
    const nextWidgets = dashboard.widgets.map((widget, index) => ({
      ...widget,
      enabled: form.get(`widget-${widget.id}`) === "on",
      sortOrder: index + 1,
      cacheTtlSeconds: Number.isFinite(ttl) && ttl > 0 ? ttl : widget.cacheTtlSeconds,
      settingsJson: {
        ...widget.settingsJson,
        dashboardName: formValue(form, "dashboardName"),
        layout: dashboardLayout,
        density: formValue(form, "density")
      }
    }));
    await updateDashboardWidgets(auth.session.accessToken, nextWidgets);
    setCustomizeOpen(false);
    await loadDashboard();
    showToast({ title: "Dashboard customized", description: formValue(form, "dashboardName") || dashboard.role.replaceAll("_", " ") });
  }

  const visibleAlerts = dashboard?.alerts ?? alerts.filter((alert) => alert.status === "open" || alert.status === "acknowledged");
  const criticalCount = visibleAlerts.filter((alert) => alert.severity === "critical").length;

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="dashboard-title">
        <div className="screen-heading">
          <p className="eyebrow">{t("dashboard.eyebrow")}</p>
          <h2 id="dashboard-title">{t("dashboard.title")}</h2>
          <p>{dashboard ? `Role dashboard: ${dashboard.role.replaceAll("_", " ")}` : t("dashboard.subtitle")}</p>
        </div>

        <div className="action-row">
          <Button type="button" onClick={() => setCustomizeOpen(true)} disabled={!dashboard}>
            <Settings aria-hidden="true" size={18} />
            Customize dashboard
          </Button>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="metric-grid">
          <article className="metric-panel">
            <span>Open exceptions</span>
            <strong>{formatNumber(visibleAlerts.length)}</strong>
          </article>
          <article className="metric-panel">
            <span>Critical alerts</span>
            <strong>{formatNumber(criticalCount)}</strong>
          </article>
          <article className="metric-panel">
            <span>Cache expires</span>
            <strong>{dashboard ? formatDateTime(new Date(dashboard.cache.expiresAt)) : "Loading"}</strong>
          </article>
        </div>

        <Tabs
          tabs={[
            {
              id: "dashboard",
              label: "Dashboard",
              content: (
                <div className="split-grid">
                  {(dashboard?.widgets ?? []).map((widget) => (
                    <article className="table-panel" key={widget.id}>
                      <div className="panel-heading">
                        <h3>{widget.title}</h3>
                        <Badge tone={(widget.criticalAlertCount ?? 0) > 0 ? "warning" : "info"}>
                          <BarChart3 aria-hidden="true" size={16} />
                          {formatNumber(widget.alertCount ?? 0)} alerts
                        </Badge>
                      </div>
                      <p className="muted-line">{widget.description}</p>
                      <dl className="sync-metrics">
                        {(widget.metrics ?? []).map((metric) => (
                          <div key={metric.id}>
                            <dt>{metric.label}</dt>
                            <dd>{typeof metric.value === "number" ? formatNumber(metric.value) : metric.value}</dd>
                          </div>
                        ))}
                      </dl>
                      <p className="muted-line">
                        Cached {widget.cachedAt ? formatDateTime(new Date(widget.cachedAt)) : "on next load"} / {widget.cacheTtlSeconds}s TTL
                      </p>
                    </article>
                  ))}
                  {!loading && (dashboard?.widgets.length ?? 0) === 0 ? (
                    <EmptyState icon={<BarChart3 aria-hidden="true" />} title="No widgets enabled" description="Enable dashboard widgets from the widget settings tab." />
                  ) : null}
                  {loading ? <LoadingState title="Loading role dashboard" description="Refreshing widgets and in-app alerts." /> : null}
                </div>
              )
            },
            {
              id: "alerts",
              label: "Alert center",
              content: (
                <AlertCenterTable
                  alerts={alerts}
                  onAcknowledge={acknowledge}
                  onSnooze={snooze}
                  formatDateTime={formatDateTime}
                />
              )
            },
            {
              id: "rules",
              label: "Alert rules",
              content: (
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Alert subscriptions</h3>
                    <Badge tone="info"><Bell aria-hidden="true" size={16} /> {formatNumber(subscriptions.length)} subscriptions</Badge>
                  </div>
                  <table className="list-table">
                    <thead><tr><th>Rule</th><th>Role</th><th>Digest</th><th>In-app</th><th>Action</th></tr></thead>
                    <tbody>
                      {subscriptions.map((subscription) => {
                        const rule = rules.find((candidate) => candidate.type === subscription.ruleType);
                        return (
                          <tr key={subscription.id}>
                            <td>
                              {rule?.name ?? subscription.ruleType}
                              <div className="muted-line">{rule?.description ?? subscription.ruleType.replaceAll("_", " ")}</div>
                            </td>
                            <td>{subscription.role.replaceAll("_", " ")}</td>
                            <td>{subscription.digestPreference}</td>
                            <td><Badge tone={subscription.inAppEnabled ? "success" : "neutral"}>{subscription.inAppEnabled ? "On" : "Off"}</Badge></td>
                            <td>
                              <Button size="sm" variant="secondary" type="button" onClick={() => void toggleSubscription(subscription)}>
                                <Bell aria-hidden="true" size={16} />
                                {subscription.inAppEnabled ? "Disable" : "Enable"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            },
            {
              id: "widgets",
              label: "Widgets",
              content: (
                <div className="table-panel">
                  <div className="panel-heading">
                    <h3>Dashboard widget settings</h3>
                    <Badge tone="info">{formatNumber(dashboard?.widgets.length ?? 0)} visible</Badge>
                  </div>
                  <table className="list-table">
                    <thead><tr><th>Widget</th><th>Role</th><th>TTL</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {(dashboard?.widgets ?? []).map((widget) => (
                        <tr key={widget.id}>
                          <td>
                            {widget.title}
                            <div className="muted-line">{widget.description}</div>
                          </td>
                          <td>{widget.role.replaceAll("_", " ")}</td>
                          <td>{widget.cacheTtlSeconds}s</td>
                          <td><Badge tone={widget.enabled ? "success" : "neutral"}>{widget.enabled ? "Enabled" : "Hidden"}</Badge></td>
                          <td>
                            <Button size="sm" variant="secondary" type="button" onClick={() => void toggleWidget(widget)}>
                              <Settings aria-hidden="true" size={16} />
                              {widget.enabled ? "Hide" : "Show"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            },
            {
              id: "sync",
              label: t("dashboard.tabs.sync"),
              content: <SyncStatusPanel />
            }
          ]}
        />

        <Dialog title="Customize dashboard" open={customizeOpen} onClose={() => setCustomizeOpen(false)}>
          <form className="form-grid" onSubmit={saveDashboardCustomization}>
            <Input label="Dashboard name" name="dashboardName" defaultValue={dashboard?.role.replaceAll("_", " ") ?? "Operations overview"} />
            <label className="select-field">
              <span>Layout</span>
              <select value={dashboardLayout} onChange={(event) => setDashboardLayout(event.target.value)}>
                <option value="operations_overview">Operations overview</option>
                <option value="exception_center">Exception center</option>
                <option value="role_workbench">Role workbench</option>
              </select>
            </label>
            <label className="select-field">
              <span>Density</span>
              <select name="density" defaultValue="standard">
                <option value="compact">Compact</option>
                <option value="standard">Standard</option>
                <option value="expanded">Expanded</option>
              </select>
            </label>
            <Input label="Refresh TTL seconds" name="cacheTtlSeconds" type="number" min="30" step="30" defaultValue={dashboard?.widgets[0]?.cacheTtlSeconds ?? 120} />
            <fieldset className="widget-picker full-span">
              <legend>Widgets</legend>
              {(dashboard?.widgets ?? []).map((widget) => (
                <label key={widget.id}>
                  <input name={`widget-${widget.id}`} type="checkbox" defaultChecked={widget.enabled} />
                  <span>
                    <strong>{widget.title}</strong>
                    <small>{widget.description}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            <div className="form-actions full-span">
              <Button type="submit" disabled={!dashboard}>
                <Save aria-hidden="true" size={18} />
                Save dashboard
              </Button>
            </div>
          </form>
        </Dialog>
      </section>
    </ProtectedRoute>
  );
}

function AlertCenterTable({
  alerts,
  onAcknowledge,
  onSnooze,
  formatDateTime
}: {
  alerts: AlertEvent[];
  onAcknowledge: (alert: AlertEvent) => Promise<void>;
  onSnooze: (alert: AlertEvent) => Promise<void>;
  formatDateTime: (value: Date) => string;
}) {
  return (
    <div className="table-panel">
      <div className="panel-heading">
        <h3>Alert center</h3>
        <Badge tone="warning"><AlertTriangle aria-hidden="true" size={16} /> {alerts.length} alerts</Badge>
      </div>
      <table className="list-table">
        <thead><tr><th>Alert</th><th>Status</th><th>Due</th><th>Source</th><th>Action</th></tr></thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id}>
              <td>
                <Badge tone={alert.severity === "critical" ? "warning" : "info"}>{alert.severity}</Badge>
                <div>{alert.title}</div>
                <div className="muted-line">{alert.message}</div>
              </td>
              <td>
                <Badge tone={alert.status === "open" ? "warning" : alert.status === "acknowledged" ? "success" : "info"}>
                  {alert.status.replaceAll("_", " ")}
                </Badge>
              </td>
              <td>{alert.dueAt ? formatDateTime(new Date(alert.dueAt)) : "Open"}</td>
              <td>
                <a href={alert.actionHref}>{alert.sourceLabel}</a>
                <div className="muted-line">{alert.sourceType.replaceAll("_", " ")}</div>
              </td>
              <td>
                <div className="form-actions">
                  <Button size="sm" variant="secondary" type="button" onClick={() => void onAcknowledge(alert)} disabled={alert.status === "acknowledged"}>
                    <CheckCircle2 aria-hidden="true" size={16} />
                    Acknowledge
                  </Button>
                  <Button size="sm" variant="ghost" type="button" onClick={() => void onSnooze(alert)}>
                    <Clock aria-hidden="true" size={16} />
                    Snooze
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {alerts.length === 0 ? <tr><td colSpan={5}>No alerts for your subscriptions.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}

function LoginRoute() {
  const { t } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("owner@mushroom-compadres.test");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await auth.signIn(email, password);
      await navigate({ to: "/", replace: true });
    } catch {
      setError(t("login.error"));
    }
  }

  return (
    <section className="auth-screen" aria-labelledby="login-title">
      <div className="auth-panel">
        <p className="eyebrow">{t("login.eyebrow")}</p>
        <h2 id="login-title">{t("login.title")}</h2>
        <p>{t("login.subtitle")}</p>
        <form className="stack" aria-label={t("login.formLabel")} onSubmit={handleSubmit}>
          <Input
            label={t("login.email")}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
          <Input
            label={t("login.password")}
            type="password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
          {error ? <p className="form-error">{error}</p> : null}
          <Button type="submit">
            <LogIn aria-hidden="true" size={18} />
            {t("login.submit")}
          </Button>
        </form>
      </div>
    </section>
  );
}

function SettingsRoute() {
  const { t } = useI18n();

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="settings-title">
        <div className="screen-heading">
          <p className="eyebrow">{t("settings.eyebrow")}</p>
          <h2 id="settings-title">{t("settings.title")}</h2>
          <p>{t("settings.subtitle")}</p>
        </div>
        <LocaleSettings />
      </section>
    </ProtectedRoute>
  );
}

function ReleaseNotesRoute() {
  const auth = useAuth();
  const { formatDateTime } = useI18n();
  const { showToast } = useToast();
  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<ReleaseNote["status"]>("published");
  const [error, setError] = useState<string | null>(null);

  async function loadNotes() {
    if (!auth.session) {
      return;
    }
    const response = auth.isAdmin
      ? await listAdminReleaseNotes(auth.session.accessToken)
      : await listReleaseNotes(auth.session.accessToken);
    setNotes(response.releaseNotes);
  }

  useEffect(() => {
    void loadNotes().catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Release notes could not be loaded."));
  }, [auth.session, auth.isAdmin]);

  async function publishNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }
    try {
      await createReleaseNote(auth.session.accessToken, { version, title, body, status });
      setVersion("");
      setTitle("");
      setBody("");
      await loadNotes();
      showToast({ title: "Release note saved", description: `${version || "Version"} is available in release notes.` });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Release note could not be saved.");
    }
  }

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="release-notes-title">
        <div className="screen-heading">
          <p className="eyebrow">Internal beta</p>
          <h2 id="release-notes-title">Release notes</h2>
          <p>Published changes and beta build notes for logged-in staff.</p>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        {auth.isAdmin ? (
          <form className="table-panel compact-form-grid" onSubmit={publishNote}>
            <div className="panel-heading">
              <h3>Publish per version</h3>
              <Badge tone="info">Admin</Badge>
            </div>
            <Input label="Version" value={version} onChange={(event) => setVersion(event.target.value)} placeholder="0.25.1-beta" required />
            <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
            <label className="select-field">
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as ReleaseNote["status"])}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="input-field full-span">
              <span>Body</span>
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} required />
            </label>
            <Button type="submit">
              <Upload aria-hidden="true" size={18} />
              Save release note
            </Button>
          </form>
        ) : null}
        <div className="table-panel">
          <div className="panel-heading">
            <h3>Versions</h3>
            <Badge tone="info">{notes.length} notes</Badge>
          </div>
          {notes.map((note) => (
            <article className="timeline-item" key={note.id}>
              <div>
                <strong>{note.version} / {note.title}</strong>
                <p>{note.body}</p>
                <span className="muted-line">
                  {note.status} / {note.publishedAt ? formatDateTime(new Date(note.publishedAt)) : "Not published"}
                </span>
              </div>
            </article>
          ))}
          {notes.length === 0 ? <EmptyState title="No release notes" description="Published release notes will appear here." /> : null}
        </div>
      </section>
    </ProtectedRoute>
  );
}

function MasterDataRoute() {
  return (
    <ProtectedRoute>
      <MasterDataScreen />
    </ProtectedRoute>
  );
}

function ImportCenterRoute() {
  return (
    <ProtectedRoute>
      <ImportCenterScreen />
    </ProtectedRoute>
  );
}

function ProductConfiguratorRoute() {
  return (
    <ProtectedRoute>
      <ProductConfiguratorScreen />
    </ProtectedRoute>
  );
}

function FarmRoute() {
  return (
    <ProtectedRoute>
      <FarmScreen />
    </ProtectedRoute>
  );
}

function ProductionRoute() {
  return (
    <ProtectedRoute>
      <ProductionScreen />
    </ProtectedRoute>
  );
}

function ChangeControlRoute() {
  return (
    <ProtectedRoute>
      <ChangeControlScreen />
    </ProtectedRoute>
  );
}

function RoutingsRoute() {
  return (
    <ProtectedRoute>
      <RoutingsScreen />
    </ProtectedRoute>
  );
}

function EquipmentRoute() {
  return (
    <ProtectedRoute>
      <EquipmentScreen />
    </ProtectedRoute>
  );
}

function CostingRoute() {
  return (
    <ProtectedRoute>
      <CostingScreen />
    </ProtectedRoute>
  );
}

function PurchasingRoute() {
  return (
    <ProtectedRoute>
      <PurchasingScreen />
    </ProtectedRoute>
  );
}

function MrpRoute() {
  return (
    <ProtectedRoute>
      <MrpScreen />
    </ProtectedRoute>
  );
}

function QualityRoute() {
  return (
    <ProtectedRoute>
      <QualityScreen />
    </ProtectedRoute>
  );
}

function CrmRoute() {
  return (
    <ProtectedRoute>
      <CrmScreen />
    </ProtectedRoute>
  );
}

function WholesaleRoute() {
  return (
    <ProtectedRoute>
      <WholesaleScreen />
    </ProtectedRoute>
  );
}

function ScanRoute() {
  return (
    <ProtectedRoute>
      <ScanScreen />
    </ProtectedRoute>
  );
}

function LabelPrintRoute() {
  return (
    <ProtectedRoute>
      <LabelPrintScreen />
    </ProtectedRoute>
  );
}

function StockCountListRoute() {
  return (
    <ProtectedRoute>
      <StockCountListScreen />
    </ProtectedRoute>
  );
}

function StockCountDetailRoute() {
  return (
    <ProtectedRoute>
      <StockCountDetailScreen />
    </ProtectedRoute>
  );
}

function qcTone(status: string): "neutral" | "success" | "warning" | "info" {
  if (status === "released" || status === "pass") {
    return "success";
  }
  if (status === "hold" || status === "pending" || status === "expired") {
    return "warning";
  }
  if (status === "rejected" || status === "fail") {
    return "warning";
  }
  return "neutral";
}

function traceTone(status: string): "neutral" | "success" | "warning" | "info" {
  return status === "normal" ? "neutral" : "warning";
}

function prettyTraceType(type: string): string {
  return type.replaceAll("_", " ");
}

function downloadTextFile(fileName: string, text: string, contentType: string): void {
  const blob = new Blob([text], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function compactReportFilters(filters: ReportFilters): ReportFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as ReportFilters;
}

function formatReportCell(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}

function LotListRoute() {
  const auth = useAuth();
  const { formatNumber, formatDate } = useI18n();
  const { showToast } = useToast();
  const [lots, setLots] = useState<LotDetail[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLotCode, setNewLotCode] = useState("LM-NEW-01");
  const [newExpiry, setNewExpiry] = useState("2027-06-30");
  const [newQuantity, setNewQuantity] = useState("24");

  async function loadLots() {
    if (!auth.session) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [lotResponse, locationResponse] = await Promise.all([
        listLots(auth.session.accessToken),
        listLocations(auth.session.accessToken)
      ]);
      setLots(lotResponse.lots);
      setLocations(locationResponse.locations);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Lots could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!auth.session) {
      return;
    }

    void loadLots();
  }, [auth.session]);

  async function submitLot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }

    const quantity = Number(newQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    try {
      await createLot(auth.session.accessToken, {
        lotCode: newLotCode,
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        itemName: "Lion's Mane Tincture 50 ml",
        itemSku: "LM-TINC-50",
        sourceType: "manual",
        sourceId: crypto.randomUUID(),
        manufacturedAt: new Date().toISOString(),
        expiresAt: new Date(`${newExpiry}T00:00:00.000Z`).toISOString(),
        initialLocationId: locations[0]?.id ?? "loc-pack",
        initialQuantity: quantity,
        uom: "bottle"
      });
      showToast({ title: "Lot created", description: newLotCode });
      await loadLots();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Lot create failed.");
    }
  }

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="lots-title">
        <div className="screen-heading">
          <p className="eyebrow">Lot management</p>
          <h2 id="lots-title">Lots and QC release</h2>
          <p>Tracked lots remain visible in inventory while QC status controls allocation.</p>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Tracked lots</h3>
            <Button variant="secondary" size="sm" onClick={() => void loadLots()}>
              <History aria-hidden="true" size={16} />
              Refresh
            </Button>
          </div>
          {loading ? (
            <p>Loading lots...</p>
          ) : (
            <table className="list-table">
              <thead>
                <tr>
                  <th>Lot</th>
                  <th>Item</th>
                  <th>QC</th>
                  <th>Expiry</th>
                  <th>On hand</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((detail) => (
                  <tr key={detail.lot.id}>
                    <td>
                      <a href={`/lots/${detail.lot.id}`}>
                        {detail.lot.lotCode}
                      </a>
                      <div className="muted-line">{detail.allocation.blockReason ?? "Allocatable"}</div>
                    </td>
                    <td>
                      {detail.lot.itemName}
                      <div className="muted-line">{detail.lot.itemSku}</div>
                    </td>
                    <td>
                      <Badge tone={qcTone(detail.lot.qcStatus)}>{detail.lot.qcStatus}</Badge>
                    </td>
                    <td>
                      <CalendarClock aria-hidden="true" size={16} />{" "}
                      {detail.lot.expiresAt ? formatDate(new Date(detail.lot.expiresAt)) : "None"}
                    </td>
                    <td>{formatNumber(detail.allocation.onHand)} {detail.balances[0]?.uom ?? ""}</td>
                    <td>
                      {formatNumber(detail.allocation.available)} available
                      {detail.allocation.held > 0 ? (
                        <div className="muted-line">{formatNumber(detail.allocation.held)} held</div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form className="table-panel compact-form-grid" onSubmit={submitLot}>
          <h3>Create lot</h3>
          <Input label="Lot code" value={newLotCode} onChange={(event) => setNewLotCode(event.target.value)} />
          <Input label="Expiry date" type="date" value={newExpiry} onChange={(event) => setNewExpiry(event.target.value)} />
          <Input label="Initial quantity" inputMode="decimal" value={newQuantity} onChange={(event) => setNewQuantity(event.target.value)} />
          <Button type="submit">
            <PlusCircle aria-hidden="true" size={18} />
            Create lot
          </Button>
        </form>
      </section>
    </ProtectedRoute>
  );
}

function LotDetailRoute() {
  const auth = useAuth();
  const params = useParams({ strict: false }) as { lotId: string };
  const { formatDate, formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [detail, setDetail] = useState<LotDetail | null>(null);
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [transitionAction, setTransitionAction] = useState<"release" | "hold" | "reject" | null>(null);
  const [transitionReason, setTransitionReason] = useState("QC review completed.");
  const [qcStatus, setQcStatus] = useState<QcRecord["status"]>("pass");
  const [qcSummary, setQcSummary] = useState("QC check passed.");
  const [coaFile, setCoaFile] = useState<File | null>(null);
  const [editLotCode, setEditLotCode] = useState("");
  const [editExpiry, setEditExpiry] = useState("");

  async function loadLot() {
    if (!auth.session) {
      return;
    }

    try {
      const [response, templateResponse] = await Promise.all([
        getLotDetail(auth.session.accessToken, params.lotId),
        listDocumentTemplates(auth.session.accessToken)
      ]);
      setDetail(response.lotDetail);
      setDocumentTemplates(templateResponse.templates);
      setEditLotCode(response.lotDetail.lot.lotCode);
      setEditExpiry(response.lotDetail.lot.expiresAt ? response.lotDetail.lot.expiresAt.slice(0, 10) : "");
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Lot detail could not be loaded.");
    }
  }

  useEffect(() => {
    if (!auth.session) {
      return;
    }

    void loadLot();
  }, [auth.session, params.lotId]);

  async function submitTransition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !transitionAction) {
      return;
    }

    try {
      const response = await transitionLotQc(auth.session.accessToken, params.lotId, {
        action: transitionAction,
        reasonCode: transitionAction === "release" ? "QC_PASS" : transitionAction === "hold" ? "QC_HOLD" : "QC_REJECT",
        reason: transitionReason
      });
      setDetail(response.lotDetail);
      setTransitionAction(null);
      showToast({ title: "Lot QC updated", description: response.lotDetail.lot.lotCode });
    } catch (transitionError) {
      setError(transitionError instanceof Error ? transitionError.message : "QC transition failed.");
    }
  }

  async function submitQcRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !detail) {
      return;
    }

    try {
      await createLotQcRecord(auth.session.accessToken, params.lotId, {
        recordCode: `QC-${detail.lot.lotCode}-${Date.now()}`,
        qcType: "visual",
        status: qcStatus,
        testedAt: new Date().toISOString(),
        summary: qcSummary
      });
      showToast({ title: "QC record added", description: detail.lot.lotCode });
      await loadLot();
    } catch (qcError) {
      setError(qcError instanceof Error ? qcError.message : "QC record failed.");
    }
  }

  async function submitLotEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !detail) {
      return;
    }

    try {
      await updateLot(auth.session.accessToken, params.lotId, {
        lotCode: editLotCode,
        expiresAt: editExpiry ? new Date(`${editExpiry}T00:00:00.000Z`).toISOString() : null
      });
      showToast({ title: "Lot updated", description: editLotCode });
      await loadLot();
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "Lot update failed.");
    }
  }

  async function submitCoa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstQcRecord = detail?.qcRecords[0];

    if (!auth.session || !detail || !coaFile || !firstQcRecord) {
      return;
    }

    try {
      const qcRecordId = firstQcRecord.id;
      const signed = await signCoaUpload(auth.session.accessToken, params.lotId, {
        qcRecordId,
        fileName: coaFile.name,
        contentType: coaFile.type || "application/octet-stream"
      });

      if (!signed.signedUpload.uploadUrl.startsWith("local-demo://")) {
        await fetch(signed.signedUpload.uploadUrl, {
          method: signed.signedUpload.method,
          headers: signed.signedUpload.headers,
          body: coaFile
        });
      }

      await completeCoaUpload(auth.session.accessToken, params.lotId, {
        qcRecordId,
        filePath: signed.signedUpload.filePath,
        fileName: coaFile.name,
        contentType: coaFile.type || "application/octet-stream"
      });
      setCoaFile(null);
      showToast({ title: "COA uploaded", description: coaFile.name });
      await loadLot();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "COA upload failed.");
    }
  }

  async function openCoa(attachmentId: string) {
    if (!auth.session) {
      return;
    }
    const response = await getCoaDownloadUrl(auth.session.accessToken, params.lotId, attachmentId);
    window.open(response.signedDownload.downloadUrl, "_blank", "noopener,noreferrer");
  }

  async function generateLotPacket() {
    if (!auth.session || !detail) {
      return;
    }
    const template = documentTemplates.find((candidate) => candidate.type === "lot_release_packet");
    if (!template) {
      setError("No approved release packet template is available.");
      return;
    }
    try {
      const response = await generateReleasePacket(auth.session.accessToken, {
        templateId: template.id,
        lotId: detail.lot.id,
        status: "final",
        signerName: auth.userContext?.displayName ?? "Owner Admin",
        customerFacing: false
      });
      showToast({ title: "Release packet exported", description: response.document.documentNumber });
      await loadLot();
    } catch (packetError) {
      setError(packetError instanceof Error ? packetError.message : "Release packet failed.");
    }
  }

  async function openGeneratedDocument(documentId: string) {
    if (!auth.session) {
      return;
    }
    const response = await getGeneratedDocumentDownloadUrl(auth.session.accessToken, documentId);
    window.open(response.signedDownload.downloadUrl, "_blank", "noopener,noreferrer");
  }

  if (!detail) {
    return (
      <ProtectedRoute>
        <EmptyState title="Loading lot" description={error ?? "Fetching lot detail."} />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="lot-detail-title">
        <div className="screen-heading">
          <p className="eyebrow">Lot detail</p>
          <h2 id="lot-detail-title">{detail.lot.lotCode}</h2>
          <p>{detail.lot.itemName} · expires {detail.lot.expiresAt ? formatDate(new Date(detail.lot.expiresAt)) : "not set"}</p>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="metric-grid">
          <article className="metric-panel">
            <span>QC status</span>
            <strong><Badge tone={qcTone(detail.lot.qcStatus)}>{detail.lot.qcStatus}</Badge></strong>
          </article>
          <article className="metric-panel">
            <span>Available</span>
            <strong>{formatNumber(detail.allocation.available)}</strong>
          </article>
          <article className="metric-panel">
            <span>Held</span>
            <strong>{formatNumber(detail.allocation.held)}</strong>
          </article>
        </div>
        {detail.allocation.blockReason ? <p className="form-error">{detail.allocation.blockReason}</p> : null}

        <div className="action-row">
          <Button onClick={() => setTransitionAction("release")}>
            <CheckCircle2 aria-hidden="true" size={18} />
            Release
          </Button>
          <Button variant="secondary" onClick={() => setTransitionAction("hold")}>
            <PauseCircle aria-hidden="true" size={18} />
            Hold
          </Button>
          <Button variant="secondary" onClick={() => setTransitionAction("reject")}>
            <XCircle aria-hidden="true" size={18} />
            Reject
          </Button>
        </div>

        <form className="table-panel compact-form-grid" onSubmit={submitLotEdit}>
          <h3>Edit lot</h3>
          <Input label="Lot code" value={editLotCode} onChange={(event) => setEditLotCode(event.target.value)} />
          <Input label="Expiry date" type="date" value={editExpiry} onChange={(event) => setEditExpiry(event.target.value)} />
          <Button type="submit">
            <PackageCheck aria-hidden="true" size={18} />
            Save lot
          </Button>
        </form>

        <div className="detail-grid">
          <section className="table-panel">
            <h3>Stock by location</h3>
            <table className="list-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Available</th>
                  <th>Reserved</th>
                  <th>Held</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {detail.balances.map((balance) => (
                  <tr key={balance.id}>
                    <td>{balance.locationName}</td>
                    <td>{formatNumber(balance.availableQuantity)} {balance.uom}</td>
                    <td>{formatNumber(balance.reservedQuantity)} {balance.uom}</td>
                    <td>{formatNumber(balance.heldQuantity)} {balance.uom}</td>
                    <td>{detail.lot.expiresAt ? formatDate(new Date(detail.lot.expiresAt)) : "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="table-panel">
            <h3>QC records</h3>
            <div className="record-list">
              {detail.qcRecords.map((record) => (
                <article className="inline-record" key={record.id}>
                  <FlaskConical aria-hidden="true" size={18} />
                  <div>
                    <strong>{record.recordCode}</strong>
                    <span>{record.qcType} · {record.testedAt ? formatDateTime(new Date(record.testedAt)) : "Not tested"}</span>
                  </div>
                  <Badge tone={qcTone(record.status)}>{record.status}</Badge>
                </article>
              ))}
            </div>
            <form className="stack" onSubmit={submitQcRecord}>
              <label className="select-field">
                <span>QC result</span>
                <select value={qcStatus} onChange={(event) => setQcStatus(event.target.value as QcRecord["status"])}>
                  <option value="pass">Pass</option>
                  <option value="hold">Hold</option>
                  <option value="fail">Fail</option>
                </select>
              </label>
              <Input label="Summary" value={qcSummary} onChange={(event) => setQcSummary(event.target.value)} />
              <Button type="submit">
                <PlusCircle aria-hidden="true" size={18} />
                Add QC record
              </Button>
            </form>
          </section>
        </div>

        <section className="table-panel">
          <div className="panel-heading">
            <h3>COA attachments</h3>
            <span className="muted-line">Uploads use server-authorized signed URLs.</span>
          </div>
          <div className="record-list">
            {detail.coaAttachments.length === 0 ? (
              <p>No COAs uploaded.</p>
            ) : (
              detail.coaAttachments.map((attachment) => (
                <article className="inline-record" key={attachment.id}>
                  <FileText aria-hidden="true" size={18} />
                  <div>
                    <strong>{attachment.fileName}</strong>
                    <span>{formatDateTime(new Date(attachment.uploadedAt))}</span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => void openCoa(attachment.id)}>
                    <Download aria-hidden="true" size={16} />
                    Open
                  </Button>
                </article>
              ))
            )}
          </div>
          <form className="coa-upload-row" onSubmit={submitCoa}>
            <input aria-label="COA file" type="file" onChange={(event) => setCoaFile(event.target.files?.[0] ?? null)} />
            <Button type="submit" disabled={!coaFile || detail.qcRecords.length === 0}>
              <Upload aria-hidden="true" size={18} />
              Upload COA
            </Button>
          </form>
        </section>

        <section className="table-panel">
          <div className="panel-heading">
            <h3>Lot release packet</h3>
            <Button variant="secondary" size="sm" onClick={() => void generateLotPacket()}>
              <PackageCheck aria-hidden="true" size={16} />
              Export packet
            </Button>
          </div>
          <div className="record-list">
            {detail.generatedDocuments.filter((document) => document.documentType === "lot_release_packet").length === 0 ? (
              <p>No release packet has been generated for this lot.</p>
            ) : (
              detail.generatedDocuments
                .filter((document) => document.documentType === "lot_release_packet")
                .map((document) => (
                  <article className="inline-record" key={document.id}>
                    <FileText aria-hidden="true" size={18} />
                    <div>
                      <strong>{document.documentNumber}</strong>
                      <span>{document.watermark} / v{document.versionNumber} / {formatDateTime(new Date(document.generatedAt))}</span>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => void openGeneratedDocument(document.id)}>
                      <Download aria-hidden="true" size={16} />
                      Download
                    </Button>
                  </article>
                ))
            )}
          </div>
        </section>

        <Dialog
          open={transitionAction !== null}
          title={`${transitionAction ?? "Update"} lot`}
          onClose={() => setTransitionAction(null)}
        >
          <form className="stack" onSubmit={submitTransition}>
            <Input label="Reason" value={transitionReason} onChange={(event) => setTransitionReason(event.target.value)} />
            <Button type="submit">
              <PackageCheck aria-hidden="true" size={18} />
              Confirm
            </Button>
          </form>
        </Dialog>
      </section>
    </ProtectedRoute>
  );
}

function QcRoute() {
  const auth = useAuth();
  const { formatNumber } = useI18n();
  const { showToast } = useToast();
  const [methods, setMethods] = useState<QcTestMethod[]>([]);
  const [specifications, setSpecifications] = useState<QcSpecification[]>([]);
  const [tasks, setTasks] = useState<QcTask[]>([]);
  const [lots, setLots] = useState<LotDetail[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedLotId, setSelectedLotId] = useState("lot-lm-2026-06");
  const [checklist, setChecklist] = useState<LotReleaseChecklist | null>(null);
  const [methodCode, setMethodCode] = useState("POTENCY");
  const [methodName, setMethodName] = useState("Potency assay");
  const [methodUnit, setMethodUnit] = useState("mg/g");
  const [rangeMin, setRangeMin] = useState("0");
  const [rangeMax, setRangeMax] = useState("999");
  const [specCode, setSpecCode] = useState("LM-FG-POT");
  const [specVersion, setSpecVersion] = useState("v1");
  const [specLineMethodId, setSpecLineMethodId] = useState("");
  const [resultValue, setResultValue] = useState("true");
  const [resultComment, setResultComment] = useState("Result entered by QC.");
  const [error, setError] = useState<string | null>(null);
  const [qcDialog, setQcDialog] = useState<"method" | "spec" | null>(null);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null;
  const latestResult = selectedTask?.results[0] ?? null;

  async function loadQc() {
    if (!auth.session) {
      return;
    }
    try {
      const [methodResponse, specResponse, taskResponse, lotResponse] = await Promise.all([
        listQcTestMethods(auth.session.accessToken),
        listQcSpecifications(auth.session.accessToken),
        listQcTasks(auth.session.accessToken),
        listLots(auth.session.accessToken)
      ]);
      setMethods(methodResponse.testMethods);
      setSpecifications(specResponse.specifications);
      setTasks(taskResponse.tasks);
      setLots(lotResponse.lots);
      setSelectedTaskId((current) => current || taskResponse.tasks[0]?.id || "");
      setSpecLineMethodId((current) => current || methodResponse.testMethods[0]?.id || "");
      setSelectedLotId((current) => current || lotResponse.lots[0]?.lot.id || "");
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "QC workspace could not be loaded.");
    }
  }

  useEffect(() => {
    if (!auth.session) {
      return;
    }
    void loadQc();
  }, [auth.session]);

  useEffect(() => {
    if (!auth.session || !selectedLotId) {
      return;
    }
    getLotReleaseChecklist(auth.session.accessToken, selectedLotId)
      .then((response) => setChecklist(response.checklist))
      .catch(() => setChecklist(null));
  }, [auth.session, selectedLotId, tasks]);

  async function submitMethod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }
    try {
      const min = Number(rangeMin);
      const max = Number(rangeMax);
      await createQcTestMethod(auth.session.accessToken, {
        code: methodCode,
        name: methodName,
        methodType: "potency",
        unit: methodUnit || null,
        defaultExpectedMin: Number.isFinite(min) ? min : null,
        defaultExpectedMax: Number.isFinite(max) ? max : null,
        passFailRule: { type: "numeric_range", min: Number.isFinite(min) ? min : null, max: Number.isFinite(max) ? max : null },
        evidenceRequirement: { attachmentRequired: true, commentRequiredOnFail: true },
        isActive: true
      });
      showToast({ title: "QC method created", description: methodCode });
      setQcDialog(null);
      await loadQc();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "QC method create failed.");
    }
  }

  async function submitSpecification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !specLineMethodId) {
      return;
    }
    try {
      const response = await createQcSpecification(auth.session.accessToken, {
        specCode,
        name: `${specCode} release specification`,
        versionCode: specVersion,
        status: "draft",
        scope: "product_variant",
        itemType: "product_variant",
        itemId: "var-lions-mane-50",
        productVariantId: "var-lions-mane-50",
        productionStage: "finished_goods",
        lotType: "processing_batch",
        effectiveFrom: new Date().toISOString(),
        lines: [{ testMethodId: specLineMethodId, required: true }]
      });
      await approveQcSpecification(auth.session.accessToken, response.specification.id);
      showToast({ title: "QC spec approved", description: `${specCode} ${specVersion}` });
      setQcDialog(null);
      await loadQc();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "QC specification create failed.");
    }
  }

  async function submitResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedTask) {
      return;
    }
    try {
      const numeric = Number(resultValue);
      const response = await createQcResult(auth.session.accessToken, selectedTask.id, {
        valueNumber: Number.isFinite(numeric) ? numeric : null,
        valueBoolean: resultValue === "true" ? true : resultValue === "false" ? false : null,
        valueText: Number.isFinite(numeric) || resultValue === "true" || resultValue === "false" ? null : resultValue,
        unit: selectedTask.specLine?.unit ?? selectedTask.testMethod?.unit ?? null,
        comments: resultComment,
        attachments: resultComment.toLocaleLowerCase().includes("attachment")
          ? [{ filePath: "qc/demo-evidence.txt", fileName: "demo-evidence.txt", contentType: "text/plain" }]
          : []
      });
      setSelectedTaskId(response.task.id);
      showToast({ title: "QC result entered", description: response.task.taskCode });
      await loadQc();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "QC result entry failed.");
    }
  }

  async function approveLatestResult() {
    if (!auth.session || !latestResult) {
      return;
    }
    try {
      const response = await reviewQcResult(auth.session.accessToken, latestResult.id, {
        status: "approved",
        reviewComments: "Reviewed and approved."
      });
      setSelectedTaskId(response.task.id);
      showToast({ title: "QC result approved", description: response.task.taskCode });
      await loadQc();
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "QC review failed.");
    }
  }

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="qc-title">
        <div className="screen-heading">
          <p className="eyebrow">Quality control</p>
          <h2 id="qc-title">QC specifications and task queue</h2>
          <p>Reusable methods, versioned specs, task completion, and lot release readiness.</p>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="metric-grid">
          <article className="metric-panel">
            <span>Test methods</span>
            <strong>{formatNumber(methods.length)}</strong>
          </article>
          <article className="metric-panel">
            <span>Approved specs</span>
            <strong>{formatNumber(specifications.filter((specification) => specification.status === "approved").length)}</strong>
          </article>
          <article className="metric-panel">
            <span>Open tasks</span>
            <strong>{formatNumber(tasks.filter((task) => task.status !== "completed").length)}</strong>
          </article>
        </div>

        <div className="action-row">
          <Button type="button" onClick={() => setQcDialog("method")}>
            <PlusCircle aria-hidden="true" size={18} />
            New test method
          </Button>
          <Button type="button" variant="secondary" onClick={() => setQcDialog("spec")} disabled={methods.length === 0}>
            <ShieldCheck aria-hidden="true" size={18} />
            New QA/QC spec
          </Button>
        </div>

        <section className="table-panel">
          <div className="panel-heading">
            <h3>QC task queue</h3>
            <Button variant="secondary" size="sm" onClick={() => void loadQc()}>
              <RefreshCw aria-hidden="true" size={16} />
              Refresh
            </Button>
          </div>
          <table className="list-table">
            <thead>
              <tr><th>Task</th><th>Subject</th><th>Method</th><th>Status</th><th>Latest result</th></tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <button className="link-button" type="button" onClick={() => setSelectedTaskId(task.id)}>
                      {task.taskCode}
                    </button>
                    <div className="muted-line">{task.specification?.specCode ?? task.specificationId}</div>
                  </td>
                  <td>{task.subjectLabel}</td>
                  <td>{task.testMethod?.name ?? task.testMethodId}</td>
                  <td><Badge tone={task.status === "completed" ? "success" : "warning"}>{task.status}</Badge></td>
                  <td>{task.results[0]?.status ?? "No result"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="detail-grid">
          <form className="table-panel compact-form-grid" onSubmit={submitResult}>
            <div className="panel-heading">
              <h3>QC result entry</h3>
              <Badge tone={selectedTask?.required ? "warning" : "info"}>{selectedTask?.required ? "Required" : "Optional"}</Badge>
            </div>
            <label className="select-field">
              <span>Task</span>
              <select
                aria-label="Task"
                value={selectedTask?.id ?? ""}
                onChange={(event) => setSelectedTaskId(event.target.value)}
              >
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>{task.taskCode} / {task.subjectLabel}</option>
                ))}
              </select>
            </label>
            <Input label="Result value" value={resultValue} onChange={(event) => setResultValue(event.target.value)} />
            <Input label="Comments" value={resultComment} onChange={(event) => setResultComment(event.target.value)} />
            <Button type="submit" disabled={!selectedTask}>
              <FlaskConical aria-hidden="true" size={18} />
              Enter result
            </Button>
            <Button type="button" variant="secondary" disabled={!latestResult} onClick={() => void approveLatestResult()}>
              <CheckCircle2 aria-hidden="true" size={18} />
              Approve latest
            </Button>
          </form>

          <section className="table-panel">
            <div className="panel-heading">
              <h3>Lot release checklist</h3>
              <Badge tone={checklist?.releasable ? "success" : "warning"}>
                {checklist?.releasable ? "Ready" : "Blocked"}
              </Badge>
            </div>
            <label className="select-field">
              <span>Lot</span>
              <select value={selectedLotId} onChange={(event) => setSelectedLotId(event.target.value)}>
                {lots.map((detail) => (
                  <option key={detail.lot.id} value={detail.lot.id}>{detail.lot.lotCode}</option>
                ))}
              </select>
            </label>
            <div className="record-list">
              {(checklist?.tasks ?? []).map((task) => (
                <article className="inline-record" key={task.id}>
                  <ShieldCheck aria-hidden="true" size={18} />
                  <div>
                    <strong>{task.testMethod?.name ?? task.taskCode}</strong>
                    <span>{task.results[0]?.status ?? "pending"} / {task.status}</span>
                  </div>
                  <Badge tone={checklist?.blockedTaskIds.includes(task.id) ? "warning" : "success"}>
                    {checklist?.blockedTaskIds.includes(task.id) ? "blocking" : "clear"}
                  </Badge>
                </article>
              ))}
              {checklist?.tasks.length === 0 ? <p>No spec tasks are required for this lot.</p> : null}
            </div>
            <p className="muted-line">{checklist?.message ?? "All required QC tasks are clear."}</p>
          </section>
        </div>

        <Dialog title="Create QC test method" open={qcDialog === "method"} onClose={() => setQcDialog(null)}>
          <form className="form-grid" onSubmit={submitMethod}>
            <Input label="Code" value={methodCode} onChange={(event) => setMethodCode(event.target.value)} />
            <Input label="Name" value={methodName} onChange={(event) => setMethodName(event.target.value)} />
            <Input label="Unit" value={methodUnit} onChange={(event) => setMethodUnit(event.target.value)} />
            <Input label="Min" inputMode="decimal" value={rangeMin} onChange={(event) => setRangeMin(event.target.value)} />
            <Input label="Max" inputMode="decimal" value={rangeMax} onChange={(event) => setRangeMax(event.target.value)} />
            <div className="form-actions full-span">
              <Button type="submit">
                <PlusCircle aria-hidden="true" size={18} />
                Add method
              </Button>
            </div>
          </form>
        </Dialog>

        <Dialog title="Create QA/QC specification" open={qcDialog === "spec"} onClose={() => setQcDialog(null)}>
          <form className="form-grid" onSubmit={submitSpecification}>
            <Input label="Spec code" value={specCode} onChange={(event) => setSpecCode(event.target.value)} />
            <Input label="Version" value={specVersion} onChange={(event) => setSpecVersion(event.target.value)} />
            <label className="select-field full-span">
              <span>Required test</span>
              <select value={specLineMethodId} onChange={(event) => setSpecLineMethodId(event.target.value)}>
                {methods.map((method) => (
                  <option key={method.id} value={method.id}>{method.code} / {method.name}</option>
                ))}
              </select>
            </label>
            <div className="form-actions full-span">
              <Button type="submit" disabled={methods.length === 0}>
                <ShieldCheck aria-hidden="true" size={18} />
                Create and approve
              </Button>
            </div>
          </form>
        </Dialog>
      </section>
    </ProtectedRoute>
  );
}

function DocumentsRoute() {
  const auth = useAuth();
  const { formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [lots, setLots] = useState<LotDetail[]>([]);
  const [selectedLotId, setSelectedLotId] = useState("lot-lm-2026-06");
  const [selectedCoaTemplateId, setSelectedCoaTemplateId] = useState("doc-template-fg-coa-v1");
  const [selectedPacketTemplateId, setSelectedPacketTemplateId] = useState("doc-template-release-packet-v1");
  const [signerName, setSignerName] = useState(auth.userContext?.displayName ?? "Owner Admin");
  const [templateCode, setTemplateCode] = useState("FG-COA-CUSTOM");
  const [templateName, setTemplateName] = useState("Customer COA Template");
  const [error, setError] = useState<string | null>(null);

  async function loadDocuments() {
    if (!auth.session) {
      return;
    }
    try {
      const [templateResponse, documentResponse, lotResponse] = await Promise.all([
        listDocumentTemplates(auth.session.accessToken),
        listGeneratedDocuments(auth.session.accessToken),
        listLots(auth.session.accessToken)
      ]);
      setTemplates(templateResponse.templates);
      setDocuments(documentResponse.documents);
      setLots(lotResponse.lots);
      setSelectedCoaTemplateId((current) => current || templateResponse.templates.find((template) => template.type !== "lot_release_packet")?.id || "");
      setSelectedPacketTemplateId((current) => current || templateResponse.templates.find((template) => template.type === "lot_release_packet")?.id || "");
      setSelectedLotId((current) => current || lotResponse.lots[0]?.lot.id || "");
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Document workspace could not be loaded.");
    }
  }

  useEffect(() => {
    if (!auth.session) {
      return;
    }
    void loadDocuments();
  }, [auth.session]);

  async function submitTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }
    try {
      await createDocumentTemplate(auth.session.accessToken, {
        templateCode,
        name: templateName,
        type: "finished_good_coa",
        versionCode: `v${templates.length + 1}`,
        status: "approved",
        definitionJson: {
          title: "Certificate of Analysis",
          subtitle: "Customer-ready finished goods COA",
          includeInternalNotes: false,
          fields: [
            { key: "lotCode", label: "Lot number", source: "lot", required: true, customerVisible: true },
            { key: "expiresAt", label: "Expiry", source: "lot", required: true, customerVisible: true },
            { key: "internalNotes", label: "Internal notes", source: "metadata", customerVisible: false }
          ],
          footer: "Controlled document generated from approved QC data."
        }
      });
      showToast({ title: "Template created", description: templateCode });
      await loadDocuments();
    } catch (templateError) {
      setError(templateError instanceof Error ? templateError.message : "Template create failed.");
    }
  }

  async function generateCoa(status: GeneratedDocument["status"]) {
    if (!auth.session || !selectedCoaTemplateId) {
      return;
    }
    try {
      const response = await generateCoaDocument(auth.session.accessToken, {
        templateId: selectedCoaTemplateId,
        lotId: selectedLotId,
        status,
        signerName,
        customerFacing: true
      });
      showToast({ title: `${status.toUpperCase()} COA generated`, description: response.document.documentNumber });
      await loadDocuments();
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "COA generation failed.");
    }
  }

  async function generatePacket() {
    if (!auth.session || !selectedPacketTemplateId) {
      return;
    }
    try {
      const response = await generateReleasePacket(auth.session.accessToken, {
        templateId: selectedPacketTemplateId,
        lotId: selectedLotId,
        status: "final",
        signerName,
        customerFacing: false
      });
      showToast({ title: "Release packet exported", description: response.document.documentNumber });
      await loadDocuments();
    } catch (packetError) {
      setError(packetError instanceof Error ? packetError.message : "Release packet failed.");
    }
  }

  async function approveDocument(documentId: string) {
    if (!auth.session) {
      return;
    }
    await approveGeneratedDocument(auth.session.accessToken, documentId, {
      decision: "approved",
      reason: "QA approval completed."
    });
    showToast({ title: "Document finalized", description: "Watermark updated to FINAL" });
    await loadDocuments();
  }

  async function voidDocument(documentId: string) {
    if (!auth.session) {
      return;
    }
    await voidGeneratedDocument(auth.session.accessToken, documentId, "Regenerated with corrected document metadata.");
    showToast({ title: "Document voided", description: "History preserved" });
    await loadDocuments();
  }

  async function downloadDocument(documentId: string) {
    if (!auth.session) {
      return;
    }
    const response = await getGeneratedDocumentDownloadUrl(auth.session.accessToken, documentId);
    window.open(response.signedDownload.downloadUrl, "_blank", "noopener,noreferrer");
  }

  const coaTemplates = templates.filter((template) => template.type !== "lot_release_packet");
  const packetTemplates = templates.filter((template) => template.type === "lot_release_packet");

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="documents-title">
        <div className="screen-heading">
          <p className="eyebrow">Controlled documents</p>
          <h2 id="documents-title">COA generation and release packets</h2>
          <p>Customer-ready documents are generated from approved QC data and carry draft, final, or void watermarks.</p>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="metric-grid">
          <article className="metric-panel">
            <span>Templates</span>
            <strong>{formatNumber(templates.length)}</strong>
          </article>
          <article className="metric-panel">
            <span>Final documents</span>
            <strong>{formatNumber(documents.filter((document) => document.status === "final").length)}</strong>
          </article>
          <article className="metric-panel">
            <span>Voided</span>
            <strong>{formatNumber(documents.filter((document) => document.status === "void").length)}</strong>
          </article>
        </div>

        <div className="detail-grid">
          <form className="table-panel compact-form-grid" onSubmit={submitTemplate}>
            <h3>COA template builder</h3>
            <Input label="Template code" value={templateCode} onChange={(event) => setTemplateCode(event.target.value)} />
            <Input label="Template name" value={templateName} onChange={(event) => setTemplateName(event.target.value)} />
            <Button type="submit">
              <PlusCircle aria-hidden="true" size={18} />
              Create approved template
            </Button>
          </form>

          <section className="table-panel compact-form-grid">
            <h3>Generate documents</h3>
            <label className="select-field">
              <span>Lot</span>
              <select value={selectedLotId} onChange={(event) => setSelectedLotId(event.target.value)}>
                {lots.map((detail) => (
                  <option key={detail.lot.id} value={detail.lot.id}>{detail.lot.lotCode} / {detail.lot.itemName}</option>
                ))}
              </select>
            </label>
            <label className="select-field">
              <span>COA template</span>
              <select value={selectedCoaTemplateId} onChange={(event) => setSelectedCoaTemplateId(event.target.value)}>
                {coaTemplates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name} {template.versionCode}</option>
                ))}
              </select>
            </label>
            <label className="select-field">
              <span>Release packet template</span>
              <select value={selectedPacketTemplateId} onChange={(event) => setSelectedPacketTemplateId(event.target.value)}>
                {packetTemplates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name} {template.versionCode}</option>
                ))}
              </select>
            </label>
            <Input label="Authorized signer" value={signerName} onChange={(event) => setSignerName(event.target.value)} />
            <div className="action-row">
              <Button type="button" onClick={() => void generateCoa("draft")}>
                <FileText aria-hidden="true" size={18} />
                Draft COA
              </Button>
              <Button type="button" onClick={() => void generateCoa("final")}>
                <ShieldCheck aria-hidden="true" size={18} />
                Final COA
              </Button>
              <Button type="button" variant="secondary" onClick={() => void generatePacket()}>
                <PackageCheck aria-hidden="true" size={18} />
                Release packet
              </Button>
            </div>
          </section>
        </div>

        <section className="table-panel">
          <div className="panel-heading">
            <h3>Generated document list</h3>
            <Button variant="secondary" size="sm" onClick={() => void loadDocuments()}>
              <RefreshCw aria-hidden="true" size={16} />
              Refresh
            </Button>
          </div>
          <table className="list-table">
            <thead>
              <tr><th>Document</th><th>Lot</th><th>Status</th><th>Customer</th><th>Generated</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr><td colSpan={6}>No generated documents yet.</td></tr>
              ) : (
                documents.map((document) => (
                  <tr key={document.id}>
                    <td>
                      {document.documentNumber}
                      <div className="muted-line">{document.templateName} / v{document.versionNumber}</div>
                    </td>
                    <td>{document.lotCode ?? document.lotId}</td>
                    <td><Badge tone={document.status === "final" ? "success" : document.status === "void" ? "warning" : "info"}>{document.watermark}</Badge></td>
                    <td>{document.customerFacing ? "Customer-facing" : "Internal packet"}</td>
                    <td>{formatDateTime(new Date(document.generatedAt))}</td>
                    <td>
                      <div className="action-row">
                        <Button size="sm" variant="secondary" onClick={() => void downloadDocument(document.id)}>
                          <Download aria-hidden="true" size={16} />
                          Download
                        </Button>
                        {document.status === "draft" ? (
                          <Button size="sm" onClick={() => void approveDocument(document.id)}>
                            <CheckCircle2 aria-hidden="true" size={16} />
                            Final
                          </Button>
                        ) : null}
                        {document.status !== "void" ? (
                          <Button size="sm" variant="secondary" onClick={() => void voidDocument(document.id)}>
                            <XCircle aria-hidden="true" size={16} />
                            Void
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </section>
    </ProtectedRoute>
  );
}

function TraceabilityRoute() {
  const auth = useAuth();
  const { formatNumber, formatDateTime } = useI18n();
  const { showToast } = useToast();
  const [query, setQuery] = useState("LM-2026-06");
  const [results, setResults] = useState<TraceSearchResult[]>([]);
  const [selected, setSelected] = useState<TraceSearchResult | null>(null);
  const [direction, setDirection] = useState<TraceDirection>("backward");
  const [graph, setGraph] = useState<TraceGraph | null>(null);
  const [report, setReport] = useState<RecallReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadGraph(result: TraceSearchResult, nextDirection = result.recommendedDirection) {
    if (!auth.session) {
      return;
    }

    setLoading(true);
    setError(null);
    setSelected(result);
    setDirection(nextDirection);
    try {
      const [graphResponse, reportResponse] = await Promise.all([
        getTraceabilityGraph(auth.session.accessToken, result.type, result.id, nextDirection),
        getRecallReport(auth.session.accessToken, result.type, result.id)
      ]);
      setGraph(graphResponse.graph);
      setReport(reportResponse.report);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Traceability graph could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function submitSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!auth.session || !query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await searchTraceability(auth.session.accessToken, query);
      setResults(response.results);
      if (response.results[0]) {
        await loadGraph(response.results[0]);
      } else {
        setSelected(null);
        setGraph(null);
        setReport(null);
      }
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Traceability search failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!auth.session) {
      return;
    }
    void submitSearch();
  }, [auth.session]);

  async function switchDirection(nextDirection: TraceDirection) {
    if (!selected) {
      return;
    }
    await loadGraph(selected, nextDirection);
  }

  async function downloadCsv() {
    if (!auth.session || !selected) {
      return;
    }

    const csv = await exportRecallReportCsv(auth.session.accessToken, selected.type, selected.id);
    downloadTextFile(`recall-${selected.label}.csv`, csv, "text/csv;charset=utf-8");
    showToast({ title: "Recall CSV exported", description: selected.label });
  }

  function downloadJson() {
    if (!report || !selected) {
      return;
    }

    downloadTextFile(
      `recall-${selected.label}.json`,
      JSON.stringify(report, null, 2),
      "application/json;charset=utf-8"
    );
    showToast({ title: "Recall JSON exported", description: selected.label });
  }

  const reportRows = report?.orders ?? [];

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="traceability-title">
        <div className="screen-heading">
          <p className="eyebrow">Traceability</p>
          <h2 id="traceability-title">Traceability explorer</h2>
          <p>Search operational identifiers, trace lots backward or forward, and export recall-ready affected order data.</p>
        </div>

        <form className="trace-search-panel" onSubmit={submitSearch}>
          <Input
            label="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Lot, SKU, order, grow batch, Shopify order"
          />
          <Button type="submit">
            <Search aria-hidden="true" size={18} />
            Search
          </Button>
        </form>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="trace-layout">
          <aside className="trace-results table-panel" aria-label="Trace search results">
            <div className="panel-heading">
              <h3>Matches</h3>
              <Badge>{results.length}</Badge>
            </div>
            {loading && results.length === 0 ? <p>Loading trace...</p> : null}
            <div className="record-list">
              {results.map((result) => (
                <button
                  className={`trace-result ${selected?.id === result.id && selected.type === result.type ? "active" : ""}`}
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => void loadGraph(result)}
                >
                  <span>
                    <strong>{result.label}</strong>
                    <small>{result.subtitle}</small>
                  </span>
                  <Badge tone={traceTone(result.status)}>{result.status}</Badge>
                </button>
              ))}
              {!loading && results.length === 0 ? <p>No trace records found.</p> : null}
            </div>
          </aside>

          <div className="trace-main">
            <div className="table-panel">
              <div className="panel-heading">
                <div>
                  <h3>{selected?.label ?? "No trace selected"}</h3>
                  <p className="muted-line">
                    {selected ? `${prettyTraceType(selected.type)} - ${direction}` : "Search and select a result."}
                  </p>
                </div>
                <div className="action-row">
                  <Button
                    variant={direction === "backward" ? "primary" : "secondary"}
                    size="sm"
                    type="button"
                    disabled={!selected}
                    onClick={() => void switchDirection("backward")}
                  >
                    Backward
                  </Button>
                  <Button
                    variant={direction === "forward" ? "primary" : "secondary"}
                    size="sm"
                    type="button"
                    disabled={!selected}
                    onClick={() => void switchDirection("forward")}
                  >
                    Forward
                  </Button>
                </div>
              </div>

              {graph ? (
                <Tabs
                  tabs={[
                    {
                      id: "graph",
                      label: "Graph",
                      content: (
                        <div className="trace-graph">
                          {graph.nodes.map((node, index) => (
                            <article
                              className={`trace-node trace-node-${node.status}`}
                              key={node.id}
                              style={{ "--trace-index": index } as CSSProperties}
                            >
                              <span>{prettyTraceType(node.type)}</span>
                              <strong>{node.label}</strong>
                              {node.subtitle ? <small>{node.subtitle}</small> : null}
                            </article>
                          ))}
                        </div>
                      )
                    },
                    {
                      id: "list",
                      label: "List",
                      content: (
                        <div className="trace-list-grid">
                          <div>
                            <h4>Nodes</h4>
                            <div className="record-list">
                              {graph.nodes.map((node) => (
                                <article className="inline-record" key={node.id}>
                                  <Badge tone={traceTone(node.status)}>{node.status}</Badge>
                                  <span>
                                    <strong>{node.label}</strong>
                                    <span>{prettyTraceType(node.type)} {node.subtitle ? `- ${node.subtitle}` : ""}</span>
                                  </span>
                                </article>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4>Relationships</h4>
                            <div className="record-list">
                              {graph.edges.map((edge) => (
                                <article className="inline-record" key={edge.id}>
                                  <GitBranch aria-hidden="true" size={18} />
                                  <span>
                                    <strong>{edge.label}</strong>
                                    <span>{edge.from} {"->"} {edge.to}</span>
                                  </span>
                                </article>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    }
                  ]}
                />
              ) : (
                <EmptyState
                  icon={<GitBranch aria-hidden="true" />}
                  title="No trace selected"
                  description="Search for a lot, SKU, order number, grow batch, or Shopify order number."
                />
              )}
            </div>

            {report ? (
              <div className="table-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Recall report</h3>
                    <p className="muted-line">Generated {formatDateTime(new Date(report.generatedAt))}</p>
                  </div>
                  <div className="action-row">
                    <Button variant="secondary" size="sm" onClick={downloadJson} type="button">
                      <FileText aria-hidden="true" size={16} />
                      JSON
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => void downloadCsv()} type="button">
                      <Download aria-hidden="true" size={16} />
                      CSV
                    </Button>
                  </div>
                </div>

                <div className="metric-grid trace-metrics">
                  <article className="metric-panel">
                    <span>Affected lots</span>
                    <strong>{formatNumber(report.summary.affectedLots)}</strong>
                  </article>
                  <article className="metric-panel">
                    <span>Affected orders</span>
                    <strong>{formatNumber(report.summary.affectedOrders)}</strong>
                  </article>
                  <article className="metric-panel">
                    <span>Shipped units</span>
                    <strong>{formatNumber(report.summary.shippedQuantity)}</strong>
                  </article>
                </div>

                <table className="list-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Lot</th>
                      <th>Quantity</th>
                      <th>Shipment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRows.map((row) => (
                      <tr key={`${row.orderId}-${row.lotCode}`}>
                        <td>
                          {row.orderNumber}
                          <div className="muted-line">{row.shopifyOrderNumber ?? row.channel}</div>
                        </td>
                        <td>
                          {row.customerName ?? "Unknown"}
                          <div className="muted-line">{row.resellerName ?? row.customerEmail ?? ""}</div>
                        </td>
                        <td>{row.lotCode}</td>
                        <td>{formatNumber(row.quantity)} {row.uom}</td>
                        <td>
                          {row.shipmentNumber ?? "Not shipped"}
                          <div className="muted-line">
                            {row.shippedAt ? formatDateTime(new Date(row.shippedAt)) : ""}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}

function MockRecallRoute() {
  const auth = useAuth();
  const { formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<MockRecallDashboard | null>(null);
  const [detail, setDetail] = useState<MockRecallRunDetail | null>(null);
  const [query, setQuery] = useState("LM-2026-06");
  const [results, setResults] = useState<TraceSearchResult[]>([]);
  const [selected, setSelected] = useState<TraceSearchResult | null>(null);
  const [scope, setScope] = useState("EU retail and wholesale shipped plus open stock");
  const [reason, setReason] = useState("Quarterly mock recall drill");
  const [drillMode, setDrillMode] = useState(true);
  const [gap, setGap] = useState("Open stock count needs supervisor confirmation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshDashboard() {
    if (!auth.session) {
      return;
    }
    const response = await getMockRecallDashboard(auth.session.accessToken);
    setDashboard(response.dashboard);
  }

  async function runSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!auth.session) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await searchTraceability(auth.session.accessToken, query);
      setResults(response.results);
      setSelected(response.results[0] ?? null);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Recall target search failed.");
    } finally {
      setLoading(false);
    }
  }

  async function startRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selected) {
      setError("Select a recall target first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const created = await createMockRecallRun(auth.session.accessToken, {
        scope,
        initiatingReason: reason,
        targetType: selected.type,
        targetId: selected.id,
        drillMode
      });
      setDetail(created);
      await refreshDashboard();
      showToast({ title: "Mock recall started", description: created.run.runNumber });
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Mock recall could not be started.");
    } finally {
      setLoading(false);
    }
  }

  async function recordGap() {
    if (!auth.session || !detail) {
      return;
    }
    const updated = await recordMockRecallAction(auth.session.accessToken, detail.run.id, {
      actionType: "gap",
      description: gap,
      status: "gap",
      gap
    });
    setDetail(updated);
    await refreshDashboard();
    showToast({ title: "Gap recorded", description: updated.run.runNumber });
  }

  async function finishRun() {
    if (!auth.session || !detail) {
      return;
    }
    const updated = await completeMockRecallRun(auth.session.accessToken, detail.run.id);
    setDetail(updated);
    await refreshDashboard();
    showToast({ title: "Drill completed", description: `${updated.run.elapsedSeconds ?? 0}s elapsed` });
  }

  async function downloadContacts() {
    if (!auth.session || !detail) {
      return;
    }
    const csv = await exportMockRecallContactsCsv(auth.session.accessToken, detail.run.id);
    downloadTextFile(`${detail.run.runNumber}-contacts.csv`, csv, "text/csv;charset=utf-8");
  }

  async function downloadPacket() {
    if (!auth.session || !detail) {
      return;
    }
    const response = await exportMockRecallPacketJson(auth.session.accessToken, detail.run.id);
    downloadTextFile(
      `${detail.run.runNumber}-audit-packet.json`,
      JSON.stringify(response.packet, null, 2),
      "application/json;charset=utf-8"
    );
  }

  useEffect(() => {
    if (!auth.session) {
      return;
    }
    void refreshDashboard();
    void runSearch();
  }, [auth.session]);

  const packet = detail?.packet ?? null;

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="mock-recall-title">
        <div className="screen-heading">
          <p className="eyebrow">Traceability</p>
          <h2 id="mock-recall-title">Mock recall launcher</h2>
          <p>Timed drills, affected stock, contacts, decisions, and audit packet exports.</p>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="trace-layout">
          <aside className="trace-results table-panel" aria-label="Mock recall targets">
            <div className="panel-heading">
              <h3>Target</h3>
              {loading ? <Badge tone="info">Loading</Badge> : null}
            </div>
            <form className="stack" onSubmit={runSearch}>
              <Input
                label="Target search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Lot, grow batch, harvest, material lot, batch"
              />
              <Button type="submit">
                <Search aria-hidden="true" size={18} />
                Search
              </Button>
            </form>
            <div className="record-list">
              {results.map((result) => (
                <button
                  className={`trace-result ${selected?.id === result.id && selected.type === result.type ? "active" : ""}`}
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => setSelected(result)}
                >
                  <span>
                    <strong>{result.label}</strong>
                    <small>{prettyTraceType(result.type)} - {result.subtitle}</small>
                  </span>
                  <Badge tone={traceTone(result.status)}>{result.status}</Badge>
                </button>
              ))}
            </div>
          </aside>

          <div className="trace-main">
            <form className="table-panel stack" onSubmit={startRun}>
              <div className="panel-heading">
                <div>
                  <h3>Run setup</h3>
                  <p className="muted-line">{selected ? `${selected.label} selected` : "No target selected"}</p>
                </div>
                <Badge tone={drillMode ? "warning" : "neutral"}>{drillMode ? "Drill mode" : "Untimed"}</Badge>
              </div>
              <Input label="Scope" value={scope} onChange={(event) => setScope(event.target.value)} />
              <Input label="Initiating reason" value={reason} onChange={(event) => setReason(event.target.value)} />
              <label className="checkbox-row">
                <input type="checkbox" checked={drillMode} onChange={(event) => setDrillMode(event.target.checked)} />
                Timed recall drill
              </label>
              <Button type="submit" disabled={!selected || loading}>
                <AlertTriangle aria-hidden="true" size={18} />
                Start mock recall
              </Button>
            </form>

            <div className="table-panel">
              <div className="panel-heading">
                <div>
                  <h3>Recall dashboard</h3>
                  <p className="muted-line">Open actions and unresolved stock</p>
                </div>
              </div>
              <div className="metric-grid trace-metrics">
                <article className="metric-panel">
                  <span>Open runs</span>
                  <strong>{formatNumber(dashboard?.openRuns.length ?? 0)}</strong>
                </article>
                <article className="metric-panel">
                  <span>Open actions</span>
                  <strong>{formatNumber(dashboard?.openActions.length ?? 0)}</strong>
                </article>
                <article className="metric-panel">
                  <span>Unresolved stock</span>
                  <strong>{formatNumber(dashboard?.unresolvedStock.length ?? 0)}</strong>
                </article>
              </div>
            </div>

            {detail && packet ? (
              <div className="table-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Run dashboard</h3>
                    <p className="muted-line">
                      {detail.run.runNumber} - {detail.run.status} - started {formatDateTime(new Date(detail.run.startedAt))}
                    </p>
                  </div>
                  <div className="action-row">
                    <Button variant="secondary" size="sm" type="button" onClick={() => void downloadPacket()}>
                      <FileText aria-hidden="true" size={16} />
                      Audit JSON
                    </Button>
                    <Button variant="secondary" size="sm" type="button" onClick={() => void downloadContacts()}>
                      <Download aria-hidden="true" size={16} />
                      Contacts CSV
                    </Button>
                    <Button variant="secondary" size="sm" type="button" onClick={() => void finishRun()}>
                      <CheckCircle2 aria-hidden="true" size={16} />
                      Complete
                    </Button>
                  </div>
                </div>

                <div className="metric-grid trace-metrics">
                  <article className="metric-panel">
                    <span>Affected lots</span>
                    <strong>{formatNumber(packet.summary.affectedLots)}</strong>
                  </article>
                  <article className="metric-panel">
                    <span>Shipped stock</span>
                    <strong>{formatNumber(packet.summary.shippedStockQuantity)}</strong>
                  </article>
                  <article className="metric-panel">
                    <span>Open stock</span>
                    <strong>{formatNumber(packet.summary.openStockQuantity)}</strong>
                  </article>
                  <article className="metric-panel">
                    <span>Gaps</span>
                    <strong>{formatNumber(packet.summary.recordedGaps)}</strong>
                  </article>
                </div>

                <Tabs
                  tabs={[
                    {
                      id: "impact",
                      label: "Impact map",
                      content: (
                        <div className="trace-graph">
                          {packet.traceGraph.nodes.map((node, index) => (
                            <article
                              className={`trace-node trace-node-${node.status}`}
                              key={node.id}
                              style={{ "--trace-index": index } as CSSProperties}
                            >
                              <span>{prettyTraceType(node.type)}</span>
                              <strong>{node.label}</strong>
                              {node.subtitle ? <small>{node.subtitle}</small> : null}
                            </article>
                          ))}
                        </div>
                      )
                    },
                    {
                      id: "stock",
                      label: "Stock",
                      content: (
                        <table className="list-table">
                          <thead>
                            <tr>
                              <th>Lot</th>
                              <th>Location</th>
                              <th>Available</th>
                              <th>Held</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {packet.stockStatus.map((stock) => (
                              <tr key={`${stock.lotId}-${stock.locationId}`}>
                                <td>{stock.lotCode}</td>
                                <td>{stock.locationName}</td>
                                <td>{formatNumber(stock.availableQuantity)} {stock.uom}</td>
                                <td>{formatNumber(stock.heldQuantity)} {stock.uom}</td>
                                <td><Badge tone={stock.unresolved ? "warning" : "success"}>{stock.unresolved ? "unresolved" : "clear"}</Badge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )
                    },
                    {
                      id: "contacts",
                      label: "Contacts",
                      content: (
                        <div className="record-list">
                          {packet.contacts.map((contact) => (
                            <article className="inline-record" key={`${contact.contactType}-${contact.customerName}`}>
                              <Users aria-hidden="true" size={18} />
                              <span>
                                <strong>{contact.customerName}</strong>
                                <span>{contact.email ?? "No email"} - {contact.orderNumbers.join(", ")}</span>
                              </span>
                              <Badge>{contact.contactType}</Badge>
                            </article>
                          ))}
                        </div>
                      )
                    },
                    {
                      id: "quality",
                      label: "Quality",
                      content: (
                        <div className="trace-list-grid">
                          <div>
                            <h4>QC and COAs</h4>
                            <div className="record-list">
                              {packet.qcRecords.map((record) => (
                                <article className="inline-record" key={record.id}>
                                  <ShieldCheck aria-hidden="true" size={18} />
                                  <span>
                                    <strong>{record.recordCode}</strong>
                                    <span>{record.subjectLabel} - {record.status}</span>
                                  </span>
                                </article>
                              ))}
                              {packet.coaAttachments.map((coa) => (
                                <article className="inline-record" key={coa.id}>
                                  <FileText aria-hidden="true" size={18} />
                                  <span>
                                    <strong>{coa.fileName}</strong>
                                    <span>{coa.contentType}</span>
                                  </span>
                                </article>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4>Actions and gaps</h4>
                            <div className="record-list">
                              {detail.actions.map((action) => (
                                <article className="inline-record" key={action.id}>
                                  <AlertTriangle aria-hidden="true" size={18} />
                                  <span>
                                    <strong>{action.description}</strong>
                                    <span>{action.status} {action.decision ? `- ${action.decision}` : ""}</span>
                                  </span>
                                </article>
                              ))}
                            </div>
                            <div className="action-row">
                              <Input label="Gap" value={gap} onChange={(event) => setGap(event.target.value)} />
                              <Button type="button" variant="secondary" onClick={() => void recordGap()}>
                                Record gap
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  ]}
                />
              </div>
            ) : (
              <EmptyState
                icon={<AlertTriangle aria-hidden="true" />}
                title="No mock recall run"
                description="Start a run from a traceability target."
              />
            )}
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}

function ReportsRoute() {
  const auth = useAuth();
  const { formatNumber, formatDateTime } = useI18n();
  const { showToast } = useToast();
  const [definitions, setDefinitions] = useState<ReportDefinition[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [presets, setPresets] = useState<ReportPreset[]>([]);
  const [selectedReportId, setSelectedReportId] = useState("inventory_valuation");
  const [filters, setFilters] = useState<ReportFilters>({
    locationId: "",
    itemId: "",
    lotStatus: "",
    channel: "",
    dateFrom: "",
    dateTo: "",
    sourceType: "grow_batch",
    sourceId: "grow-lm-2026-06",
    expiringWithinDays: 90
  });
  const [report, setReport] = useState<OperationalReport | null>(null);
  const [presetName, setPresetName] = useState("Monthly export");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedDefinition =
    definitions.find((definition) => definition.id === selectedReportId) ?? definitions[0] ?? null;
  const uniqueItems = useMemo(() => {
    const seen = new Map<string, { itemId: string; label: string }>();
    balances.forEach((balance) => {
      if (!seen.has(balance.itemId)) {
        seen.set(balance.itemId, {
          itemId: balance.itemId,
          label: `${balance.itemSku ?? balance.itemId} - ${balance.itemName ?? balance.itemType}`
        });
      }
    });
    return Array.from(seen.values());
  }, [balances]);

  async function loadReport(nextReportId = selectedReportId, nextFilters = filters) {
    if (!auth.session) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getOperationalReport(auth.session.accessToken, nextReportId, compactReportFilters(nextFilters));
      setReport(response.report);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Report could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!auth.session) {
      return;
    }

    setLoading(true);
    Promise.all([
      listReports(auth.session.accessToken),
      listLocations(auth.session.accessToken),
      listInventoryBalances(auth.session.accessToken),
      listReportPresets(auth.session.accessToken)
    ])
      .then(([reportResponse, locationResponse, balanceResponse, presetResponse]) => {
        setDefinitions(reportResponse.reports);
        setLocations(locationResponse.locations);
        setBalances(balanceResponse.balances);
        setPresets(presetResponse.presets);
        const firstReportId = reportResponse.reports[0]?.id ?? selectedReportId;
        setSelectedReportId(firstReportId);
        void loadReport(firstReportId, filters);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Reports could not be loaded.");
        setLoading(false);
      });
  }, [auth.session]);

  async function changeReport(reportId: string) {
    const definition = definitions.find((candidate) => candidate.id === reportId);
    const nextFilters = {
      ...filters,
      ...(definition?.defaultFilters ?? {})
    };
    setSelectedReportId(reportId);
    setFilters(nextFilters);
    await loadReport(reportId, nextFilters);
  }

  async function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadReport();
  }

  async function applyPreset(preset: ReportPreset) {
    setSelectedReportId(preset.reportId);
    setFilters({ ...filters, ...preset.filters });
    await loadReport(preset.reportId, { ...filters, ...preset.filters });
  }

  async function savePreset() {
    if (!auth.session) {
      return;
    }
    const response = await saveReportPreset(auth.session.accessToken, {
      name: presetName,
      reportId: selectedReportId,
      filters: compactReportFilters(filters)
    });
    setPresets((current) => [
      response.preset,
      ...current.filter((preset) => preset.id !== response.preset.id)
    ]);
    showToast({ title: "Report preset saved", description: response.preset.name });
  }

  async function removePreset(preset: ReportPreset) {
    if (!auth.session) {
      return;
    }
    await deleteReportPreset(auth.session.accessToken, preset.id);
    setPresets((current) => current.filter((candidate) => candidate.id !== preset.id));
    showToast({ title: "Report preset deleted", description: preset.name });
  }

  async function exportCsv() {
    if (!auth.session || !report) {
      return;
    }
    const csv = await exportOperationalReportCsv(
      auth.session.accessToken,
      selectedReportId,
      compactReportFilters(filters)
    );
    downloadTextFile(`${selectedReportId}.csv`, csv, "text/csv;charset=utf-8");
    showToast({ title: "CSV exported", description: report.metadata.title });
  }

  async function exportJson() {
    if (!auth.session || !report) {
      return;
    }
    const json = await exportOperationalReportJson(
      auth.session.accessToken,
      selectedReportId,
      compactReportFilters(filters)
    );
    downloadTextFile(`${selectedReportId}.json`, json, "application/json;charset=utf-8");
    showToast({ title: "JSON exported", description: report.metadata.title });
  }

  const visibleColumns = report?.columns.slice(0, 8) ?? [];

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="reports-title">
        <div className="screen-heading">
          <p className="eyebrow">Reports</p>
          <h2 id="reports-title">Operational reports and exports</h2>
          <p>Inventory, compliance, sync, yield, and wholesale exports with stable schemas for accounting and BI tools.</p>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="table-panel">
          <div className="panel-heading">
            <div>
              <h3>{selectedDefinition?.title ?? "Report"}</h3>
              <p>{selectedDefinition?.description}</p>
            </div>
            <div className="form-actions">
              <Button variant="secondary" size="sm" type="button" onClick={() => void exportCsv()} disabled={!report}>
                <Download aria-hidden="true" size={16} />
                CSV
              </Button>
              <Button variant="secondary" size="sm" type="button" onClick={() => void exportJson()} disabled={!report}>
                <FileText aria-hidden="true" size={16} />
                JSON
              </Button>
            </div>
          </div>

          <form className="compact-form-grid" onSubmit={submitFilters}>
            <label className="select-field">
              <span>Report type</span>
              <select value={selectedReportId} onChange={(event) => void changeReport(event.target.value)}>
                {definitions.map((definition) => (
                  <option key={definition.id} value={definition.id}>
                    {definition.title}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Date from"
              type="date"
              value={String(filters.dateFrom ?? "")}
              onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
            />
            <Input
              label="Date to"
              type="date"
              value={String(filters.dateTo ?? "")}
              onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
            />
            <label className="select-field">
              <span>Location</span>
              <select
                value={String(filters.locationId ?? "")}
                onChange={(event) => setFilters((current) => ({ ...current, locationId: event.target.value }))}
              >
                <option value="">All locations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="select-field">
              <span>Product</span>
              <select
                value={String(filters.itemId ?? "")}
                onChange={(event) => setFilters((current) => ({ ...current, itemId: event.target.value }))}
              >
                <option value="">All products</option>
                {uniqueItems.map((item) => (
                  <option key={item.itemId} value={item.itemId}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="select-field">
              <span>Lot status</span>
              <select
                value={String(filters.lotStatus ?? "")}
                onChange={(event) => setFilters((current) => ({ ...current, lotStatus: event.target.value }))}
              >
                <option value="">Any status</option>
                <option value="pending">Pending</option>
                <option value="released">Released</option>
                <option value="hold">Hold</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </label>
            <label className="select-field">
              <span>Channel</span>
              <select
                value={String(filters.channel ?? "")}
                onChange={(event) => setFilters((current) => ({ ...current, channel: event.target.value }))}
              >
                <option value="">All channels</option>
                <option value="shopify">Shopify</option>
                <option value="wholesale">Wholesale</option>
                <option value="manual">Manual</option>
              </select>
            </label>
            <Input
              label="Expiry days"
              inputMode="numeric"
              value={String(filters.expiringWithinDays ?? "")}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  expiringWithinDays: event.target.value ? Number(event.target.value) : null
                }))
              }
            />
            <label className="select-field">
              <span>Recall source</span>
              <select
                value={String(filters.sourceType ?? "grow_batch")}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    sourceType: event.target.value as Exclude<ReportFilters["sourceType"], undefined>
                  }))
                }
              >
                <option value="grow_batch">Grow batch</option>
                <option value="harvest">Harvest</option>
                <option value="lot">Lot</option>
                <option value="processing_batch">Processing batch</option>
              </select>
            </label>
            <Input
              label="Source ID"
              value={String(filters.sourceId ?? "")}
              onChange={(event) => setFilters((current) => ({ ...current, sourceId: event.target.value }))}
            />
            <Button type="submit">
              <Search aria-hidden="true" size={18} />
              Run report
            </Button>
          </form>
        </div>

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Saved presets</h3>
            <div className="form-actions">
              <Input
                label="Preset name"
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
              />
              <Button type="button" variant="secondary" onClick={() => void savePreset()}>
                <PlusCircle aria-hidden="true" size={16} />
                Save
              </Button>
            </div>
          </div>
          <div className="record-list">
            {presets.map((preset) => (
              <article className="trace-result" key={preset.id}>
                <span>
                  <strong>{preset.name}</strong>
                  <small>{preset.reportId}</small>
                </span>
                <Badge tone="info">Preset</Badge>
                <Button size="sm" type="button" variant="secondary" onClick={() => void applyPreset(preset)}>
                  <CheckCircle2 aria-hidden="true" size={16} />
                  Apply
                </Button>
                <Button
                  aria-label={`Delete ${preset.name}`}
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => void removePreset(preset)}
                >
                  <XCircle aria-hidden="true" size={16} />
                </Button>
              </article>
            ))}
            {presets.length === 0 ? <p>No saved presets yet.</p> : null}
          </div>
        </div>

        <div className="metric-grid">
          <article className="metric-panel">
            <span>Rows</span>
            <strong>{formatNumber(report?.metadata.rowCount ?? 0)}</strong>
          </article>
          <article className="metric-panel">
            <span>Schema</span>
            <strong>v{report?.metadata.schemaVersion ?? 1}</strong>
          </article>
          <article className="metric-panel">
            <span>Generated</span>
            <strong>{report ? formatDateTime(new Date(report.metadata.generatedAt)) : "Not run"}</strong>
          </article>
        </div>

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Results</h3>
            <Badge tone="info">{report?.metadata.exportPurpose ?? "operations"}</Badge>
          </div>
          {loading ? (
            <p>Loading report...</p>
          ) : report && report.rows.length > 0 ? (
            <table className="list-table">
              <thead>
                <tr>
                  {visibleColumns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.slice(0, 25).map((row, index) => (
                  <tr key={`${report.metadata.reportId}-${index}`}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{formatReportCell(row[column.key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState title="No rows" description="Run another report or adjust filters." />
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}

const emptyMasterDataSnapshot: MasterDataSnapshot = {
  products: [],
  productVariants: [],
  materials: [],
  packagingComponents: [],
  locations: []
};

function formValue(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

function nullableFormValue(form: FormData, name: string): string | null {
  const value = formValue(form, name);
  return value.length > 0 ? value : null;
}

function allMasterDataSkus(masterData: MasterDataSnapshot): string[] {
  return [
    ...masterData.productVariants.map((variant) => variant.sku),
    ...masterData.materials.map((material) => material.sku ?? ""),
    ...masterData.packagingComponents.map((component) => component.sku)
  ].filter(Boolean);
}

function InventoryRoute() {
  const auth = useAuth();
  const { formatNumber, formatDate, formatDateTime } = useI18n();
  const { showToast } = useToast();
  const syncStatus = useSyncStatus();
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [masterData, setMasterData] = useState<MasterDataSnapshot>(emptyMasterDataSnapshot);
  const [selectedBalanceId, setSelectedBalanceId] = useState<string | null>(null);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<"material" | "packaging_component" | "product_variant">("material");
  const [newItemClassCode, setNewItemClassCode] = useState(inventoryItemClasses[0]!.code);
  const [newItemName, setNewItemName] = useState("New inventory item");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adjustmentDirection, setAdjustmentDirection] = useState<"increase" | "decrease">("increase");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("1");
  const [adjustmentReason, setAdjustmentReason] = useState("cycle_count");
  const [transferToLocationId, setTransferToLocationId] = useState("loc-shopify");
  const [transferQuantity, setTransferQuantity] = useState("1");

  const selectedBalance =
    balances.find((balance) => balance.id === selectedBalanceId) ?? balances[0] ?? null;
  const selectedItemClass = itemClassByCode(newItemClassCode);
  const generatedSku = generateInventorySku(newItemClassCode, newItemName, allMasterDataSkus(masterData));

  async function loadInventory(nextSelectedLotId?: string | null) {
    if (!auth.session) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [balanceResponse, locationResponse, masterDataResponse] = await Promise.all([
        listInventoryBalances(auth.session.accessToken),
        listLocations(auth.session.accessToken),
        listMasterData(auth.session.accessToken)
      ]);
      setBalances(balanceResponse.balances);
      setLocations(locationResponse.locations);
      setMasterData(masterDataResponse);

      const selected =
        balanceResponse.balances.find((balance) => balance.lotId === nextSelectedLotId) ??
        balanceResponse.balances.find((balance) => balance.id === selectedBalanceId) ??
        balanceResponse.balances[0] ??
        null;
      setSelectedBalanceId(selected?.id ?? null);

      const movementResponse = await listStockMovements(
        auth.session.accessToken,
        selected?.lotId ? { lotId: selected.lotId } : {}
      );
      setMovements(movementResponse.movements);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Inventory could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!auth.session) {
      return;
    }

    void loadInventory();
  }, [auth.session]);

  useEffect(() => {
    if (!auth.session || !selectedBalance) {
      return;
    }

    listStockMovements(
      auth.session.accessToken,
      selectedBalance.lotId ? { lotId: selectedBalance.lotId } : {}
    ).then((response) => setMovements(response.movements));
  }, [auth.session, selectedBalance?.lotId]);

  async function submitAdjustment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedBalance) {
      return;
    }

    const quantity = Number(adjustmentQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    try {
      await postInventoryAdjustment(auth.session.accessToken, {
        clientTransactionId: crypto.randomUUID(),
        itemType: selectedBalance.itemType,
        itemId: selectedBalance.itemId,
        lotId: selectedBalance.lotId,
        fromLocationId: adjustmentDirection === "decrease" ? selectedBalance.locationId : null,
        toLocationId: adjustmentDirection === "increase" ? selectedBalance.locationId : null,
        quantity,
        uom: selectedBalance.uom,
        reasonCode: adjustmentReason,
        notes: "Posted from inventory adjustment form"
      });
      showToast({
        title: syncStatus.online ? "Adjustment posted" : "Adjustment queued offline",
        description: selectedBalance.lotCode ?? selectedBalance.itemSku ?? ""
      });
      await loadInventory(selectedBalance.lotId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Adjustment failed.");
    }
  }

  async function submitTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !selectedBalance) {
      return;
    }

    const quantity = Number(transferQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    try {
      await postInventoryTransfer(auth.session.accessToken, {
        clientTransactionId: crypto.randomUUID(),
        itemType: selectedBalance.itemType,
        itemId: selectedBalance.itemId,
        lotId: selectedBalance.lotId,
        fromLocationId: selectedBalance.locationId,
        toLocationId: transferToLocationId,
        quantity,
        uom: selectedBalance.uom,
        reasonCode: "location_transfer",
        notes: "Posted from inventory transfer form"
      });
      showToast({
        title: syncStatus.online ? "Transfer posted" : "Transfer queued offline",
        description: selectedBalance.lotCode ?? selectedBalance.itemSku ?? ""
      });
      await loadInventory(selectedBalance.lotId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Transfer failed.");
    }
  }

  async function submitNewInventoryItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const itemClass = itemClassByCode(formValue(form, "itemClassCode"));
    const name = formValue(form, "name");
    const sku = formValue(form, "sku") || generateInventorySku(itemClass.code, name, allMasterDataSkus(masterData));
    const uom = formValue(form, "uom") || defaultUomForItemClass(itemClass);
    const trackLots = form.get("trackLots") === "on";
    const trackExpiry = form.get("trackExpiry") === "on";

    try {
      if (newItemType === "packaging_component") {
        await createPackagingComponent(auth.session.accessToken, {
          name,
          uom,
          sku,
          barcode: nullableFormValue(form, "barcode"),
          trackLots,
          localizedNames: { en: name, pt: "" },
          localizedDescriptions: { en: `${itemClass.name} / ${itemClass.phase}`, pt: "" }
        });
      } else if (newItemType === "product_variant") {
        const productResponse = await createProduct(auth.session.accessToken, {
          name,
          category: itemClass.name,
          descriptionI18n: { en: formValue(form, "description"), pt: "" },
          localizedNames: { en: name, pt: "" },
          localizedDescriptions: { en: formValue(form, "description"), pt: "" },
          status: "draft",
          brand: "Mushroom Compadres",
          defaultUom: uom
        });
        await createProductVariant(auth.session.accessToken, {
          productId: productResponse.product.id,
          sku,
          barcode: nullableFormValue(form, "barcode"),
          nameI18n: { en: name, pt: "" },
          localizedNames: { en: name, pt: "" },
          form: itemClass.phase.toLowerCase().replaceAll(" ", "_"),
          trackLots,
          trackExpiry,
          inventoryUom: uom,
          sellableUom: uom,
          netQuantity: null,
          status: "draft",
          shopifyVariantGid: null,
          shopifyInventoryItemGid: null
        });
      } else {
        await createMaterial(auth.session.accessToken, {
          name,
          category: itemClass.name,
          sku,
          barcode: nullableFormValue(form, "barcode"),
          uom,
          supplierPartNumber: nullableFormValue(form, "supplierPartNumber"),
          trackLots,
          trackExpiry,
          localizedNames: { en: name, pt: "" },
          localizedDescriptions: { en: formValue(form, "description"), pt: "" }
        });
      }
      showToast({ title: "Inventory item created", description: `${sku} / ${itemClass.name}` });
      setNewItemOpen(false);
      await loadInventory();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Inventory item create failed.");
    }
  }

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="inventory-title">
        <div className="screen-heading">
          <p className="eyebrow">Inventory</p>
          <h2 id="inventory-title">Inventory balances</h2>
          <p>Append-only movement ledger with derived balances by item, lot, and location.</p>
        </div>

        <div className="action-row">
          <Button type="button" onClick={() => setNewItemOpen(true)}>
            <PackagePlus aria-hidden="true" size={18} />
            New inventory item
          </Button>
          <Link to="/master-data" className="button button-secondary button-md">
            <PackageSearch aria-hidden="true" size={18} />
            Master data
          </Link>
        </div>

        <SyncStatusPanel compact />

        {error ? <p className="form-error">{error}</p> : null}

        <div className="inventory-layout">
          <div className="table-panel">
            <div className="panel-heading">
              <h3>Balances</h3>
              <Button variant="secondary" size="sm" onClick={() => void loadInventory()}>
                <History aria-hidden="true" size={16} />
                Refresh
              </Button>
            </div>
            {loading ? (
              <p>Loading inventory...</p>
            ) : (
              <table className="list-table inventory-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Lot</th>
                    <th>Expiry</th>
                    <th>Location</th>
                    <th>Available</th>
                    <th>Reserved</th>
                    <th>Held</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((balance) => (
                    <tr
                      className={balance.id === selectedBalance?.id ? "selected-row" : ""}
                      key={balance.id}
                      onClick={() => setSelectedBalanceId(balance.id)}
                    >
                      <td>
                        <strong>{balance.itemName ?? balance.itemId}</strong>
                        <span>{balance.itemSku}</span>
                      </td>
                      <td>{balance.lotCode ?? "Unlotted"}</td>
                      <td>{balance.expiresAt ? formatDate(new Date(balance.expiresAt)) : "None"}</td>
                      <td>{balance.locationName}</td>
                      <td>{formatNumber(balance.availableQuantity)} {balance.uom}</td>
                      <td>{formatNumber(balance.reservedQuantity)} {balance.uom}</td>
                      <td>{formatNumber(balance.heldQuantity)} {balance.uom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <aside className="detail-panel" aria-label="Item and lot balance detail">
            <h3>{selectedBalance?.lotCode ?? selectedBalance?.itemSku ?? "No balance selected"}</h3>
            {selectedBalance ? (
              <>
                <dl className="balance-detail-list">
                  <div>
                    <dt>Item</dt>
                    <dd>{selectedBalance.itemName}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{selectedBalance.locationName}</dd>
                  </div>
                  <div>
                    <dt>Available</dt>
                    <dd>{formatNumber(selectedBalance.availableQuantity)} {selectedBalance.uom}</dd>
                  </div>
                  <div>
                    <dt>Reserved</dt>
                    <dd>{formatNumber(selectedBalance.reservedQuantity)} {selectedBalance.uom}</dd>
                  </div>
                  <div>
                    <dt>Held</dt>
                    <dd>{formatNumber(selectedBalance.heldQuantity)} {selectedBalance.uom}</dd>
                  </div>
                  <div>
                    <dt>Expiry</dt>
                    <dd>{selectedBalance.expiresAt ? formatDate(new Date(selectedBalance.expiresAt)) : "None"}</dd>
                  </div>
                </dl>
                <h4>Movement history</h4>
                <div className="movement-list">
                  {movements.map((movement) => (
                    <article key={movement.id}>
                      <strong>{movement.movementNumber}</strong>
                      <span>{movement.movementType.replaceAll("_", " ")}</span>
                      <span>{formatNumber(movement.quantity)} {movement.uom}</span>
                      <small>{formatDateTime(new Date(movement.occurredAt))}</small>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <p>Select a balance row.</p>
            )}
          </aside>
        </div>

        <Tabs
          tabs={[
            {
              id: "adjustment",
              label: "Adjustment",
              content: (
                <form className="inventory-form-grid" onSubmit={submitAdjustment}>
                  <label className="select-field">
                    <span>Direction</span>
                    <select
                      value={adjustmentDirection}
                      onChange={(event) =>
                        setAdjustmentDirection(event.target.value as "increase" | "decrease")
                      }
                    >
                      <option value="increase">Increase available</option>
                      <option value="decrease">Decrease available</option>
                    </select>
                  </label>
                  <Input
                    label="Quantity"
                    min="0.000001"
                    step="0.000001"
                    type="number"
                    value={adjustmentQuantity}
                    onChange={(event) => setAdjustmentQuantity(event.target.value)}
                  />
                  <label className="select-field">
                    <span>Reason</span>
                    <select
                      value={adjustmentReason}
                      onChange={(event) => setAdjustmentReason(event.target.value)}
                    >
                      <option value="cycle_count">Cycle count</option>
                      <option value="damage">Damage</option>
                      <option value="found_stock">Found stock</option>
                    </select>
                  </label>
                  <div className="form-actions">
                    <Button type="submit" disabled={!selectedBalance}>
                      <PlusCircle aria-hidden="true" size={18} />
                      Post adjustment
                    </Button>
                  </div>
                </form>
              )
            },
            {
              id: "transfer",
              label: "Transfer",
              content: (
                <form className="inventory-form-grid" onSubmit={submitTransfer}>
                  <label className="select-field">
                    <span>From</span>
                    <select value={selectedBalance?.locationId ?? ""} disabled>
                      <option>{selectedBalance?.locationName ?? "Select a balance"}</option>
                    </select>
                  </label>
                  <label className="select-field">
                    <span>To</span>
                    <select
                      value={transferToLocationId}
                      onChange={(event) => setTransferToLocationId(event.target.value)}
                    >
                      {locations
                        .filter((location) => location.id !== selectedBalance?.locationId)
                        .map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <Input
                    label="Quantity"
                    min="0.000001"
                    step="0.000001"
                    type="number"
                    value={transferQuantity}
                    onChange={(event) => setTransferQuantity(event.target.value)}
                  />
                  <div className="form-actions">
                    <Button type="submit" disabled={!selectedBalance}>
                      <ArrowLeftRight aria-hidden="true" size={18} />
                      Post transfer
                    </Button>
                  </div>
                </form>
              )
            }
          ]}
        />

        <Dialog title="Create inventory item" open={newItemOpen} onClose={() => setNewItemOpen(false)}>
          <form className="form-grid" onSubmit={submitNewInventoryItem}>
            <label className="select-field">
              <span>Item type</span>
              <select value={newItemType} onChange={(event) => setNewItemType(event.target.value as typeof newItemType)}>
                <option value="material">Material</option>
                <option value="packaging_component">Packaging component</option>
                <option value="product_variant">Finished good / SKU</option>
              </select>
            </label>
            <label className="select-field">
              <span>Item class</span>
              <select
                name="itemClassCode"
                value={newItemClassCode}
                onChange={(event) => setNewItemClassCode(event.target.value)}
              >
                {inventoryItemClasses.map((itemClass) => (
                  <option key={itemClass.code} value={itemClass.code}>
                    {itemClass.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Item name"
              name="name"
              required
              value={newItemName}
              onChange={(event) => setNewItemName(event.target.value)}
            />
            <Input label="Generated SKU" name="sku" readOnly value={generatedSku} hint="SKU is assigned by item class and existing native SKUs." />
            <Input label="UOM" name="uom" required defaultValue={defaultUomForItemClass(selectedItemClass)} key={selectedItemClass.code} />
            <Input label="Barcode" name="barcode" />
            <Input label="Supplier part" name="supplierPartNumber" disabled={newItemType !== "material"} />
            <Input label="Description" name="description" className="full-span" defaultValue={`${selectedItemClass.group} / ${selectedItemClass.erpItemType}`} key={`${selectedItemClass.code}-description`} />
            <dl className="class-defaults full-span">
              <div><dt>Phase</dt><dd>{selectedItemClass.phase}</dd></div>
              <div><dt>QC</dt><dd>{selectedItemClass.qcRequired ? "Required" : "Not required"}</dd></div>
              <div><dt>BOM</dt><dd>{selectedItemClass.usedInBom ? "Component" : selectedItemClass.producedByBom ? "Produced" : "Not used"}</dd></div>
            </dl>
            <div className="checkbox-grid full-span">
              <label><input name="trackLots" type="checkbox" defaultChecked={selectedItemClass.lotTracked} key={`${selectedItemClass.code}-lot`} /> Lot tracking</label>
              <label><input name="trackExpiry" type="checkbox" defaultChecked={selectedItemClass.expiryTracked} key={`${selectedItemClass.code}-expiry`} /> Expiry tracking</label>
            </div>
            <div className="form-actions full-span">
              <Button type="submit">
                <Save aria-hidden="true" size={18} />
                Create item
              </Button>
            </div>
          </form>
        </Dialog>
      </section>
    </ProtectedRoute>
  );
}

function AdminUsersRoute() {
  const { t } = useI18n();
  const auth = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.session || !auth.isAdmin) {
      return;
    }

    listUsers(auth.session.accessToken)
      .then((response) => setUsers(response.users))
      .finally(() => setLoading(false));
  }, [auth.isAdmin, auth.session]);

  return (
    <ProtectedRoute adminOnly>
      <section className="screen-grid" aria-labelledby="users-title">
        <div className="screen-heading">
          <p className="eyebrow">{t("admin.users.title")}</p>
          <h2 id="users-title">{t("admin.users.title")}</h2>
          <p>{t("admin.users.description")}</p>
        </div>
        <div className="table-panel">
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <table className="list-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <Link to="/admin/users/$userId" params={{ userId: user.id }}>
                        {user.displayName}
                      </Link>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <Badge>{user.status}</Badge>
                    </td>
                    <td>{user.roles.map((role) => role.roleName).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}

function AdminUserDetailRoute() {
  const { t } = useI18n();
  const auth = useAuth();
  const params = useParams({ strict: false }) as { userId: string };
  const [user, setUser] = useState<AdminUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!auth.session || !auth.isAdmin) {
      return;
    }

    Promise.all([
      getUser(auth.session.accessToken, params.userId),
      listRoles(auth.session.accessToken),
      listLocations(auth.session.accessToken)
    ]).then(([userResponse, rolesResponse, locationsResponse]) => {
      setUser(userResponse.user);
      setRoles(rolesResponse.roles);
      setLocations(locationsResponse.locations);
      setAssignments(
        Object.fromEntries(
          userResponse.user.roles.map((assignment) => [
            assignment.roleId,
            assignment.locationId ?? "global"
          ])
        )
      );
    });
  }, [auth.isAdmin, auth.session, params.userId]);

  async function saveAssignments() {
    if (!auth.session || !user) {
      return;
    }

    const response = await updateUser(auth.session.accessToken, user.id, {
      roleAssignments: Object.entries(assignments).map(([roleId, locationValue]) => ({
        roleId,
        locationId: locationValue === "global" ? null : locationValue
      }))
    });
    setUser(response.user);
  }

  return (
    <ProtectedRoute adminOnly>
      <section className="screen-grid" aria-labelledby="user-title">
        <div className="screen-heading">
          <p className="eyebrow">{t("admin.userDetail.title")}</p>
          <h2 id="user-title">{user?.displayName ?? t("admin.userDetail.title")}</h2>
          <p>{user?.email}</p>
        </div>

        <div className="table-panel">
          <h3>{t("admin.assignments")}</h3>
          <div className="role-grid">
            {roles.map((role) => (
              <label className="role-row" key={role.id}>
                <span>
                  <input
                    type="checkbox"
                    checked={assignments[role.id] !== undefined}
                    onChange={(event) =>
                      setAssignments((current) => {
                        const next = { ...current };
                        if (event.target.checked) {
                          next[role.id] = "global";
                        } else {
                          delete next[role.id];
                        }
                        return next;
                      })
                    }
                  />
                  {role.name}
                </span>
                <select
                  disabled={assignments[role.id] === undefined}
                  value={assignments[role.id] ?? "global"}
                  onChange={(event) =>
                    setAssignments((current) => ({ ...current, [role.id]: event.target.value }))
                  }
                >
                  <option value="global">{t("admin.globalScope")}</option>
                  {locations.map((location) => (
                    <option value={location.id} key={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <Button onClick={() => void saveAssignments()}>{t("admin.save")}</Button>
        </div>
      </section>
    </ProtectedRoute>
  );
}

function AdminFeedbackRoute() {
  const auth = useAuth();
  const { formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapSnapshot | null>(null);
  const [role, setRole] = useState("");
  const [module, setModule] = useState("");
  const [status, setStatus] = useState<FeedbackStatus | "">("");
  const [priority, setPriority] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<string[]>([]);
  const [backlogTitle, setBacklogTitle] = useState("");
  const [userImpact, setUserImpact] = useState("4");
  const [frequency, setFrequency] = useState("3");
  const [complianceRisk, setComplianceRisk] = useState("2");
  const [revenueImpact, setRevenueImpact] = useState("2");
  const [effortEstimate, setEffortEstimate] = useState("2");
  const [dependency, setDependency] = useState("1");
  const [releaseVersion, setReleaseVersion] = useState("0.25.2-beta");
  const [releaseName, setReleaseName] = useState("Feedback roadmap fixes");
  const [selectedBacklogId, setSelectedBacklogId] = useState("");
  const [selectedReleaseId, setSelectedReleaseId] = useState("");
  const [codexPrompt, setCodexPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadFeedback() {
    if (!auth.session) {
      return;
    }
    const [feedbackResponse, usersResponse, roadmapResponse] = await Promise.all([
      listFeedback(auth.session.accessToken, { role, module, status, priority, dateFrom, dateTo }),
      listUsers(auth.session.accessToken),
      getRoadmapSnapshot(auth.session.accessToken)
    ]);
    setFeedback(feedbackResponse.feedback);
    setUsers(usersResponse.users);
    setRoadmap(roadmapResponse.roadmap);
    setCodexPrompt(roadmapResponse.roadmap.codexPrompt);
    setSelectedBacklogId((current) => current || roadmapResponse.roadmap.backlogItems[0]?.id || "");
    setSelectedReleaseId((current) => current || roadmapResponse.roadmap.releases[0]?.id || "");
  }

  useEffect(() => {
    void loadFeedback().catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Feedback could not be loaded."));
  }, [auth.session]);

  async function triage(feedbackId: string, input: Partial<Pick<FeedbackItem, "status" | "priority" | "assignedTo">>) {
    if (!auth.session) {
      return;
    }
    const response = await updateFeedback(auth.session.accessToken, feedbackId, input);
    setFeedback((current) => current.map((item) => (item.id === feedbackId ? response.feedback : item)));
    showToast({ title: "Feedback updated", description: `${response.feedback.workflow} is ${response.feedback.status}.` });
  }

  async function copyExport(kind: "csv" | "json") {
    if (!auth.session) {
      return;
    }
    const content = kind === "csv"
      ? await exportFeedbackCsv(auth.session.accessToken)
      : await exportFeedbackJson(auth.session.accessToken);
    await navigator.clipboard.writeText(content);
    showToast({ title: `Feedback ${kind.toUpperCase()} copied`, description: "Ready for planning or build intake." });
  }

  function toggleSelectedFeedback(feedbackId: string) {
    setSelectedFeedbackIds((current) =>
      current.includes(feedbackId) ? current.filter((id) => id !== feedbackId) : [...current, feedbackId]
    );
  }

  async function refreshRoadmap() {
    if (!auth.session) {
      return;
    }
    const response = await getRoadmapSnapshot(auth.session.accessToken);
    setRoadmap(response.roadmap);
    setCodexPrompt(response.roadmap.codexPrompt);
    setSelectedBacklogId((current) => current || response.roadmap.backlogItems[0]?.id || "");
    setSelectedReleaseId((current) => current || response.roadmap.releases[0]?.id || "");
  }

  async function convertSelectedFeedback() {
    if (!auth.session || selectedFeedbackIds.length === 0) {
      return;
    }
    const selected = feedback.filter((item) => selectedFeedbackIds.includes(item.id));
    const first = selected[0];
    if (!first) {
      return;
    }
    const title = backlogTitle.trim() || `${first.workflow} improvement`;
    const response = await createBacklogItem(auth.session.accessToken, {
      title,
      description: selected.map((item) => item.notes).join("\n"),
      userImpact: Number(userImpact),
      frequency: Number(frequency),
      complianceRisk: Number(complianceRisk),
      revenueImpact: Number(revenueImpact),
      effortEstimate: Number(effortEstimate),
      dependency: Number(dependency),
      feedbackIds: selectedFeedbackIds
    });
    setSelectedFeedbackIds([]);
    setBacklogTitle("");
    await loadFeedback();
    showToast({ title: "Backlog item created", description: `${response.backlogItem.title} is P${response.backlogItem.priority}.` });
  }

  async function changeBacklogStatus(item: BacklogItem, nextStatus: BacklogStatus) {
    if (!auth.session) {
      return;
    }
    const response = await updateBacklogItem(auth.session.accessToken, item.id, { status: nextStatus });
    setRoadmap((current) =>
      current
        ? {
            ...current,
            backlogItems: current.backlogItems.map((candidate) => (candidate.id === item.id ? response.backlogItem : candidate))
          }
        : current
    );
    showToast({ title: "Backlog updated", description: `${response.backlogItem.title} is ${response.backlogItem.status}.` });
  }

  async function saveRoadmapRelease() {
    if (!auth.session) {
      return;
    }
    const response = await createRoadmapRelease(auth.session.accessToken, {
      version: releaseVersion,
      name: releaseName,
      plannedDate: null
    });
    await refreshRoadmap();
    setSelectedReleaseId(response.release.id);
    showToast({ title: "Release planned", description: response.release.name });
  }

  async function addSelectedBacklogToRelease() {
    if (!auth.session || !selectedBacklogId || !selectedReleaseId) {
      return;
    }
    const response = await addBacklogItemsToRelease(auth.session.accessToken, selectedReleaseId, [selectedBacklogId]);
    await refreshRoadmap();
    showToast({ title: "Release board updated", description: `${response.release.name} now includes the backlog item.` });
  }

  async function generateReleaseNote() {
    if (!auth.session || !selectedReleaseId) {
      return;
    }
    const response = await generateRoadmapReleaseNote(auth.session.accessToken, selectedReleaseId);
    await refreshRoadmap();
    showToast({ title: "Release notes generated", description: response.releaseNote.title });
  }

  async function copyCodexPrompt() {
    if (!auth.session) {
      return;
    }
    const prompt = await exportRoadmapCodexPrompt(auth.session.accessToken);
    setCodexPrompt(prompt);
    await navigator.clipboard.writeText(prompt);
    showToast({ title: "Codex prompts copied", description: "Backlog evidence is ready for build planning." });
  }

  const backlogItems = roadmap?.backlogItems ?? [];
  const releases = roadmap?.releases ?? [];
  const selectedFeedback = feedback.filter((item) => selectedFeedbackIds.includes(item.id));
  const horizonGroups: Array<{ id: "now" | "next" | "later"; label: string }> = [
    { id: "now", label: "Now" },
    { id: "next", label: "Next" },
    { id: "later", label: "Later" }
  ];

  return (
    <ProtectedRoute adminOnly>
      <section className="screen-grid" aria-labelledby="feedback-title">
        <div className="screen-heading">
          <p className="eyebrow">Beta intake</p>
          <h2 id="feedback-title">Feedback dashboard</h2>
          <p>Triage feedback, convert it into scored backlog items, plan releases, and export Codex build prompts.</p>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <Tabs
          tabs={[
            {
              id: "feedback",
              label: "Feedback insights",
              content: (
                <>
                  <form className="table-panel compact-form-grid" onSubmit={(event) => { event.preventDefault(); void loadFeedback(); }}>
                    <div className="panel-heading">
                      <h3>Filters</h3>
                      <Badge tone="info">{formatNumber(feedback.length)} items</Badge>
                    </div>
                    <label className="select-field">
                      <span>Role</span>
                      <select value={role} onChange={(event) => setRole(event.target.value)}>
                        <option value="">All roles</option>
                        <option value="owner_admin">Owner/admin</option>
                        <option value="production_farm">Production/farm</option>
                        <option value="packing_fulfillment">Packing/fulfillment</option>
                        <option value="sales_wholesale">Sales/wholesale</option>
                        <option value="auditor">Auditor</option>
                      </select>
                    </label>
                    <label className="select-field">
                      <span>Module</span>
                      <select value={module} onChange={(event) => setModule(event.target.value)}>
                        <option value="">All modules</option>
                        <option value="inventory">Inventory</option>
                        <option value="production">Production</option>
                        <option value="qc">QC</option>
                        <option value="shopify">Shopify</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="reporting">Reporting</option>
                        <option value="offline_sync">Offline/sync</option>
                      </select>
                    </label>
                    <label className="select-field">
                      <span>Status</span>
                      <select value={status} onChange={(event) => setStatus(event.target.value as FeedbackStatus | "")}>
                        <option value="">All statuses</option>
                        <option value="new">New</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="planned">Planned</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                        <option value="declined">Declined</option>
                      </select>
                    </label>
                    <Input label="Priority" value={priority} onChange={(event) => setPriority(event.target.value)} inputMode="numeric" />
                    <Input label="From" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                    <Input label="To" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
                    <Button type="submit"><Search aria-hidden="true" size={18} />Apply filters</Button>
                    <Button type="button" variant="secondary" onClick={() => void copyExport("csv")}><Download aria-hidden="true" size={18} />CSV</Button>
                    <Button type="button" variant="secondary" onClick={() => void copyExport("json")}><Download aria-hidden="true" size={18} />JSON</Button>
                  </form>
                  <div className="metric-grid">
                    {(roadmap?.insights.moduleCounts ?? []).map((row) => (
                      <article className="metric-panel" key={row.module}>
                        <span>{row.module}</span>
                        <strong>{formatNumber(row.openCount)} open</strong>
                        <p>{formatNumber(row.count)} total feedback items</p>
                      </article>
                    ))}
                  </div>
                  <div className="table-panel">
                    <div className="panel-heading">
                      <h3>Feedback queue</h3>
                      <Badge tone={feedback.some((item) => item.severity === "critical") ? "warning" : "info"}>
                        {feedback.filter((item) => item.status !== "done" && item.status !== "declined").length} open
                      </Badge>
                    </div>
                    <table className="list-table">
                      <thead><tr><th>Select</th><th>Item</th><th>Context</th><th>Status</th><th>Priority</th><th>Assign</th></tr></thead>
                      <tbody>
                        {feedback.map((item) => (
                          <tr key={item.id}>
                            <td><input aria-label={`Select ${item.workflow}`} checked={selectedFeedbackIds.includes(item.id)} type="checkbox" onChange={() => toggleSelectedFeedback(item.id)} /></td>
                            <td>
                              <strong>{item.workflow}</strong>
                              <div className="muted-line">{item.notes}</div>
                              {item.attachments.length > 0 ? <Badge tone="info">{item.attachments.length} screenshot</Badge> : null}
                            </td>
                            <td>
                              {item.screen}
                              <div className="muted-line">{item.roleCode} / {item.device}</div>
                              <div className="muted-line">{formatDateTime(new Date(item.createdAt))}</div>
                            </td>
                            <td>
                              <select value={item.status} onChange={(event) => void triage(item.id, { status: event.target.value as FeedbackStatus })}>
                                <option value="new">New</option>
                                <option value="acknowledged">Acknowledged</option>
                                <option value="planned">Planned</option>
                                <option value="in_progress">In progress</option>
                                <option value="done">Done</option>
                                <option value="declined">Declined</option>
                              </select>
                            </td>
                            <td>
                              <select value={item.priority} onChange={(event) => void triage(item.id, { priority: Number(event.target.value) })}>
                                <option value={1}>P1</option>
                                <option value={2}>P2</option>
                                <option value={3}>P3</option>
                                <option value={4}>P4</option>
                                <option value={5}>P5</option>
                              </select>
                              <div className="muted-line">{item.category} / {item.severity}</div>
                            </td>
                            <td>
                              <select value={item.assignedTo ?? ""} onChange={(event) => void triage(item.id, { assignedTo: event.target.value || null })}>
                                <option value="">Unassigned</option>
                                {users.map((user) => <option key={user.id} value={user.id}>{user.displayName}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                        {feedback.length === 0 ? <tr><td colSpan={6}>No feedback matches the current filters.</td></tr> : null}
                      </tbody>
                    </table>
                  </div>
                  <form className="table-panel compact-form-grid" onSubmit={(event) => { event.preventDefault(); void convertSelectedFeedback(); }}>
                    <div className="panel-heading">
                      <h3>Convert to backlog</h3>
                      <Badge tone="info">{selectedFeedback.length} selected</Badge>
                    </div>
                    <Input label="Backlog title" value={backlogTitle} onChange={(event) => setBacklogTitle(event.target.value)} placeholder={selectedFeedback[0]?.workflow ? `${selectedFeedback[0].workflow} improvement` : "Select feedback first"} />
                    <Input label="User impact" value={userImpact} onChange={(event) => setUserImpact(event.target.value)} inputMode="numeric" />
                    <Input label="Frequency" value={frequency} onChange={(event) => setFrequency(event.target.value)} inputMode="numeric" />
                    <Input label="Compliance risk" value={complianceRisk} onChange={(event) => setComplianceRisk(event.target.value)} inputMode="numeric" />
                    <Input label="Revenue impact" value={revenueImpact} onChange={(event) => setRevenueImpact(event.target.value)} inputMode="numeric" />
                    <Input label="Effort estimate" value={effortEstimate} onChange={(event) => setEffortEstimate(event.target.value)} inputMode="numeric" />
                    <Input label="Dependency" value={dependency} onChange={(event) => setDependency(event.target.value)} inputMode="numeric" />
                    <Button type="submit" disabled={selectedFeedbackIds.length === 0}><PlusCircle aria-hidden="true" size={18} />Create backlog item</Button>
                  </form>
                </>
              )
            },
            {
              id: "backlog",
              label: "Backlog board",
              content: (
                <div className="table-panel">
                  <div className="panel-heading"><h3>Backlog board</h3><Badge tone="info">{backlogItems.length} items</Badge></div>
                  <table className="list-table">
                    <thead><tr><th>Item</th><th>Score</th><th>Status</th><th>Feedback</th></tr></thead>
                    <tbody>
                      {backlogItems.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.title}</strong><div className="muted-line">{item.module} / {item.workflow}</div><div className="muted-line">{item.description}</div></td>
                          <td><Badge tone={item.priority <= 2 ? "warning" : "info"}>P{item.priority} / {item.horizon}</Badge><div className="muted-line">{item.priorityExplanation}</div></td>
                          <td>
                            <select value={item.status} onChange={(event) => void changeBacklogStatus(item, event.target.value as BacklogStatus)}>
                              <option value="proposed">Proposed</option>
                              <option value="ready">Ready</option>
                              <option value="in_progress">In progress</option>
                              <option value="completed">Completed</option>
                              <option value="declined">Declined</option>
                            </select>
                          </td>
                          <td>{item.feedback.length} linked<div className="muted-line">{item.feedback.map((linked) => linked.workflow).join(", ")}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            },
            {
              id: "roadmap",
              label: "Roadmap view",
              content: (
                <div className="metric-grid">
                  {horizonGroups.map((group) => (
                    <article className="metric-panel" key={group.id}>
                      <span>{group.label}</span>
                      <strong>{formatNumber(backlogItems.filter((item) => item.horizon === group.id).length)} items</strong>
                      <p>{backlogItems.filter((item) => item.horizon === group.id).map((item) => `${item.module}: ${item.title}`).join(" / ") || "No items planned"}</p>
                    </article>
                  ))}
                </div>
              )
            },
            {
              id: "release",
              label: "Release planning",
              content: (
                <>
                  <form className="table-panel compact-form-grid" onSubmit={(event) => { event.preventDefault(); void saveRoadmapRelease(); }}>
                    <div className="panel-heading"><h3>Plan release</h3><Badge tone="info">{releases.length} releases</Badge></div>
                    <Input label="Version" value={releaseVersion} onChange={(event) => setReleaseVersion(event.target.value)} />
                    <Input label="Name" value={releaseName} onChange={(event) => setReleaseName(event.target.value)} />
                    <Button type="submit"><PlusCircle aria-hidden="true" size={18} />Create release</Button>
                  </form>
                  <form className="table-panel compact-form-grid" onSubmit={(event) => { event.preventDefault(); void addSelectedBacklogToRelease(); }}>
                    <div className="panel-heading"><h3>Release board</h3><Badge tone="info">Link backlog to notes</Badge></div>
                    <label className="select-field"><span>Release</span><select value={selectedReleaseId} onChange={(event) => setSelectedReleaseId(event.target.value)}>{releases.map((release) => <option key={release.id} value={release.id}>{release.version} / {release.name}</option>)}</select></label>
                    <label className="select-field"><span>Backlog item</span><select value={selectedBacklogId} onChange={(event) => setSelectedBacklogId(event.target.value)}>{backlogItems.map((item) => <option key={item.id} value={item.id}>P{item.priority} / {item.title}</option>)}</select></label>
                    <Button type="submit" disabled={!selectedBacklogId || !selectedReleaseId}><PlusCircle aria-hidden="true" size={18} />Add to release</Button>
                    <Button type="button" variant="secondary" disabled={!selectedReleaseId} onClick={() => void generateReleaseNote()}><FileText aria-hidden="true" size={18} />Generate release notes</Button>
                  </form>
                  <div className="table-panel">
                    <table className="list-table">
                      <thead><tr><th>Release</th><th>Status</th><th>Backlog items</th><th>Release note</th></tr></thead>
                      <tbody>
                        {releases.map((release) => (
                          <tr key={release.id}>
                            <td><strong>{release.version}</strong><div className="muted-line">{release.name}</div></td>
                            <td><Badge tone={release.status === "released" ? "success" : "info"}>{release.status}</Badge></td>
                            <td>{release.backlogItems.map((item) => item.title).join(", ") || "No backlog items"}</td>
                            <td>{release.releaseNote ? release.releaseNote.title : "Not generated"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )
            },
            {
              id: "codex",
              label: "Codex prompt export",
              content: (
                <div className="table-panel">
                  <div className="panel-heading"><h3>Codex build planning prompts</h3><Button type="button" variant="secondary" onClick={() => void copyCodexPrompt()}><Download aria-hidden="true" size={18} />Copy prompts</Button></div>
                  <textarea className="code-textarea" readOnly rows={18} value={codexPrompt} />
                </div>
              )
            }
          ]}
        />
      </section>
    </ProtectedRoute>
  );
}

function AdminRolesRoute() {
  const { t } = useI18n();
  const auth = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (!auth.session || !auth.isAdmin) {
      return;
    }

    Promise.all([listRoles(auth.session.accessToken), listLocations(auth.session.accessToken)]).then(
      ([rolesResponse, locationsResponse]) => {
        setRoles(rolesResponse.roles);
        setLocations(locationsResponse.locations);
      }
    );
  }, [auth.isAdmin, auth.session]);

  return (
    <ProtectedRoute adminOnly>
      <section className="screen-grid" aria-labelledby="roles-title">
        <div className="screen-heading">
          <p className="eyebrow">{t("admin.roles.title")}</p>
          <h2 id="roles-title">{t("admin.roles.title")}</h2>
          <p>{t("admin.roles.description")}</p>
        </div>
        <div className="metric-grid">
          {roles.map((role) => (
            <article className="metric-panel" key={role.id}>
              <span>{role.code}</span>
              <strong>{role.name}</strong>
              <p>{role.description}</p>
            </article>
          ))}
        </div>
        <div className="table-panel">
          <h3>{t("admin.locations")}</h3>
          <table className="list-table">
            <tbody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <th>{location.code}</th>
                  <td>{location.name}</td>
                  <td>{location.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ProtectedRoute>
  );
}

function healthTone(status: OperationalHealth["status"]): "neutral" | "success" | "warning" | "info" {
  if (status === "ok") {
    return "success";
  }
  if (status === "degraded" || status === "down") {
    return "warning";
  }
  return "neutral";
}

function AdminHealthRoute() {
  const auth = useAuth();
  const { formatDateTime, formatNumber } = useI18n();
  const [health, setHealth] = useState<OperationalHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHealth() {
    if (!auth.session || !auth.isAdmin) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setHealth(await getOperationalHealth(auth.session.accessToken));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Operational health could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHealth();
  }, [auth.isAdmin, auth.session]);

  return (
    <ProtectedRoute adminOnly>
      <section className="screen-grid" aria-labelledby="health-title">
        <div className="screen-heading">
          <p className="eyebrow">Production readiness</p>
          <h2 id="health-title">Health diagnostics</h2>
          <p>API, worker, database, Redis, PowerSync, and Shopify readiness checks for launch operations.</p>
        </div>

        {error ? (
          <ErrorState
            title="Health checks unavailable"
            description="The diagnostics endpoint could not be reached. Check API logs and retry."
            action={
              <Button type="button" onClick={() => void loadHealth()}>
                <RefreshCw aria-hidden="true" size={18} />
                Retry
              </Button>
            }
          />
        ) : null}

        {loading ? (
          <LoadingState title="Loading diagnostics" description="Checking operational dependencies." />
        ) : health ? (
          <>
            <div className="metric-grid">
              <article className="metric-panel">
                <span>Overall status</span>
                <strong>{health.status}</strong>
              </article>
              <article className="metric-panel">
                <span>Checks</span>
                <strong>{formatNumber(health.checks.length)}</strong>
              </article>
              <article className="metric-panel">
                <span>Last checked</span>
                <strong>{formatDateTime(new Date(health.checkedAt))}</strong>
              </article>
            </div>

            <div className="table-panel">
              <div className="panel-heading">
                <h3>Dependency checks</h3>
                <Button variant="secondary" size="sm" onClick={() => void loadHealth()}>
                  <RefreshCw aria-hidden="true" size={16} />
                  Refresh
                </Button>
              </div>
              <table className="list-table">
                <caption className="sr-only">Operational dependency readiness checks</caption>
                <thead>
                  <tr>
                    <th>Dependency</th>
                    <th>Status</th>
                    <th>Latency</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {health.checks.map((check) => (
                    <tr key={check.name}>
                      <td>{check.name}</td>
                      <td><Badge tone={healthTone(check.status)}>{check.status}</Badge></td>
                      <td>{formatNumber(check.latencyMs)} ms</td>
                      <td>{check.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>
    </ProtectedRoute>
  );
}

function shopifyEventTone(status: ShopifySyncEvent["status"]): "neutral" | "success" | "warning" | "info" {
  if (status === "processed") {
    return "success";
  }
  if (status === "failed") {
    return "warning";
  }
  if (status === "processing" || status === "received") {
    return "info";
  }
  return "neutral";
}

function AdminShopifyRoute() {
  const auth = useAuth();
  const { formatCurrency, formatDateTime, formatNumber } = useI18n();
  const toast = useToast();
  const [status, setStatus] = useState<ShopifyIntegrationStatus | null>(null);
  const [events, setEvents] = useState<ShopifySyncEvent[]>([]);
  const [dashboard, setDashboard] = useState<ShopifySyncDashboard | null>(null);
  const [orders, setOrders] = useState<SalesOrderSummary[]>([]);
  const [inventoryRows, setInventoryRows] = useState<ShopifyInventoryPushRow[]>([]);
  const [driftRows, setDriftRows] = useState<ShopifyInventoryDriftRow[]>([]);
  const [fulfillmentQueue, setFulfillmentQueue] = useState<ShopifyFulfillmentQueueItem[]>([]);
  const [fulfillmentOrder, setFulfillmentOrder] = useState<ShopifyFulfillmentOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [pushingInventory, setPushingInventory] = useState(false);
  const [fulfillmentBusy, setFulfillmentBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("CTT2002");

  async function loadShopifyStatus() {
    if (!auth.session || !auth.isAdmin) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [response, dashboardResponse, ordersResponse, inventoryResponse, queueResponse] = await Promise.all([
        getShopifyStatus(auth.session.accessToken),
        getShopifyDashboard(auth.session.accessToken),
        listSalesOrders(auth.session.accessToken),
        getShopifyInventoryPushStatus(auth.session.accessToken),
        listShopifyFulfillmentQueue(auth.session.accessToken)
      ]);
      setStatus(response.status);
      setEvents(response.events);
      setDashboard(dashboardResponse);
      setOrders(ordersResponse.orders);
      setInventoryRows(inventoryResponse.rows);
      setFulfillmentQueue(queueResponse.queue);
      if (fulfillmentOrder) {
        const refreshed = await getShopifyFulfillmentOrder(auth.session.accessToken, fulfillmentOrder.id);
        setFulfillmentOrder(refreshed.order);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Shopify status could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function runManualReconciliation() {
    if (!auth.session) {
      return;
    }

    setReconciling(true);
    setError(null);
    try {
      const response = await runShopifyOrderReconciliation(auth.session.accessToken);
      toast.showToast({
        title: "Reconciliation queued",
        description: `${response.job.processedCount} orders checked`
      });
      await loadShopifyStatus();
    } catch (reconcileError) {
      setError(reconcileError instanceof Error ? reconcileError.message : "Reconciliation failed.");
    } finally {
      setReconciling(false);
    }
  }

  async function runInventoryPush() {
    if (!auth.session) {
      return;
    }
    setPushingInventory(true);
    setError(null);
    try {
      const response = await pushShopifyInventory(auth.session.accessToken);
      setInventoryRows(response.rows);
      toast.showToast({ title: "Inventory pushed", description: `${response.rows.length} mapped levels` });
    } catch (pushError) {
      setError(pushError instanceof Error ? pushError.message : "Inventory push failed.");
    } finally {
      setPushingInventory(false);
    }
  }

  async function runInventoryDrift() {
    if (!auth.session) {
      return;
    }
    setError(null);
    try {
      const response = await reconcileShopifyInventory(auth.session.accessToken);
      setDriftRows(response.rows);
      toast.showToast({ title: "Inventory drift checked", description: `${response.rows.length} mapped levels` });
    } catch (driftError) {
      setError(driftError instanceof Error ? driftError.message : "Inventory drift check failed.");
    }
  }

  async function openFulfillment(orderId: string) {
    if (!auth.session) {
      return;
    }
    const response = await getShopifyFulfillmentOrder(auth.session.accessToken, orderId);
    setFulfillmentOrder(response.order);
  }

  async function allocateFirstLot() {
    if (!auth.session || !fulfillmentOrder) {
      return;
    }
    const line = fulfillmentOrder.lines.find((candidate) => candidate.status !== "shipped");
    const lot = fulfillmentOrder.availableLots[0];
    if (!line || !lot) {
      setError("No allocatable lot is available for this order.");
      return;
    }
    setFulfillmentBusy(true);
    setError(null);
    try {
      await allocateShopifyOrderLine(auth.session.accessToken, {
        lotId: lot.lotId,
        locationId: lot.locationId,
        quantity: Math.min(line.quantity, lot.availableQuantity),
        uom: line.uom,
        salesOrderLineId: line.id,
        clientTransactionId: crypto.randomUUID()
      });
      await openFulfillment(fulfillmentOrder.id);
      await loadShopifyStatus();
    } catch (allocationError) {
      setError(allocationError instanceof Error ? allocationError.message : "Allocation failed.");
    } finally {
      setFulfillmentBusy(false);
    }
  }

  async function pickPackShip(action: "pick" | "pack" | "ship") {
    if (!auth.session || !fulfillmentOrder) {
      return;
    }
    setFulfillmentBusy(true);
    setError(null);
    try {
      const response =
        action === "pick"
          ? await pickShopifyOrder(auth.session.accessToken, fulfillmentOrder.id)
          : action === "pack"
            ? await packShopifyOrder(auth.session.accessToken, fulfillmentOrder.id)
            : await shipShopifyOrder(auth.session.accessToken, fulfillmentOrder.id, {
                carrier: "CTT",
                trackingNumber,
                idempotencyKey: `fulfillment:${fulfillmentOrder.id}:${trackingNumber}`
              });
      setFulfillmentOrder(response.order);
      await loadShopifyStatus();
    } catch (fulfillmentError) {
      setError(fulfillmentError instanceof Error ? fulfillmentError.message : "Fulfillment action failed.");
    } finally {
      setFulfillmentBusy(false);
    }
  }

  useEffect(() => {
    void loadShopifyStatus();
  }, [auth.isAdmin, auth.session]);

  return (
    <ProtectedRoute adminOnly>
      <section className="screen-grid" aria-labelledby="shopify-title">
        <div className="screen-heading">
          <p className="eyebrow">Shopify</p>
          <h2 id="shopify-title">Order sync dashboard</h2>
          <p>{status?.shopDomain ?? "No shop domain configured"}</p>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="metric-grid">
          <article className="metric-panel">
            <span>Connection</span>
            <strong>{status?.configured ? "Configured" : "Missing"}</strong>
          </article>
          <article className="metric-panel">
            <span>Mapped variants</span>
            <strong>{formatNumber(status?.mappedProductVariants ?? 0)}</strong>
          </article>
          <article className="metric-panel">
            <span>Mapped locations</span>
            <strong>{formatNumber(status?.mappedLocations ?? 0)}</strong>
          </article>
          <article className="metric-panel">
            <span>Webhook failures</span>
            <strong>{formatNumber(status?.failedEventCount ?? 0)}</strong>
          </article>
        </div>

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Reconciliation</h3>
            <Button onClick={() => void runManualReconciliation()} disabled={reconciling}>
              <RefreshCw aria-hidden="true" size={18} />
              {reconciling ? "Reconciling" : "Run reconciliation"}
            </Button>
          </div>
          <table className="list-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Cursor</th>
                <th>Last success</th>
                <th>Last error</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.cursors ?? []).map((cursor) => (
                <tr key={cursor.id}>
                  <td>{cursor.resourceType}</td>
                  <td>{cursor.cursorValue ?? "Not started"}</td>
                  <td>{cursor.lastSuccessAt ? formatDateTime(new Date(cursor.lastSuccessAt)) : "Never"}</td>
                  <td>{cursor.lastErrorAt ? formatDateTime(new Date(cursor.lastErrorAt)) : "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Inventory push status</h3>
            <div className="form-actions">
              <Button variant="secondary" size="sm" onClick={() => void runInventoryDrift()}>
                <BarChart3 aria-hidden="true" size={16} />
                Check drift
              </Button>
              <Button size="sm" onClick={() => void runInventoryPush()} disabled={pushingInventory}>
                <Upload aria-hidden="true" size={16} />
                {pushingInventory ? "Pushing" : "Push stock"}
              </Button>
            </div>
          </div>
          <table className="list-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>ERP available</th>
                <th>Excluded</th>
                <th>Status</th>
                <th>Last push</th>
              </tr>
            </thead>
            <tbody>
              {inventoryRows.map((row) => (
                <tr key={row.idempotencyKey}>
                  <td>
                    {row.sku}
                    <div className="muted-line">{row.shopifyInventoryItemGid}</div>
                  </td>
                  <td>{formatNumber(row.availableQuantity)}</td>
                  <td>{formatNumber(row.excludedQuantity)}</td>
                  <td><Badge tone={row.status === "processed" ? "success" : row.status === "failed" ? "warning" : "info"}>{row.status}</Badge></td>
                  <td>{row.lastPushedAt ? formatDateTime(new Date(row.lastPushedAt)) : "Not pushed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {driftRows.length > 0 ? (
          <div className="table-panel">
            <div className="panel-heading">
              <h3>Drift dashboard</h3>
              <Badge tone={driftRows.some((row) => row.driftQuantity !== 0) ? "warning" : "success"}>
                {formatNumber(driftRows.filter((row) => row.driftQuantity !== 0).length)} drift
              </Badge>
            </div>
            <table className="list-table">
              <thead>
                <tr><th>SKU</th><th>ERP</th><th>Shopify</th><th>Difference</th></tr>
              </thead>
              <tbody>
                {driftRows.map((row) => (
                  <tr key={`drift-${row.idempotencyKey}`}>
                    <td>{row.sku}</td>
                    <td>{formatNumber(row.availableQuantity)}</td>
                    <td>{row.shopifyQuantity === null ? "Unknown" : formatNumber(row.shopifyQuantity)}</td>
                    <td><Badge tone={row.driftQuantity === 0 ? "success" : "warning"}>{row.driftQuantity === null ? "Unknown" : formatNumber(row.driftQuantity)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Fulfillment queue</h3>
            <Badge tone="info">{formatNumber(fulfillmentQueue.length)} open</Badge>
          </div>
          <table className="list-table">
            <thead>
              <tr><th>Order</th><th>Status</th><th>Allocated</th><th>Picked</th><th>Action</th></tr>
            </thead>
            <tbody>
              {fulfillmentQueue.map((item) => (
                <tr key={item.order.id}>
                  <td>{item.order.orderNumber}</td>
                  <td><Badge>{item.order.status}</Badge></td>
                  <td>{formatNumber(item.allocatedQuantity)}</td>
                  <td>{formatNumber(item.pickedQuantity)}</td>
                  <td>
                    <Button size="sm" variant="secondary" onClick={() => void openFulfillment(item.order.id)}>
                      <PackageCheck aria-hidden="true" size={16} />
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
              {fulfillmentQueue.length === 0 ? (
                <tr><td colSpan={5}>No open Shopify orders need fulfillment.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {fulfillmentOrder ? (
          <div className="table-panel">
            <div className="panel-heading">
              <h3>Pick / pack / ship {fulfillmentOrder.orderNumber}</h3>
              <Badge tone={fulfillmentOrder.status === "shipped" ? "success" : "info"}>{fulfillmentOrder.status}</Badge>
            </div>
            <div className="compact-form-grid">
              <Button type="button" size="sm" onClick={() => void allocateFirstLot()} disabled={fulfillmentBusy || fulfillmentOrder.allocations.length > 0}>
                <PlusCircle aria-hidden="true" size={16} />
                Allocate lot
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => void pickPackShip("pick")} disabled={fulfillmentBusy || fulfillmentOrder.allocations.length === 0}>
                <CheckCircle2 aria-hidden="true" size={16} />
                Pick
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => void pickPackShip("pack")} disabled={fulfillmentBusy || fulfillmentOrder.allocations.some((allocation) => !allocation.pickedAt)}>
                <Package aria-hidden="true" size={16} />
                Pack
              </Button>
              <Input label="Tracking" value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} />
              <Button type="button" size="sm" onClick={() => void pickPackShip("ship")} disabled={fulfillmentBusy || fulfillmentOrder.allocations.some((allocation) => !allocation.pickedAt)}>
                <Upload aria-hidden="true" size={16} />
                Fulfill
              </Button>
            </div>
            <table className="list-table">
              <thead>
                <tr><th>Line / lot</th><th>Quantity</th><th>Location</th><th>Picked</th><th>Shipped</th></tr>
              </thead>
              <tbody>
                {fulfillmentOrder.allocations.map((allocation) => (
                  <tr key={allocation.id}>
                    <td>
                      {allocation.itemSku}
                      <div className="muted-line">{allocation.lotCode}</div>
                    </td>
                    <td>{formatNumber(allocation.quantity)} {allocation.uom}</td>
                    <td>{allocation.locationName}</td>
                    <td>{allocation.pickedAt ? formatDateTime(new Date(allocation.pickedAt)) : "Pending"}</td>
                    <td>{allocation.shippedAt ? formatDateTime(new Date(allocation.shippedAt)) : "Pending"}</td>
                  </tr>
                ))}
                {fulfillmentOrder.allocations.length === 0 ? (
                  <tr><td colSpan={5}>Allocate a released lot before fulfillment.</td></tr>
                ) : null}
              </tbody>
            </table>
            {fulfillmentOrder.outboundLogs.length > 0 ? (
              <p className="muted-line">Fulfillment push: {fulfillmentOrder.outboundLogs[0]?.status ?? "Pending"}</p>
            ) : null}
          </div>
        ) : null}

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Unmapped items</h3>
            <Badge tone={(dashboard?.mappingErrors.length ?? 0) > 0 ? "warning" : "success"}>
              {formatNumber(dashboard?.mappingErrors.length ?? 0)} errors
            </Badge>
          </div>
          <table className="list-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Order</th>
                <th>SKU / GID</th>
                <th>Action needed</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.mappingErrors ?? []).map((mappingError, index) => (
                <tr key={`${mappingError.type}-${mappingError.shopifyGid ?? mappingError.sku ?? index}`}>
                  <td><Badge tone="warning">{mappingError.type}</Badge></td>
                  <td>{mappingError.orderName ?? "Unknown"}</td>
                  <td>
                    {mappingError.sku ?? mappingError.shopifyGid ?? "Unknown"}
                    <div className="muted-line">{mappingError.lineName ?? mappingError.shopifyGid}</div>
                  </td>
                  <td>{mappingError.message}</td>
                </tr>
              ))}
              {(dashboard?.mappingErrors.length ?? 0) === 0 ? (
                <tr><td colSpan={4}>All Shopify variants and locations are mapped.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Sales orders</h3>
            <Badge tone="info">{formatNumber(orders.length)} orders</Badge>
          </div>
          <table className="list-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Lines</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to="/sales-orders/$orderId" params={{ orderId: order.id }}>
                      {order.orderNumber}
                    </Link>
                    <div className="muted-line">{order.shopifyOrderGid ?? "Manual/wholesale"}</div>
                  </td>
                  <td>{order.customerName ?? "Unknown"}</td>
                  <td>
                    <Badge tone={order.mappingErrorCount > 0 ? "warning" : "success"}>{order.status}</Badge>
                  </td>
                  <td>{formatNumber(order.lineCount)}</td>
                  <td>{order.totalAmountExport === null ? "-" : formatCurrency(order.totalAmountExport, order.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-panel">
          <div className="panel-heading">
            <h3>Recent webhook deliveries</h3>
            <Button variant="secondary" size="sm" onClick={() => void loadShopifyStatus()}>
              <History aria-hidden="true" size={16} />
              Refresh
            </Button>
          </div>
          {loading ? (
            <p>Loading Shopify status...</p>
          ) : (
            <table className="list-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Webhook ID</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th>Completed at</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      {event.topic}
                      <div className="muted-line">{event.shopDomain}</div>
                    </td>
                    <td>{event.webhookId}</td>
                    <td>
                      <Badge tone={shopifyEventTone(event.status)}>{event.status === "processed" ? "complete" : event.status}</Badge>
                    </td>
                    <td>{formatDateTime(new Date(event.receivedAt))}</td>
                    <td>{event.processedAt ? formatDateTime(new Date(event.processedAt)) : "Pending"}</td>
                    <td>{event.error ?? "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}

function SalesOrderDetailRoute() {
  const auth = useAuth();
  const params = useParams({ strict: false }) as { orderId: string };
  const { formatCurrency, formatDateTime, formatNumber } = useI18n();
  const { showToast } = useToast();
  const syncStatus = useSyncStatus();
  const [order, setOrder] = useState<SalesOrderDetail | null>(null);
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [selectedBalanceId, setSelectedBalanceId] = useState("");
  const [pickQuantity, setPickQuantity] = useState("1");
  const [carrier, setCarrier] = useState("CTT");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const firstLine = order?.lines[0] ?? null;
  const selectedBalance = balances.find((balance) => balance.id === selectedBalanceId) ?? balances[0] ?? null;

  useEffect(() => {
    if (!auth.session) {
      return;
    }

    Promise.all([getSalesOrder(auth.session.accessToken, params.orderId), listInventoryBalances(auth.session.accessToken)])
      .then(([response, balanceResponse]) => {
        setOrder(response.order);
        const eligibleBalances = balanceResponse.balances.filter(
          (balance) => balance.itemType === "product_variant" && balance.availableQuantity > 0
        );
        setBalances(eligibleBalances);
        setSelectedBalanceId((current) => current || eligibleBalances[0]?.id || "");
        setError(null);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Sales order could not be loaded.");
      });
  }, [auth.session, params.orderId]);

  async function submitPickPack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.session || !order || !firstLine || !selectedBalance || !selectedBalance.lotId) {
      setError("Select a lot with available stock before packing.");
      return;
    }

    const quantity = Number(pickQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Pick quantity must be greater than zero.");
      return;
    }

    try {
      await pickPackSalesOrder(auth.session.accessToken, {
        salesOrderId: order.id,
        salesOrderLineId: firstLine.id,
        itemType: selectedBalance.itemType,
        itemId: selectedBalance.itemId,
        lotId: selectedBalance.lotId,
        locationId: selectedBalance.locationId,
        quantity,
        uom: selectedBalance.uom,
        allocationClientTransactionId: crypto.randomUUID(),
        shipmentClientTransactionId: crypto.randomUUID(),
        shipmentNumber: `SHIP-${order.orderNumber.replace(/[^0-9A-Z]/gi, "")}-${String(Date.now()).slice(-4)}`,
        carrier,
        trackingNumber: trackingNumber || null,
        notes: "Picked and packed from fulfillment screen"
      });
      showToast({
        title: syncStatus.online ? "Pick/pack uploaded" : "Pick/pack saved offline",
        description: `${selectedBalance.lotCode ?? selectedBalance.itemSku} / ${quantity} ${selectedBalance.uom}`
      });
      const balanceResponse = await listInventoryBalances(auth.session.accessToken);
      setBalances(balanceResponse.balances.filter((balance) => balance.itemType === "product_variant" && balance.availableQuantity > 0));
    } catch (packError) {
      setError(packError instanceof Error ? packError.message : "Pick/pack failed.");
    }
  }

  async function downloadCustomerDocument(documentId: string) {
    if (!auth.session) {
      return;
    }
    const response = await getGeneratedDocumentDownloadUrl(auth.session.accessToken, documentId);
    window.open(response.signedDownload.downloadUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <ProtectedRoute>
      <section className="screen-grid" aria-labelledby="sales-order-title">
        <div className="screen-heading">
          <p className="eyebrow">Sales order</p>
          <h2 id="sales-order-title">{order?.orderNumber ?? "Order detail"}</h2>
          <p>{order?.shopifyOrderGid ?? "Manual or wholesale order"}</p>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {order ? (
          <>
            <div className="metric-grid">
              <article className="metric-panel">
                <span>Status</span>
                <strong>{order.status}</strong>
              </article>
              <article className="metric-panel">
                <span>Ordered</span>
                <strong>{formatDateTime(new Date(order.orderedAt))}</strong>
              </article>
              <article className="metric-panel">
                <span>Total</span>
                <strong>{order.totalAmountExport === null ? "-" : formatCurrency(order.totalAmountExport, order.currency)}</strong>
              </article>
            </div>

            {order.mappingErrors.length > 0 ? (
              <div className="table-panel">
                <div className="panel-heading">
                  <h3>Mapping errors</h3>
                  <Badge tone="warning">{formatNumber(order.mappingErrors.length)} errors</Badge>
                </div>
                <table className="list-table">
                  <thead><tr><th>Type</th><th>SKU / GID</th><th>Message</th></tr></thead>
                  <tbody>
                    {order.mappingErrors.map((mappingError, index) => (
                      <tr key={`${mappingError.type}-${index}`}>
                        <td>{mappingError.type}</td>
                        <td>{mappingError.sku ?? mappingError.shopifyGid ?? "Unknown"}</td>
                        <td>{mappingError.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="table-panel">
              <div className="panel-heading">
                <h3>Lines</h3>
                <Badge tone="info">{formatNumber(order.lines.length)} lines</Badge>
              </div>
              <table className="list-table">
                <thead>
                  <tr><th>Item</th><th>Quantity</th><th>Unit price</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {order.lines.map((line) => (
                    <tr key={line.id}>
                      <td>
                        {line.name ?? line.productVariantId}
                        <div className="muted-line">{line.sku ?? "No SKU"}</div>
                      </td>
                      <td>{formatNumber(line.quantity)} {line.uom}</td>
                      <td>{line.unitPrice === null ? "-" : formatCurrency(line.unitPrice, line.currency)}</td>
                      <td><Badge>{line.status}</Badge></td>
                    </tr>
                ))}
              </tbody>
            </table>
            </div>

            <form className="table-panel compact-form-grid" onSubmit={submitPickPack}>
              <div className="panel-heading">
                <h3>Pick and pack</h3>
                <Badge tone={syncStatus.pendingUploads > 0 ? "warning" : "info"}>
                  {syncStatus.pendingUploads > 0 ? "Uploads pending" : "Ready"}
                </Badge>
              </div>
              <label className="select-field">
                <span>Lot/location</span>
                <select value={selectedBalance?.id ?? ""} onChange={(event) => setSelectedBalanceId(event.target.value)}>
                  {balances.map((balance) => (
                    <option key={balance.id} value={balance.id}>
                      {balance.lotCode ?? balance.itemSku} / {balance.locationName} / {formatNumber(balance.availableQuantity)} {balance.uom}
                    </option>
                  ))}
                </select>
              </label>
              <Input label="Quantity" inputMode="decimal" value={pickQuantity} onChange={(event) => setPickQuantity(event.target.value)} />
              <Input label="Carrier" value={carrier} onChange={(event) => setCarrier(event.target.value)} />
              <Input label="Tracking" value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} />
              <Button type="submit" disabled={!selectedBalance || !firstLine}>
                <PackageCheck aria-hidden="true" size={18} />
                Pick and pack
              </Button>
            </form>

            <section className="table-panel">
              <div className="panel-heading">
                <h3>Customer documents</h3>
                <Badge tone={(order.customerDocuments?.length ?? 0) > 0 ? "success" : "neutral"}>
                  {formatNumber(order.customerDocuments?.length ?? 0)} ready
                </Badge>
              </div>
              <div className="record-list">
                {(order.customerDocuments?.length ?? 0) === 0 ? (
                  <p>No customer-facing documents are available for the allocated lots.</p>
                ) : (
                  order.customerDocuments?.map((document) => (
                    <article className="inline-record" key={document.id}>
                      <FileText aria-hidden="true" size={18} />
                      <div>
                        <strong>{document.documentNumber}</strong>
                        <span>{document.documentType} / {document.lotCode ?? "lot"} / {formatDateTime(new Date(document.generatedAt))}</span>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => void downloadCustomerDocument(document.id)}>
                        <Download aria-hidden="true" size={16} />
                        Download
                      </Button>
                    </article>
                  ))
                )}
              </div>
            </section>
          </>
        ) : (
          <EmptyState title="Loading order" description="Fetching sales order detail." />
        )}
      </section>
    </ProtectedRoute>
  );
}

function OfflineRoute() {
  const { t } = useI18n();

  return (
    <section className="auth-screen" aria-labelledby="offline-title">
      <EmptyState
        title={t("offline.title")}
        description={t("offline.description")}
        action={
          <Button onClick={() => window.location.reload()} type="button">
            {t("offline.retry")}
          </Button>
        }
      />
    </section>
  );
}

function NotFoundRoute() {
  const { t } = useI18n();

  return (
    <section className="auth-screen">
      <EmptyState title={t("notFound.title")} description={t("notFound.description")} />
    </section>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardRoute
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginRoute
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsRoute
});

const masterDataRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/master-data",
  component: MasterDataRoute
});

const importCenterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/import-center",
  component: ImportCenterRoute
});

const productConfiguratorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product-configurator",
  component: ProductConfiguratorRoute
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory",
  component: InventoryRoute
});

const farmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/farm",
  component: FarmRoute
});

const productionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/production",
  component: ProductionRoute
});

const changeControlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/change-control",
  component: ChangeControlRoute
});

const routingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/routings",
  component: RoutingsRoute
});

const equipmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/equipment",
  component: EquipmentRoute
});

const costingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/costing",
  component: CostingRoute
});

const purchasingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/purchasing",
  component: PurchasingRoute
});

const mrpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mrp",
  component: MrpRoute
});

const scanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scan",
  component: ScanRoute
});

const labelPrintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/labels",
  component: LabelPrintRoute
});

const stockCountListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stock-counts",
  component: StockCountListRoute
});

const stockCountDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stock-counts/$sessionId",
  component: StockCountDetailRoute
});

const lotsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lots",
  component: LotListRoute
});

const lotDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/lots/$lotId",
  component: LotDetailRoute
});

const qcRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/qc",
  component: QcRoute
});

const documentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/documents",
  component: DocumentsRoute
});

const qualityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quality",
  component: QualityRoute
});

const traceabilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/traceability",
  component: TraceabilityRoute
});

const mockRecallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mock-recalls",
  component: MockRecallRoute
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsRoute
});

const crmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm",
  component: CrmRoute
});

const wholesaleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wholesale",
  component: WholesaleRoute
});

const releaseNotesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/release-notes",
  component: ReleaseNotesRoute
});

const syncDiagnosticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sync",
  component: SyncDiagnosticsRoute
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/users",
  component: AdminUsersRoute
});

const adminUserDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/users/$userId",
  component: AdminUserDetailRoute
});

const adminRolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/roles",
  component: AdminRolesRoute
});

const adminFeedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/feedback",
  component: AdminFeedbackRoute
});

const adminHealthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/health",
  component: AdminHealthRoute
});

const adminShopifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/shopify",
  component: AdminShopifyRoute
});

const salesOrderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sales-orders/$orderId",
  component: SalesOrderDetailRoute
});

const offlineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/offline",
  component: OfflineRoute
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  settingsRoute,
  importCenterRoute,
  farmRoute,
  productionRoute,
  changeControlRoute,
  routingsRoute,
  equipmentRoute,
  costingRoute,
  purchasingRoute,
  mrpRoute,
  inventoryRoute,
  scanRoute,
  labelPrintRoute,
  stockCountListRoute,
  stockCountDetailRoute,
  lotsRoute,
  lotDetailRoute,
  qcRoute,
  documentsRoute,
  qualityRoute,
  traceabilityRoute,
  mockRecallRoute,
  reportsRoute,
  crmRoute,
  wholesaleRoute,
  releaseNotesRoute,
  syncDiagnosticsRoute,
  masterDataRoute,
  productConfiguratorRoute,
  adminUsersRoute,
  adminUserDetailRoute,
  adminRolesRoute,
  adminFeedbackRoute,
  adminHealthRoute,
  adminShopifyRoute,
  salesOrderDetailRoute,
  offlineRoute
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
