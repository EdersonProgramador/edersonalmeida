const tokenKey = "ed_jwt";

export function getToken() {
  return localStorage.getItem(tokenKey);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(tokenKey, token);
  else localStorage.removeItem(tokenKey);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const msg =
      typeof err.error === "string"
        ? err.error
        : typeof err.message === "string"
          ? err.message
          : res.statusText || "Erro na requisição";
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>("/auth/me"),
  updateProfile: (body: Partial<User> & { currentPassword?: string; newPassword?: string }) =>
    request<User>("/auth/profile", { method: "PATCH", body: JSON.stringify(body) }),
  publicSettings: () => request<SiteSettings>("/public/settings"),
  categories: () => request<CategoryTree[]>("/public/categories"),
  posts: (params: Record<string, string | number | boolean | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") q.set(k, String(v));
    });
    return request<PostsPage>(`/public/posts?${q}`);
  },
  post: (slug: string) => request<Post>(`/public/posts/${slug}`),
  adminStats: () => request<AdminStats>("/admin/stats"),
  adminPosts: (params?: { status?: string; q?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.q?.trim()) q.set("q", params.q.trim());
    const qs = q.toString();
    return request<Post[]>(`/admin/posts${qs ? `?${qs}` : ""}`);
  },
  adminPost: (id: string) => request<Post>(`/admin/posts/${id}`),
  createPost: (body: PostInput) => request<Post>("/admin/posts", { method: "POST", body: JSON.stringify(body) }),
  updatePost: (id: string, body: Partial<PostInput>) =>
    request<Post>(`/admin/posts/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deletePost: (id: string) => request<void>(`/admin/posts/${id}`, { method: "DELETE" }),
  adminCategories: () => request<AdminCategory[]>("/admin/categories"),
  createCategory: (body: CategoryInput) =>
    request<Category>("/admin/categories", { method: "POST", body: JSON.stringify(body) }),
  updateCategory: (id: string, body: Partial<CategoryInput>) =>
    request<Category>(`/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteCategory: (id: string) => request<void>(`/admin/categories/${id}`, { method: "DELETE" }),
  adminSettings: () => request<SiteSettingsFull>("/admin/settings"),
  updateSettings: (body: Partial<SiteSettingsFull>) =>
    request<SiteSettingsFull>("/admin/settings", { method: "PATCH", body: JSON.stringify(body) }),
  upload: async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const token = getToken();
    const res = await fetch("/admin/uploads", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) throw new Error("Falha no upload");
    return res.json() as Promise<{ url: string }>;
  },
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  bio?: string | null;
  jobTitle?: string | null;
  oabNumber?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  linkedInUrl?: string | null;
  instagramUrl?: string | null;
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  siteDescription: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  contactEmail?: string | null;
  defaultMetaTitle?: string | null;
  defaultMetaDescription?: string | null;
  defaultOgImage?: string | null;
  twitterHandle?: string | null;
  googleSiteVerification?: string | null;
  gaMeasurementId?: string | null;
  gtmContainerId?: string | null;
  adsEnabled: boolean;
  googleAdsClientId?: string | null;
  adsHeadHtml?: string | null;
  cookieConsentEnabled: boolean;
  cookieNoticeText?: string | null;
  legalDisclaimer?: string | null;
  postsPerPage: number;
  allowPublicSearch: boolean;
  maintenanceMode: boolean;
};

export type SiteSettingsFull = SiteSettings & {
  privacyPolicyHtml?: string | null;
  termsHtml?: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  accentColor?: string | null;
  parentId?: string | null;
  sortOrder?: number;
};

export type CategoryTree = Category & {
  postCount?: number;
  children: Category[];
};

export type AdminCategory = CategoryTree & {
  parent?: Category | null;
  _count?: { posts: number };
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  contentFormat: "HTML" | "MARKDOWN";
  coverImage?: string | null;
  type: string;
  status: string;
  featured: boolean;
  publishedAt?: string | null;
  scheduledFor?: string | null;
  readingMinutes?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex: boolean;
  categoryId: string;
  category: Category & { parent?: Category | null };
  author: Pick<User, "id" | "name" | "avatarUrl" | "jobTitle" | "oabNumber">;
  createdAt?: string;
  updatedAt?: string;
};

export type PostsPage = { items: Post[]; total: number; page: number; pageSize: number };

export type PostInput = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string;
  contentFormat?: "HTML" | "MARKDOWN";
  coverImage?: string | null;
  type?: string;
  status?: string;
  featured?: boolean;
  publishedAt?: string | null;
  scheduledFor?: string | null;
  categoryId: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
};

export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  accentColor?: string | null;
  sortOrder?: number;
  parentId?: string | null;
};

export type AdminStats = {
  published: number;
  draft: number;
  review: number;
  scheduled: number;
  categories: number;
};
