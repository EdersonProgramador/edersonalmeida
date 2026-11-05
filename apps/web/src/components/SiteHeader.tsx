import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Scale, X } from "lucide-react";
import type { SiteSettings } from "@/lib/api";
import { SITE_BRANDING } from "@/lib/siteBranding";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "text-gold" : "text-ink hover:text-accent";
}

function HeaderNavLinks({
  layout,
  onNavigate,
}: {
  layout: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const adminClass =
    layout === "mobile"
      ? "mt-1 inline-flex w-full justify-center rounded-full border border-border px-4 py-2.5 text-ink hover:border-gold hover:text-accent"
      : "rounded-full border border-border px-4 py-1.5 text-ink hover:border-gold hover:text-accent";

  if (layout === "mobile") {
    return (
      <ul className="flex flex-col gap-1 text-sm font-medium">
        <li>
          <NavLink to="/" className={navLinkClass} onClick={onNavigate}>
            Início
          </NavLink>
        </li>
        <li>
          <NavLink to="/categorias" className={navLinkClass} onClick={onNavigate}>
            Áreas do Direito
          </NavLink>
        </li>
        <li>
          <Link to="/admin/login" className={adminClass} onClick={onNavigate}>
            Entrar
          </Link>
        </li>
      </ul>
    );
  }

  return (
    <>
      <NavLink to="/" className={navLinkClass}>
        Início
      </NavLink>
      <NavLink to="/categorias" className={navLinkClass}>
        Áreas do Direito
      </NavLink>
      <Link to="/admin/login" className={adminClass}>
        Entrar
      </Link>
    </>
  );
}

export function SiteHeader({ settings }: { settings?: SiteSettings | null }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="border-b border-border/80 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:gap-4 md:px-6">
        <Link to="/" className="group flex min-w-0 flex-1 items-center gap-3" onClick={closeMenu}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-gold shadow-sm">
            <Scale className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-serif text-lg font-semibold leading-tight text-navy group-hover:text-accent md:text-xl">
              {settings?.siteName ?? SITE_BRANDING.siteName}
            </p>
            <p className="truncate text-xs tracking-wide text-muted uppercase">{settings?.tagline ?? SITE_BRANDING.tagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Principal">
          <HeaderNavLinks layout="desktop" />
        </nav>

        <button
          type="button"
          className="flex shrink-0 items-center justify-center rounded-lg border border-border p-2.5 text-navy hover:border-gold hover:text-accent md:hidden"
          aria-expanded={menuOpen}
          aria-controls="site-mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          <span className="sr-only">{menuOpen ? "Fechar menu" : "Abrir menu"}</span>
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="site-mobile-nav"
          className="border-t border-border bg-surface px-4 py-4 md:hidden"
          aria-label="Principal"
        >
          <HeaderNavLinks layout="mobile" onNavigate={closeMenu} />
        </nav>
      ) : null}
    </header>
  );
}
