import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import sanitizeHtml from "sanitize-html";
import type { Post } from "../types";
import { mediaUrl } from "../api";

const sanitizeOpts: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height"],
    a: ["href", "name", "target", "rel"],
  },
};

function resolveHtml(html: string) {
  return html.replace(/src="(\/uploads\/[^"]+)"/g, (_, p) => {
    const url = mediaUrl(p);
    return url ? `src="${url}"` : _;
  });
}

export function PostContent({ post }: { post: Post }) {
  if (post.contentFormat === "MARKDOWN") {
    return (
      <div className="prose prose-stone max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
    );
  }

  const html = sanitizeHtml(resolveHtml(post.content), sanitizeOpts);
  return <div className="prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}
