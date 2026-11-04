import Link from "next/link";
import { DeleteAuthorButton } from "@/components/admin/DeleteAuthorButton";
import { prisma } from "@/lib/db";

export default async function AdminAuthorsPage() {
  const authors = await prisma.author.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Autores</h1>
          <p className="mt-2 text-muted">
            Vários autores podem assinar publicações no portal.
          </p>
        </div>
        <Link
          href="/admin/autores/novo"
          className="rounded-lg bg-accent px-4 py-2 text-sm text-paper"
        >
          Novo autor
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-border bg-paper/50 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Publicações</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium">{author.name}</td>
                <td className="px-4 py-3 text-muted">{author.slug}</td>
                <td className="px-4 py-3">{author._count.posts}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/autores/${author.id}`}
                      className="text-accent hover:underline"
                    >
                      Editar
                    </Link>
                    <DeleteAuthorButton id={author.id} name={author.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {authors.length === 0 ? (
          <p className="p-6 text-muted">Nenhum autor cadastrado.</p>
        ) : null}
      </div>
    </div>
  );
}
