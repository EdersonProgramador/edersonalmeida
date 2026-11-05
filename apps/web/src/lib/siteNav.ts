export type SiteNavItem =
  | { kind: "route"; to: string; label: string; end?: boolean }
  | { kind: "link"; to: string; label: string; highlight?: boolean };

export const SITE_NAV_ITEMS: SiteNavItem[] = [
  { kind: "route", to: "/", label: "Início", end: true },
  { kind: "route", to: "/categorias", label: "Áreas do Direito" },
  { kind: "link", to: "/admin/login", label: "Entrar", highlight: true },
];
