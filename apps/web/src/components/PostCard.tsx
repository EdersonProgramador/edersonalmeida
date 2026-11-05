import { Link } from "react-router-dom";
import type { Post } from "@/lib/api";

const typeLabels: Record<string, string> = {
  ARTIGO: "Artigo",
  MATERIAL: "Material",
  AULA: "Aula",
  PALESTRA: "Palestra",
  PODCAST: "Podcast",
  OUTRO: "Outro",
};

export function PostCard({ post }: { post: Post }) {
  const cat = post.category.parent ? `${post.category.parent.name} · ${post.category.name}` : post.category.name;
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:shadow-md">
      {post.coverImage ? (
        <img src={post.coverImage} alt="" className="h-44 w-full object-cover" loading="lazy" />
      ) : (
        <div className="h-44 bg-gradient-to-br from-navy to-accent/80" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold">
          <span>{typeLabels[post.type] ?? post.type}</span>
          <span className="text-border">•</span>
          <span className="text-muted normal-case">{cat}</span>
        </div>
        <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug text-navy">
          <Link to={`/artigo/${post.slug}`} className="hover:text-accent">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p> : null}
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted">
          <span>{post.author.name}</span>
          {post.readingMinutes ? <span>{post.readingMinutes} min</span> : null}
        </div>
      </div>
    </article>
  );
}
