import { useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { SITE_NAV_ITEMS } from "@/lib/siteNav";

type MobileSiteMenuProps = {
  open: boolean;
  onClose: () => void;
  siteName: string;
};

function mobileNavLinkClass(isActive: boolean) {
  return isActive
    ? "bg-navy/5 text-navy ring-1 ring-gold/40"
    : "text-ink hover:bg-paper hover:text-accent";
}

export function MobileSiteMenu({ open, onClose, siteName }: MobileSiteMenuProps) {
  const { pathname } = useLocation();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    onCloseRef.current();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true" aria-label="Menu do site">
      <button
        type="button"
        className="absolute inset-0 bg-navy/55 backdrop-blur-[2px]"
        aria-label="Fechar menu"
        onClick={onClose}
      />
      <div className="relative flex h-full max-h-[100dvh] flex-col bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <p className="font-serif text-lg font-semibold text-navy">{siteName}</p>
          <button
            type="button"
            className="rounded-lg border border-border p-2.5 text-navy hover:border-gold hover:text-accent"
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden />
            <span className="sr-only">Fechar menu</span>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Principal">
          <ul className="flex flex-col gap-2">
            {SITE_NAV_ITEMS.map((item) => (
              <li key={item.to}>
                {item.kind === "route" ? (
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `block rounded-xl px-4 py-3.5 text-base font-semibold transition ${mobileNavLinkClass(isActive)}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ) : (
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className={`block rounded-xl px-4 py-3.5 text-center text-base font-semibold transition ${
                      item.highlight
                        ? "bg-navy text-white hover:bg-accent"
                        : "text-ink hover:bg-paper hover:text-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
