import { Effect } from "effect";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { getTwitterEmbed, normalizeTweet } from "./embed-cache";
import type { Env } from "./repository";

const payload = {
  id_str: "123",
  text: "cached text",
  user: { name: "Example", screen_name: "example" },
};

const environmentWith = (fetchedAt: number): Env =>
  ({
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => ({
            cache_key: "123",
            payload_json: JSON.stringify(payload),
            fetched_at: fetchedAt,
          }),
        }),
      }),
    },
  }) as unknown as Env;

afterEach(() => vi.restoreAllMocks());

describe("normalizeTweet", () => {
  it("converts a cached Twitter payload into the stable render contract", () => {
    expect(
      normalizeTweet("123", {
        text: "cached text",
        created_at: "2025-01-02T03:04:05Z",
        favorite_count: 12,
        conversation_count: 3,
        retweet_count: 4,
        entities: {
          urls: [
            {
              url: "https://t.co/example",
              expanded_url: "https://example.com/article",
            },
          ],
          media: [{ url: "https://t.co/media" }],
        },
        card: {
          url: "https://t.co/example",
          binding_values: {
            title: { string_value: "Example article" },
            description: { string_value: "Cached card" },
            domain: { string_value: "example.com" },
            summary_photo_image_large: {
              image_value: { url: "https://images.example.com/card.jpg" },
            },
          },
        },
        user: {
          name: "Example",
          screen_name: "example",
          profile_image_url_https: "https://pbs.twimg.com/avatar.jpg",
        },
        mediaDetails: [
          {
            media_url_https: "https://pbs.twimg.com/media.jpg",
            ext_alt_text: "description",
          },
        ],
      }),
    ).toEqual({
      provider: "twitter",
      id: "123",
      url: "https://twitter.com/example/status/123",
      text: "cached text",
      createdAt: "2025-01-02T03:04:05.000Z",
      author: {
        name: "Example",
        username: "example",
        avatarUrl: "https://pbs.twimg.com/avatar.jpg",
      },
      media: [
        {
          url: "https://pbs.twimg.com/media.jpg",
          alt: "description",
          sourceUrl: "https://t.co/media",
        },
      ],
      linkCard: {
        url: "https://example.com/article",
        sourceUrl: "https://t.co/example",
        title: "Example article",
        description: "Cached card",
        domain: "example.com",
        imageUrl: "https://images.example.com/card.jpg",
      },
      metrics: { likes: 12, replies: 3, retweets: 4 },
    });
  });

  it("serves a fresh D1 entry without contacting Twitter", async () => {
    const upstream = vi.spyOn(globalThis, "fetch");
    const result = await Effect.runPromise(
      getTwitterEmbed(
        environmentWith(Math.floor(Date.now() / 1000)),
        {} as ExecutionContext,
        "123",
      ),
    );

    expect(result.cache).toBe("hit");
    expect(result.tweet).toMatchObject({ provider: "twitter", text: "cached text" });
    expect(upstream).not.toHaveBeenCalled();
  });

  it("serves stale D1 data while a failed background refresh keeps the cache intact", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Twitter is unavailable"));
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    let background: Promise<unknown> | undefined;
    const executionContext = {
      waitUntil: (promise: Promise<unknown>) => {
        background = promise;
      },
    } as unknown as ExecutionContext;

    const result = await Effect.runPromise(
      getTwitterEmbed(environmentWith(0), executionContext, "123"),
    );
    await background;

    expect(result.cache).toBe("stale");
    expect(result.tweet).toMatchObject({ id: "123", text: "cached text" });
  });
});
