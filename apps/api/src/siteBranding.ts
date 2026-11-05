import type { PrismaClient } from "@prisma/client";

export const SITE_BRANDING = {
  siteName: "Ederson Almeida - Acadêmico de Direito",
  tagline: "Acadêmico de Direito",
  siteDescription: "Portal de conteúdo jurídico com artigos, materiais, notícias.",
  defaultMetaTitle: "Ederson Almeida - Acadêmico de Direito",
  defaultMetaDescription: "Portal de conteúdo jurídico com artigos, materiais, notícias.",
} as const;

const LEGACY_SITE_NAMES = new Set([
  "Ederson Almeida — Direito",
  "Ederson Almeida - Direito",
  "Ederson Almeida | Blog Jurídico",
]);

/** Atualiza identidade do site quando ainda usa textos antigos do seed/migration. */
export async function syncSiteBranding(prisma: PrismaClient) {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!row) return;
  if (!LEGACY_SITE_NAMES.has(row.siteName as string)) return;
  await prisma.siteSettings.update({
    where: { id: "default" },
    data: { ...SITE_BRANDING },
  });
}
