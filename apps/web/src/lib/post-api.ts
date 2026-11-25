import type { PostSummary } from "@/types/post";

export interface PostArticle extends PostSummary {
  html: string;
}

let postListRequest: Promise<PostSummary[]> | undefined;
const articleRequests = new Map<string, Promise<PostArticle | null>>();

export const getPostList = () => {
  postListRequest ??= fetch("/api/posts")
    .then(async (response) => {
      if (!response.ok) throw new Error("記事一覧を読み込めませんでした。");
      return (await response.json()) as PostSummary[];
    })
    .catch((error: unknown) => {
      postListRequest = undefined;
      throw error;
    });
  return postListRequest;
};

export const getPostArticle = (url: string) => {
  const normalized = `${url.replace(/^\/+|\/+$/g, "")}/`;
  const request = articleRequests.get(normalized);
  if (request) return request;

  const path = normalized
    .replace(/^posts\//, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const nextRequest = fetch(`/api/posts/${path}`)
    .then(async (response) => {
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("記事を読み込めませんでした。");
      return (await response.json()) as PostArticle;
    })
    .catch((error: unknown) => {
      articleRequests.delete(normalized);
      throw error;
    });
  articleRequests.set(normalized, nextRequest);
  return nextRequest;
};
