export const postStatusLabel: Record<string, string> = {
  DRAFT: "Rascunho",
  REVIEW: "Em revisão",
  SCHEDULED: "Agendado",
  PUBLISHED: "Publicado",
  ARCHIVED: "Arquivado",
};

export const postTypeLabel: Record<string, string> = {
  ARTIGO: "Artigo",
  MATERIAL: "Material",
  AULA: "Aula",
  PALESTRA: "Palestra",
  PODCAST: "Podcast",
  OUTRO: "Outro",
};

export const postStatuses = ["DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"] as const;
export const postTypes = ["ARTIGO", "MATERIAL", "AULA", "PALESTRA", "PODCAST", "OUTRO"] as const;

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-100 text-emerald-900 ring-emerald-200";
    case "REVIEW":
      return "bg-amber-100 text-amber-900 ring-amber-200";
    case "SCHEDULED":
      return "bg-sky-100 text-sky-900 ring-sky-200";
    case "ARCHIVED":
      return "bg-stone-200 text-stone-800 ring-stone-300";
    default:
      return "bg-paper text-muted ring-border";
  }
}
