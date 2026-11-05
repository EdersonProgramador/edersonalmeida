import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = process.cwd();
const apiDir = resolve(root, "apps/api");
const isRender = process.env.RENDER === "true";

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run("npm", ["run", "db:generate"], apiDir);

if (!isRender) {
  run("npm", ["run", "build:web"], root);
}
