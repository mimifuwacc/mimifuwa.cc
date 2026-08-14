import { env } from "cloudflare:workers";
import { Effect, Schema } from "effect";

export interface TwitterEmbed {
  readonly provider: "twitter";
  readonly id: string;
  readonly url: string;
  readonly text: string;
  readonly createdAt?: string;
  readonly author: {
    readonly name: string;
    readonly username: string;
    readonly avatarUrl?: string;
  };
  readonly media: readonly {
    readonly url: string;
    readonly alt: string;
    readonly sourceUrl?: string;
  }[];
  readonly linkCard?: {
    readonly url: string;
    readonly sourceUrl?: string;
    readonly title: string;
    readonly description?: string;
    readonly domain?: string;
    readonly imageUrl?: string;
    readonly imageAlt?: string;
  };
  readonly metrics: {
    readonly likes?: number;
    readonly replies?: number;
    readonly retweets?: number;
  };
}

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
  const configuredUrl = import.meta.env.API_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const hostname = requestUrl.hostname.toLowerCase();
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return (import.meta.env.API_URL ?? "http://localhost:8787").replace(/\/$/, "");
  }
  if (hostname === "mimifuwacc-dev.m8c.workers.dev") {
    return "https://mimifuwacc-api-dev.m8c.workers.dev";
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
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(requestUrl.hostname.toLowerCase());
  const response = isLocal ? await fetch(url) : await env.CONTENT_API.fetch(url);
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

const getTwitterEmbedProgram = (requestUrl: URL, id: string) => {
  if (!/^\d{1,40}$/.test(id)) return undefined;
  const baseUrl = contentApiBaseUrl(requestUrl);
  const url = `${baseUrl}/embeds/twitter/${id}`;
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(requestUrl.hostname.toLowerCase());
  return Effect.tryPromise({
    try: async () => {
      const response = isLocal ? await fetch(url) : await env.CONTENT_API.fetch(url);
      if (!response.ok) return undefined;
      const value: unknown = await response.json();
      if (
        !value ||
        typeof value !== "object" ||
        !("provider" in value) ||
        value.provider !== "twitter" ||
        !("author" in value) ||
        !("text" in value)
      ) {
        return undefined;
      }
      return value as TwitterEmbed;
    },
    catch: () => undefined,
  }).pipe(Effect.catchAll(() => Effect.succeed(undefined)));
};

export const getTwitterEmbed = (requestUrl: URL, id: string): Promise<TwitterEmbed | undefined> => {
  const program = getTwitterEmbedProgram(requestUrl, id);
  return program ? Effect.runPromise(program) : Promise.resolve(undefined);
};
