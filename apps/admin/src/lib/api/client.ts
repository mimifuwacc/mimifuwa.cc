import type { Post, PostInput, PostPage } from "./types";

const API_URL = process.env.API_URL ?? "http://localhost:8787";

const slugPath = (slug: string) => slug.split("/").map(encodeURIComponent).join("/");

const request = async <A>(path: string, init?: RequestInit): Promise<A> => {
  const secret = process.env.API_ADMIN_SECRET ?? "local-development";
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  headers.set("x-admin-secret", secret);
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `API request failed (${response.status})`);
  }
  return response.json() as Promise<A>;
};

export const adminApi = {
  listPosts: () => request<PostPage>("/admin/posts"),
  getPost: (slug: string) => request<Post>(`/admin/posts/${slugPath(slug)}`),
  createPost: (input: PostInput) =>
    request<Post>("/admin/posts", { method: "POST", body: JSON.stringify(input) }),
  updatePost: (slug: string, input: PostInput) =>
    request<Post>(`/admin/posts/${slugPath(slug)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deletePost: (slug: string) =>
    request<{ success: true; message: string }>(`/admin/posts/${slugPath(slug)}`, {
      method: "DELETE",
    }),
  archivePost: (slug: string) =>
    request<{ success: true; message: string }>(`/admin/posts/${slugPath(slug)}/archive`, {
      method: "POST",
    }),
};
