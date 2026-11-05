import { Link, NavLink } from "react-router-dom";
import { SITE_NAV_ITEMS } from "@/lib/siteNav";

function desktopNavLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "text-gold" : "text-ink hover:text-accent";
}

export function SiteNavLinksDesktop() {
  return (
    <>
      {SITE_NAV_ITEMS.map((item) =>
        item.kind === "route" ? (
          <NavLink key={item.to} to={item.to} end={item.end} className={desktopNavLinkClass}>
            {item.label}
          </NavLink>
        ) : (
          <Link
            key={item.to}
            to={item.to}
            className={
              item.highlight
                ? "rounded-full border border-border px-4 py-1.5 text-ink hover:border-gold hover:text-accent"
                : "text-ink hover:text-accent"
            }
          >
            {item.label}
          </Link>
        ),
      )}
    </>
  );
}

export function SiteNavLinksFooter() {
  return (
    <nav className="mt-8 border-t border-white/15 pt-6 md:hidden" aria-label="Navegação rápida">
      <p className="text-xs font-semibold tracking-wide text-white/50 uppercase">Menu</p>
      <ul className="mt-3 flex flex-col gap-2 text-sm font-medium">
        {SITE_NAV_ITEMS.map((item) => (
          <li key={item.to}>
            {item.kind === "route" ? (
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "text-gold" : "text-white/85 hover:text-gold")}
              >
                {item.label}
              </NavLink>
            ) : (
              <Link to={item.to} className="text-white/85 hover:text-gold">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
