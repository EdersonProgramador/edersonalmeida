export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function matchesSearch(haystack: string, needle: string): boolean {
  const q = normalizeSearchText(needle);
  if (!q) return true;
  return normalizeSearchText(haystack).includes(q);
}
