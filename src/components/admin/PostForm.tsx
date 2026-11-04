"use client";

import type { Author, Category, Post } from "@prisma/client";
import { useCallback, useMemo, useState } from "react";
import { CoverImageField } from "@/components/admin/CoverImageField";
import { PostFormFields } from "@/components/admin/PostFormFields";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type Props = {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  authors: Author[];
  post?: Post;
};

export function PostForm({ action, categories, authors, post }: Props) {
  const initialHtml = useMemo(() => {
    if (!post) return "";
    if (post.contentFormat === "MARKDOWN") return "";
    return post.content;
  }, [post]);

  const [content, setContent] = useState(initialHtml);
  const onContentChange = useCallback((html: string) => setContent(html), []);

  async function handleSubmit(formData: FormData) {
    formData.set("content", content);
    formData.set("contentFormat", "HTML");
    await action(formData);
  }

  return (
    <form action={handleSubmit} className="flex max-w-3xl flex-col gap-5">
      <PostFormFields
        categories={categories}
        authors={authors}
        post={post}
        hideContentAndCover
      />
      {post?.contentFormat === "MARKDOWN" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Esta publicação ainda usa Markdown. Ao salvar com o editor visual, o conteúdo
          passará para HTML (revise o texto abaixo).
        </p>
      ) : null}
      <CoverImageField defaultValue={post?.coverImage} />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink">Conteúdo</span>
        <RichTextEditor initialHtml={initialHtml} onChange={onContentChange} />
      </div>
      <button
        type="submit"
        className="w-fit rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-paper"
      >
        Salvar
      </button>
    </form>
  );
}
