import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";
import { api, type AdminCategory, type CategoryInput } from "@/lib/api";

const emptyForm = (): CategoryInput => ({
  name: "",
  sortOrder: 0,
  parentId: null,
  description: "",
  icon: "",
  accentColor: "",
  slug: "",
});

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryInput>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const parentOptions = useMemo(() => {
    const rows: { id: string; label: string }[] = [];
    for (const root of catsQ.data ?? []) {
      if (root.id !== editingId) rows.push({ id: root.id, label: root.name });
    }
    return rows;
  }, [catsQ.data, editingId]);

  function startCreate() {
    setEditingId(null);
    setFormError(null);
    setForm(emptyForm());
  }

  function startEdit(cat: AdminCategory) {
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

  const remove = useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => {
      if (editingId) startCreate();
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

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-navy">Categorias e subcategorias</h1>
          <p className="mt-2 text-sm text-muted">
            CRUD completo: criar, editar, ordenar e excluir. Subcategorias ficam vinculadas a uma categoria pai.
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
      {!catsQ.isLoading && !catsQ.isError && (catsQ.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted">Nenhuma categoria cadastrada. Use o formulário acima para criar a primeira.</p>
      ) : null}

      {(catsQ.data?.length ?? 0) > 0 ? (
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
              {(catsQ.data ?? []).flatMap((root) => {
                const rootRow = (
                  <tr key={root.id} className="border-b border-border/70 bg-surface">
                    <td className="px-4 py-3 font-medium text-navy">
                      {root.icon ? `${root.icon} ` : null}
                      {root.name}
                    </td>
                    <td className="px-4 py-3 text-muted">{root.slug}</td>
                    <td className="px-4 py-3">{root.sortOrder ?? 0}</td>
                    <td className="px-4 py-3">{root._count?.posts ?? 0}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button type="button" className="text-accent hover:underline" onClick={() => startEdit(root)}>
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
                const childRows = root.children.map((ch) => {
                  const full = findCategory(catsQ.data!, ch.id) ?? { ...ch, children: [], parent: root };
                  return (
                    <tr key={ch.id} className="border-b border-border/50">
                      <td className="px-4 py-3 pl-10 text-ink">↳ {ch.name}</td>
                      <td className="px-4 py-3 text-muted">{ch.slug}</td>
                      <td className="px-4 py-3">{ch.sortOrder ?? 0}</td>
                      <td className="px-4 py-3">—</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button type="button" className="text-accent hover:underline" onClick={() => startEdit(full)}>
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
                    </tr>
                  );
                });
                return [rootRow, ...childRows];
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
