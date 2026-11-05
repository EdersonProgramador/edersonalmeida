import { useQuery } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function AdminLoginPage() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const settingsQ = useQuery({ queryKey: ["settings"], queryFn: api.publicSettings });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await login(String(fd.get("email")), String(fd.get("password")));
      nav("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-navy">
      <SiteHeader settings={settingsQ.data} />
      <div className="flex flex-1 items-center justify-center px-4 py-8">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-xl">
        <h1 className="font-serif text-3xl text-navy">Acesso administrativo</h1>
        <p className="mt-2 text-sm text-muted">Portal jurídico — credenciais seguras via JWT.</p>
        <label className="mt-6 block text-sm font-medium">
          E-mail
          <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-border px-3 py-2" />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Senha
          <input name="password" type="password" required className="mt-1 w-full rounded-lg border border-border px-3 py-2" />
        </label>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-navy py-2.5 font-semibold text-white hover:bg-accent disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
        <p className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar à página inicial
          </Link>
        </p>
      </form>
      </div>
    </div>
  );
}
