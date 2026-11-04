import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import { PostCard } from "../components/PostCard";
import { SITE } from "../lib/constants";
import type { Category, Post } from "../types";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<Category[]>("/public/categories"),
      apiFetch<Post[]>("/public/posts"),
    ])
      .then(([cats, list]) => {
        setCategories(cats);
        setPosts(list.slice(0, 9));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar"));
  }, []);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60 bg-ink text-paper">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.15),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.25em] text-accent-light">Portal jurídico</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight md:text-6xl">{SITE.name}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80">{SITE.description}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#publicacoes"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-paper hover:bg-accent/90 transition"
            >
              Ver publicações
            </a>
            <Link
              to="/admin"
              className="rounded-full border border-paper/30 px-6 py-2.5 text-sm text-paper/90 hover:border-paper transition"
            >
              Área administrativa
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <p className="mx-auto max-w-6xl px-6 py-8 text-red-700">{error}</p>
      ) : null}

      <section id="categorias" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl text-ink">Categorias</h2>
        <p className="mt-2 max-w-xl text-muted">
          Assuntos organizados como no WordPress — crie e edite categorias no admin antes de publicar.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categoria/${cat.slug}`}
              className="rounded-2xl border border-border/70 bg-surface p-5 transition hover:border-accent/50 hover:shadow-sm"
            >
              <h3 className="font-display text-xl text-ink">{cat.name}</h3>
              {cat.description ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted">{cat.description}</p>
              ) : null}
              <p className="mt-4 text-xs uppercase tracking-wider text-accent">
                {cat._count?.posts ?? 0} publicação
                {(cat._count?.posts ?? 0) === 1 ? "" : "ões"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section id="publicacoes" className="border-t border-border/60 bg-surface/50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-3xl text-ink">Últimas publicações</h2>
          {posts.length === 0 ? (
            <p className="mt-6 text-muted">Nenhuma publicação ainda. Acesse o admin para criar conteúdo.</p>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
