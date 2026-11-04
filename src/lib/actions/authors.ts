"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toSlug, uniqueSlug } from "@/lib/slug";

export async function createAuthor(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || null;

  if (!name) throw new Error("Nome obrigatório");

  const slug = await uniqueSlug(name, async (s) => {
    const found = await prisma.author.findUnique({ where: { slug: s } });
    return !!found;
  });

  await prisma.author.create({ data: { name, slug, bio, avatarUrl } });
  revalidatePath("/admin/autores");
  redirect("/admin/autores");
}

export async function updateAuthor(id: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || null;

  if (!name) throw new Error("Nome obrigatório");

  const current = await prisma.author.findUniqueOrThrow({ where: { id } });
  let slug = current.slug;
  if (toSlug(name) !== toSlug(current.name)) {
    slug = await uniqueSlug(name, async (s) => {
      const found = await prisma.author.findFirst({
        where: { slug: s, NOT: { id } },
      });
      return !!found;
    });
  }

  await prisma.author.update({
    where: { id },
    data: { name, slug, bio, avatarUrl },
  });
  revalidatePath("/admin/autores");
  redirect("/admin/autores");
}

export async function deleteAuthor(id: string) {
  await requireAdmin();
  const count = await prisma.post.count({ where: { authorId: id } });
  if (count > 0) {
    throw new Error("Reatribua ou remova as publicações deste autor antes de excluí-lo.");
  }
  await prisma.author.delete({ where: { id } });
  revalidatePath("/admin/autores");
}
