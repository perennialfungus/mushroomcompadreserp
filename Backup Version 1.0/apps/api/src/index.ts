import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";

export function createApiServer() {
  return buildApp({ config: loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent" }), logger: false });
}
