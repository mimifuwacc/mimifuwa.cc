import { createApp } from "./app";
import { createDB } from "./db";
import { handleOgImage } from "./routes/og";
import type { Env } from "./types";

const app = createApp();

app.get("/og/*", async (c) => {
  const slug = c.req.path.replace(/^\/og\//, "");
  const db = createDB(c.env as Env);
  return handleOgImage(c.req.raw, slug, db);
});

export default app;
