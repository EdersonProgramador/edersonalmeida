import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CategoryCard } from "@/components/CategoryCard";
import { PostCard } from "@/components/PostCard";
import { Seo } from "@/components/Seo";
import { api } from "@/lib/api";
import { defaultLawAreas } from "@/lib/defaultLawAreas";
import { HOME_COPY } from "@/lib/siteBranding";

export function HomePage() {
  const settingsQ = useQuery({ queryKey: ["settings"], queryFn: api.publicSettings });
  const catsQ = useQuery({
    queryKey: ["categories"],
    queryFn: api.categories,
    retry: 1,
  });
  const categories = catsQ.data?.length ? catsQ.data : defaultLawAreas;
  const featuredQ = useQuery({
    queryKey: ["posts", "featured"],
    queryFn: () => api.posts({ featured: true, page: 1 }),
  });
  const latestQ = useQuery({
    queryKey: ["posts", "latest"],
    queryFn: () => api.posts({ page: 1 }),
  });

  const settings = settingsQ.data;
  const headline = settings?.siteName ?? HOME_COPY.heroHeadline;
  const role = settings?.tagline ?? HOME_COPY.heroRole;
  const intro = settings?.siteDescription ?? HOME_COPY.heroIntro;

  return (
    <>
      <Seo settings={settings} />
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,39,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">{HOME_COPY.heroEyebrow}</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight font-semibold md:text-6xl">{headline}</h1>
          <p className="mt-4 max-w-2xl font-serif text-xl text-gold-soft md:text-2xl">{role}</p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">{intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/categorias" className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-navy">
              Explorar categorias
            </Link>
            <Link
              to="/admin/publicacoes/nova"
              className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-semibold text-white hover:border-gold"
            >
              Nova publicação
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <header className="max-w-2xl">
          <h2 className="font-serif text-3xl text-navy">{HOME_COPY.featuredTitle}</h2>
          <p className="mt-2 text-muted">{HOME_COPY.featuredLead}</p>
        </header>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(featuredQ.data?.items.length ? featuredQ.data.items : latestQ.data?.items.slice(0, 3) ?? []).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>

      <section className="bg-surface/60 py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <header className="max-w-2xl">
            <h2 className="font-serif text-3xl text-navy">{HOME_COPY.areasTitle}</h2>
            <p className="mt-2 text-muted">{HOME_COPY.areasLead}</p>
          </header>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <header className="max-w-2xl">
          <h2 className="font-serif text-3xl text-navy">{HOME_COPY.latestTitle}</h2>
          <p className="mt-2 text-muted">{HOME_COPY.latestLead}</p>
        </header>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(latestQ.data?.items ?? []).map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>
    </>
  );
}
