import Link from "next/link";
import { PostForm } from "@/components/admin/PostForm";
import { createPost } from "@/lib/actions/posts";
import { prisma } from "@/lib/db";

export default async function NewPostPage() {
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (categories.length === 0) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-muted">
          Crie pelo menos uma categoria antes de publicar conteúdo.
        </p>
        <Link href="/admin/categorias/nova" className="mt-4 inline-block text-accent">
          Nova categoria →
        </Link>
      </div>
    );
  }

  if (authors.length === 0) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-muted">Cadastre um autor antes de publicar.</p>
        <Link href="/admin/autores/novo" className="mt-4 inline-block text-accent">
          Novo autor →
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <Link href="/admin/publicacoes" className="text-sm text-muted hover:text-accent">
        ← Publicações
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Nova publicação</h1>
      <div className="mt-8">
        <PostForm
          action={createPost}
          categories={categories}
          authors={authors}
        />
      </div>
    </div>
  );
}
