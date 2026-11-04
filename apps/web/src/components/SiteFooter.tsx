import { SITE } from "../lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface py-10 text-center text-sm text-muted">
      <p>
        © {new Date().getFullYear()} {SITE.name}. Portal acadêmico.
      </p>
    </footer>
  );
}
