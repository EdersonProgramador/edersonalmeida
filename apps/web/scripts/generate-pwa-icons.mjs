import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const svg = fs.readFileSync(path.join(dir, "favicon.svg"));

for (const size of [192, 512]) {
  const out = path.join(dir, `pwa-${size}.png`);
  await sharp(svg).resize(size, size).png().toFile(out);
  console.log("wrote", out);
}
