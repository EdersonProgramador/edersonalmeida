export type PostType = "ARTIGO" | "MATERIAL" | "AULA" | "PALESTRA" | "PODCAST" | "OUTRO";
export type PostStatus = "DRAFT" | "PUBLISHED";
export type ContentFormat = "HTML" | "MARKDOWN";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count?: { posts: number };
};

export type Author = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  contentFormat: ContentFormat;
  coverImage: string | null;
  type: PostType;
  status: PostStatus;
  publishedAt: string | null;
  categoryId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  author?: Author;
};
