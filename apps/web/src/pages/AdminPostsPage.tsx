import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, apiFetch, logout } from "../api";
import type { Post } from "../types";

export function AdminPostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Post[]>("/admin/posts")
      .then(setPosts)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          navigate("/admin/login");
          return;
        }
        setError(e instanceof Error ? e.message : "Erro");
      });
  }, [navigate]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ink">Publicações</h1>
        <div className="flex gap-3">
          <Link to="/admin/publicacoes/nova" className="rounded-lg bg-accent px-4 py-2 text-sm text-paper">
            Nova
          </Link>
          <Link to="/admin/autores" className="rounded-lg border border-border px-4 py-2 text-sm">
            Autores
          </Link>
          <button
            type="button"
            className="text-sm text-muted hover:text-ink"
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
          >
            Sair
          </button>
        </div>
      </div>
      {error ? <p className="mt-6 text-red-700">{error}</p> : null}
      <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-surface">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="font-medium text-ink">{p.title}</p>
              <p className="text-xs text-muted">
                {p.status} · {p.category?.name}
              </p>
            </div>
            <Link to={`/admin/publicacoes/${p.id}`} className="text-sm text-accent hover:underline">
              Editar
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
