import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { api } from "@/lib/api";

export function AdminDashboard() {
  const statsQ = useQuery({ queryKey: ["admin-stats"], queryFn: api.adminStats });

  const s = statsQ.data;
  const cards = [
    ["Publicados", s?.published, "from-emerald-600 to-emerald-800"],
    ["Rascunhos", s?.draft, "from-stone-500 to-stone-700"],
    ["Em revisão", s?.review, "from-amber-500 to-amber-700"],
    ["Agendados", s?.scheduled, "from-sky-600 to-sky-800"],
    ["Categorias", s?.categories, "from-navy to-accent"],
  ] as const;

  return (
    <div>
      <AdminPageHeader
        title="Dashboard editorial"
        subtitle="Visão geral do acervo e atalhos para publicação, categorias e SEO."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value, gradient]) => (
          <div key={label} className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-md`}>
            <p className="text-sm text-white/80">{label}</p>
            <p className="mt-1 font-serif text-4xl font-semibold">{value ?? "—"}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/publicacoes/nova" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
          Nova publicação
        </Link>
        <Link to="/admin/publicacoes" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">
          Gerenciar publicações
        </Link>
        <Link to="/admin/categorias" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">
          CRUD categorias
        </Link>
        <Link to="/admin/configuracoes" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">
          SEO e Google Ads
        </Link>
        <Link to="/admin/perfil" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">
          Meu perfil
        </Link>
      </div>
    </div>
  );
}
