import { copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const TMP_DB = "/tmp/edpersonalmeida.db";

/** Ajusta DATABASE_URL para SQLite no Vercel (bundle + cópia em /tmp). */
export function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL?.trim();

  if (process.env.VERCEL) {
    const bundled = path.join(process.cwd(), "prisma", "data.db");
    if (existsSync(bundled)) {
      try {
        copyFileSync(bundled, TMP_DB);
        return `file:${TMP_DB}`;
      } catch {
        /* /tmp indisponível — tenta caminho do bundle */
        return `file:${bundled}`;
      }
    }
    if (existsSync(TMP_DB)) {
      return `file:${TMP_DB}`;
    }
  }

  return envUrl || "file:./data.db";
}

export function applyDatabaseUrl(): void {
  process.env.DATABASE_URL = resolveDatabaseUrl();
}

/** Garante pasta prisma no build local. */
export function ensurePrismaDir(): void {
  const dir = path.join(process.cwd(), "prisma");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
