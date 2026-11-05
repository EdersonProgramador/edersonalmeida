import type { PrismaClient } from "@prisma/client";
import { toSlug } from "./slug.js";

export type CatalogCategory = {
  name: string;
  description: string;
  icon: string;
  accentColor: string;
  sortOrder: number;
  children?: string[];
};

/** Áreas do Direito (grade original do portal). */
export const lawAreaCatalog: CatalogCategory[] = [
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
    description: "Administração pública, licitações, servidores e atos administrativos.",
    icon: "▣",
    accentColor: "#553c9a",
    sortOrder: 5,
    children: ["Licitações", "Servidores públicos"],
  },
  {
    name: "Direito Tributário",
    description: "Sistema tributário nacional, lançamento e execução fiscal.",
    icon: "◉",
    accentColor: "#9b2c2c",
    sortOrder: 6,
    children: ["Impostos federais", "Execução fiscal"],
  },
  {
    name: "Direito Empresarial",
    description: "Sociedades, falência, propriedade industrial e mercado de capitais.",
    icon: "◐",
    accentColor: "#234e52",
    sortOrder: 7,
    children: ["Sociedades", "Recuperação e falência"],
  },
  {
    name: "Temas diversos",
    description: "Reflexões transversais, atualidades e assuntos gerais.",
    icon: "✦",
    accentColor: "#4a5568",
    sortOrder: 99,
  },
];

export async function syncLawAreaCatalog(prisma: PrismaClient) {
  for (const cat of lawAreaCatalog) {
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

    for (const [i, childName] of (cat.children ?? []).entries()) {
      const childSlug = toSlug(`${cat.name}-${childName}`);
      await prisma.category.upsert({
        where: { slug: childSlug },
        create: {
          name: childName,
          slug: childSlug,
          parentId: parent.id,
          sortOrder: i + 1,
        },
        update: { name: childName, parentId: parent.id, sortOrder: i + 1 },
      });
    }
  }
}
