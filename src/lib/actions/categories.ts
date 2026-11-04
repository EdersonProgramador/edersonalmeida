"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toSlug, uniqueSlug } from "@/lib/slug";

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;

  if (!name) {
    throw new Error("Nome obrigatório");
  }

  const slug = await uniqueSlug(name, async (s) => {
    const found = await prisma.category.findUnique({ where: { slug: s } });
    return !!found;
  });

  await prisma.category.create({
    data: { name, slug, description, sortOrder },
  });

  revalidatePath("/");
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;

  if (!name) throw new Error("Nome obrigatório");

  const current = await prisma.category.findUniqueOrThrow({ where: { id } });
  let slug = current.slug;
  if (toSlug(name) !== toSlug(current.name)) {
    slug = await uniqueSlug(name, async (s) => {
      const found = await prisma.category.findFirst({
        where: { slug: s, NOT: { id } },
      });
      return !!found;
    });
  }

  await prisma.category.update({
    where: { id },
    data: { name, slug, description, sortOrder },
  });

  revalidatePath("/");
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  const count = await prisma.post.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error("Remova ou mova as publicações desta categoria antes de excluí-la.");
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/categorias");
}
