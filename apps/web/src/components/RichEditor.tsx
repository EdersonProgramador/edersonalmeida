import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

export function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Escreva o conteúdo jurídico…" }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {(
          [
            ["N", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")],
            ["I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")],
            ["H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading")],
            ["•", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList")],
          ] as const
        ).map(([label, action, active]) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className={`rounded px-2 py-1 text-xs font-semibold ${active ? "bg-navy text-white" : "bg-paper text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} className="prose-legal min-h-[280px] px-4 py-3" />
    </div>
  );
}
