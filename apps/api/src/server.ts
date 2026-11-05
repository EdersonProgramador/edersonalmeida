import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import bcrypt from "bcryptjs";
import Fastify from "fastify";
import { mkdirSync, createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname } from "node:path";
import { pipeline } from "node:stream/promises";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { PostStatus, PostType, Prisma } from "@prisma/client";
import { env } from "./env.js";
import { prisma } from "./prisma.js";
import { sanitizeHtmlContent } from "./sanitize.js";
import { estimateReadingMinutes, resolvePublishedAt } from "./post-utils.js";
import { registerAuth, authenticate } from "./auth-plugin.js";
import { syncLawAreaCatalog } from "./catalog.js";
import { toSlug, uniqueSlug } from "./slug.js";

const app = Fastify({ logger: true, ignoreTrailingSlash: true });

function resolveUploadRoot() {
  const candidates = [
    env.UPLOAD_ROOT?.trim(),
    join(process.cwd(), "uploads"),
    join(tmpdir(), "edpersonalmeida-uploads"),
  ].filter((d): d is string => Boolean(d?.trim()));
  for (const dir of candidates) {
    try {
      mkdirSync(dir, { recursive: true });
      return dir;
    } catch {
      /* try next */
    }
  }
  return join(tmpdir(), "edpersonalmeida-uploads");
}

const uploadRoot = resolveUploadRoot();

await app.register(cors, {
  origin: [env.WEB_ORIGIN, "http://localhost:5173", "http://localhost:5175", /\.vercel\.app$/],
  credentials: true,
});
await app.register(jwt, { secret: env.JWT_SECRET });
await app.register(multipart, { limits: { fileSize: 5_000_000 } });
await app.register(fastifyStatic, { root: uploadRoot, prefix: "/uploads/", decorateReply: false });
registerAuth(app);

const postInclude = {
  category: { include: { parent: true } },
  author: { select: { id: true, name: true, avatarUrl: true, jobTitle: true, oabNumber: true } },
} satisfies Prisma.PostInclude;

function publicPostWhere(now = new Date()): Prisma.PostWhereInput {
  return {
    status: "PUBLISHED",
    OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
    noIndex: false,
  };
}

async function getSettings() {
  return prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {},
    update: {},
  });
}

app.get("/health", async () => ({ ok: true }));

app.post("/auth/login", async (request, reply) => {
  const body = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .parse(request.body);
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    return reply.code(401).send({ error: "Credenciais inválidas" });
  }
  const token = await reply.jwtSign(
    { sub: user.id, email: user.email, role: user.role },
    { expiresIn: "7d" },
  );
  return { token, user: sanitizeUser(user) };
});

app.get("/auth/me", { preHandler: authenticate }, async (request) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: request.user.sub } });
  return sanitizeUser(user);
});

app.patch("/auth/profile", { preHandler: authenticate }, async (request, reply) => {
  const body = z
    .object({
      name: z.string().min(2).optional(),
      bio: z.string().max(2000).nullable().optional(),
      jobTitle: z.string().max(120).nullable().optional(),
      oabNumber: z.string().max(32).nullable().optional(),
      phone: z.string().max(32).nullable().optional(),
      websiteUrl: z.string().url().nullable().optional(),
      linkedInUrl: z.string().url().nullable().optional(),
      instagramUrl: z.string().url().nullable().optional(),
      avatarUrl: z.string().url().nullable().optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().min(6).optional(),
    })
    .parse(request.body);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: request.user.sub } });
  const data: Prisma.UserUpdateInput = {
    name: body.name,
    bio: body.bio,
    jobTitle: body.jobTitle,
    oabNumber: body.oabNumber,
    phone: body.phone,
    websiteUrl: body.websiteUrl,
    linkedInUrl: body.linkedInUrl,
    instagramUrl: body.instagramUrl,
    avatarUrl: body.avatarUrl,
  };

  if (body.newPassword) {
    if (!body.currentPassword || !(await bcrypt.compare(body.currentPassword, user.passwordHash))) {
      return reply.code(401).send({ error: "Senha atual incorreta" });
    }
    data.passwordHash = await bcrypt.hash(body.newPassword, 12);
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return sanitizeUser(updated);
});

app.get("/public/settings", async () => {
  const s = await getSettings();
  return publicSettings(s);
});

app.get("/public/categories", async () => {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      children: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      _count: { select: { posts: { where: publicPostWhere() } } },
    },
    where: { parentId: null },
  });
  return categories.map((c) => ({
    ...c,
    postCount: c._count.posts,
    children: c.children.map((ch) => ({ ...ch, postCount: undefined })),
  }));
});

app.get("/public/posts", async (request) => {
  const q = z
    .object({
      page: z.coerce.number().min(1).default(1),
      category: z.string().optional(),
      subcategory: z.string().optional(),
      type: z.string().optional(),
      featured: z.coerce.boolean().optional(),
      q: z.string().optional(),
    })
    .parse(request.query);

  const settings = await getSettings();
  const take = settings.postsPerPage;
  const skip = (q.page - 1) * take;

  const categoryFilter: Prisma.PostWhereInput = {};
  if (q.subcategory) categoryFilter.category = { slug: q.subcategory };
  else if (q.category) {
    categoryFilter.category = {
      OR: [{ slug: q.category }, { parent: { slug: q.category } }],
    };
  }

  const where: Prisma.PostWhereInput = {
    ...publicPostWhere(),
    ...categoryFilter,
    ...(q.type ? { type: q.type as PostType } : {}),
    ...(q.featured ? { featured: true } : {}),
    ...(q.q
      ? {
          OR: [
            { title: { contains: q.q, mode: "insensitive" } },
            { excerpt: { contains: q.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: postInclude,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take,
    }),
    prisma.post.count({ where }),
  ]);

  return { items, total, page: q.page, pageSize: take };
});

app.get("/public/posts/:slug", async (request, reply) => {
  const { slug } = z.object({ slug: z.string() }).parse(request.params);
  const post = await prisma.post.findFirst({
    where: { slug, ...publicPostWhere() },
    include: postInclude,
  });
  if (!post) return reply.code(404).send({ error: "Publicação não encontrada" });
  return post;
});

app.get("/public/sitemap.xml", async (_req, reply) => {
  const settings = await getSettings();
  const base = env.WEB_ORIGIN.replace(/\/$/, "");
  const posts = await prisma.post.findMany({
    where: publicPostWhere(),
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  const categories = await prisma.category.findMany({ select: { slug: true, updatedAt: true } });
  const urls = [
    { loc: `${base}/`, lastmod: new Date().toISOString() },
    ...categories.map((c) => ({
      loc: `${base}/categoria/${c.slug}`,
      lastmod: c.updatedAt.toISOString(),
    })),
    ...posts.map((p) => ({
      loc: `${base}/artigo/${p.slug}`,
      lastmod: (p.publishedAt ?? p.updatedAt).toISOString(),
    })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>weekly</changefreq></url>`,
  )
  .join("\n")}
</urlset>`;
  reply.header("Content-Type", "application/xml").send(xml);
});

app.get("/public/robots.txt", async (_req, reply) => {
  const base = env.WEB_ORIGIN.replace(/\/$/, "");
  reply
    .type("text/plain")
    .send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${base}/public/sitemap.xml\n`);
});

app.post("/admin/uploads", { preHandler: authenticate }, async (request, reply) => {
  const file = await request.file();
  if (!file) return reply.code(400).send({ error: "Arquivo obrigatório" });
  const ext = extname(file.filename).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
    return reply.code(400).send({ error: "Formato não permitido" });
  }
  const name = `${randomUUID()}${ext}`;
  const dest = join(uploadRoot, name);
  await pipeline(file.file, createWriteStream(dest));
  return { url: `/uploads/${name}` };
});

const postBodySchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().max(500).nullable().optional(),
  content: z.string().min(1),
  contentFormat: z.enum(["HTML", "MARKDOWN"]).optional(),
  coverImage: z.string().nullable().optional(),
  type: z.enum(["ARTIGO", "MATERIAL", "AULA", "PALESTRA", "PODCAST", "OUTRO"]).optional(),
  status: z.enum(["DRAFT", "REVIEW", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  scheduledFor: z.string().datetime().nullable().optional(),
  categoryId: z.string(),
  metaTitle: z.string().max(70).nullable().optional(),
  metaDescription: z.string().max(160).nullable().optional(),
  focusKeyword: z.string().max(80).nullable().optional(),
  ogImage: z.string().nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  noIndex: z.boolean().optional(),
});

app.get("/admin/posts", { preHandler: authenticate }, async (request) => {
  const q = z
    .object({ status: z.string().optional(), q: z.string().optional() })
    .parse(request.query);
  return prisma.post.findMany({
    where: {
      ...(q.status ? { status: q.status as PostStatus } : {}),
      ...(q.q
        ? { OR: [{ title: { contains: q.q, mode: "insensitive" } }, { slug: { contains: q.q, mode: "insensitive" } }] }
        : {}),
    },
    include: postInclude,
    orderBy: [{ updatedAt: "desc" }],
  });
});

app.get("/admin/posts/:id", { preHandler: authenticate }, async (request, reply) => {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const post = await prisma.post.findUnique({ where: { id }, include: postInclude });
  if (!post) return reply.code(404).send({ error: "Não encontrado" });
  return post;
});

app.post("/admin/posts", { preHandler: authenticate }, async (request) => {
  const body = postBodySchema.parse(request.body);
  const slug = body.slug?.trim()
    ? toSlug(body.slug)
    : await uniqueSlug(body.title, async (s) => Boolean(await prisma.post.findUnique({ where: { slug: s } })));
  const status = body.status ?? "DRAFT";
  const content =
    body.contentFormat === "HTML" || !body.contentFormat
      ? sanitizeHtmlContent(body.content)
      : body.content;
  const publishedAt = resolvePublishedAt({
    status,
    publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
    scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
  });
  return prisma.post.create({
    data: {
      title: body.title,
      slug,
      excerpt: body.excerpt,
      content,
      contentFormat: body.contentFormat ?? "HTML",
      coverImage: body.coverImage,
      type: body.type ?? "ARTIGO",
      status,
      featured: body.featured ?? false,
      publishedAt,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      readingMinutes: estimateReadingMinutes(content),
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      focusKeyword: body.focusKeyword,
      ogImage: body.ogImage,
      canonicalUrl: body.canonicalUrl,
      noIndex: body.noIndex ?? false,
      categoryId: body.categoryId,
      authorId: request.user.sub,
    },
    include: postInclude,
  });
});

app.patch("/admin/posts/:id", { preHandler: authenticate }, async (request, reply) => {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const body = postBodySchema.partial().parse(request.body);
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return reply.code(404).send({ error: "Não encontrado" });

  let slug = existing.slug;
  if (body.slug) slug = toSlug(body.slug);
  else if (body.title) {
    slug = await uniqueSlug(body.title, async (s) => {
      const other = await prisma.post.findUnique({ where: { slug: s } });
      return Boolean(other && other.id !== id);
    });
  }

  const status = body.status ?? existing.status;
  const contentRaw = body.content ?? existing.content;
  const content =
    (body.contentFormat ?? existing.contentFormat) === "HTML"
      ? sanitizeHtmlContent(contentRaw)
      : contentRaw;

  const publishedAt = resolvePublishedAt({
    status,
    publishedAt: body.publishedAt !== undefined ? (body.publishedAt ? new Date(body.publishedAt) : null) : existing.publishedAt,
    scheduledFor:
      body.scheduledFor !== undefined
        ? body.scheduledFor
          ? new Date(body.scheduledFor)
          : null
        : existing.scheduledFor,
  });

  return prisma.post.update({
    where: { id },
    data: {
      title: body.title,
      slug,
      excerpt: body.excerpt,
      content,
      contentFormat: body.contentFormat,
      coverImage: body.coverImage,
      type: body.type,
      status,
      featured: body.featured,
      publishedAt,
      scheduledFor:
        body.scheduledFor !== undefined
          ? body.scheduledFor
            ? new Date(body.scheduledFor)
            : null
          : undefined,
      readingMinutes: estimateReadingMinutes(content),
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      focusKeyword: body.focusKeyword,
      ogImage: body.ogImage,
      canonicalUrl: body.canonicalUrl,
      noIndex: body.noIndex,
      categoryId: body.categoryId,
    },
    include: postInclude,
  });
});

app.delete("/admin/posts/:id", { preHandler: authenticate }, async (request, reply) => {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  await prisma.post.delete({ where: { id } });
  return reply.code(204).send();
});

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  icon: z.string().max(4).nullable().optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  sortOrder: z.number().int().optional(),
  parentId: z.string().nullable().optional(),
});

app.get("/admin/categories", { preHandler: authenticate }, async () => {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      children: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      parent: true,
      _count: { select: { posts: true } },
    },
    where: { parentId: null },
  });
});

app.post("/admin/categories", { preHandler: authenticate }, async (request) => {
  const body = categorySchema.parse(request.body);
  const slug =
    body.slug?.trim() ||
    (await uniqueSlug(body.name, async (s) => Boolean(await prisma.category.findUnique({ where: { slug: s } }))));
  return prisma.category.create({
    data: {
      name: body.name,
      slug: toSlug(slug),
      description: body.description,
      icon: body.icon,
      accentColor: body.accentColor,
      sortOrder: body.sortOrder ?? 0,
      parentId: body.parentId,
    },
  });
});

app.patch("/admin/categories/:id", { preHandler: authenticate }, async (request, reply) => {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const body = categorySchema.partial().parse(request.body);
  if (body.parentId === id) return reply.code(400).send({ error: "Categoria não pode ser pai de si mesma" });
  return prisma.category.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug ? toSlug(body.slug) : undefined,
      description: body.description,
      icon: body.icon,
      accentColor: body.accentColor,
      sortOrder: body.sortOrder,
      parentId: body.parentId,
    },
  });
});

app.delete("/admin/categories/:id", { preHandler: authenticate }, async (request, reply) => {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const posts = await prisma.post.count({ where: { categoryId: id } });
  if (posts > 0) return reply.code(400).send({ error: "Remova ou mova as publicações antes de excluir" });
  const children = await prisma.category.count({ where: { parentId: id } });
  if (children > 0) return reply.code(400).send({ error: "Remova as subcategorias primeiro" });
  await prisma.category.delete({ where: { id } });
  return reply.code(204).send();
});

const settingsSchema = z.object({
  siteName: z.string().min(2).optional(),
  tagline: z.string().optional(),
  siteDescription: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  defaultMetaTitle: z.string().nullable().optional(),
  defaultMetaDescription: z.string().nullable().optional(),
  defaultOgImage: z.string().nullable().optional(),
  twitterHandle: z.string().nullable().optional(),
  googleSiteVerification: z.string().nullable().optional(),
  gaMeasurementId: z.string().nullable().optional(),
  gtmContainerId: z.string().nullable().optional(),
  adsEnabled: z.boolean().optional(),
  googleAdsClientId: z.string().nullable().optional(),
  adsHeadHtml: z.string().nullable().optional(),
  cookieConsentEnabled: z.boolean().optional(),
  cookieNoticeText: z.string().nullable().optional(),
  privacyPolicyHtml: z.string().nullable().optional(),
  termsHtml: z.string().nullable().optional(),
  legalDisclaimer: z.string().nullable().optional(),
  postsPerPage: z.number().int().min(4).max(48).optional(),
  allowPublicSearch: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
});

app.get("/admin/settings", { preHandler: authenticate }, async () => getSettings());

app.patch("/admin/settings", { preHandler: authenticate }, async (request) => {
  const body = settingsSchema.parse(request.body);
  return prisma.siteSettings.update({ where: { id: "default" }, data: body });
});

app.get("/admin/stats", { preHandler: authenticate }, async () => {
  const [published, draft, review, scheduled, categories] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.count({ where: { status: "REVIEW" } }),
    prisma.post.count({ where: { status: "SCHEDULED" } }),
    prisma.category.count(),
  ]);
  return { published, draft, review, scheduled, categories };
});

function sanitizeUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  jobTitle: string | null;
  oabNumber: string | null;
  phone: string | null;
  websiteUrl: string | null;
  linkedInUrl: string | null;
  instagramUrl: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    jobTitle: user.jobTitle,
    oabNumber: user.oabNumber,
    phone: user.phone,
    websiteUrl: user.websiteUrl,
    linkedInUrl: user.linkedInUrl,
    instagramUrl: user.instagramUrl,
  };
}

function publicSettings(s: Awaited<ReturnType<typeof getSettings>>) {
  return {
    siteName: s.siteName,
    tagline: s.tagline,
    siteDescription: s.siteDescription,
    logoUrl: s.logoUrl,
    faviconUrl: s.faviconUrl,
    contactEmail: s.contactEmail,
    defaultMetaTitle: s.defaultMetaTitle,
    defaultMetaDescription: s.defaultMetaDescription,
    defaultOgImage: s.defaultOgImage,
    twitterHandle: s.twitterHandle,
    googleSiteVerification: s.googleSiteVerification,
    gaMeasurementId: s.gaMeasurementId,
    gtmContainerId: s.gtmContainerId,
    adsEnabled: s.adsEnabled,
    googleAdsClientId: s.googleAdsClientId,
    adsHeadHtml: s.adsHeadHtml,
    cookieConsentEnabled: s.cookieConsentEnabled,
    cookieNoticeText: s.cookieNoticeText,
    legalDisclaimer: s.legalDisclaimer,
    postsPerPage: s.postsPerPage,
    allowPublicSearch: s.allowPublicSearch,
    maintenanceMode: s.maintenanceMode,
  };
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

async function ensureBootstrapUser() {
  const count = await prisma.user.count();
  if (count > 0) return;
  await prisma.user.create({
    data: {
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash: await bcrypt.hash(env.ADMIN_PASSWORD, 12),
      name: "Administrador",
      role: "ADMIN",
      jobTitle: "Advogado",
    },
  });
}

await ensureBootstrapUser();
await getSettings();
await syncLawAreaCatalog(prisma);

const port = env.API_PORT;
await app.listen({ port, host: "0.0.0.0" });
