import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import {
  getCategoryBySlug,
  listPublishedPosts,
} from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Categoria" };
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const posts = await listPublishedPosts({ categorySlug: slug });

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">Categoria</p>
      <h1 className="mt-2 font-display text-4xl text-ink">{category.name}</h1>
      {category.description ? (
        <p className="mt-4 max-w-2xl text-lg text-muted">{category.description}</p>
      ) : null}

      {posts.length === 0 ? (
        <p className="mt-12 text-muted">Nenhuma publicação nesta categoria.</p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
