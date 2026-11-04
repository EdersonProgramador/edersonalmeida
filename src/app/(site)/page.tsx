import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { SITE } from "@/lib/constants";
import { listCategoriesWithCounts, listPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, posts] = await Promise.all([
    listCategoriesWithCounts(),
    listPublishedPosts({ limit: 9 }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60 bg-ink text-paper">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.15),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.25em] text-accent-light">
            Portal jurídico
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
            {SITE.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80">
            {SITE.description}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="#publicacoes"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-paper hover:bg-accent/90 transition"
            >
              Ver publicações
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-paper/30 px-6 py-2.5 text-sm text-paper/90 hover:border-paper transition"
            >
              Área administrativa
            </Link>
          </div>
        </div>
      </section>

      <section id="categorias" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl text-ink">Categorias</h2>
            <p className="mt-2 max-w-xl text-muted">
              Assuntos organizados como no WordPress — crie e edite categorias no
              admin antes de publicar.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categoria/${cat.slug}`}
              className="rounded-2xl border border-border/70 bg-surface p-5 transition hover:border-accent/50 hover:shadow-sm"
            >
              <h3 className="font-display text-xl text-ink">{cat.name}</h3>
              {cat.description ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {cat.description}
                </p>
              ) : null}
              <p className="mt-4 text-xs uppercase tracking-wider text-accent">
                {cat._count.posts} publicação
                {cat._count.posts === 1 ? "" : "ões"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section id="publicacoes" className="border-t border-border/60 bg-surface/50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-3xl text-ink">Últimas publicações</h2>
          {posts.length === 0 ? (
            <p className="mt-6 text-muted">
              Nenhuma publicação ainda. Acesse o admin para criar conteúdo.
            </p>
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
