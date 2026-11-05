import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RichEditor } from "@/components/RichEditor";
import { api, type PostInput } from "@/lib/api";

const statuses = ["DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"] as const;
const types = ["ARTIGO", "MATERIAL", "AULA", "PALESTRA", "PODCAST", "OUTRO"] as const;

export function AdminPostEditPage() {
  const { id } = useParams();
  const isNew = id === "nova";
  const nav = useNavigate();
  const qc = useQueryClient();

  const postQ = useQuery({
    queryKey: ["admin-post", id],
    queryFn: () => api.adminPost(id!),
    enabled: !isNew && Boolean(id),
  });
  const catsQ = useQuery({ queryKey: ["admin-categories"], queryFn: api.adminCategories });

  const flatCategories = useMemo(() => {
    const rows: { id: string; label: string }[] = [];
    for (const root of catsQ.data ?? []) {
      if (root.children.length) {
        for (const ch of root.children) rows.push({ id: ch.id, label: `${root.name} › ${ch.name}` });
      } else rows.push({ id: root.id, label: root.name });
    }
    return rows;
  }, [catsQ.data]);

  const [form, setForm] = useState<PostInput>({
    title: "",
    content: "<p></p>",
    categoryId: "",
    status: "DRAFT",
    type: "ARTIGO",
    featured: false,
    noIndex: false,
  });

  useEffect(() => {
    if (postQ.data) {
      const p = postQ.data;
      setForm({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        contentFormat: p.contentFormat,
        coverImage: p.coverImage,
        type: p.type,
        status: p.status,
        featured: p.featured,
        publishedAt: p.publishedAt,
        scheduledFor: p.scheduledFor,
        categoryId: p.categoryId,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        focusKeyword: p.focusKeyword,
        ogImage: p.ogImage,
        canonicalUrl: p.canonicalUrl,
        noIndex: p.noIndex,
      });
    }
  }, [postQ.data]);

  useEffect(() => {
    if (isNew && flatCategories.length && !form.categoryId) {
      setForm((f) => ({ ...f, categoryId: flatCategories[0].id }));
    }
  }, [isNew, flatCategories, form.categoryId]);

  const save = useMutation({
    mutationFn: async () => {
      if (isNew) return api.createPost(form);
      return api.updatePost(id!, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      nav("/admin/publicacoes");
    },
  });

  async function onUpload(file: File) {
    const { url } = await api.upload(file);
    setForm((f) => ({ ...f, coverImage: url }));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate();
  }

  const field = "mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-navy">{isNew ? "Nova publicação" : "Editar publicação"}</h1>
        <Link to="/admin/publicacoes" className="text-sm text-accent">
          Voltar
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2 text-sm font-medium">
          Título
          <input
            className={field}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </label>
        <label className="text-sm font-medium">
          Slug (URL)
          <input className={field} value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </label>
        <label className="text-sm font-medium">
          Palavra-chave SEO
          <input
            className={field}
            value={form.focusKeyword ?? ""}
            onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })}
          />
        </label>
        <label className="md:col-span-2 text-sm font-medium">
          Resumo
          <textarea
            className={field}
            rows={2}
            value={form.excerpt ?? ""}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
        </label>
      </section>

      <section>
        <p className="mb-2 text-sm font-medium">Conteúdo</p>
        <RichEditor value={form.content} onChange={(content) => setForm({ ...form, content })} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium">
          Categoria / subcategoria
          <select
            className={field}
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            {flatCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Tipo
          <select className={field} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Status editorial
          <select className={field} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Agendamento
          <input
            type="datetime-local"
            className={field}
            value={form.scheduledFor?.slice(0, 16) ?? ""}
            onChange={(e) =>
              setForm({ ...form, scheduledFor: e.target.value ? new Date(e.target.value).toISOString() : null })
            }
          />
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input
            type="checkbox"
            checked={form.featured ?? false}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Destaque na home
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input
            type="checkbox"
            checked={form.noIndex ?? false}
            onChange={(e) => setForm({ ...form, noIndex: e.target.checked })}
          />
          Não indexar (noindex)
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium">
          Meta title
          <input
            className={field}
            maxLength={70}
            value={form.metaTitle ?? ""}
            onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium">
          Meta description
          <input
            className={field}
            maxLength={160}
            value={form.metaDescription ?? ""}
            onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium">
          Imagem OG / capa URL
          <input
            className={field}
            value={form.ogImage ?? form.coverImage ?? ""}
            onChange={(e) => setForm({ ...form, ogImage: e.target.value, coverImage: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium">
          Upload capa
          <input
            type="file"
            accept="image/*"
            className="mt-1 block text-sm"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />
        </label>
      </section>

      {save.error ? <p className="text-sm text-red-700">{(save.error as Error).message}</p> : null}

      <button
        type="submit"
        disabled={save.isPending}
        className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {save.isPending ? "Salvando…" : "Salvar publicação"}
      </button>
    </form>
  );
}
