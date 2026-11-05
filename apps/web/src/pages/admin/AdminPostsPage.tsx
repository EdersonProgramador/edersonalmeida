import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { api } from "@/lib/api";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const statusLabel: Record<string, string> = {
  DRAFT: "Rascunho",
  REVIEW: "Revisão",
  SCHEDULED: "Agendado",
  PUBLISHED: "Publicado",
  ARCHIVED: "Arquivado",
};

const statusOptions = [
  { value: "", label: "Todos os status" },
  { value: "DRAFT", label: "Rascunho" },
  { value: "REVIEW", label: "Revisão" },
  { value: "SCHEDULED", label: "Agendado" },
  { value: "PUBLISHED", label: "Publicado" },
  { value: "ARCHIVED", label: "Arquivado" },
];

export function AdminPostsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const postsQ = useQuery({
    queryKey: ["admin-posts", debouncedSearch, status],
    queryFn: () => api.adminPosts({ q: debouncedSearch || undefined, status: status || undefined }),
  });

  const del = useMutation({
    mutationFn: api.deletePost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-posts"] }),
    onError: (err: Error) => alert(err.message),
  });

  const unfilteredQ = useQuery({
    queryKey: ["admin-posts", "", ""],
    queryFn: () => api.adminPosts(),
    enabled: Boolean(debouncedSearch || status),
  });

  const total = unfilteredQ.data?.length ?? postsQ.data?.length ?? 0;
  const shown = postsQ.data?.length ?? 0;

  const categoryFilter = useMemo(() => {
    const set = new Map<string, string>();
    for (const p of postsQ.data ?? []) {
      set.set(p.categoryId, p.category.name);
    }
    return [...set.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [postsQ.data]);

  const [categoryId, setCategoryId] = useState("");
  const displayed = useMemo(() => {
    const items = postsQ.data ?? [];
    if (!categoryId) return items;
    return items.filter((p) => p.categoryId === categoryId);
  }, [postsQ.data, categoryId]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-navy">Publicações</h1>
          <p className="mt-1 text-sm text-muted">Busca por título/slug, filtro por status e categoria.</p>
        </div>
        <Link to="/admin/publicacoes/nova" className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy">
          Nova publicação
        </Link>
      </div>

      <div className="mt-6">
        <AdminListToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Título ou slug…"
          shown={categoryId ? displayed.length : shown}
          total={total}
          filters={[
            {
              id: "status",
              label: "Status",
              value: status,
              onChange: setStatus,
              options: statusOptions,
            },
            {
              id: "category",
              label: "Categoria",
              value: categoryId,
              onChange: setCategoryId,
              options: [{ value: "", label: "Todas" }, ...categoryFilter.map(([id, name]) => ({ value: id, label: name }))],
            },
          ]}
        />
      </div>

      {postsQ.isLoading ? <p className="mt-6 text-sm text-muted">Carregando publicações…</p> : null}
      {postsQ.isError ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Não foi possível carregar as publicações. Faça login novamente ou atualize a página.
          {(postsQ.error as Error)?.message ? ` (${(postsQ.error as Error).message})` : ""}
        </p>
      ) : null}

      {!postsQ.isLoading && !postsQ.isError && total === 0 ? (
        <p className="mt-6 text-sm text-muted">
          Nenhuma publicação ainda.{" "}
          <Link to="/admin/publicacoes/nova" className="text-accent hover:underline">
            Criar a primeira
          </Link>
          .
        </p>
      ) : null}

      {!postsQ.isLoading && !postsQ.isError && total > 0 && displayed.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Nenhum resultado para a busca ou filtros atuais.</p>
      ) : null}

      {displayed.length > 0 ? (
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
              {displayed.map((p) => (
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
