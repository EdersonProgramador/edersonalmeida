import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { toSlug } from "../src/slug.js";

const prisma = new PrismaClient();

const rootCategories = [
  {
    name: "Direito Constitucional",
    description: "Organização do Estado, direitos fundamentais e controle de constitucionalidade.",
    icon: "§",
    accentColor: "#1e3a5f",
    sortOrder: 1,
    children: ["Controle de constitucionalidade", "Direitos fundamentais"],
  },
  {
    name: "Direito Civil",
    description: "Obrigações, contratos, família, sucessões e responsabilidade civil.",
    icon: "⚖",
    accentColor: "#2c5282",
    sortOrder: 2,
    children: ["Contratos", "Família e sucessões"],
  },
  {
    name: "Direito Penal",
    description: "Teoria do crime, processo penal e política criminal.",
    icon: "◆",
    accentColor: "#744210",
    sortOrder: 3,
    children: ["Teoria do crime", "Processo penal"],
  },
  {
    name: "Direito do Trabalho",
    description: "Relações de trabalho, sindicatos e processo trabalhista.",
    icon: "◈",
    accentColor: "#285e61",
    sortOrder: 4,
    children: ["CLT e reformas", "Processo do trabalho"],
  },
  {
    name: "Direito Administrativo",
    description: "Administração pública, licitações e atos administrativos.",
    icon: "▣",
    accentColor: "#553c9a",
    sortOrder: 5,
    children: ["Licitações", "Servidores públicos"],
  },
  {
    name: "Direito Tributário",
    description: "Sistema tributário nacional e execução fiscal.",
    icon: "◉",
    accentColor: "#9b2c2c",
    sortOrder: 6,
    children: ["Impostos federais", "Execução fiscal"],
  },
];

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
      jobTitle: "Advogado",
      bio: "Conteúdo jurídico, análises e materiais para estudo e prática.",
    },
    update: {},
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      siteName: "Ederson Almeida — Direito",
      tagline: "Análises, materiais e atualidades jurídicas",
      defaultMetaTitle: "Ederson Almeida | Blog Jurídico",
      defaultMetaDescription:
        "Artigos, materiais e notícias sobre Direito Constitucional, Civil, Penal, Trabalho e mais.",
      cookieNoticeText:
        "Utilizamos cookies para analytics e, quando habilitado, exibição de anúncios. Ao continuar, você concorda com nossa política.",
      legalDisclaimer:
        "O conteúdo deste site tem caráter informativo e não substitui consultoria jurídica individual.",
    },
    update: {},
  });

  for (const cat of rootCategories) {
    const parent = await prisma.category.upsert({
      where: { slug: toSlug(cat.name) },
      create: {
        name: cat.name,
        slug: toSlug(cat.name),
        description: cat.description,
        icon: cat.icon,
        accentColor: cat.accentColor,
        sortOrder: cat.sortOrder,
      },
      update: {
        description: cat.description,
        icon: cat.icon,
        accentColor: cat.accentColor,
        sortOrder: cat.sortOrder,
      },
    });

    for (const [i, childName] of cat.children.entries()) {
      await prisma.category.upsert({
        where: { slug: toSlug(`${cat.name} ${childName}`) },
        create: {
          name: childName,
          slug: toSlug(`${cat.name}-${childName}`),
          parentId: parent.id,
          sortOrder: i + 1,
        },
        update: { parentId: parent.id, sortOrder: i + 1 },
      });
    }
  }

  const constSub = await prisma.category.findFirst({
    where: { name: "Controle de constitucionalidade" },
  });

  if (constSub) {
    const slug = "bem-vindo-ao-portal-juridico";
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.post.create({
        data: {
          title: "Bem-vindo ao portal jurídico",
          slug,
          excerpt:
            "Conteúdo organizado por áreas do Direito, com foco em SEO, materiais didáticos e publicações profissionais.",
          content: `<p>Este portal reúne <strong>artigos, materiais e análises</strong> organizados por categorias e subcategorias.</p>
<h2>Fluxo editorial</h2>
<ul>
<li><strong>Rascunho</strong> — elaboração interna</li>
<li><strong>Revisão</strong> — conferência técnica</li>
<li><strong>Agendado</strong> — data de publicação futura</li>
<li><strong>Publicado</strong> — visível no site e indexável</li>
</ul>
<p>Configure SEO, Google Analytics e Google Ads em <em>Configurações</em> no painel admin.</p>`,
          type: "ARTIGO",
          status: "PUBLISHED",
          featured: true,
          publishedAt: new Date(),
          readingMinutes: 2,
          metaTitle: "Portal jurídico | Ederson Almeida",
          metaDescription: "Blog jurídico com categorias, subcategorias e publicações profissionais.",
          categoryId: constSub.id,
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
