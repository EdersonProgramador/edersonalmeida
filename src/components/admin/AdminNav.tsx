"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/publicacoes", label: "Publicações" },
  { href: "/admin/autores", label: "Autores" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col gap-6 border-b border-border bg-ink px-6 py-6 text-paper md:min-h-screen md:w-56 md:border-b-0 md:border-r">
      <div>
        <p className="font-display text-xl">Administração</p>
        <p className="text-xs text-paper/60">Gerenciador de conteúdo</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-accent/20 text-accent-light" : "hover:bg-paper/10"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <Link
          href="/"
          className="text-sm text-paper/70 hover:text-paper transition"
        >
          Ver site →
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="text-left text-sm text-paper/70 hover:text-paper transition"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
