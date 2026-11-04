import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorAvatarField } from "@/components/admin/AuthorAvatarField";
import { updateAuthor } from "@/lib/actions/authors";
import { fieldClass, labelClass } from "@/components/admin/formStyles";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function EditAuthorPage({ params }: Props) {
  const { id } = await params;
  const author = await prisma.author.findUnique({ where: { id } });
  if (!author) notFound();

  const boundUpdate = updateAuthor.bind(null, id);

  return (
    <div className="p-6 md:p-10">
      <Link href="/admin/autores" className="text-sm text-muted hover:text-accent">
        ← Autores
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Editar autor</h1>

      <form action={boundUpdate} className="mt-8 flex max-w-lg flex-col gap-5">
        <label className={labelClass}>
          Nome
          <input name="name" required defaultValue={author.name} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Bio (opcional)
          <textarea
            name="bio"
            rows={3}
            defaultValue={author.bio ?? ""}
            className={fieldClass}
          />
        </label>
        <AuthorAvatarField defaultValue={author.avatarUrl} />
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
