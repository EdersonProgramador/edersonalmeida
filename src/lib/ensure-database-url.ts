import { applyDatabaseUrl } from "@/lib/database-url";

export function ensureDatabaseUrl(): void {
  applyDatabaseUrl();
}
