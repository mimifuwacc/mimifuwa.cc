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

const baseUrl = (import.meta.env.API_V2_URL ?? "http://localhost:8787").replace(/\/$/, "");
export const ogpEndpoint = `${baseUrl}/ogp`;

export class BlogApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const request = async <A, I>(path: string, schema: Schema.Schema<A, I>): Promise<A> => {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    const body = await response
      .json()
      .then(Schema.decodeUnknownPromise(ApiErrorBody))
      .catch(() => null);
    throw new BlogApiError(body?.message ?? "Content API request failed", response.status);
  }
  return Schema.decodeUnknownPromise(schema)(await response.json());
};

export const getPosts = (limit = 20) => request(`/posts?limit=${limit}`, BlogPostPage);

export const getPost = (slug: string) =>
  request(`/posts/${slug.split("/").map(encodeURIComponent).join("/")}`, BlogPost);
