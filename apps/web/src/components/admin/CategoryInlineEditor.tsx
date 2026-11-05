import { FormEvent, useState } from "react";
import { type CategoryInput } from "@/lib/api";

type Props = {
  initial: CategoryInput & { id: string };
  parentLabel?: string;
  onSave: (payload: CategoryInput) => void;
  onCancel: () => void;
  onFullEdit: () => void;
  saving: boolean;
  error?: string | null;
};

export function CategoryInlineEditor({ initial, parentLabel, onSave, onCancel, onFullEdit, saving, error }: Props) {
  const [form, setForm] = useState<CategoryInput>({
    name: initial.name,
    slug: initial.slug ?? "",
    sortOrder: initial.sortOrder ?? 0,
    icon: initial.icon ?? "",
    accentColor: initial.accentColor ?? "",
    description: initial.description ?? "",
    parentId: initial.parentId ?? null,
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    onSave({
      ...form,
      description: form.description?.trim() || null,
      icon: form.icon?.trim() || null,
      accentColor: form.accentColor?.trim() || null,
      slug: form.slug?.trim() || undefined,
    });
  }

  const field = "w-full rounded-lg border border-border px-2 py-1.5 text-sm";

  return (
    <form onSubmit={submit} className="grid gap-3 bg-paper/80 p-4 md:grid-cols-2 lg:grid-cols-4">
      {parentLabel ? (
        <p className="md:col-span-2 lg:col-span-4 text-xs text-muted">
          Subcategoria de <span className="font-medium text-ink">{parentLabel}</span>
        </p>
      ) : null}
      <label className="text-xs font-medium md:col-span-2 lg:col-span-2">
        Nome
        <input className={`${field} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </label>
      <label className="text-xs font-medium">
        Slug
        <input className={`${field} mt-1`} value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      </label>
      <label className="text-xs font-medium">
        Ordem
        <input
          type="number"
          className={`${field} mt-1`}
          value={form.sortOrder ?? 0}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
        />
      </label>
      <label className="text-xs font-medium">
        Ícone
        <input className={`${field} mt-1`} maxLength={4} value={form.icon ?? ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
      </label>
      <label className="text-xs font-medium">
        Cor
        <input className={`${field} mt-1`} value={form.accentColor ?? ""} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} />
      </label>
      {error ? <p className="md:col-span-2 lg:col-span-4 text-xs text-red-700">{error}</p> : null}
      <div className="flex flex-wrap gap-2 md:col-span-2 lg:col-span-4">
        <button type="submit" disabled={saving} className="rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
          {saving ? "Salvando…" : "Salvar inline"}
        </button>
        <button type="button" onClick={onFullEdit} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">
          Edição completa
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-1.5 text-xs text-muted hover:text-ink">
          Fechar
        </button>
      </div>
    </form>
  );
}
