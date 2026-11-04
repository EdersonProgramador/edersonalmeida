import type { ContentFormat } from "@prisma/client";
import { MarkdownContent } from "@/components/MarkdownContent";
import { sanitizeHtmlContent } from "@/lib/sanitize";

export function PostContent({
  content,
  format,
}: {
  content: string;
  format: ContentFormat;
}) {
  if (format === "MARKDOWN") {
    return <MarkdownContent content={content} />;
  }

  const safe = sanitizeHtmlContent(content);
  return (
    <div
      className="prose prose-stone prose-lg max-w-none prose-headings:font-display prose-headings:font-normal prose-a:text-accent prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
