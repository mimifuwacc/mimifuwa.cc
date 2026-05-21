import { serve } from "@hono/node-server";
import { getPlatformProxy } from "wrangler";
import { createApp } from "./app";
import { createDB } from "./db";
import { handleOgImage } from "./routes/og";
import type { Env } from "./types";

(async () => {
  const { env, dispose } = await getPlatformProxy<Env>();

  const app = createApp();

  app.get("/og/:slug", async (c) => {
    const slug = c.req.param("slug");
    const db = createDB(env);
    return handleOgImage(slug, db);
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
