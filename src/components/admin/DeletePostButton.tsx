"use client";

import { deletePost } from "@/lib/actions/posts";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) {
          return;
        }
        startTransition(async () => {
          await deletePost(id);
          router.refresh();
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Excluir
    </button>
  );
}
