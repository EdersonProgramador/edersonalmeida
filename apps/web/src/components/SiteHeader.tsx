import { Link, NavLink } from "react-router-dom";
import { Scale } from "lucide-react";
import type { SiteSettings } from "@/lib/api";
import { SITE_BRANDING } from "@/lib/siteBranding";

export function SiteHeader({ settings }: { settings?: SiteSettings | null }) {
  return (
    <header className="border-b border-border/80 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-gold shadow-sm">
            <Scale className="h-5 w-5" />
          </span>
          <div>
            <p className="font-serif text-xl font-semibold leading-tight text-navy group-hover:text-accent">
              {settings?.siteName ?? SITE_BRANDING.siteName}
            </p>
            <p className="text-xs tracking-wide text-muted uppercase">{settings?.tagline ?? SITE_BRANDING.tagline}</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <NavLink to="/" className={({ isActive }) => (isActive ? "text-gold" : "text-ink hover:text-accent")}>
            Início
          </NavLink>
          <NavLink
            to="/categorias"
            className={({ isActive }) => (isActive ? "text-gold" : "text-ink hover:text-accent")}
          >
            Áreas do Direito
          </NavLink>
          <Link
            to="/admin"
            className="rounded-full border border-border px-4 py-1.5 text-ink hover:border-gold hover:text-accent"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
