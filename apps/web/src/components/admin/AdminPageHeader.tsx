import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function AdminPageHeader({
  title,
  subtitle,
  backTo,
  backLabel = "Voltar",
  actions,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {backTo ? (
          <Link to={backTo} className="text-xs font-semibold uppercase tracking-wide text-accent hover:underline">
            ← {backLabel}
          </Link>
        ) : null}
        <h1 className="mt-1 font-serif text-3xl text-navy md:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
