import type { SiteSettings } from "@/lib/api";

export function SiteFooter({ settings }: { settings?: SiteSettings | null }) {
  return (
    <footer className="mt-16 border-t border-border bg-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <p className="font-serif text-2xl text-gold-soft">{settings?.siteName}</p>
        <p className="mt-2 max-w-2xl text-sm text-white/75">{settings?.legalDisclaimer}</p>
        {settings?.contactEmail ? (
          <p className="mt-4 text-sm">
            Contato:{" "}
            <a className="text-gold hover:underline" href={`mailto:${settings.contactEmail}`}>
              {settings.contactEmail}
            </a>
          </p>
        ) : null}
        <p className="mt-8 text-xs text-white/50">© {new Date().getFullYear()} — Conteúdo jurídico informativo.</p>
      </div>
    </footer>
  );
}
