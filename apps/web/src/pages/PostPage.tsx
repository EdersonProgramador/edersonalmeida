import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { api } from "@/lib/api";
import { postTypeLabel } from "@/lib/postLabels";

export function PostPage() {
  const { slug } = useParams();
  const settingsQ = useQuery({ queryKey: ["settings"], queryFn: api.publicSettings });
  const postQ = useQuery({
    queryKey: ["post", slug],
    queryFn: () => api.post(slug!),
    enabled: Boolean(slug),
  });

  const post = postQ.data;
  if (postQ.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted">
        <p className="animate-pulse font-serif text-xl">Carregando publicação…</p>
      </div>
    );
  }
  if (!post) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-navy">Publicação não encontrada</h1>
        <Link to="/" className="mt-4 inline-block text-accent hover:underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const catLabel = post.category.parent
    ? `${post.category.parent.name} › ${post.category.name}`
    : post.category.name;

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

      {post.coverImage ? (
        <div className="relative h-[min(420px,55vh)] w-full overflow-hidden bg-navy">
          <img src={post.coverImage} alt="" className="h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-4 pb-10 pt-16 md:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-soft">
              {postTypeLabel[post.type] ?? post.type}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight font-semibold text-white md:text-5xl">{post.title}</h1>
          </div>
        </div>
      ) : null}

      <article className={`mx-auto max-w-3xl px-4 md:px-6 ${post.coverImage ? "py-10" : "py-12"}`}>
        {!post.coverImage ? (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{postTypeLabel[post.type] ?? post.type}</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight font-semibold text-navy md:text-5xl">{post.title}</h1>
          </>
        ) : null}

        <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted" aria-label="Trilha">
          <Link to="/" className="hover:text-accent">
            Início
          </Link>
          <span className="text-border">/</span>
          {post.category.parent ? (
            <>
              <Link to={`/categoria/${post.category.parent.slug}`} className="hover:text-accent">
                {post.category.parent.name}
              </Link>
              <span className="text-border">/</span>
            </>
          ) : null}
          <Link to={`/categoria/${post.category.parent?.slug ?? post.category.slug}`} className="hover:text-accent">
            {post.category.name}
          </Link>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-paper/80 px-4 py-3 text-sm text-muted">
          <span className="font-semibold text-ink">{post.author.name}</span>
          {post.author.oabNumber ? <span>OAB {post.author.oabNumber}</span> : null}
          {post.publishedAt ? <span>{new Date(post.publishedAt).toLocaleDateString("pt-BR", { dateStyle: "long" })}</span> : null}
          {post.readingMinutes ? <span>{post.readingMinutes} min de leitura</span> : null}
          <span className="text-xs uppercase tracking-wide">{catLabel}</span>
        </div>

        {post.excerpt && !post.coverImage ? (
          <p className="mt-8 border-l-4 border-gold pl-4 font-serif text-xl leading-relaxed text-navy/90">{post.excerpt}</p>
        ) : null}

        <div className="prose-legal mt-10" dangerouslySetInnerHTML={{ __html: post.content }} />

        {settingsQ.data?.legalDisclaimer ? (
          <aside className="mt-12 rounded-xl border border-border bg-paper p-5 text-xs leading-relaxed text-muted">
            {settingsQ.data.legalDisclaimer}
          </aside>
        ) : null}

        {settingsQ.data?.adsEnabled && settingsQ.data.googleAdsClientId ? (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-paper p-8 text-center text-sm text-muted">
            Espaço reservado para Google Ads
          </div>
        ) : null}
      </article>
    </>
  );
}
