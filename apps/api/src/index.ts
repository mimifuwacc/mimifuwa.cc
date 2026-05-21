import { createApp } from "./app";
import { createDB } from "./db";
import { handleOgImage } from "./routes/og";
import type { Env } from "./types";

const app = createApp();

app.get("/og/:slug", async (c) => {
  const slug = c.req.param("slug");
  const db = createDB(c.env as Env);
  return handleOgImage(slug, db);
});

export default app;
