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
    onError: (err: Error) => alert(err.message),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-navy">Publicações</h1>
          <p className="mt-1 text-sm text-muted">Criar, editar, publicar e excluir conteúdo (CRUD completo).</p>
        </div>
        <Link to="/admin/publicacoes/nova" className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy">
          Nova publicação
        </Link>
      </div>

      {postsQ.isLoading ? <p className="mt-6 text-sm text-muted">Carregando publicações…</p> : null}
      {postsQ.isError ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Não foi possível carregar as publicações. Faça login novamente ou atualize a página.
          {(postsQ.error as Error)?.message ? ` (${(postsQ.error as Error).message})` : ""}
        </p>
      ) : null}

      {!postsQ.isLoading && !postsQ.isError && (postsQ.data?.length ?? 0) === 0 ? (
        <p className="mt-6 text-sm text-muted">
          Nenhuma publicação ainda.{" "}
          <Link to="/admin/publicacoes/nova" className="text-accent hover:underline">
            Criar a primeira
          </Link>
          .
        </p>
      ) : null}

      {(postsQ.data?.length ?? 0) > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-paper text-muted">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(postsQ.data ?? []).map((p) => (
                <tr key={p.id} className="border-b border-border/70">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">{statusLabel[p.status] ?? p.status}</td>
                  <td className="px-4 py-3">{p.category.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
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
      ) : null}
    </div>
  );
}
