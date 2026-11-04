import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

const webDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(webDir, "../..");

const API_PROXY_PATHS = ["/auth", "/public", "/admin", "/health", "/uploads"] as const;

function apiProxy(target: string) {
  const entry: Record<string, { target: string; changeOrigin: boolean }> = {};
  for (const path of API_PROXY_PATHS) {
    entry[path] = { target, changeOrigin: true };
  }
  return entry;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, "");
  const apiTarget = (env.VITE_DEV_API_TARGET ?? "http://127.0.0.1:3333").replace(/\/$/, "");

  return {
    envDir: repoRoot,
    plugins: [react()],
    server: {
      port: 5175,
      strictPort: true,
      host: true,
      proxy: mode === "development" ? apiProxy(apiTarget) : undefined,
    },
  };
});
