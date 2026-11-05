import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { api, type SiteSettingsFull } from "@/lib/api";

export function AdminSettingsPage() {
  const qc = useQueryClient();
  const settingsQ = useQuery({ queryKey: ["admin-settings"], queryFn: api.adminSettings });
  const [form, setForm] = useState<Partial<SiteSettingsFull>>({});

  useEffect(() => {
    if (settingsQ.data) setForm(settingsQ.data);
  }, [settingsQ.data]);

  const save = useMutation({
    mutationFn: () => api.updateSettings(form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-settings"] }),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate();
  }

  const field = "mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm";
  const section = "rounded-xl border border-border bg-paper p-5";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-navy">Configurações do sistema</h1>
        <p className="mt-2 text-sm text-muted">Identidade, SEO, analytics, LGPD e monetização (Google Ads).</p>
      </div>

      <section className={`${section} grid gap-4 md:grid-cols-2`}>
        <h2 className="md:col-span-2 font-serif text-xl text-navy">Site</h2>
        {(
          [
            ["siteName", "Nome do site"],
            ["tagline", "Tagline"],
            ["contactEmail", "E-mail de contato"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm font-medium md:col-span-2">
            {label}
            <input className={field} value={(form[key] as string) ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
          </label>
        ))}
        <label className="md:col-span-2 text-sm font-medium">
          Descrição
          <textarea
            className={field}
            rows={3}
            value={form.siteDescription ?? ""}
            onChange={(e) => setForm({ ...form, siteDescription: e.target.value })}
          />
        </label>
        <label className="md:col-span-2 text-sm font-medium">
          Aviso legal (rodapé)
          <textarea
            className={field}
            rows={2}
            value={form.legalDisclaimer ?? ""}
            onChange={(e) => setForm({ ...form, legalDisclaimer: e.target.value })}
          />
        </label>
      </section>

      <section className={`${section} grid gap-4 md:grid-cols-2`}>
        <h2 className="md:col-span-2 font-serif text-xl text-navy">SEO padrão</h2>
        <label className="text-sm font-medium md:col-span-2">
          Meta title padrão
          <input
            className={field}
            value={form.defaultMetaTitle ?? ""}
            onChange={(e) => setForm({ ...form, defaultMetaTitle: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium md:col-span-2">
          Meta description padrão
          <textarea
            className={field}
            rows={2}
            value={form.defaultMetaDescription ?? ""}
            onChange={(e) => setForm({ ...form, defaultMetaDescription: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium">
          Google Search Console (verification)
          <input
            className={field}
            value={form.googleSiteVerification ?? ""}
            onChange={(e) => setForm({ ...form, googleSiteVerification: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium">
          OG image padrão (URL)
          <input
            className={field}
            value={form.defaultOgImage ?? ""}
            onChange={(e) => setForm({ ...form, defaultOgImage: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium">
          Posts por página
          <input
            type="number"
            min={4}
            max={48}
            className={field}
            value={form.postsPerPage ?? 12}
            onChange={(e) => setForm({ ...form, postsPerPage: Number(e.target.value) })}
          />
        </label>
      </section>

      <section className={`${section} grid gap-4 md:grid-cols-2`}>
        <h2 className="md:col-span-2 font-serif text-xl text-navy">Analytics</h2>
        <label className="text-sm font-medium">
          GA4 Measurement ID
          <input
            className={field}
            placeholder="G-XXXXXXXX"
            value={form.gaMeasurementId ?? ""}
            onChange={(e) => setForm({ ...form, gaMeasurementId: e.target.value })}
          />
        </label>
        <label className="text-sm font-medium">
          Google Tag Manager
          <input
            className={field}
            placeholder="GTM-XXXX"
            value={form.gtmContainerId ?? ""}
            onChange={(e) => setForm({ ...form, gtmContainerId: e.target.value })}
          />
        </label>
      </section>

      <section className={`${section} grid gap-4 md:grid-cols-2`}>
        <h2 className="md:col-span-2 font-serif text-xl text-navy">Google Ads & cookies</h2>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={form.adsEnabled ?? false}
            onChange={(e) => setForm({ ...form, adsEnabled: e.target.checked })}
          />
          Habilitar Google Ads
        </label>
        <label className="text-sm font-medium md:col-span-2">
          Client ID (ca-pub-…)
          <input
            className={field}
            value={form.googleAdsClientId ?? ""}
            onChange={(e) => setForm({ ...form, googleAdsClientId: e.target.value })}
          />
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={form.cookieConsentEnabled ?? true}
            onChange={(e) => setForm({ ...form, cookieConsentEnabled: e.target.checked })}
          />
          Banner de consentimento (LGPD)
        </label>
        <label className="md:col-span-2 text-sm font-medium">
          Texto do banner
          <textarea
            className={field}
            rows={2}
            value={form.cookieNoticeText ?? ""}
            onChange={(e) => setForm({ ...form, cookieNoticeText: e.target.value })}
          />
        </label>
      </section>

      {save.isSuccess ? <p className="text-sm text-emerald-700">Configurações salvas.</p> : null}
      <button type="submit" className="rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white">
        Salvar configurações
      </button>
    </form>
  );
}
