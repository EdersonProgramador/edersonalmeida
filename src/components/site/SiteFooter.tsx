import { SITE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="font-display text-lg">{SITE.name}</p>
        <p className="max-w-md text-sm text-paper/70">{SITE.description}</p>
      </div>
    </footer>
  );
}
