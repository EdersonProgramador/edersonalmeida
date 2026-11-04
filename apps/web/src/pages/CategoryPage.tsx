import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import { PostCard } from "../components/PostCard";
import type { Post } from "../types";

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    apiFetch<Post[]>(`/public/categories/${slug}/posts`)
      .then(setPosts)
      .catch((e) => setError(e instanceof Error ? e.message : "Erro"));
  }, [slug]);

  const title = posts[0]?.category?.name ?? slug?.replace(/-/g, " ");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link to="/" className="text-sm text-accent hover:underline">
        ← Início
      </Link>
      <h1 className="mt-6 font-display text-4xl text-ink capitalize">{title}</h1>
      {error ? <p className="mt-6 text-red-700">{error}</p> : null}
      {posts.length === 0 && !error ? (
        <p className="mt-8 text-muted">Nenhuma publicação nesta categoria.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
