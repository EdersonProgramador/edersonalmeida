import Link from "next/link";
import { AuthorAvatarField } from "@/components/admin/AuthorAvatarField";
import { createAuthor } from "@/lib/actions/authors";
import { fieldClass, labelClass } from "@/components/admin/formStyles";

export default function NewAuthorPage() {
  return (
    <div className="p-6 md:p-10">
      <Link href="/admin/autores" className="text-sm text-muted hover:text-accent">
        ← Autores
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Novo autor</h1>

      <form action={createAuthor} className="mt-8 flex max-w-lg flex-col gap-5">
        <label className={labelClass}>
          Nome
          <input name="name" required className={fieldClass} />
        </label>
        <label className={labelClass}>
          Bio (opcional)
          <textarea name="bio" rows={3} className={fieldClass} />
        </label>
        <AuthorAvatarField />
        <button
          type="submit"
          className="w-fit rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-paper"
        >
          Criar autor
        </button>
      </form>
    </div>
  );
}
