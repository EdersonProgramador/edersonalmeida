import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import type { Author } from "../types";

export function AdminAuthorsPage() {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiFetch<Author[]>("/admin/authors")
      .then(setAuthors)
      .catch(() => navigate("/admin/login"));
  }

  useEffect(() => {
    load();
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/admin/authors", { method: "POST", body: JSON.stringify({ name }) });
      setName("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <Link to="/admin/publicacoes" className="text-sm text-accent hover:underline">
        ← Publicações
      </Link>
      <h1 className="mt-4 font-display text-3xl text-ink">Autores</h1>
      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do autor"
          required
          className="flex-1 rounded-lg border border-border px-3 py-2"
        />
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-paper">
          Adicionar
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      <ul className="mt-8 space-y-2">
        {authors.map((a) => (
          <li key={a.id} className="rounded-lg border border-border px-4 py-2">
            {a.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
