import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { CategoryInlineEditor } from "@/components/admin/CategoryInlineEditor";
import { api, type AdminCategory, type CategoryInput } from "@/lib/api";
import { matchesSearch } from "@/lib/searchText";

const emptyForm = (): CategoryInput => ({
  name: "",
  sortOrder: 0,
  parentId: null,
  description: "",
  icon: "",
  accentColor: "",
  slug: "",
});

type KindFilter = "all" | "roots" | "subs";

function filterCategories(roots: AdminCategory[], query: string, kind: KindFilter): AdminCategory[] {
  const q = query.trim();

  if (kind === "roots") {
    return roots
      .filter((r) => matchesSearch(r.name, q) || matchesSearch(r.slug, q))
      .map((r) => ({ ...r, children: [] }));
  }

  if (kind === "subs") {
    return roots
      .map((r) => ({
        ...r,
        children: r.children.filter((ch) => matchesSearch(ch.name, q) || matchesSearch(ch.slug, q)),
      }))
      .filter((r) => r.children.length > 0);
  }

  return roots
    .map((r) => {
      const rootMatch = !q || matchesSearch(r.name, q) || matchesSearch(r.slug, q);
      const children = r.children.filter((ch) => !q || matchesSearch(ch.name, q) || matchesSearch(ch.slug, q));
      if (!rootMatch && children.length === 0) return null;
      return { ...r, children: rootMatch && !q ? r.children : children };
    })
    .filter((r): r is AdminCategory => r !== null);
}

function countVisibleRows(roots: AdminCategory[], kind: KindFilter): number {
  if (kind === "roots") return roots.length;
  if (kind === "subs") return roots.reduce((n, r) => n + r.children.length, 0);
  return roots.reduce((n, r) => n + 1 + r.children.length, 0);
}

function findCategory(roots: AdminCategory[], id: string): AdminCategory | null {
  for (const root of roots) {
    if (root.id === id) return root;
    const child = root.children.find((c) => c.id === id);
    if (child) return { ...child, children: [], parent: root };
  }
  return null;
}

export function AdminCategoriesPage() {
  const qc = useQueryClient();
  const catsQ = useQuery({ queryKey: ["admin-categories"], queryFn: api.adminCategories });
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineId, setInlineId] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryInput>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const allRoots = catsQ.data ?? [];
  const filteredRoots = useMemo(() => filterCategories(allRoots, search, kind), [allRoots, search, kind]);
  const totalRows = countVisibleRows(allRoots, "all");
  const shownRows = countVisibleRows(filteredRoots, kind);

  const parentOptions = useMemo(() => {
    const rows: { id: string; label: string }[] = [];
    for (const root of allRoots) {
      if (root.id !== editingId) rows.push({ id: root.id, label: root.name });
    }
    return rows;
  }, [allRoots, editingId]);

  function startCreate() {
    setEditingId(null);
    setInlineId(null);
    setFormError(null);
    setForm(emptyForm());
  }

  function startEdit(cat: AdminCategory) {
    setInlineId(null);
    setEditingId(cat.id);
    setFormError(null);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      icon: cat.icon ?? "",
      accentColor: cat.accentColor ?? "",
      sortOrder: cat.sortOrder ?? 0,
      parentId: cat.parentId ?? null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload: CategoryInput = {
        ...form,
        description: form.description?.trim() || null,
        icon: form.icon?.trim() || null,
        accentColor: form.accentColor?.trim() || null,
        slug: form.slug?.trim() || undefined,
      };
      if (editingId) return api.updateCategory(editingId, payload);
      return api.createCategory(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      startCreate();
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const inlineSave = useMutation({
    mutationFn: ({ id, body }: { id: string; body: CategoryInput }) => api.updateCategory(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      setInlineId(null);
      setInlineError(null);
    },
    onError: (err: Error) => setInlineError(err.message),
  });

  const remove = useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => {
      if (editingId || inlineId) startCreate();
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err: Error) => alert(err.message),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    save.mutate();
  }

  const field = "mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm";
  const isEditing = Boolean(editingId);
  const rowHighlight = "ring-2 ring-gold/40 bg-gold/5";

  function renderInlineRow(cat: AdminCategory, parentLabel?: string) {
    if (inlineId !== cat.id) return null;
    return (
      <tr key={`${cat.id}-inline`}>
        <td colSpan={5} className="border-b border-border/70 px-0 py-0">
          <CategoryInlineEditor
            initial={{ ...cat, id: cat.id }}
            parentLabel={parentLabel}
            saving={inlineSave.isPending}
            error={inlineError}
            onCancel={() => {
              setInlineId(null);
              setInlineError(null);
            }}
            onFullEdit={() => startEdit(cat)}
            onSave={(body) => {
              setInlineError(null);
              inlineSave.mutate({ id: cat.id, body });
            }}
          />
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-navy">Categorias e subcategorias</h1>
          <p className="mt-2 text-sm text-muted">
            Busca, filtros, edição inline na tabela ou formulário completo acima.
          </p>
        </div>
        {isEditing ? (
          <button type="button" onClick={startCreate} className="rounded-lg border border-border px-4 py-2 text-sm font-medium">
            Cancelar edição
          </button>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border border-border bg-paper p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 font-serif text-xl text-navy">{isEditing ? "Editar categoria" : "Nova categoria"}</h2>
        <label className="text-sm font-medium md:col-span-2">
          Nome
          <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="text-sm font-medium">
          Slug (URL)
          <input
            className={field}
            placeholder="gerado automaticamente se vazio"
            value={form.slug ?? ""}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium">
          Ordem
          <input
            type="number"
            className={field}
            value={form.sortOrder ?? 0}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm font-medium">
          Ícone
          <input className={field} maxLength={4} value={form.icon ?? ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        </label>
        <label className="text-sm font-medium">
          Cor (#hex)
          <input
            className={field}
            placeholder="#1e4d7b"
            value={form.accentColor ?? ""}
            onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium md:col-span-2">
          Categoria pai (vazio = raiz)
          <select
            className={field}
            value={form.parentId ?? ""}
            onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}
          >
            <option value="">— Raiz —</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2 text-sm font-medium">
          Descrição
          <textarea
            className={field}
            rows={2}
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        {formError ? (
          <p className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{formError}</p>
        ) : null}
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white md:col-span-2 disabled:opacity-60"
        >
          {save.isPending ? "Salvando…" : isEditing ? "Salvar alterações" : "Criar categoria"}
        </button>
      </form>

      {catsQ.isLoading ? <p className="text-sm text-muted">Carregando categorias…</p> : null}
      {catsQ.isError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Não foi possível carregar as categorias. Confirme o login e tente atualizar a página.
          {(catsQ.error as Error)?.message ? ` (${(catsQ.error as Error).message})` : ""}
        </p>
      ) : null}
      {!catsQ.isLoading && !catsQ.isError && allRoots.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma categoria cadastrada. Use o formulário acima para criar a primeira.</p>
      ) : null}

      {allRoots.length > 0 ? (
        <div className="space-y-4">
          <AdminListToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Nome ou slug…"
            shown={shownRows}
            total={totalRows}
            filters={[
              {
                id: "kind",
                label: "Exibir",
                value: kind,
                onChange: (v) => setKind(v as KindFilter),
                options: [
                  { value: "all", label: "Todas" },
                  { value: "roots", label: "Só raízes" },
                  { value: "subs", label: "Só subcategorias" },
                ],
              },
            ]}
          />

          {filteredRoots.length === 0 ? (
            <p className="text-sm text-muted">Nenhum resultado para a busca ou filtro atual.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border bg-paper text-muted">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Ordem</th>
                    <th className="px-4 py-3">Posts</th>
                    <th className="px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoots.flatMap((root) => {
                    const rootActive = editingId === root.id || inlineId === root.id;
                    const rootRow = (
                      <tr key={root.id} className={`border-b border-border/70 bg-surface ${rootActive ? rowHighlight : ""}`}>
                        <td className="px-4 py-3 font-medium text-navy">
                          {root.icon ? `${root.icon} ` : null}
                          {root.name}
                        </td>
                        <td className="px-4 py-3 text-muted">{root.slug}</td>
                        <td className="px-4 py-3">{root.sortOrder ?? 0}</td>
                        <td className="px-4 py-3">{root._count?.posts ?? 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            className="text-accent hover:underline"
                            onClick={() => {
                              setInlineError(null);
                              setInlineId(inlineId === root.id ? null : root.id);
                              setEditingId(null);
                            }}
                          >
                            {inlineId === root.id ? "Fechar" : "Inline"}
                          </button>
                          <button type="button" className="ml-3 text-accent hover:underline" onClick={() => startEdit(root)}>
                            Editar
                          </button>
                          <button
                            type="button"
                            className="ml-3 text-red-700 hover:underline"
                            onClick={() => confirm(`Excluir “${root.name}”?`) && remove.mutate(root.id)}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                    const rootInline = kind !== "subs" ? renderInlineRow(root) : null;
                    const childRows =
                      kind === "roots"
                        ? []
                        : root.children.flatMap((ch) => {
                            const full = findCategory(allRoots, ch.id) ?? { ...ch, children: [], parent: root };
                            const childActive = editingId === ch.id || inlineId === ch.id;
                            return [
                              <tr key={ch.id} className={`border-b border-border/50 ${childActive ? rowHighlight : ""}`}>
                                <td className="px-4 py-3 pl-10 text-ink">↳ {ch.name}</td>
                                <td className="px-4 py-3 text-muted">{ch.slug}</td>
                                <td className="px-4 py-3">{ch.sortOrder ?? 0}</td>
                                <td className="px-4 py-3">—</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <button
                                    type="button"
                                    className="text-accent hover:underline"
                                    onClick={() => {
                                      setInlineError(null);
                                      setInlineId(inlineId === ch.id ? null : ch.id);
                                      setEditingId(null);
                                    }}
                                  >
                                    {inlineId === ch.id ? "Fechar" : "Inline"}
                                  </button>
                                  <button type="button" className="ml-3 text-accent hover:underline" onClick={() => startEdit(full)}>
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="ml-3 text-red-700 hover:underline"
                                    onClick={() => confirm(`Excluir subcategoria “${ch.name}”?`) && remove.mutate(ch.id)}
                                  >
                                    Excluir
                                  </button>
                                </td>
                              </tr>,
                              renderInlineRow(full, root.name),
                            ].filter(Boolean);
                          });
                    return [rootRow, rootInline, ...childRows].filter(Boolean);
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
