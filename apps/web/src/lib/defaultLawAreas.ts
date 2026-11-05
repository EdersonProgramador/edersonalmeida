import type { CategoryTree } from "./api";

function area(
  slug: string,
  name: string,
  description: string,
  sortOrder: number,
  icon?: string,
  accentColor?: string,
): CategoryTree {
  return {
    id: `static-${slug}`,
    name,
    slug,
    description,
    icon: icon ?? "§",
    accentColor: accentColor ?? "#1e4d7b",
    sortOrder,
    children: [],
  };
}

/** Grade informada no portal + ramos clássicos (fallback se a API falhar). */
export const defaultLawAreas: CategoryTree[] = [
  area(
    "introducao-ao-estudo-do-direito",
    "Introdução ao Estudo do Direito",
    "Método, fontes, interpretação e vocabulário jurídico.",
    1,
  ),
  area("filosofia", "Filosofia", "Fundamentos filosóficos do direito e da justiça.", 2),
  area(
    "ciencia-politica-e-teoria-do-estado",
    "Ciência Política e Teoria do Estado",
    "Estado, poder, soberania e instituições políticas.",
    3,
  ),
  area(
    "direito-constitucional",
    "Direito Constitucional",
    "Organização do Estado, direitos fundamentais e controle de constitucionalidade.",
    1,
    "§",
    "#1e3a5f",
  ),
  area(
    "direito-civil",
    "Direito Civil",
    "Obrigações, contratos, família, sucessões e responsabilidade civil.",
    2,
    "⚖",
    "#2c5282",
  ),
  area("direito-civil-parte-geral", "Direito Civil - Parte Geral", "Pessoas, bens, fatos jurídicos e relações obrigacionais.", 11),
  area("direito-penal", "Direito Penal", "Teoria do crime, processo penal e política criminal.", 3, "◆", "#744210"),
  area(
    "direito-do-trabalho",
    "Direito do Trabalho",
    "Relações de trabalho, sindicatos e processo trabalhista.",
    4,
    "◈",
    "#285e61",
  ),
  area(
    "direito-administrativo",
    "Direito Administrativo",
    "Administração pública, licitações, servidores e atos administrativos.",
    5,
    "▣",
    "#553c9a",
  ),
  area(
    "direito-tributario",
    "Direito Tributário",
    "Sistema tributário nacional, lançamento e execução fiscal.",
    6,
    "◉",
    "#9b2c2c",
  ),
  area(
    "direito-empresarial",
    "Direito Empresarial",
    "Sociedades, falência, propriedade industrial e mercado de capitais.",
    7,
    "◐",
    "#234e52",
  ),
  area("direito-previdenciario", "Direito Previdenciário", "Seguridade social, benefícios e previdência.", 15),
  area("hermeneutica-juridica", "Hermenêutica Jurídica", "Interpretação e aplicação das normas jurídicas.", 16),
  area("temas-diversos", "Temas diversos", "Reflexões transversais, atualidades e assuntos gerais.", 99, "✦", "#4a5568"),
];
