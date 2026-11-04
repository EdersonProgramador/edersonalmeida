import Link from "next/link";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { updatePost } from "@/lib/actions/posts";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const [post, categories, authors] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  const boundUpdate = updatePost.bind(null, id);

  return (
    <div className="p-6 md:p-10">
      <Link href="/admin/publicacoes" className="text-sm text-muted hover:text-accent">
        ← Publicações
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Editar publicação</h1>
      <p className="mt-1 text-sm text-muted">
        Slug: <code>{post.slug}</code>
      </p>
      <div className="mt-8">
        <PostForm
          action={boundUpdate}
          categories={categories}
          authors={authors}
          post={post}
        />
      </div>
    </div>
  );
}
