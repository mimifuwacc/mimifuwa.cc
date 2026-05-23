import { Hono } from "hono";
import type { Env } from "../types";

export const imagesRouter = new Hono<{ Bindings: Env }>();

imagesRouter.get("/:path{.+}", async (c) => {
  const key = `images/${c.req.param("path")}`;
  const obj = await c.env.R2.get(key);

  if (!obj) return c.json({ error: "Not found" }, 404);

  const headers = new Headers({
    "content-type": obj.httpMetadata?.contentType ?? "application/octet-stream",
    "cache-control": "public, max-age=31536000, immutable",
  });

  return new Response(obj.body, { headers });
});
