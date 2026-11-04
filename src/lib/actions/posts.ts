"use server";

import type { ContentFormat, PostStatus, PostType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";

const POST_TYPES: PostType[] = [
  "ARTIGO",
  "MATERIAL",
  "AULA",
  "PALESTRA",
  "PODCAST",
  "OUTRO",
];

const POST_STATUSES: PostStatus[] = ["DRAFT", "PUBLISHED"];

function parsePostForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const content = String(formData.get("content") ?? "").trim();
  const coverImage = String(formData.get("coverImage") ?? "").trim() || null;
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const authorId = String(formData.get("authorId") ?? "").trim();
  const contentFormat = String(
    formData.get("contentFormat") ?? "HTML",
  ) as ContentFormat;
  const type = String(formData.get("type") ?? "ARTIGO") as PostType;
  const status = String(formData.get("status") ?? "DRAFT") as PostStatus;

  if (!title || !content || !categoryId || !authorId) {
    throw new Error("Título, conteúdo, categoria e autor são obrigatórios.");
  }
  if (!POST_TYPES.includes(type)) throw new Error("Tipo inválido.");
  if (!POST_STATUSES.includes(status)) throw new Error("Status inválido.");

  return {
    title,
    excerpt,
    content,
    coverImage,
    categoryId,
    authorId,
    contentFormat,
    type,
    status,
  };
}

function publishedAtForStatus(status: PostStatus, existing: Date | null) {
  if (status === "PUBLISHED") {
    return existing ?? new Date();
  }
  return null;
}

export async function createPost(formData: FormData) {
  await requireAdmin();
  const data = parsePostForm(formData);

  const slug = await uniqueSlug(data.title, async (s) => {
    const found = await prisma.post.findUnique({ where: { slug: s } });
    return !!found;
  });

  const post = await prisma.post.create({
    data: {
      ...data,
      slug,
      publishedAt: publishedAtForStatus(data.status, null),
    },
  });

  await revalidatePaths(post.slug, post.categoryId);
  redirect("/admin/publicacoes");
}

export async function updatePost(id: string, formData: FormData) {
  await requireAdmin();
  const data = parsePostForm(formData);

  const current = await prisma.post.findUniqueOrThrow({ where: { id } });
  let slug = current.slug;
  if (data.title !== current.title) {
    slug = await uniqueSlug(data.title, async (s) => {
      const found = await prisma.post.findFirst({
        where: { slug: s, NOT: { id } },
      });
      return !!found;
    });
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...data,
      slug,
      publishedAt: publishedAtForStatus(data.status, current.publishedAt),
    },
  });

  await revalidatePaths(post.slug, post.categoryId);
  if (current.slug !== post.slug) {
    revalidatePath(`/publicacao/${current.slug}`);
  }
  redirect("/admin/publicacoes");
}

export async function deletePost(id: string) {
  await requireAdmin();
  const post = await prisma.post.findUniqueOrThrow({ where: { id } });
  await prisma.post.delete({ where: { id } });
  await revalidatePaths(post.slug, post.categoryId);
}

async function revalidatePaths(slug: string, categoryId: string) {
  revalidatePath("/");
  revalidatePath("/admin/publicacoes");
  revalidatePath(`/publicacao/${slug}`);
  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (cat) revalidatePath(`/categoria/${cat.slug}`);
}
