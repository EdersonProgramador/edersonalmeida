import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

type Tool = { label: string; key: string; active: (e: Editor) => boolean; run: (e: Editor) => void };

const tools: Tool[] = [
  {
    label: "Negrito",
    key: "bold",
    active: (e) => e.isActive("bold"),
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    label: "Itálico",
    key: "italic",
    active: (e) => e.isActive("italic"),
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    label: "H2",
    key: "h2",
    active: (e) => e.isActive("heading", { level: 2 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "H3",
    key: "h3",
    active: (e) => e.isActive("heading", { level: 3 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: "Lista",
    key: "list",
    active: (e) => e.isActive("bulletList"),
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Citação",
    key: "quote",
    active: (e) => e.isActive("blockquote"),
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
];

export function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Desenvolva o conteúdo com clareza jurídica…" }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-inner">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-paper px-2 py-2">
        {tools.map((t) => {
          const active = t.active(editor);
          return (
            <button
              key={t.key}
              type="button"
              title={t.label}
              onClick={() => t.run(editor)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                active ? "bg-navy text-white shadow-sm" : "bg-surface text-ink hover:bg-white"
              }`}
            >
              {t.label}
            </button>
          );
        })}
        <button
          type="button"
          className="ml-auto rounded-md px-2.5 py-1.5 text-xs font-medium text-accent hover:bg-white"
          onClick={() => {
            const url = window.prompt("URL do link:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </button>
      </div>
      <EditorContent editor={editor} className="editor-prose min-h-[320px] px-5 py-4" />
    </div>
  );
}
