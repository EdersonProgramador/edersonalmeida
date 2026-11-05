import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const links = [
  ["", "Dashboard", "◆"],
  ["publicacoes", "Publicações", "§"],
  ["categorias", "Categorias", "▤"],
  ["configuracoes", "Configurações", "⚙"],
  ["perfil", "Meu perfil", "◉"],
] as const;

export function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const wideEditor = location.pathname.includes("/admin/publicacoes/");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-muted">
        Carregando painel…
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ee_0%,#efe9dc_100%)]">
      <header className="border-b border-navy/10 bg-navy text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-soft">CMS Jurídico</p>
            <p className="font-serif text-xl md:text-2xl">{user.name}</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <a
              href="/"
              className="rounded-full border border-white/25 px-4 py-1.5 text-gold-soft transition hover:border-gold hover:text-white"
            >
              Ver site
            </a>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-white/10 px-4 py-1.5 transition hover:bg-white/20"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr] md:px-8 md:py-8">
        <nav className="flex flex-wrap gap-2 md:flex-col md:gap-1">
          {links.map(([path, label, icon]) => (
            <NavLink
              key={path}
              to={path ? `/admin/${path}` : "/admin"}
              end={!path}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-navy text-white shadow-md ring-1 ring-gold/30"
                    : "bg-surface/90 text-ink shadow-sm hover:bg-white"
                }`
              }
            >
              <span className="text-xs opacity-70" aria-hidden>
                {icon}
              </span>
              {label}
            </NavLink>
          ))}
        </nav>
        <main
          className={`min-w-0 rounded-2xl border border-border/80 bg-surface/95 p-5 shadow-[0_8px_40px_rgba(15,23,41,0.06)] backdrop-blur-sm md:p-8 ${wideEditor ? "xl:p-10" : ""}`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
