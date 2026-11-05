import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { api } from "@/lib/api";
import { postTypeLabel } from "@/lib/postLabels";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const statusOptions = [
  { value: "", label: "Todos os status" },
  { value: "DRAFT", label: "Rascunho" },
  { value: "REVIEW", label: "Em revisão" },
  { value: "SCHEDULED", label: "Agendado" },
  { value: "PUBLISHED", label: "Publicado" },
  { value: "ARCHIVED", label: "Arquivado" },
];

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function AdminPostsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const postsQ = useQuery({
    queryKey: ["admin-posts", debouncedSearch, status],
    queryFn: () => api.adminPosts({ q: debouncedSearch || undefined, status: status || undefined }),
  });

  const patchStatus = useMutation({
    mutationFn: ({ id, status: next }: { id: string; status: string }) => api.updatePost(id, { status: next }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-posts"] }),
    onError: (err: Error) => alert(err.message),
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
    <div className="space-y-6">
      <AdminPageHeader
        title="Publicações"
        subtitle="Gestão editorial com busca, filtros e fluxo de status. Clique no título para editar."
        actions={
          <Link
            to="/admin/publicacoes/nova"
            className="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-navy shadow-sm hover:brightness-105"
          >
            + Nova publicação
          </Link>
        }
      />

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

      {postsQ.isLoading ? <p className="text-sm text-muted">Carregando publicações…</p> : null}
      {postsQ.isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Não foi possível carregar as publicações. Faça login novamente ou atualize a página.
          {(postsQ.error as Error)?.message ? ` (${(postsQ.error as Error).message})` : ""}
        </p>
      ) : null}

      {!postsQ.isLoading && !postsQ.isError && total === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-paper/80 p-10 text-center">
          <p className="font-serif text-2xl text-navy">Nenhuma publicação ainda</p>
          <p className="mt-2 text-sm text-muted">Comece com um artigo, material ou aula.</p>
          <Link to="/admin/publicacoes/nova" className="mt-6 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">
            Criar publicação
          </Link>
        </div>
      ) : null}

      {!postsQ.isLoading && !postsQ.isError && total > 0 && displayed.length === 0 ? (
        <p className="text-sm text-muted">Nenhum resultado para a busca ou filtros atuais.</p>
      ) : null}

      {displayed.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-navy text-xs font-semibold uppercase tracking-wide text-white/80">
                <tr>
                  <th className="px-4 py-3.5 w-[42%]">Conteúdo</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Tipo</th>
                  <th className="px-4 py-3.5">Atualizado</th>
                  <th className="px-4 py-3.5">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {displayed.map((p) => {
                  const cat = p.category.parent ? `${p.category.parent.name} › ${p.category.name}` : p.category.name;
                  return (
                    <tr key={p.id} className="group transition hover:bg-paper/70">
                      <td className="px-4 py-4">
                        <div className="flex gap-4">
                          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-paper">
                            {p.coverImage ? (
                              <img src={p.coverImage} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy to-accent text-[10px] font-bold text-white/80">
                                {postTypeLabel[p.type]?.slice(0, 3).toUpperCase() ?? "—"}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                to={`/admin/publicacoes/${p.id}`}
                                className="font-serif text-lg font-semibold text-navy hover:text-accent"
                              >
                                {p.title}
                              </Link>
                              {p.featured ? (
                                <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-navy">
                                  Destaque
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-0.5 text-xs text-muted">{cat}</p>
                            {p.excerpt ? <p className="mt-1 line-clamp-2 text-xs text-muted/90">{p.excerpt}</p> : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <select
                          className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium"
                          value={p.status}
                          onChange={(e) => patchStatus.mutate({ id: p.id, status: e.target.value })}
                          aria-label="Alterar status"
                        >
                          {statusOptions.slice(1).map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <div className="mt-2">
                          <StatusBadge status={p.status} />
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-muted">{postTypeLabel[p.type] ?? p.type}</td>
                      <td className="px-4 py-4 align-top text-muted">{formatDate(p.updatedAt ?? p.publishedAt)}</td>
                      <td className="px-4 py-4 align-top whitespace-nowrap">
                        <Link to={`/admin/publicacoes/${p.id}`} className="font-medium text-accent hover:underline">
                          Editar
                        </Link>
                        {p.status === "PUBLISHED" ? (
                          <a href={`/artigo/${p.slug}`} target="_blank" rel="noreferrer" className="ml-3 text-muted hover:text-ink">
                            Ver
                          </a>
                        ) : null}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
