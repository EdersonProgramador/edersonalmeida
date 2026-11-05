import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
};

function ToolbarDivider() {
  return <span className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />;
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
        active ? "bg-navy text-white shadow-sm" : "text-ink hover:bg-white"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function EditorToolbar({
  editor,
  onPickImage,
  imageUploading,
  focusMode,
  onToggleFocus,
}: {
  editor: Editor;
  onPickImage: () => void;
  imageUploading: boolean;
  focusMode: boolean;
  onToggleFocus: () => void;
}) {
  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link (deixe vazio para remover):", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  const icon = 16;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-paper px-2 py-2 sm:gap-1 sm:px-3">
      <ToolbarButton label="Desfazer" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={icon} />
      </ToolbarButton>
      <ToolbarButton label="Refazer" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={icon} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Título principal (H1)"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Subtítulo (H2)"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Seção (H3)"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={icon} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton label="Negrito" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={icon} />
      </ToolbarButton>
      <ToolbarButton label="Itálico" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Sublinhado"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon size={icon} />
      </ToolbarButton>
      <ToolbarButton label="Tachado" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={icon} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Lista com marcadores"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Lista numerada"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Citação"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={icon} />
      </ToolbarButton>
      <ToolbarButton label="Linha horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus size={icon} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton label="Alinhar à esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <AlignLeft size={icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Centralizar"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter size={icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Justificar"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify size={icon} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton label="Inserir link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 size={icon} />
      </ToolbarButton>
      <ToolbarButton label="Inserir imagem" disabled={imageUploading} onClick={onPickImage}>
        <ImagePlus size={icon} />
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-1">
        <ToolbarButton label={focusMode ? "Sair do modo foco" : "Modo foco (tela ampla)"} onClick={onToggleFocus}>
          {focusMode ? <Minimize2 size={icon} /> : <Maximize2 size={icon} />}
        </ToolbarButton>
      </div>
    </div>
  );
}

export function RichEditor({ value, onChange, onUploadImage }: Props) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Escreva o conteúdo completo: argumentos, citações, listas e referências…",
      }),
      CharacterCount.configure(),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "editor-prose editor-canvas focus:outline-none",
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  useEffect(() => {
    if (!focusMode) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [focusMode]);

  async function handleImageFile(file: File) {
    if (!editor || !onUploadImage) {
      alert("Faça login e salve o rascunho para enviar imagens ao servidor.");
      return;
    }
    setImageUploading(true);
    try {
      const url = await onUploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, "") }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao enviar imagem");
    } finally {
      setImageUploading(false);
    }
  }

  if (!editor) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-border bg-paper text-sm text-muted">
        Carregando editor…
      </div>
    );
  }

  const chars = editor.storage.characterCount?.characters?.() ?? 0;
  const words = editor.storage.characterCount?.words?.() ?? 0;

  const shell = (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ${
        focusMode ? "h-full" : ""
      }`}
    >
      <EditorToolbar
        editor={editor}
        focusMode={focusMode}
        imageUploading={imageUploading}
        onToggleFocus={() => setFocusMode((v) => !v)}
        onPickImage={() => {
          if (!onUploadImage) {
            alert("Upload de imagens indisponível nesta sessão.");
            return;
          }
          fileRef.current?.click();
        }}
      />
      <div className={`editor-scroll flex-1 overflow-y-auto bg-[#faf8f4] ${focusMode ? "min-h-0" : ""}`}>
        <EditorContent editor={editor} className={`px-4 py-6 sm:px-8 sm:py-8 ${focusMode ? "min-h-[calc(100vh-12rem)]" : "min-h-[min(520px,55vh)]"}`} />
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-paper px-4 py-2 text-xs text-muted">
        <span>
          {words.toLocaleString("pt-BR")} palavras · {chars.toLocaleString("pt-BR")} caracteres
        </span>
        <span className="hidden sm:inline">Modo foco: Esc para sair</span>
      </footer>
      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleImageFile(file);
        }}
      />
    </div>
  );

  if (focusMode) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-navy/40 p-2 backdrop-blur-sm sm:p-4 md:p-6">
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col">{shell}</div>
      </div>
    );
  }

  return shell;
}
