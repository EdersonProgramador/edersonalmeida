import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const envPaths = [
  resolve(process.cwd(), "../../.env"),
  resolve(process.cwd(), "../../.env.local"),
  resolve(process.cwd(), ".env"),
];

for (const p of envPaths) {
  if (existsSync(p)) {
    config({ path: p, override: process.env.NODE_ENV !== "production" });
  }
}

if (!process.env.DATABASE_URL_UNPOOLED?.trim() && process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
}

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.preprocess((v) => v ?? process.env.PORT, z.coerce.number().default(3333)),
  DATABASE_URL: z
    .string()
    .min(1)
    .refine((u) => /^postgres(ql)?:\/\//i.test(u), {
      message: "Use postgresql:// (Neon DATABASE_URL ou Render Postgres).",
    }),
  DATABASE_URL_UNPOOLED: z.string().min(1).optional(),
  WEB_ORIGIN: z.string().default("http://localhost:5175"),
  JWT_SECRET: z
    .preprocess((v) => v ?? process.env.SESSION_SECRET, z.string().min(16)),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6),
  UPLOAD_ROOT: z
    .preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().optional()),
  NEON_REALTIME_URL: z.string().url().optional(),
  NEON_REALTIME_SECRET: z.string().min(1).optional(),
  NEON_BRANCH: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const neonRealtimeEnabled =
  Boolean(env.NEON_REALTIME_SECRET?.trim()) && Boolean(env.NEON_REALTIME_URL?.trim());
