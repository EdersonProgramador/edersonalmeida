import { PrismaClient } from "@prisma/client";
import { toSlug } from "../src/lib/slug";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Direito Constitucional",
    description: "Organização do Estado, direitos fundamentais e controle de constitucionalidade.",
    sortOrder: 1,
  },
  {
    name: "Direito Civil",
    description: "Obrigações, contratos, família, sucessões e responsabilidade civil.",
    sortOrder: 2,
  },
  {
    name: "Direito Penal",
    description: "Teoria do crime, processo penal e política criminal.",
    sortOrder: 3,
  },
  {
    name: "Direito do Trabalho",
    description: "Relações de trabalho, sindicatos e processo trabalhista.",
    sortOrder: 4,
  },
  {
    name: "Direito Administrativo",
    description: "Administração pública, licitações, servidores e atos administrativos.",
    sortOrder: 5,
  },
  {
    name: "Direito Tributário",
    description: "Sistema tributário nacional, lançamento e execução fiscal.",
    sortOrder: 6,
  },
  {
    name: "Direito Empresarial",
    description: "Sociedades, falência, propriedade industrial e mercado de capitais.",
    sortOrder: 7,
  },
  {
    name: "Temas diversos",
    description: "Reflexões transversais, atualidades e assuntos gerais.",
    sortOrder: 99,
  },
];

async function main() {
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
        description: cat.description,
        sortOrder: cat.sortOrder,
      },
    });
  }

  const constCat = await prisma.category.findUnique({
    where: { slug: toSlug("Direito Constitucional") },
  });

  if (constCat) {
    const slug = "bem-vindo-ao-portal";
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.post.create({
        data: {
          title: "Bem-vindo ao portal de publicações",
          slug,
          excerpt:
            "Este é um exemplo de artigo publicado. Use o painel administrativo para criar categorias, materiais, aulas e palestras.",
          content: `## Sobre este espaço

Este portal reúne **conteúdo jurídico** organizado por categorias de assunto — como no WordPress, você define as categorias no admin e publica quando estiver pronto.

### Tipos de publicação

- **Artigos** e textos de opinião
- **Materiais** para download ou estudo
- **Aulas** e roteiros didáticos
- **Palestras** e apresentações
- **Podcasts** e mídia em áudio

Edite ou remova este post em \`/admin/publicacoes\`.`,
          type: "ARTIGO",
          status: "PUBLISHED",
          publishedAt: new Date(),
          categoryId: constCat.id,
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
