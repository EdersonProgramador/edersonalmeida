import { Link } from "react-router-dom";
import { POST_TYPE_LABELS } from "../lib/constants";
import type { Post } from "../types";

export function PostCard({ post }: { post: Post }) {
  const date = post.publishedAt ?? post.createdAt;
  const category = post.category!;

  return (
    <article className="group flex flex-col rounded-2xl border border-border/60 bg-surface p-6 shadow-sm transition hover:border-accent/40 hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-muted">
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-medium text-accent">
          {POST_TYPE_LABELS[post.type]}
        </span>
        <Link to={`/categoria/${category.slug}`} className="hover:text-ink transition">
          {category.name}
        </Link>
        <span aria-hidden>·</span>
        <time dateTime={date}>
          {new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </time>
      </div>
      <h3 className="font-display text-2xl leading-snug text-ink group-hover:text-accent transition">
        <Link to={`/publicacao/${post.slug}`}>{post.title}</Link>
      </h3>
      {post.excerpt ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
      ) : null}
      <Link
        to={`/publicacao/${post.slug}`}
        className="mt-5 text-sm font-medium text-accent hover:underline"
      >
        Ler publicação →
      </Link>
    </article>
  );
}
