import type { PostType } from "@prisma/client";

export const POST_TYPE_LABELS: Record<PostType, string> = {
  ARTIGO: "Artigo",
  MATERIAL: "Material",
  AULA: "Aula",
  PALESTRA: "Palestra",
  PODCAST: "Podcast",
  OUTRO: "Outro",
};

export const SITE = {
  name: "Ederson Almeida",
  tagline: "Direito, aulas e reflexões",
  description:
    "Publicações, materiais didáticos, palestras e artigos sobre Direito e temas correlatos.",
};
