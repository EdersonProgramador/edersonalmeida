import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Scale } from "lucide-react";
import { MobileSiteMenu } from "@/components/MobileSiteMenu";
import { SiteMobileNavBar } from "@/components/SiteMobileNavBar";
import { SiteNavLinksDesktop } from "@/components/SiteNavLinks";
import type { SiteSettings } from "@/lib/api";
import { SITE_BRANDING } from "@/lib/siteBranding";

export function SiteHeader({ settings }: { settings?: SiteSettings | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const siteName = settings?.siteName ?? SITE_BRANDING.siteName;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6 md:py-4">
          <Link to="/" className="group flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-gold shadow-sm md:h-11 md:w-11">
              <Scale className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-serif text-lg font-semibold leading-tight text-navy group-hover:text-accent md:text-xl">
                {siteName}
              </p>
              <p className="truncate text-xs tracking-wide text-muted uppercase">
                {settings?.tagline ?? SITE_BRANDING.tagline}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex" aria-label="Principal">
            <SiteNavLinksDesktop />
          </nav>

          <button
            type="button"
            className="flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-navy hover:border-gold hover:text-accent lg:hidden"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden />
            Menu
          </button>
        </div>
        <SiteMobileNavBar />
      </header>

      <MobileSiteMenu open={menuOpen} onClose={() => setMenuOpen(false)} siteName={siteName} />
    </>
  );
}
