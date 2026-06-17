import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  getCached,
  isCacheablePublicRead,
  isMutation,
  parseGraphQLBody,
  purgeForMutation,
  putCached,
} from "./graphql/cache";
import { createYogaServer } from "./graphql/yoga";
import { imagesRouter } from "./routes/images";
import { uploadRouter } from "./routes/upload";
import type { Context, Env } from "./types";

export function createApp() {
  const app = new Hono<{ Bindings: Env }>();

  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.route("/upload", uploadRouter);
  app.route("/images", imagesRouter);

  const yoga = createYogaServer();

  app.use("/graphql/*", async (c) => {
    const raw = c.req.raw;
    // ボディは複製から読む。raw 本体は未消費のまま Yoga へ渡す
    const bodyText = raw.method === "POST" ? await raw.clone().text() : "";
    const body = bodyText ? parseGraphQLBody(bodyText) : null;

    // handle のオーバーロード解決が依存型に左右されるため、呼び出し形を明示する
    const handle = yoga.handle as unknown as (
      request: Request,
      context: Context,
    ) => Promise<Response>;
    const runYoga = async () => handle(new Request(raw), { env: c.env, request: raw });

    // Cache API は Workers ランタイム限定（Node の dev サーバには caches が無い）
    const cache =
      typeof caches !== "undefined" ? (caches as unknown as { default: Cache }).default : null;

    // 公開読み取り → エッジキャッシュ
    if (cache && body && isCacheablePublicRead(raw, body)) {
      const cached = await getCached(cache, body);
      if (cached) return cached;

      const response = await runYoga();
      const text = await response.text();
      const headers = Object.fromEntries(response.headers.entries());

      const put = putCached(cache, body, response.status, headers, text);
      if (put) c.executionCtx.waitUntil(put);

      return new Response(text, {
        status: response.status,
        headers: { ...headers, "x-cache": "MISS" },
      });
    }

    const response = await runYoga();

    // ミューテーション → 実行後に関連する公開キャッシュをパージ
    if (cache && body && isMutation(body)) {
      c.executionCtx.waitUntil(purgeForMutation(cache, body));
    }

    return new Response(response.body, {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    });
  });

  return app;
}
