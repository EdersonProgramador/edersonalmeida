import { PrismaClient } from "@prisma/client";
import { toSlug } from "../src/lib/slug";

const prisma = new PrismaClient();

const categories: { name: string; description: string; sortOrder: number }[] = [
  {
    name: "Introdução ao Estudo do Direito",
    description: "Método, fontes, interpretação e vocabulário jurídico.",
    sortOrder: 1,
  },
  {
    name: "Filosofia",
    description: "Fundamentos filosóficos do direito e da justiça.",
    sortOrder: 2,
  },
  {
    name: "Ciência Política e Teoria do Estado",
    description: "Estado, poder, soberania e instituições políticas.",
    sortOrder: 3,
  },
  {
    name: "Fundamentos Antropológicos e Sociológicos",
    description: "Direito na sociedade, cultura e comportamento humano.",
    sortOrder: 4,
  },
  {
    name: "Direito do Trabalho",
    description: "Relações de trabalho, contratos e tutela laboral.",
    sortOrder: 5,
  },
  {
    name: "Teoria Geral do Processo e Fase de conhecimento no Processo Civil",
    description: "Estrutura processual e fase cognitiva no CPC.",
    sortOrder: 6,
  },
  {
    name: "Teoria Constitucional e Direitos Fundamentais",
    description: "Constituição, direitos e garantias fundamentais.",
    sortOrder: 7,
  },
  {
    name: "Organização Estatal",
    description: "Organização dos poderes e entes federativos.",
    sortOrder: 8,
  },
  {
    name: "Língua Portuguesa",
    description: "Comunicação escrita e oral aplicada aos estudos jurídicos.",
    sortOrder: 9,
  },
  {
    name: "A História da Justiça no Brasil",
    description: "Trajetória das instituições de justiça no país.",
    sortOrder: 10,
  },
  {
    name: "Direito Civil - Parte Geral",
    description: "Pessoas, bens, fatos jurídicos e relações obrigacionais.",
    sortOrder: 11,
  },
  {
    name: "Direito Penal - Teoria do Crime",
    description: "Tipicidade, antijuridicidade, culpabilidade e imputação.",
    sortOrder: 12,
  },
  {
    name: "Teoria da Decisão Jurisdicional e Recursos no Processo Civil",
    description: "Sentença, coisa julgada e sistema recursal cível.",
    sortOrder: 13,
  },
  {
    name: "Processo do Trabalho",
    description: "Procedimentos na Justiça do Trabalho.",
    sortOrder: 14,
  },
  {
    name: "Direito Previdenciário",
    description: "Seguridade social, benefícios e previdência.",
    sortOrder: 15,
  },
  {
    name: "Hermenêutica Jurídica",
    description: "Interpretação e aplicação das normas jurídicas.",
    sortOrder: 16,
  },
  {
    name: "Administração",
    description: "Temas diversos — gestão, organizações e administração.",
    sortOrder: 90,
  },
  {
    name: "Psicologia",
    description: "Temas diversos — psicologia e comportamento.",
    sortOrder: 91,
  },
  {
    name: "Sociologia",
    description: "Temas diversos — sociedade, grupos e instituições.",
    sortOrder: 92,
  },
  {
    name: "Antropologia",
    description: "Temas diversos — cultura, diversidade e antropologia.",
    sortOrder: 93,
  },
  {
    name: "Temas diversos",
    description: "Outros assuntos transversais e reflexões gerais.",
    sortOrder: 99,
  },
];

async function main() {
  await prisma.author.upsert({
    where: { slug: "ederson-almeida" },
    create: {
      id: "seed-author-ederson",
      name: "Ederson Almeida",
      slug: "ederson-almeida",
      bio: "Estudante e autor do portal acadêmico.",
    },
    update: {
      name: "Ederson Almeida",
      bio: "Estudante e autor do portal acadêmico.",
    },
  });

  const keepSlugs = new Set(categories.map((c) => toSlug(c.name)));
  const existingCats = await prisma.category.findMany();
  for (const old of existingCats) {
    if (!keepSlugs.has(old.slug)) {
      const posts = await prisma.post.count({ where: { categoryId: old.id } });
      if (posts === 0) {
        await prisma.category.delete({ where: { id: old.id } });
      }
    }
  }

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: toSlug(cat.name) },
      create: {
        name: cat.name,
        slug: toSlug(cat.name),
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
      update: {
        name: cat.name,
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
    });
  }

  const intro = await prisma.category.findUnique({
    where: { slug: toSlug("Introdução ao Estudo do Direito") },
  });
  const author = await prisma.author.findUnique({
    where: { slug: "ederson-almeida" },
  });

  if (intro && author) {
    const slug = "bem-vindo-ao-portal";
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.post.create({
        data: {
          title: "Bem-vindo ao portal de publicações",
          slug,
          excerpt:
            "Organize suas aulas, materiais e artigos por disciplina da faculdade.",
          content: `<h2>Sobre este espaço</h2>
<p>Conteúdo das suas disciplinas — <strong>Direito</strong>, humanidades e <strong>temas diversos</strong> — com editor visual, imagens e vários autores.</p>
<h3>Como publicar</h3>
<ul>
<li>Categorias já refletem sua grade; crie novas no admin se precisar.</li>
<li>Use <strong>Publicações → Nova</strong> com o editor WYSIWYG e upload de capa.</li>
<li>Atribua autores em <strong>Admin → Autores</strong>.</li>
</ul>`,
          contentFormat: "HTML",
          type: "ARTIGO",
          status: "PUBLISHED",
          publishedAt: new Date(),
          categoryId: intro.id,
          authorId: author.id,
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
