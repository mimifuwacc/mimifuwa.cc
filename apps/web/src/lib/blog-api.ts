import type { BlogSummary } from "@/types/blog";

export interface BlogArticle extends BlogSummary {
  html: string;
}

let blogListRequest: Promise<BlogSummary[]> | undefined;
const articleRequests = new Map<string, Promise<BlogArticle | null>>();

export const getBlogList = () => {
  blogListRequest ??= fetch("/api/blogs")
    .then(async (response) => {
      if (!response.ok) throw new Error("ブログ一覧を読み込めませんでした。");
      return (await response.json()) as BlogSummary[];
    })
    .catch((error: unknown) => {
      blogListRequest = undefined;
      throw error;
    });
  return blogListRequest;
};

export const getBlogArticle = (url: string) => {
  const normalized = `${url.replace(/^\/+|\/+$/g, "")}/`;
  const request = articleRequests.get(normalized);
  if (request) return request;

  const path = normalized
    .replace(/^blogs\//, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const nextRequest = fetch(`/api/blogs/${path}`)
    .then(async (response) => {
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("記事を読み込めませんでした。");
      return (await response.json()) as BlogArticle;
    })
    .catch((error: unknown) => {
      articleRequests.delete(normalized);
      throw error;
    });
  articleRequests.set(normalized, nextRequest);
  return nextRequest;
};
