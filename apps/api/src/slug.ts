import slugify from "slugify";

export function toSlug(text: string): string {
  return slugify(text, { lower: true, strict: true, locale: "pt" });
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = toSlug(base);
  if (!(await exists(slug))) return slug;
  let n = 2;
  while (await exists(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}
