import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostContent } from "@/components/PostContent";
import { POST_TYPE_LABELS } from "@/lib/constants";
import { getPublishedPostBySlug } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Publicação" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const date = post.publishedAt ?? post.createdAt;

  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      <Link
        href={`/categoria/${post.category.slug}`}
        className="text-xs uppercase tracking-[0.2em] text-accent hover:underline"
      >
        {post.category.name}
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-accent">
          {POST_TYPE_LABELS[post.type]}
        </span>
        <time dateTime={date.toISOString()}>
          {date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </time>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        {post.author.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.author.avatarUrl}
            alt=""
            className="h-12 w-12 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 font-display text-lg text-accent">
            {post.author.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm text-muted">Autor</p>
          <p className="font-medium text-ink">{post.author.name}</p>
        </div>
      </div>
      <h1 className="mt-8 font-display text-4xl leading-tight text-ink md:text-5xl">
        {post.title}
      </h1>
      {post.excerpt ? (
        <p className="mt-6 text-xl leading-relaxed text-muted">{post.excerpt}</p>
      ) : null}
      {post.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          className="mt-10 w-full rounded-2xl border border-border object-cover"
        />
      ) : null}
      <div className="mt-12 border-t border-border/60 pt-10">
        <PostContent content={post.content} format={post.contentFormat} />
      </div>
    </article>
  );
}
