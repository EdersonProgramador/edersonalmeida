import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [categories, published, drafts] = await Promise.all([
    prisma.category.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
  ]);

  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl text-ink">Painel</h1>
      <p className="mt-2 text-muted">Visão geral do conteúdo publicado.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Categorias", value: categories },
          { label: "Publicadas", value: published },
          { label: "Rascunhos", value: drafts },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-2 font-display text-4xl text-ink">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/admin/categorias/nova"
          className="rounded-lg bg-ink px-4 py-2 text-sm text-paper hover:bg-ink/90"
        >
          Nova categoria
        </Link>
        <Link
          href="/admin/publicacoes/nova"
          className="rounded-lg bg-accent px-4 py-2 text-sm text-paper hover:bg-accent/90"
        >
          Nova publicação
        </Link>
      </div>
    </div>
  );
}
