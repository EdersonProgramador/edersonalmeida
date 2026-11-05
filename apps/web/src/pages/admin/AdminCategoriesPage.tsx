import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { api, type CategoryInput } from "@/lib/api";

export function AdminCategoriesPage() {
  const qc = useQueryClient();
  const catsQ = useQuery({ queryKey: ["admin-categories"], queryFn: api.adminCategories });
  const [form, setForm] = useState<CategoryInput>({ name: "", sortOrder: 0 });

  const create = useMutation({
    mutationFn: () => api.createCategory(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      setForm({ name: "", sortOrder: 0, parentId: null });
    },
  });

  const remove = useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  const field = "mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl text-navy">Categorias e subcategorias</h1>
        <p className="mt-2 text-sm text-muted">Organize o acervo por ramos do Direito e temas específicos.</p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border border-border bg-paper p-5 md:grid-cols-2">
        <label className="text-sm font-medium md:col-span-2">
          Nome
          <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="text-sm font-medium">
          Ícone (1 caractere)
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
          Categoria pai (deixe vazio para categoria raiz)
          <select
            className={field}
            value={form.parentId ?? ""}
            onChange={(e) => setForm({ ...form, parentId: e.target.value || null })}
          >
            <option value="">— Raiz —</option>
            {(catsQ.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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
        <button type="submit" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white md:col-span-2">
          Adicionar categoria
        </button>
      </form>

      <div className="space-y-4">
        {(catsQ.data ?? []).map((root) => (
          <div key={root.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-serif text-xl text-navy">
                {root.icon} {root.name}{" "}
                <span className="text-sm text-muted">({root._count?.posts ?? 0} posts)</span>
              </p>
              <button
                type="button"
                className="text-sm text-red-700"
                onClick={() => confirm("Excluir?") && remove.mutate(root.id)}
              >
                Excluir
              </button>
            </div>
            <ul className="mt-3 space-y-2 pl-4">
              {root.children.map((ch) => (
                <li key={ch.id} className="flex items-center justify-between text-sm">
                  <span>↳ {ch.name}</span>
                  <button
                    type="button"
                    className="text-red-700"
                    onClick={() => confirm("Excluir subcategoria?") && remove.mutate(ch.id)}
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
