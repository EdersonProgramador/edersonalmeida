import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/api";

const consentKey = "ed_cookie_consent";

export function Analytics({ settings }: { settings?: SiteSettings | null }) {
  const [consent, setConsent] = useState(() => localStorage.getItem(consentKey) === "1");

  useEffect(() => {
    if (!settings || settings.maintenanceMode) return;
    const allow = !settings.cookieConsentEnabled || consent;
    if (!allow) return;

    if (settings.gtmContainerId) {
      const id = settings.gtmContainerId;
      const s = document.createElement("script");
      s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;
      document.head.appendChild(s);
    } else if (settings.gaMeasurementId) {
      const mid = settings.gaMeasurementId;
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${mid}`;
      document.head.appendChild(s);
      const inline = document.createElement("script");
      inline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${mid}');`;
      document.head.appendChild(inline);
    }

    if (settings.adsEnabled && settings.googleAdsClientId) {
      const ads = document.createElement("script");
      ads.async = true;
      ads.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.googleAdsClientId}`;
      ads.crossOrigin = "anonymous";
      document.head.appendChild(ads);
    }

    if (settings.adsHeadHtml) {
      const wrap = document.createElement("div");
      wrap.innerHTML = settings.adsHeadHtml;
      wrap.querySelectorAll("script").forEach((node) => {
        const script = document.createElement("script");
        script.text = node.textContent ?? "";
        document.head.appendChild(script);
      });
    }
  }, [settings, consent]);

  if (!settings?.cookieConsentEnabled || consent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-navy p-4 text-sm text-white shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>{settings.cookieNoticeText ?? "Este site utiliza cookies para melhorar sua experiência."}</p>
        <button
          type="button"
          className="rounded-lg bg-gold px-4 py-2 font-semibold text-navy"
          onClick={() => {
            localStorage.setItem(consentKey, "1");
            setConsent(true);
          }}
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
