"use client";

import { deleteAuthor } from "@/lib/actions/authors";
import { useTransition } from "react";

export function DeleteAuthorButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Excluir o autor "${name}"?`)) return;
        startTransition(async () => {
          try {
            await deleteAuthor(id);
          } catch (e) {
            alert(e instanceof Error ? e.message : "Erro ao excluir.");
          }
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Excluir
    </button>
  );
}
