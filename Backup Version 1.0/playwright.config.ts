import { defineConfig, devices } from "@playwright/test";

const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL;
const channelOverride = browserChannel ? { channel: browserChannel } : {};
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173";
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER === "true";

export default defineConfig({
  testDir: "./apps/web/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry"
  },
  webServer: skipWebServer ? undefined : {
    command: "pnpm --filter @mushroom-compadres/web build && pnpm --filter @mushroom-compadres/web preview --host 127.0.0.1",
    url: baseURL,
    reuseExistingServer: true
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], ...channelOverride }
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"], ...channelOverride }
    }
  ]
});
