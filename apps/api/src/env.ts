import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

if (process.env.NODE_ENV !== "production") {
  for (const p of [resolve(process.cwd(), "../../.env"), resolve(process.cwd(), ".env")]) {
    if (existsSync(p)) config({ path: p, override: true });
  }
}

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.preprocess((v) => v ?? process.env.PORT, z.coerce.number().default(3333)),
  DATABASE_URL: z
    .string()
    .min(1)
    .refine((u) => /^postgres(ql)?:\/\//i.test(u) || u.startsWith("file:"), {
      message: "Use postgresql:// em produção (Render).",
    }),
  WEB_ORIGIN: z.string().default("http://localhost:5175"),
  JWT_SECRET: z.string().min(16),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6),
  UPLOAD_ROOT: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
