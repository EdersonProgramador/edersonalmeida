"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback } from "react";

type Props = {
  initialHtml: string;
  onChange: (html: string) => void;
};

async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Upload falhou");
  }
  return data.url;
}

export function RichTextEditor({ initialHtml, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({
        placeholder: "Escreva o conteúdo da publicação…",
      }),
    ],
    content: initialHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-stone max-w-none min-h-[280px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  const addImage = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      try {
        const url = await uploadFile(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Erro ao enviar imagem");
      }
    };
    input.click();
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[280px] rounded-lg border border-border bg-surface animate-pulse" />
    );
  }

  const btn =
    "rounded-md px-2 py-1 text-sm text-ink hover:bg-paper disabled:opacity-40";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap gap-1 border-b border-border bg-paper/60 p-2">
        <button type="button" className={btn} onClick={() => editor.chain().focus().toggleBold().run()}>
          Negrito
        </button>
        <button type="button" className={btn} onClick={() => editor.chain().focus().toggleItalic().run()}>
          Itálico
        </button>
        <button type="button" className={btn} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          Título
        </button>
        <button type="button" className={btn} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Lista
        </button>
        <button type="button" className={btn} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Numerada
        </button>
        <button type="button" className={btn} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Citação
        </button>
        <button type="button" className={btn} onClick={addImage}>
          Imagem
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
