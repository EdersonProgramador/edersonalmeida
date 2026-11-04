"use client";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl text-ink">Erro ao carregar</h1>
      <p className="mt-4 text-muted">
        Não foi possível acessar o banco de dados. Em produção, use o deploy no
        Render ou configure Postgres na Vercel.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted">Referência: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-lg bg-accent px-5 py-2 text-sm text-paper"
      >
        Tentar novamente
      </button>
    </div>
  );
}
