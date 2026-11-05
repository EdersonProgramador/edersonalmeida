import { Link } from "react-router-dom";
import type { Post } from "@/lib/api";
import { postTypeLabel } from "@/lib/postLabels";

export function PostCard({ post }: { post: Post }) {
  const cat = post.category.parent ? `${post.category.parent.name} · ${post.category.name}` : post.category.name;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      {post.coverImage ? (
        <div className="relative h-44 overflow-hidden">
          <img
            src={post.coverImage}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent opacity-0 transition group-hover:opacity-100" />
        </div>
      ) : (
        <div className="relative h-44 bg-[linear-gradient(135deg,#0f1729_0%,#1e4d7b_100%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a227,transparent_50%)] opacity-30" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
          <span className="text-gold">{postTypeLabel[post.type] ?? post.type}</span>
          <span className="text-border">•</span>
          <span className="truncate text-muted normal-case">{cat}</span>
        </div>
        <h3 className="mt-2 font-serif text-2xl font-semibold leading-snug text-navy">
          <Link to={`/artigo/${post.slug}`} className="hover:text-accent">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p> : null}
        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted">
          <span>{post.author.name}</span>
          {post.readingMinutes ? <span>{post.readingMinutes} min</span> : null}
        </div>
      </div>
    </article>
  );
}
