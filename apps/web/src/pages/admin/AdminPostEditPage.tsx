import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSection } from "@/components/admin/AdminSection";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { RichEditor } from "@/components/RichEditor";
import { api, type PostInput } from "@/lib/api";
import { postStatusLabel, postStatuses, postTypeLabel, postTypes } from "@/lib/postLabels";

function formatWhen(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

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
  const [savedNotice, setSavedNotice] = useState(false);

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
    mutationFn: async (patch?: Partial<PostInput>) => {
      const payload = { ...form, ...patch };
      if (isNew) return api.createPost(payload);
      return api.updatePost(id!, payload);
    },
    onSuccess: (post, patch) => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      if (patch) setForm((f) => ({ ...f, ...patch }));
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 4000);
      if (isNew && post.id) nav(`/admin/publicacoes/${post.id}`, { replace: true });
    },
  });

  async function onUpload(file: File) {
    const { url } = await api.upload(file);
    setForm((f) => ({ ...f, coverImage: url, ogImage: f.ogImage || url }));
  }

  async function onUploadInlineImage(file: File) {
    const { url } = await api.upload(file);
    return url;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate(undefined);
  }

  function workflow(next: Partial<PostInput>) {
    setForm((f) => ({ ...f, ...next }));
    save.mutate(next);
  }

  const field = "mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
  const slug = form.slug || postQ.data?.slug;
  const canPreview = form.status === "PUBLISHED" && slug;
  const metaTitleLen = (form.metaTitle ?? form.title ?? "").length;
  const metaDescLen = (form.metaDescription ?? form.excerpt ?? "").length;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <AdminPageHeader
        title={isNew ? "Nova publicação" : "Editor editorial"}
        subtitle="Fluxo profissional: conteúdo, metadados, SEO e publicação em um só lugar."
        backTo="/admin/publicacoes"
        backLabel="Publicações"
        actions={
          canPreview ? (
            <a
              href={`/artigo/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
            >
              Ver no site
            </a>
          ) : null
        }
      />

      {savedNotice ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          Alterações salvas com sucesso.
        </p>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6 xl:col-start-1">
          <AdminSection title="Identificação" description="Título e resumo exibidos no site e nas redes.">
            <div className="grid gap-4">
              <label className="text-sm font-medium text-ink">
                Título
                <input
                  className={field}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Título da publicação"
                  required
                />
              </label>
              <label className="text-sm font-medium text-ink">
                Resumo (lead)
                <textarea
                  className={field}
                  rows={3}
                  value={form.excerpt ?? ""}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Aparece em listagens e redes sociais quando não houver meta description."
                />
              </label>
            </div>
          </AdminSection>

          <AdminSection
            title="Corpo da publicação"
            description="Editor completo: formatação, listas, citações, imagens no texto e modo foco para escrever com mais espaço."
            flushBody
            className="overflow-hidden border-navy/10"
          >
            <RichEditor
              value={form.content}
              onChange={(content) => setForm({ ...form, content })}
              onUploadImage={onUploadInlineImage}
            />
          </AdminSection>

          <AdminSection title="SEO e descoberta" description="Otimize para buscadores e compartilhamento.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium md:col-span-2">
                Slug (URL)
                <input
                  className={field}
                  value={form.slug ?? ""}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="gerado a partir do título"
                />
              </label>
              <label className="text-sm font-medium">
                Palavra-chave foco
                <input
                  className={field}
                  value={form.focusKeyword ?? ""}
                  onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })}
                />
              </label>
              <label className="text-sm font-medium">
                URL canônica
                <input
                  className={field}
                  value={form.canonicalUrl ?? ""}
                  onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                  placeholder="https://…"
                />
              </label>
              <label className="text-sm font-medium md:col-span-2">
                Meta title
                <input
                  className={field}
                  maxLength={70}
                  value={form.metaTitle ?? ""}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                />
                <span className={`mt-1 block text-xs ${metaTitleLen > 60 ? "text-amber-700" : "text-muted"}`}>
                  {metaTitleLen}/70 caracteres
                </span>
              </label>
              <label className="text-sm font-medium md:col-span-2">
                Meta description
                <textarea
                  className={field}
                  rows={2}
                  maxLength={160}
                  value={form.metaDescription ?? ""}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                />
                <span className={`mt-1 block text-xs ${metaDescLen > 155 ? "text-amber-700" : "text-muted"}`}>
                  {metaDescLen}/160 caracteres
                </span>
              </label>
            </div>
          </AdminSection>

          <AdminSection title="Mídia" description="Capa e imagem para Open Graph.">
            <div className="grid gap-4 md:grid-cols-2">
              {form.coverImage ? (
                <div className="md:col-span-2 overflow-hidden rounded-xl border border-border">
                  <img src={form.coverImage} alt="" className="max-h-56 w-full object-cover" />
                </div>
              ) : null}
              <label className="text-sm font-medium md:col-span-2">
                URL da imagem
                <input
                  className={field}
                  value={form.ogImage ?? form.coverImage ?? ""}
                  onChange={(e) => setForm({ ...form, ogImage: e.target.value, coverImage: e.target.value })}
                />
              </label>
              <label className="text-sm font-medium md:col-span-2">
                Enviar capa
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                />
              </label>
            </div>
          </AdminSection>
        </div>

        <aside className="space-y-4 xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-2xl border border-border bg-navy p-5 text-white shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-soft">Publicação</p>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge status={form.status ?? "DRAFT"} />
              {!isNew && postQ.data?.updatedAt ? (
                <span className="text-xs text-white/60">Atualizado {formatWhen(postQ.data.updatedAt)}</span>
              ) : null}
            </div>

            <div className="mt-5 space-y-3">
              <label className="block text-xs font-medium text-white/80">
                Status
                <select
                  className="mt-1 w-full rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {postStatuses.map((s) => (
                    <option key={s} value={s} className="text-ink">
                      {postStatusLabel[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-white/80">
                Tipo
                <select
                  className="mt-1 w-full rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {postTypes.map((t) => (
                    <option key={t} value={t} className="text-ink">
                      {postTypeLabel[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-white/80">
                Categoria
                <select
                  className="mt-1 w-full rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  required
                >
                  {flatCategories.map((c) => (
                    <option key={c.id} value={c.id} className="text-ink">
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-white/80">
                Agendar publicação
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white"
                  value={form.scheduledFor?.slice(0, 16) ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      scheduledFor: e.target.value ? new Date(e.target.value).toISOString() : null,
                      status: e.target.value ? "SCHEDULED" : form.status,
                    })
                  }
                />
              </label>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="rounded border-white/30"
                checked={form.featured ?? false}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Destaque na home
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="rounded border-white/30"
                checked={form.noIndex ?? false}
                onChange={(e) => setForm({ ...form, noIndex: e.target.checked })}
              />
              Não indexar (noindex)
            </label>

            {save.error ? <p className="mt-4 text-xs text-red-200">{(save.error as Error).message}</p> : null}

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="submit"
                disabled={save.isPending}
                className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-navy disabled:opacity-60"
              >
                {save.isPending ? "Salvando…" : "Salvar"}
              </button>
              <button
                type="button"
                disabled={save.isPending}
                className="w-full rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25"
                onClick={() => workflow({ status: "REVIEW" })}
              >
                Enviar para revisão
              </button>
              <button
                type="button"
                disabled={save.isPending}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500"
                onClick={() => workflow({ status: "PUBLISHED" })}
              >
                Publicar agora
              </button>
              {!isNew ? (
                <button
                  type="button"
                  disabled={save.isPending}
                  className="w-full rounded-lg border border-white/25 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
                  onClick={() => workflow({ status: "ARCHIVED" })}
                >
                  Arquivar
                </button>
              ) : null}
            </div>
          </div>

          {!isNew && postQ.data?.publishedAt ? (
            <p className="rounded-xl border border-border bg-paper px-4 py-3 text-xs text-muted">
              Publicado em {formatWhen(postQ.data.publishedAt)}
            </p>
          ) : null}
        </aside>
      </div>
    </form>
  );
}
