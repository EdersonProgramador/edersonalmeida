/** Garante DATABASE_URL no build (ex.: Vercel) quando só o schema é validado. */
export function ensureDatabaseUrl() {
  if (!process.env.DATABASE_URL?.trim()) {
    process.env.DATABASE_URL = "file:./prisma/.vercel-build.db";
  }
}
