import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { api } from "@/lib/api";

export function PostPage() {
  const { slug } = useParams();
  const settingsQ = useQuery({ queryKey: ["settings"], queryFn: api.publicSettings });
  const postQ = useQuery({
    queryKey: ["post", slug],
    queryFn: () => api.post(slug!),
    enabled: Boolean(slug),
  });

  const post = postQ.data;
  if (postQ.isLoading) return <p className="p-10 text-muted">Carregando…</p>;
  if (!post) return <p className="p-10">Publicação não encontrada.</p>;

  return (
    <>
      <Seo
        settings={settingsQ.data}
        title={post.metaTitle ?? post.title}
        description={post.metaDescription ?? post.excerpt ?? undefined}
        image={post.ogImage ?? post.coverImage}
        type="article"
        post={post}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <p className="text-sm text-muted">
          <Link to="/">Início</Link>
          {post.category.parent ? (
            <>
              {" "}
              /{" "}
              <Link to={`/categoria/${post.category.parent.slug}`}>{post.category.parent.name}</Link>
            </>
          ) : null}{" "}
          / <Link to={`/categoria/${post.category.parent?.slug ?? post.category.slug}`}>{post.category.name}</Link>
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight font-semibold text-navy md:text-5xl">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>{post.author.name}</span>
          {post.author.oabNumber ? <span>OAB {post.author.oabNumber}</span> : null}
          {post.publishedAt ? <span>{new Date(post.publishedAt).toLocaleDateString("pt-BR")}</span> : null}
          {post.readingMinutes ? <span>{post.readingMinutes} min de leitura</span> : null}
        </div>
        {post.coverImage ? (
          <img src={post.coverImage} alt="" className="mt-8 w-full rounded-2xl object-cover shadow-md" />
        ) : null}
        <div className="prose-legal mt-10" dangerouslySetInnerHTML={{ __html: post.content }} />
        {settingsQ.data?.adsEnabled && settingsQ.data.googleAdsClientId ? (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-paper p-6 text-center text-sm text-muted">
            Espaço reservado para Google Ads (`data-ad-client={settingsQ.data.googleAdsClientId}`)
          </div>
        ) : null}
      </article>
    </>
  );
}
