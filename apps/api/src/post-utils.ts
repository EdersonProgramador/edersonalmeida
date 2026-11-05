import type { PostStatus } from "@prisma/client";

export function estimateReadingMinutes(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function resolvePublishedAt(input: {
  status: PostStatus;
  publishedAt?: Date | null;
  scheduledFor?: Date | null;
}): Date | null {
  if (input.status !== "PUBLISHED") return input.publishedAt ?? null;
  if (input.publishedAt) return input.publishedAt;
  if (input.scheduledFor && input.scheduledFor <= new Date()) return input.scheduledFor;
  return new Date();
}
