import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch, mediaUrl } from "../api";
import { PostContent } from "../components/PostContent";
import { POST_TYPE_LABELS } from "../lib/constants";
import type { Post } from "../types";

export function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    apiFetch<Post>(`/public/posts/${slug}`)
      .then(setPost)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro"));
  }, [slug]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-red-700">{error}</p>
        <Link to="/" className="mt-4 inline-block text-accent">
          Voltar
        </Link>
      </div>
    );
  }

  if (!post) {
    return <div className="mx-auto max-w-3xl px-6 py-16 animate-pulse text-muted">Carregando…</div>;
  }

  const date = post.publishedAt ?? post.createdAt;
  const cover = mediaUrl(post.coverImage);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/" className="text-sm text-accent hover:underline">
        ← Início
      </Link>
      <p className="mt-8 text-xs uppercase tracking-widest text-muted">
        {POST_TYPE_LABELS[post.type]} · {post.category?.name}
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">{post.title}</h1>
      <p className="mt-4 text-sm text-muted">
        {post.author?.name} ·{" "}
        {new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
      </p>
      {cover ? (
        <img src={cover} alt="" className="mt-10 w-full rounded-2xl border border-border object-cover" />
      ) : null}
      <div className="mt-10">
        <PostContent post={post} />
      </div>
    </article>
  );
}
