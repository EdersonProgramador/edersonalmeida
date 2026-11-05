import { Link, NavLink } from "react-router-dom";
import { SITE_NAV_ITEMS } from "@/lib/siteNav";

function itemClass(isActive: boolean, highlight?: boolean) {
  if (highlight) {
    return isActive
      ? "bg-navy text-white ring-2 ring-gold/50"
      : "bg-navy/90 text-white hover:bg-accent";
  }
  return isActive ? "bg-gold/15 text-navy ring-1 ring-gold/40" : "bg-paper text-ink hover:bg-gold/10 hover:text-accent";
}

/** Navegação sempre visível no mobile (mobile-first), sem depender do painel Menu. */
export function SiteMobileNavBar() {
  return (
    <nav
      className="border-t border-border/80 bg-surface px-2 py-2 lg:hidden"
      aria-label="Navegação mobile"
    >
      <ul className="grid grid-cols-3 gap-1.5 text-center text-xs font-semibold sm:text-sm">
        {SITE_NAV_ITEMS.map((item) => (
          <li key={item.to} className="min-w-0">
            {item.kind === "route" ? (
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block truncate rounded-lg px-2 py-2.5 transition ${itemClass(isActive)}`
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <Link
                to={item.to}
                className={`block truncate rounded-lg px-2 py-2.5 transition ${itemClass(false, item.highlight)}`}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
