import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCategory } from "@/lib/actions/categories";
import { fieldClass, labelClass } from "@/components/admin/formStyles";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  const boundUpdate = updateCategory.bind(null, id);

  return (
    <div className="p-6 md:p-10">
      <Link href="/admin/categorias" className="text-sm text-muted hover:text-accent">
        ← Categorias
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Editar categoria</h1>

      <form action={boundUpdate} className="mt-8 max-w-lg flex flex-col gap-5">
        <label className={labelClass}>
          Nome
          <input
            name="name"
            required
            defaultValue={category.name}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Descrição
          <textarea
            name="description"
            rows={3}
            defaultValue={category.description ?? ""}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Ordem de exibição
          <input
            name="sortOrder"
            type="number"
            defaultValue={category.sortOrder}
            className={fieldClass}
          />
        </label>
        <p className="text-xs text-muted">
          Slug atual: <code className="text-ink">{category.slug}</code> (atualizado ao renomear)
        </p>
        <button
          type="submit"
          className="w-fit rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-paper"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
