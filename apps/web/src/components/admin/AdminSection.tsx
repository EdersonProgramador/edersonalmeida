import type { ReactNode } from "react";

export function AdminSection({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-paper/60 p-5 md:p-6 ${className}`}>
      <header className="mb-4 border-b border-border/80 pb-3">
        <h2 className="font-serif text-xl text-navy">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
