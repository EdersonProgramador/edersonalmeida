import Link from "next/link";
import { createCategory } from "@/lib/actions/categories";
import { fieldClass, labelClass } from "@/components/admin/formStyles";

export default function NewCategoryPage() {
  return (
    <div className="p-6 md:p-10">
      <Link href="/admin/categorias" className="text-sm text-muted hover:text-accent">
        ← Categorias
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Nova categoria</h1>

      <form action={createCategory} className="mt-8 max-w-lg flex flex-col gap-5">
        <label className={labelClass}>
          Nome
          <input name="name" required className={fieldClass} placeholder="Ex.: Direito Penal" />
        </label>
        <label className={labelClass}>
          Descrição
          <textarea
            name="description"
            rows={3}
            className={fieldClass}
            placeholder="Breve descrição para a página da categoria"
          />
        </label>
        <label className={labelClass}>
          Ordem de exibição
          <input
            name="sortOrder"
            type="number"
            defaultValue={0}
            className={fieldClass}
          />
        </label>
        <button
          type="submit"
          className="w-fit rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-paper"
        >
          Criar categoria
        </button>
      </form>
    </div>
  );
}
