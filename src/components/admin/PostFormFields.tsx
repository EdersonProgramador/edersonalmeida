import type { Author, Category, Post } from "@prisma/client";
import { POST_TYPE_LABELS } from "@/lib/constants";
import { fieldClass, labelClass } from "@/components/admin/formStyles";

export function PostFormFields({
  categories,
  authors,
  post,
  hideContentAndCover,
}: {
  categories: Category[];
  authors: Author[];
  post?: Post;
  hideContentAndCover?: boolean;
}) {
  return (
    <>
      <label className={labelClass}>
        Título
        <input
          name="title"
          required
          defaultValue={post?.title}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Resumo (excerpt)
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt ?? ""}
          className={fieldClass}
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Categoria
          <select
            name="categoryId"
            required
            defaultValue={post?.categoryId ?? categories[0]?.id}
            className={fieldClass}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Autor
          <select
            name="authorId"
            required
            defaultValue={post?.authorId ?? authors[0]?.id}
            className={fieldClass}
          >
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Tipo
          <select name="type" defaultValue={post?.type ?? "ARTIGO"} className={fieldClass}>
            {Object.entries(POST_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Status
          <select name="status" defaultValue={post?.status ?? "DRAFT"} className={fieldClass}>
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
          </select>
        </label>
      </div>
      {!hideContentAndCover ? (
        <>
          <label className={labelClass}>
            URL da imagem de capa (opcional)
            <input
              name="coverImage"
              type="url"
              defaultValue={post?.coverImage ?? ""}
              className={fieldClass}
              placeholder="https://..."
            />
          </label>
          <label className={labelClass}>
            Conteúdo (Markdown)
            <textarea
              name="content"
              required
              rows={16}
              defaultValue={post?.content ?? ""}
              className={`${fieldClass} font-mono text-sm`}
            />
          </label>
        </>
      ) : null}
    </>
  );
}
