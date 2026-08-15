import { Effect } from "effect";
import type { Env } from "./repository";

const maxAgeSeconds = 7 * 24 * 60 * 60;
const twitterProvider = "twitter";

interface CachedEmbedRow {
  readonly cache_key: string;
  readonly payload_json: string;
  readonly fetched_at: number;
}

export interface TwitterEmbedResult {
  readonly cache: "hit" | "miss" | "stale";
  readonly tweet: Record<string, unknown>;
}

export class EmbedCacheError extends Error {
  readonly _tag = "EmbedCacheError";
}

const fromPromise = <A>(message: string, run: () => Promise<A>) =>
  Effect.tryPromise({
    try: run,
    catch: (cause) => new EmbedCacheError(message, { cause }),
  });

const tokenFor = (id: string) =>
  ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");

const readCachedTweet = (env: Env, id: string) =>
  fromPromise("The embed cache is unavailable", () =>
    env.DB.prepare(
      "SELECT cache_key, payload_json, fetched_at FROM embed_cache WHERE provider = ? AND cache_key = ?",
    )
      .bind(twitterProvider, id)
      .first<CachedEmbedRow>(),
  );

const fetchTwitter = (id: string) =>
  fromPromise("Twitter is unavailable", async () => {
    const url = new URL("https://cdn.syndication.twimg.com/tweet-result");
    url.searchParams.set("id", id);
    url.searchParams.set("lang", "ja");
    url.searchParams.set("token", tokenFor(id));

    const response = await fetch(url, {
      headers: { "user-agent": "mimifuwa.cc embed cache/1.0" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`Twitter returned ${response.status}`);
    const payload: unknown = await response.json();
    if (
      !payload ||
      typeof payload !== "object" ||
      !("user" in payload) ||
      !payload.user ||
      typeof payload.user !== "object" ||
      !("text" in payload) ||
      typeof payload.text !== "string" ||
      ("__typename" in payload && payload.__typename === "TweetTombstone")
    ) {
      throw new Error("Twitter returned an unavailable or invalid tweet");
    }
    return payload as Record<string, unknown>;
  });

const refreshTweet = (env: Env, id: string) =>
  Effect.gen(function* () {
    const payload = yield* fetchTwitter(id);
    const user = payload.user as { screen_name?: unknown };
    const username = typeof user.screen_name === "string" ? user.screen_name : "i";
    yield* fromPromise("The embed cache could not be updated", () =>
      env.DB.prepare(
        `INSERT INTO embed_cache (provider, cache_key, source_url, payload_json, fetched_at)
         VALUES (?, ?, ?, ?, unixepoch())
         ON CONFLICT(provider, cache_key) DO UPDATE SET
           source_url = excluded.source_url,
           payload_json = excluded.payload_json,
           fetched_at = excluded.fetched_at`,
      )
        .bind(
          twitterProvider,
          id,
          `https://twitter.com/${username}/status/${id}`,
          JSON.stringify(payload),
        )
        .run(),
    );
    return payload;
  });

export const normalizeTweet = (
  id: string,
  payload: Record<string, unknown>,
): Record<string, unknown> => {
  const user =
    payload.user && typeof payload.user === "object"
      ? (payload.user as Record<string, unknown>)
      : {};
  const username = typeof user.screen_name === "string" ? user.screen_name : "i";
  const entities =
    payload.entities && typeof payload.entities === "object"
      ? (payload.entities as Record<string, unknown>)
      : {};
  const mediaEntities = Array.isArray(entities.media) ? entities.media : [];
  const mediaDetails = Array.isArray(payload.mediaDetails) ? payload.mediaDetails : [];
  const media = mediaDetails.flatMap((item: unknown, index) => {
    if (!item || typeof item !== "object") return [];
    const value = item as Record<string, unknown>;
    if (typeof value.media_url_https !== "string") return [];
    const originalInfo =
      value.original_info && typeof value.original_info === "object"
        ? (value.original_info as Record<string, unknown>)
        : undefined;
    const width =
      typeof originalInfo?.width === "number" && originalInfo.width > 0
        ? originalInfo.width
        : undefined;
    const height =
      typeof originalInfo?.height === "number" && originalInfo.height > 0
        ? originalInfo.height
        : undefined;
    const entity = mediaEntities[index];
    const sourceUrl =
      entity && typeof entity === "object" && "url" in entity && typeof entity.url === "string"
        ? entity.url
        : undefined;
    return [
      {
        url: value.media_url_https,
        alt: typeof value.ext_alt_text === "string" ? value.ext_alt_text : "",
        ...(sourceUrl ? { sourceUrl } : {}),
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
      },
    ];
  });
  const createdAt =
    typeof payload.created_at === "string" ? new Date(payload.created_at) : undefined;
  const card =
    payload.card && typeof payload.card === "object"
      ? (payload.card as Record<string, unknown>)
      : undefined;
  const bindings =
    card?.binding_values && typeof card.binding_values === "object"
      ? (card.binding_values as Record<string, unknown>)
      : {};
  const stringBinding = (name: string): string | undefined => {
    const binding = bindings[name];
    if (!binding || typeof binding !== "object" || !("string_value" in binding)) return undefined;
    return typeof binding.string_value === "string" ? binding.string_value : undefined;
  };
  const imageBinding = (name: string): string | undefined => {
    const binding = bindings[name];
    if (!binding || typeof binding !== "object" || !("image_value" in binding)) return undefined;
    const image = binding.image_value;
    return image && typeof image === "object" && "url" in image && typeof image.url === "string"
      ? image.url
      : undefined;
  };
  const cardUrl = typeof card?.url === "string" ? card.url : undefined;
  const entityUrls = Array.isArray(entities.urls) ? entities.urls : [];
  const matchingEntity = entityUrls.find(
    (entity: unknown) =>
      entity && typeof entity === "object" && "url" in entity && entity.url === cardUrl,
  ) as Record<string, unknown> | undefined;
  const expandedUrl =
    matchingEntity && typeof matchingEntity.expanded_url === "string"
      ? matchingEntity.expanded_url
      : cardUrl;
  const safeHttpUrl = (value: string | undefined): string | undefined => {
    if (!value) return undefined;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
    } catch {
      return undefined;
    }
  };
  const linkCardUrl = safeHttpUrl(expandedUrl);
  const linkCardSourceUrl = safeHttpUrl(cardUrl);
  const linkCardTitle = stringBinding("title");
  const linkCardImage = safeHttpUrl(
    imageBinding("summary_photo_image_large") ??
      imageBinding("photo_image_full_size_large") ??
      imageBinding("thumbnail_image_large"),
  );
  return {
    provider: twitterProvider,
    id,
    url: `https://twitter.com/${username}/status/${id}`,
    text: typeof payload.text === "string" ? payload.text : "",
    ...(createdAt && !Number.isNaN(createdAt.valueOf())
      ? { createdAt: createdAt.toISOString() }
      : {}),
    author: {
      name: typeof user.name === "string" ? user.name : username,
      username,
      ...(typeof user.profile_image_url_https === "string"
        ? { avatarUrl: user.profile_image_url_https }
        : {}),
    },
    media,
    ...(linkCardUrl && linkCardTitle
      ? {
          linkCard: {
            url: linkCardUrl,
            ...(linkCardSourceUrl ? { sourceUrl: linkCardSourceUrl } : {}),
            title: linkCardTitle,
            ...(stringBinding("description") ? { description: stringBinding("description") } : {}),
            ...(stringBinding("domain") ? { domain: stringBinding("domain") } : {}),
            ...(linkCardImage ? { imageUrl: linkCardImage } : {}),
            ...(stringBinding("summary_photo_image_alt_text")
              ? { imageAlt: stringBinding("summary_photo_image_alt_text") }
              : {}),
          },
        }
      : {}),
    metrics: {
      ...(typeof payload.favorite_count === "number" ? { likes: payload.favorite_count } : {}),
      ...(typeof payload.conversation_count === "number"
        ? { replies: payload.conversation_count }
        : {}),
      ...(typeof payload.retweet_count === "number" ? { retweets: payload.retweet_count } : {}),
    },
  };
};

const normalizeCachedTweet = (row: CachedEmbedRow): Record<string, unknown> | undefined => {
  try {
    const payload: unknown = JSON.parse(row.payload_json);
    if (!payload || typeof payload !== "object") return undefined;
    return normalizeTweet(row.cache_key, payload as Record<string, unknown>);
  } catch {
    return undefined;
  }
};

export const getTwitterEmbed = (
  env: Env,
  executionContext: ExecutionContext,
  id: string,
): Effect.Effect<TwitterEmbedResult, EmbedCacheError> =>
  Effect.gen(function* () {
    const cached = yield* readCachedTweet(env, id);
    const normalized = cached ? normalizeCachedTweet(cached) : undefined;
    const now = Math.floor(Date.now() / 1000);
    if (cached && normalized && now - cached.fetched_at < maxAgeSeconds) {
      return { cache: "hit", tweet: normalized };
    }

    if (cached && normalized) {
      yield* Effect.sync(() =>
        executionContext.waitUntil(
          Effect.runPromise(
            refreshTweet(env, id).pipe(
              Effect.catchAll((error) =>
                Effect.sync(() => console.warn(`Unable to refresh cached tweet ${id}`, error)),
              ),
            ),
          ),
        ),
      );
      return { cache: "stale", tweet: normalized };
    }

    const payload = yield* refreshTweet(env, id);
    return { cache: "miss", tweet: normalizeTweet(id, payload) };
  });
