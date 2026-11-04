/** Fallback para build quando DATABASE_URL não está definida (ex.: Vercel). */
export function ensureDatabaseUrl() {
  if (!process.env.DATABASE_URL?.trim()) {
    process.env.DATABASE_URL = "file:./data.db";
  }
}
