import type { ReactNode } from "react";

export function AdminSection({
  title,
  description,
  children,
  className = "",
  flushBody = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  flushBody?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-paper/60 ${flushBody ? "" : "p-5 md:p-6"} ${className}`}
    >
      <header
        className={`border-b border-border/80 pb-3 ${flushBody ? "px-5 pt-5 md:px-6 md:pt-6" : "mb-4"}`}
      >
        <h2 className="font-serif text-xl text-navy">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
