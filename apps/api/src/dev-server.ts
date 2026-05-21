import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { serve } from "@hono/node-server";
import { getPlatformProxy } from "wrangler";
import { Resvg } from "@resvg/resvg-js";
import { createApp } from "./app";
import { createDB } from "./db";
import { handleOgImage, type ResvgConstructor } from "./routes/og";
import type { Env } from "./types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontData = readFileSync(
  join(__dirname, "routes/fonts/NotoSansJP-Bold.ttf"),
).buffer as ArrayBuffer;

(async () => {
  const { env, dispose } = await getPlatformProxy<Env>();

  const app = createApp();

  app.get("/og/:slug", async (c) => {
    const slug = c.req.param("slug");
    const db = createDB(env);
    return handleOgImage(slug, db, Resvg as unknown as ResvgConstructor, fontData);
  });

  const server = serve(
    {
      fetch: (request) => app.fetch(request, env),
      port: 8000,
    },
    () => console.log("API running on http://localhost:8000"),
  );

  process.on("SIGINT", async () => {
    await dispose();
    server.close();
  });
})();
