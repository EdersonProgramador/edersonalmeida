"use client";

import { deleteCategory } from "@/lib/actions/categories";
import { useTransition } from "react";

export function DeleteCategoryButton({
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
        if (
          !confirm(
            `Excluir a categoria "${name}"? Só é possível se não houver publicações vinculadas.`,
          )
        ) {
          return;
        }
        startTransition(async () => {
          try {
            await deleteCategory(id);
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
