import type { ApiErrorBody, BlogPost, BlogPostPage } from "@mimifuwacc/blog-domain";

const baseUrl = (import.meta.env.API_V2_URL ?? "http://localhost:8787").replace(/\/$/, "");

export class BlogApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const request = async <A>(path: string): Promise<A> => {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new BlogApiError(body?.message ?? "Content API request failed", response.status);
  }
  return response.json() as Promise<A>;
};

export const getPosts = (limit = 20) => request<BlogPostPage>(`/posts?limit=${limit}`);

export const getPost = (slug: string) =>
  request<BlogPost>(`/posts/${slug.split("/").map(encodeURIComponent).join("/")}`);
