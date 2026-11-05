import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const links = [
  ["", "Dashboard"],
  ["publicacoes", "Publicações"],
  ["categorias", "Categorias"],
  ["configuracoes", "Configurações"],
  ["perfil", "Meu perfil"],
] as const;

export function AdminLayout() {
  const { user, loading, logout } = useAuth();
  if (loading) return <p className="p-10">Carregando…</p>;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-border bg-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <p className="font-serif text-xl">Painel — {user.name}</p>
          <div className="flex items-center gap-4 text-sm">
            <a href="/" className="text-gold-soft hover:underline">
              Ver site
            </a>
            <button type="button" onClick={logout} className="rounded border border-white/30 px-3 py-1">
              Sair
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:px-6">
        <nav className="flex flex-wrap gap-2 md:flex-col md:gap-1">
          {links.map(([path, label]) => (
            <NavLink
              key={path}
              to={path ? `/admin/${path}` : "/admin"}
              end={!path}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-navy text-white" : "bg-surface text-ink hover:bg-white"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 rounded-2xl border border-border bg-surface p-5 shadow-sm md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
