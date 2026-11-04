import { Link } from "react-router-dom";
import { SITE } from "../lib/constants";

export function SiteHeader() {
  return (
    <header className="border-b border-border/70 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <Link to="/" className="group">
          <p className="font-display text-2xl tracking-tight text-ink group-hover:text-accent transition">
            {SITE.name}
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{SITE.tagline}</p>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/#categorias" className="text-muted hover:text-ink transition">
            Categorias
          </Link>
          <Link to="/#publicacoes" className="text-muted hover:text-ink transition">
            Publicações
          </Link>
          <Link
            to="/admin"
            className="rounded-full border border-border px-4 py-1.5 text-muted hover:border-accent hover:text-accent transition"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
