import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { lawAreaCatalog, syncLawAreaCatalog } from "../src/catalog.js";
import { repairOrphanPosts } from "../src/repair-data.js";
import { SITE_BRANDING } from "../src/siteBranding.js";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@ederson.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "admin123";

  const admin = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      name: "Ederson Almeida",
      role: "ADMIN",
      jobTitle: "Acadêmico de Direito",
      bio: "Conteúdo jurídico, análises e materiais para estudo e prática.",
    },
    update: {},
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      ...SITE_BRANDING,
      cookieNoticeText:
        "Utilizamos cookies para analytics e, quando habilitado, exibição de anúncios. Ao continuar, você concorda com nossa política.",
      legalDisclaimer:
        "O conteúdo deste site tem caráter informativo e não substitui consultoria jurídica individual.",
    },
    update: {},
  });

  await repairOrphanPosts(prisma);
  await syncLawAreaCatalog(prisma);

  const constSub = await prisma.category.findFirst({
    where: { slug: "direito-constitucional-controle-de-constitucionalidade" },
  });
  const constRoot = await prisma.category.findUnique({
    where: { slug: "direito-constitucional" },
  });
  const welcomeCategoryId = constSub?.id ?? constRoot?.id;

  if (welcomeCategoryId) {
    const slug = "bem-vindo-ao-portal-juridico";
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.post.create({
        data: {
          title: "Bem-vindo ao portal jurídico",
          slug,
          excerpt:
            "Conteúdo organizado por áreas do Direito, com foco em SEO, materiais didáticos e publicações profissionais.",
          content: `<p>Este portal reúne <strong>artigos, materiais e análises</strong> nas áreas do Direito que você já conhece do portal.</p>
<ul>
${lawAreaCatalog.map((c) => `<li><strong>${c.name}</strong> — ${c.description}</li>`).join("\n")}
</ul>`,
          type: "ARTIGO",
          status: "PUBLISHED",
          featured: true,
          publishedAt: new Date(),
          readingMinutes: 2,
          metaTitle: "Portal jurídico | Ederson Almeida",
          metaDescription: "Blog jurídico com categorias, subcategorias e publicações profissionais.",
          categoryId: welcomeCategoryId,
          authorId: admin.id,
        },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
