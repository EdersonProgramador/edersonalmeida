import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <p className="font-display text-2xl text-ink">Entrar no admin</p>
        <p className="mt-2 text-sm text-muted">
          Gerencie categorias e publicações do portal.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-muted">Carregando…</p>}>
            <LoginForm />
          </Suspense>
        </div>
        <Link href="/" className="mt-6 inline-block text-sm text-muted hover:text-accent">
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}
