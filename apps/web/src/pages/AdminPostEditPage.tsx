import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch, mediaUrl, uploadFile } from "../api";
import { RichTextEditor } from "../components/RichTextEditor";
import { POST_TYPE_LABELS } from "../lib/constants";
import type { Author, Category, Post, PostStatus, PostType } from "../types";

export function AdminPostEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "nova";
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([apiFetch<Category[]>("/admin/categories"), apiFetch<Author[]>("/admin/authors")])
      .then(([cats, auths]) => {
        setCategories(cats);
        setAuthors(auths);
      })
      .catch(() => navigate("/admin/login"));
  }, [navigate]);

  useEffect(() => {
    if (isNew || !id) return;
    apiFetch<Post>(`/admin/posts/${id}`)
      .then((p) => {
        setPost(p);
        setContent(p.contentFormat === "HTML" ? p.content : "");
        setCoverImage(p.coverImage);
      })
      .catch(() => navigate("/admin/login"));
  }, [id, isNew, navigate]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title")),
      excerpt: String(fd.get("excerpt") || "") || undefined,
      content,
      contentFormat: "HTML" as const,
      coverImage: coverImage ?? undefined,
      type: String(fd.get("type")) as PostType,
      status: String(fd.get("status")) as PostStatus,
      categoryId: String(fd.get("categoryId")),
      authorId: String(fd.get("authorId")),
    };

    try {
      if (isNew) {
        await apiFetch("/admin/posts", { method: "POST", body: JSON.stringify(payload) });
      } else {
        await apiFetch(`/admin/posts/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
      }
      navigate("/admin/publicacoes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function onCoverChange(file: File) {
    const url = await uploadFile(file);
    setCoverImage(url);
  }

  const fieldClass = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link to="/admin/publicacoes" className="text-sm text-accent hover:underline">
        ← Publicações
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink">{isNew ? "Nova publicação" : "Editar"}</h1>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-1 text-sm">
          Título
          <input name="title" required defaultValue={post?.title} className={fieldClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Resumo
          <textarea name="excerpt" rows={2} defaultValue={post?.excerpt ?? ""} className={fieldClass} />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Categoria
            <select name="categoryId" required defaultValue={post?.categoryId ?? categories[0]?.id} className={fieldClass}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Autor
            <select name="authorId" required defaultValue={post?.authorId ?? authors[0]?.id} className={fieldClass}>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Tipo
            <select name="type" defaultValue={post?.type ?? "ARTIGO"} className={fieldClass}>
              {Object.entries(POST_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Status
            <select name="status" defaultValue={post?.status ?? "DRAFT"} className={fieldClass}>
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicado</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          Capa
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onCoverChange(f).catch((err) => alert(String(err)));
            }}
          />
          {coverImage ? (
            <img src={mediaUrl(coverImage)} alt="" className="mt-2 max-h-40 rounded-lg border border-border" />
          ) : null}
        </label>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Conteúdo</span>
          <RichTextEditor initialHtml={content} onChange={setContent} />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="w-fit rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </form>
    </div>
  );
}
