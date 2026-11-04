import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { env } from "../env.js";
import { prisma } from "../prisma.js";
import { toSlug, uniqueSlug } from "../slug.js";

function uploadRoot() {
  return env.UPLOAD_ROOT?.trim() || path.join(process.cwd(), "uploads");
}

async function adminGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ message: "Não autorizado" });
  }
}

const postBody = z.object({
  title: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  contentFormat: z.enum(["HTML", "MARKDOWN"]).default("HTML"),
  coverImage: z.string().optional(),
  type: z.enum(["ARTIGO", "MATERIAL", "AULA", "PALESTRA", "PODCAST", "OUTRO"]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  categoryId: z.string(),
  authorId: z.string(),
});

export async function registerCmsRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    const body = z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .parse(request.body);
    const email = body.email.trim().toLowerCase();
    if (email !== env.ADMIN_EMAIL.toLowerCase() || body.password !== env.ADMIN_PASSWORD) {
      return reply.code(401).send({ message: "E-mail ou senha inválidos." });
    }
    const token = await reply.jwtSign({ role: "admin", email });
    return { token, email };
  });

  app.get("/public/categories", async () => {
    return prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { posts: { where: { status: "PUBLISHED" } } } } },
    });
  });

  app.get("/public/categories/:slug/posts", async (request) => {
    const { slug } = z.object({ slug: z.string() }).parse(request.params);
    return prisma.post.findMany({
      where: { status: "PUBLISHED", category: { slug } },
      include: { category: true, author: true },
      orderBy: [{ publishedAt: "desc" }],
    });
  });

  app.get("/public/posts", async () => {
    return prisma.post.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true, author: true },
      orderBy: [{ publishedAt: "desc" }],
      take: 20,
    });
  });

  app.get("/public/posts/:slug", async (request, reply) => {
    const { slug } = z.object({ slug: z.string() }).parse(request.params);
    const post = await prisma.post.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { category: true, author: true },
    });
    if (!post) return reply.code(404).send({ message: "Não encontrado" });
    return post;
  });

  await app.register(
    async (admin) => {
      admin.addHook("onRequest", adminGuard);

      admin.get("/categories", async () =>
        prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
      );

      admin.post("/categories", async (request) => {
        const body = z
          .object({
            name: z.string().min(1),
            description: z.string().optional(),
            sortOrder: z.coerce.number().default(0),
          })
          .parse(request.body);
        const slug = await uniqueSlug(body.name, async (s) =>
          !!(await prisma.category.findUnique({ where: { slug: s } })),
        );
        return prisma.category.create({
          data: { ...body, slug, description: body.description ?? null },
        });
      });

      admin.get("/authors", async () => prisma.author.findMany({ orderBy: { name: "asc" } }));

      admin.post("/authors", async (request) => {
        const body = z
          .object({ name: z.string().min(1), bio: z.string().optional(), avatarUrl: z.string().optional() })
          .parse(request.body);
        const slug = await uniqueSlug(body.name, async (s) =>
          !!(await prisma.author.findUnique({ where: { slug: s } })),
        );
        return prisma.author.create({
          data: { name: body.name, slug, bio: body.bio ?? null, avatarUrl: body.avatarUrl ?? null },
        });
      });

      admin.get("/posts", async () =>
        prisma.post.findMany({ include: { category: true, author: true }, orderBy: { updatedAt: "desc" } }),
      );

      admin.get("/posts/:id", async (request, reply) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);
        const post = await prisma.post.findUnique({
          where: { id },
          include: { category: true, author: true },
        });
        if (!post) return reply.code(404).send({ message: "Não encontrado" });
        return post;
      });

      admin.post("/posts", async (request) => {
        const body = postBody.parse(request.body);
        const slug = await uniqueSlug(body.title, async (s) =>
          !!(await prisma.post.findUnique({ where: { slug: s } })),
        );
        return prisma.post.create({
          data: {
            ...body,
            slug,
            excerpt: body.excerpt ?? null,
            coverImage: body.coverImage ?? null,
            publishedAt: body.status === "PUBLISHED" ? new Date() : null,
          },
        });
      });

      admin.patch("/posts/:id", async (request, reply) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);
        const existing = await prisma.post.findUnique({ where: { id } });
        if (!existing) return reply.code(404).send({ message: "Não encontrado" });
        const body = postBody.partial().parse(request.body);
        let slug = existing.slug;
        if (body.title && body.title !== existing.title) {
          slug = await uniqueSlug(body.title, async (s) => {
            const other = await prisma.post.findUnique({ where: { slug: s } });
            return !!other && other.id !== id;
          });
        }
        const status = body.status ?? existing.status;
        const publishedAt =
          status === "PUBLISHED"
            ? existing.publishedAt ?? new Date()
            : status === "DRAFT"
              ? null
              : existing.publishedAt;
        return prisma.post.update({
          where: { id },
          data: {
            ...body,
            slug,
            excerpt: body.excerpt === undefined ? undefined : body.excerpt ?? null,
            coverImage: body.coverImage === undefined ? undefined : body.coverImage ?? null,
            publishedAt,
          },
        });
      });

      admin.delete("/posts/:id", async (request, reply) => {
        const { id } = z.object({ id: z.string() }).parse(request.params);
        try {
          await prisma.post.delete({ where: { id } });
          return { ok: true };
        } catch {
          return reply.code(404).send({ message: "Não encontrado" });
        }
      });

      admin.post("/upload", async (request, reply) => {
        const data = await request.file();
        if (!data) return reply.code(400).send({ message: "Arquivo obrigatório" });
        const ext = path.extname(data.filename) || ".bin";
        const name = `${randomUUID()}${ext}`;
        const dir = uploadRoot();
        await mkdir(dir, { recursive: true });
        await pipeline(data.file, createWriteStream(path.join(dir, name)));
        return { url: `/uploads/${name}` };
      });
    },
    { prefix: "/admin" },
  );
}

export { uploadRoot };
