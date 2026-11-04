import Link from "next/link";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import { prisma } from "@/lib/db";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Categorias</h1>
          <p className="mt-2 text-muted">
            Defina assuntos (Direito Civil, Penal, temas diversos…).
          </p>
        </div>
        <Link
          href="/admin/categorias/nova"
          className="rounded-lg bg-accent px-4 py-2 text-sm text-paper"
        >
          Nova categoria
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-border bg-paper/50 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Ordem</th>
              <th className="px-4 py-3 font-medium">Posts</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-muted">{cat.slug}</td>
                <td className="px-4 py-3">{cat.sortOrder}</td>
                <td className="px-4 py-3">{cat._count.posts}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/categorias/${cat.id}`}
                      className="text-accent hover:underline"
                    >
                      Editar
                    </Link>
                    <DeleteCategoryButton id={cat.id} name={cat.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
