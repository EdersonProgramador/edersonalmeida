import { Link } from "react-router-dom";
import type { CategoryTree } from "@/lib/api";

export function CategoryCard({ category }: { category: CategoryTree }) {
  const accent = category.accentColor ?? "#1e4d7b";
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderTopColor: accent, borderTopWidth: 4 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg font-serif"
            style={{ backgroundColor: `${accent}18`, color: accent }}
          >
            {category.icon ?? "§"}
          </span>
          <h3 className="mt-4 font-serif text-2xl font-semibold text-navy group-hover:text-accent">
            <Link to={`/categoria/${category.slug}`}>{category.name}</Link>
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{category.description}</p>
        </div>
        {category.postCount != null ? (
          <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted">
            {category.postCount} posts
          </span>
        ) : null}
      </div>
      {category.children?.length ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {category.children.map((sub) => (
            <li key={sub.id}>
              <Link
                to={`/categoria/${category.slug}/${sub.slug}`}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-ink hover:border-gold hover:text-accent"
              >
                {sub.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
