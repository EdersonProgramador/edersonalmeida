import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

const statusLabel: Record<string, string> = {
  DRAFT: "Rascunho",
  REVIEW: "Revisão",
  SCHEDULED: "Agendado",
  PUBLISHED: "Publicado",
  ARCHIVED: "Arquivado",
};

export function AdminPostsPage() {
  const qc = useQueryClient();
  const postsQ = useQuery({ queryKey: ["admin-posts"], queryFn: () => api.adminPosts() });
  const del = useMutation({
    mutationFn: api.deletePost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-posts"] }),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-navy">Publicações</h1>
        <Link to="/admin/publicacoes/nova" className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy">
          Nova
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="py-2 pr-4">Título</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Categoria</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(postsQ.data ?? []).map((p) => (
              <tr key={p.id} className="border-b border-border/70">
                <td className="py-3 pr-4 font-medium">{p.title}</td>
                <td className="py-3 pr-4">{statusLabel[p.status] ?? p.status}</td>
                <td className="py-3 pr-4">{p.category.name}</td>
                <td className="py-3">
                  <Link to={`/admin/publicacoes/${p.id}`} className="text-accent hover:underline">
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="ml-3 text-red-700 hover:underline"
                    onClick={() => {
                      if (confirm("Excluir publicação?")) del.mutate(p.id);
                    }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
