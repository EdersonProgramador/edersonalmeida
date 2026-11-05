import type { PrismaClient } from "@prisma/client";

export const SITE_BRANDING = {
  siteName: "Ederson Almeida",
  tagline: "Acadêmico de Direito",
  siteDescription: "Portal de conteúdo jurídico com artigos, materiais, notícias.",
  defaultMetaTitle: "Ederson Almeida | Portal jurídico",
  defaultMetaDescription: "Artigos, materiais e notícias jurídicas por Ederson Almeida, acadêmico de Direito.",
} as const;

const LEGACY_SITE_NAMES = new Set([
  "Ederson Almeida — Direito",
  "Ederson Almeida - Direito",
  "Ederson Almeida | Blog Jurídico",
  "Ederson Almeida - Acadêmico de Direito",
]);

function shouldSyncBranding(siteName: string) {
  if (LEGACY_SITE_NAMES.has(siteName)) return true;
  return siteName.includes("Acadêmico de Direito") && siteName !== SITE_BRANDING.siteName;
}

/** Atualiza identidade quando ainda usa textos antigos ou nome longo duplicado. */
export async function syncSiteBranding(prisma: PrismaClient) {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!row) return;
  if (!shouldSyncBranding(row.siteName)) return;
  await prisma.siteSettings.update({
    where: { id: "default" },
    data: { ...SITE_BRANDING },
  });
}
