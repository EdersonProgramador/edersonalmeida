import Link from "next/link";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { POST_TYPE_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/db";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: { category: true, author: true },
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Publicações</h1>
          <p className="mt-2 text-muted">
            Artigos, materiais, aulas, palestras e outros formatos.
          </p>
        </div>
        <Link
          href="/admin/publicacoes/nova"
          className="rounded-lg bg-accent px-4 py-2 text-sm text-paper"
        >
          Nova publicação
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-paper/50 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Autor</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium">{post.title}</td>
                <td className="px-4 py-3">{POST_TYPE_LABELS[post.type]}</td>
                <td className="px-4 py-3 text-muted">{post.author.name}</td>
                <td className="px-4 py-3 text-muted">{post.category.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      post.status === "PUBLISHED"
                        ? "text-green-700"
                        : "text-muted"
                    }
                  >
                    {post.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/admin/publicacoes/${post.id}`}
                      className="text-accent hover:underline"
                    >
                      Editar
                    </Link>
                    {post.status === "PUBLISHED" ? (
                      <Link
                        href={`/publicacao/${post.slug}`}
                        className="text-muted hover:underline"
                        target="_blank"
                      >
                        Ver
                      </Link>
                    ) : null}
                    <DeletePostButton id={post.id} title={post.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 ? (
          <p className="p-6 text-muted">Nenhuma publicação cadastrada.</p>
        ) : null}
      </div>
    </div>
  );
}
