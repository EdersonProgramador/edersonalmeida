import type { PrismaClient } from "@prisma/client";
import { toSlug } from "./slug.js";

export type CatalogCategory = {
  name: string;
  description: string;
  icon?: string;
  accentColor?: string;
  sortOrder: number;
  children?: string[];
};

/** Disciplinas da grade que você definiu no portal (além dos ramos clássicos). */
export const academicLawCatalog: CatalogCategory[] = [
  {
    name: "Introdução ao Estudo do Direito",
    description: "Método, fontes, interpretação e vocabulário jurídico.",
    sortOrder: 1,
  },
  { name: "Filosofia", description: "Fundamentos filosóficos do direito e da justiça.", sortOrder: 2 },
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
    name: "Teoria Geral do Processo e Fase de conhecimento no Processo Civil",
    description: "Estrutura processual e fase cognitiva no CPC.",
    sortOrder: 6,
  },
  {
    name: "Teoria Constitucional e Direitos Fundamentais",
    description: "Constituição, direitos e garantias fundamentais.",
    sortOrder: 7,
  },
  { name: "Organização Estatal", description: "Organização dos poderes e entes federativos.", sortOrder: 8 },
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
    name: "Teoria da Decisão Jurisdicional e Recursos no Processo Civil",
    description: "Sentença, coisa julgada e sistema recursal cível.",
    sortOrder: 13,
  },
  { name: "Processo do Trabalho", description: "Procedimentos na Justiça do Trabalho.", sortOrder: 14 },
  { name: "Direito Previdenciário", description: "Seguridade social, benefícios e previdência.", sortOrder: 15 },
  { name: "Hermenêutica Jurídica", description: "Interpretação e aplicação das normas jurídicas.", sortOrder: 16 },
  { name: "Administração", description: "Gestão, organizações e administração.", sortOrder: 90 },
  { name: "Psicologia", description: "Psicologia e comportamento.", sortOrder: 91 },
  { name: "Sociologia", description: "Sociedade, grupos e instituições.", sortOrder: 92 },
  { name: "Antropologia", description: "Cultura, diversidade e antropologia.", sortOrder: 93 },
];

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

const fullCatalog = [...academicLawCatalog, ...lawAreaCatalog];

export async function syncLawAreaCatalog(prisma: PrismaClient) {
  for (const cat of fullCatalog) {
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
