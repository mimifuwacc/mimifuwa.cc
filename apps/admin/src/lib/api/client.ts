import type { Post, PostInput, PostPage } from "./types";

const slugPath = (slug: string) => slug.split("/").map(encodeURIComponent).join("/");

const request = async <A>(path: string, init?: RequestInit): Promise<A> => {
  // Never let the encrypted deployment secret get sent to the local API.
  // The local API is started by Wrangler with API_ADMIN_SECRET=local-development.
  const isDev = import.meta.env.DEV;
  const secret = isDev ? "local-development" : (process.env.ADMIN_SECRET ?? "");
  const apiUrl = isDev
    ? "http://localhost:8787"
    : (import.meta.env.VITE_API_URL ?? "http://localhost:8787");
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  headers.set("x-admin-secret", secret);
  const response = await fetch(`${apiUrl}${path}`, {
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
