"use client";

import { useState } from "react";
import { fieldClass, labelClass } from "@/components/admin/formStyles";

export function AuthorAvatarField({ defaultValue }: { defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload falhou");
      setUrl(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className={labelClass}>
        Foto (opcional)
        <input name="avatarUrl" type="hidden" value={url} readOnly />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={fieldClass}
          placeholder="/uploads/... ou URL"
        />
      </label>
      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:border-accent">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={uploading}
          onChange={onFileChange}
        />
        {uploading ? "Enviando…" : "Enviar foto"}
      </label>
    </div>
  );
}
