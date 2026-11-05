import { useEffect } from "react";
import type { Post, SiteSettings } from "@/lib/api";
import { SITE_BRANDING } from "@/lib/siteBranding";

type Props = {
  settings?: SiteSettings | null;
  title?: string;
  description?: string;
  image?: string | null;
  url?: string;
  type?: "website" | "article";
  post?: Post;
  noIndex?: boolean;
};

function upsertMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function Seo({ settings, title, description, image, url, type = "website", post, noIndex }: Props) {
  const siteTitle = settings?.defaultMetaTitle ?? settings?.siteName ?? SITE_BRANDING.defaultMetaTitle;
  const metaTitle = title ? `${title} | ${settings?.siteName ?? SITE_BRANDING.siteName}` : siteTitle;
  const metaDesc =
    description ?? settings?.defaultMetaDescription ?? settings?.siteDescription ?? SITE_BRANDING.defaultMetaDescription;
  const og = image ?? post?.ogImage ?? post?.coverImage ?? settings?.defaultOgImage ?? "";
  const canonical = post?.canonicalUrl ?? url ?? window.location.href;
  const indexable = !(noIndex ?? post?.noIndex);

  useEffect(() => {
    document.title = metaTitle;
    upsertMeta("description", metaDesc);
    upsertMeta("robots", indexable ? "index,follow" : "noindex,nofollow");
    if (settings?.googleSiteVerification) upsertMeta("google-site-verification", settings.googleSiteVerification);
    if (post?.focusKeyword) upsertMeta("keywords", post.focusKeyword);
    upsertLink("canonical", canonical);
    upsertMeta("og:title", metaTitle, "property");
    upsertMeta("og:description", metaDesc, "property");
    upsertMeta("og:type", type, "property");
    if (og) upsertMeta("og:image", og, "property");
    if (settings?.twitterHandle) upsertMeta("twitter:site", settings.twitterHandle);

    const jsonLd = post
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt ?? metaDesc,
          datePublished: post.publishedAt,
          author: { "@type": "Person", name: post.author.name },
          image: og || undefined,
        }
      : {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: settings?.siteName,
          description: settings?.siteDescription,
          url: canonical,
        };

    let script = document.getElementById("json-ld-seo") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "json-ld-seo";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
  }, [metaTitle, metaDesc, og, canonical, indexable, post, settings, type]);

  return null;
}
