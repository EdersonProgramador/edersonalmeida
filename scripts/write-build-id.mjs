import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
let sha = "dev";
try {
  sha = execSync("git rev-parse --short HEAD", { cwd: root, encoding: "utf8" }).trim();
} catch {
  sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "unknown";
}

const out = resolve(root, "apps/web/public/build-id.txt");
writeFileSync(out, `${sha}\n`, "utf8");
console.info(`[build-id] ${sha}`);
