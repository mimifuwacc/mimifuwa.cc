import { Schema } from "effect";

export const BlogPostSummary = Schema.Struct({
  slug: Schema.String,
  title: Schema.String,
  excerpt: Schema.String,
  date: Schema.String,
  tags: Schema.Array(Schema.String),
});

const BlogPost = Schema.extend(BlogPostSummary, Schema.Struct({ markdown: Schema.String }));

const BlogPostPage = Schema.Struct({
  posts: Schema.Array(BlogPostSummary),
  totalCount: Schema.Number,
});

const ApiErrorBody = Schema.Struct({
  error: Schema.Literal("not_found", "invalid_request", "internal_error"),
  message: Schema.String,
});

export const contentApiBaseUrl = (requestUrl: URL) => {
  const configuredUrl = import.meta.env.API_V2_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const hostname = requestUrl.hostname.toLowerCase();
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return (import.meta.env.API_V2_URL ?? "http://localhost:8787").replace(/\/$/, "");
  }
  if (hostname === "mimifuwacc-devel.m8c.workers.dev") {
    return "https://mimifuwacc-api-devel.m8c.workers.dev";
  }
  return "https://api.mimifuwa.cc";
};

export class BlogApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const request = async <A, I>(
  requestUrl: URL,
  path: string,
  schema: Schema.Schema<A, I>,
): Promise<A> => {
  const baseUrl = contentApiBaseUrl(requestUrl);
  const url = `${baseUrl}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response
      .json()
      .then(Schema.decodeUnknownPromise(ApiErrorBody))
      .catch(() => null);
    const message = body?.message ?? "Content API request failed";
    throw new BlogApiError(`${message} (${response.status} ${url})`, response.status);
  }
  return Schema.decodeUnknownPromise(schema)(await response.json());
};

export const getPosts = (requestUrl: URL, limit = 20) =>
  request(requestUrl, `/posts?limit=${limit}`, BlogPostPage);

export const getPost = (requestUrl: URL, slug: string) =>
  request(requestUrl, `/posts/${slug.split("/").map(encodeURIComponent).join("/")}`, BlogPost);
