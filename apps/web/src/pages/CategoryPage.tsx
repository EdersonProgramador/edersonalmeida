import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { PostCard } from "@/components/PostCard";
import { Seo } from "@/components/Seo";
import { api } from "@/lib/api";

export function CategoryPage() {
  const { slug, subslug } = useParams();
  const settingsQ = useQuery({ queryKey: ["settings"], queryFn: api.publicSettings });
  const catsQ = useQuery({ queryKey: ["categories"], queryFn: api.categories });
  const postsQ = useQuery({
    queryKey: ["posts", slug, subslug],
    queryFn: () => api.posts({ page: 1, category: slug, subcategory: subslug }),
  });

  const root = catsQ.data?.find((c) => c.slug === slug);
  const sub = subslug ? root?.children.find((c) => c.slug === subslug) : null;
  const title = sub?.name ?? root?.name ?? "Categoria";

  return (
    <>
      <Seo settings={settingsQ.data} title={title} description={root?.description ?? undefined} />
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <p className="text-sm text-muted">
          <Link to="/categorias" className="hover:text-accent">
            Áreas do Direito
          </Link>{" "}
          / {root?.name}
          {sub ? ` / ${sub.name}` : ""}
        </p>
        <h1 className="mt-2 font-serif text-4xl text-navy">{title}</h1>
        {root?.description ? <p className="mt-3 max-w-2xl text-muted">{root.description}</p> : null}
        {root?.children?.length && !subslug ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {root.children.map((ch) => (
              <Link
                key={ch.id}
                to={`/categoria/${slug}/${ch.slug}`}
                className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm hover:border-gold"
              >
                {ch.name}
              </Link>
            ))}
          </div>
        ) : null}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(postsQ.data?.items ?? []).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </>
  );
}
