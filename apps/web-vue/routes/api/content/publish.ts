import { defineHandler } from "void";
import { env } from "void/env";
import { storage } from "void/storage";
import { isDevContent } from "../../../src/server-content";

export const POST = defineHandler(async (c) => {
  if (isDevContent) return c.notFound();

  const expected = env.CONTENT_PUBLISH_TOKEN;
  if (!expected || c.req.header("Authorization") !== `Bearer ${expected}`) {
    return c.json({ error: "unauthorized" }, 401);
  }
  const body: unknown = await c.req.json().catch(() => null);
  const revision =
    body && typeof body === "object" && "revision" in body && typeof body.revision === "string"
      ? body.revision
      : "";
  if (!/^[a-f0-9]{7,64}$/.test(revision)) return c.json({ error: "invalid_request" }, 400);

  const index = await storage.head(`content/revisions/${revision}/blogs/index.json`);
  const content = await storage.head(`content/revisions/${revision}/blogs/content.json`);
  const works = await storage.head(`content/revisions/${revision}/works/index.json`);
  const workContent = await storage.head(`content/revisions/${revision}/works/content.json`);
  if (!index || !content || !works || !workContent)
    return c.json({ error: "incomplete_revision" }, 409);

  await storage.put("content/active-revision.json", JSON.stringify({ revision }), {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
  });
  return c.json({ published: revision });
});
