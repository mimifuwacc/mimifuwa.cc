import { Hono } from "hono";
import type { Env } from "../types";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];

export const uploadRouter = new Hono<{ Bindings: Env }>();

uploadRouter.post("/image", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return c.json({ error: "No file provided" }, 400);
  if (!ALLOWED_TYPES.includes(file.type)) return c.json({ error: "Invalid file type" }, 400);
  if (file.size > MAX_SIZE) return c.json({ error: "File too large (max 10MB)" }, 400);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const r2Key = `images/${filename}`;

  await c.env.R2.put(r2Key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  const base = c.env.API_BASE_URL ?? new URL(c.req.url).origin;
  return c.json({ url: `${base}/images/${filename}` });
});
