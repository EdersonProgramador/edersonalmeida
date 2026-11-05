import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

export function AdminDashboard() {
  const statsQ = useQuery({ queryKey: ["admin-stats"], queryFn: api.adminStats });

  const s = statsQ.data;
  const cards = [
    ["Publicados", s?.published, "text-emerald-700"],
    ["Rascunhos", s?.draft, "text-muted"],
    ["Em revisão", s?.review, "text-amber-700"],
    ["Agendados", s?.scheduled, "text-accent"],
    ["Categorias", s?.categories, "text-navy"],
  ] as const;

  return (
    <div>
      <h1 className="font-serif text-3xl text-navy">Dashboard editorial</h1>
      <p className="mt-2 text-muted">Fluxo profissional: rascunho → revisão → agendamento → publicação.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-border bg-paper p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className={`mt-1 text-3xl font-semibold ${color}`}>{value ?? "—"}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/publicacoes/nova" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
          Nova publicação
        </Link>
        <Link to="/admin/configuracoes" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">
          SEO e Google Ads
        </Link>
      </div>
    </div>
  );
}
