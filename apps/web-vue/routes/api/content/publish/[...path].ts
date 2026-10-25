import { defineHandler } from "void";
import { env } from "void/env";
import { storage } from "void/storage";

export const POST = defineHandler(async (c) => {
  const expected = env.CONTENT_PUBLISH_TOKEN;
  if (!expected || c.req.header("Authorization") !== `Bearer ${expected}`) {
    return c.json({ error: "unauthorized" }, 401);
  }
  const revision = c.req.header("X-Content-Revision") ?? "";
  const path = (c.req.param("path") ?? "").replace(/^\/+/, "");
  if (!/^[a-f0-9]{7,64}$/.test(revision) || !isPublishablePath(path)) {
    return c.json({ error: "invalid_request" }, 400);
  }

  await storage.put(`content/revisions/${revision}/${path}`, await c.req.raw.arrayBuffer(), {
    httpMetadata: { contentType: c.req.header("Content-Type") ?? "application/octet-stream" },
  });
  return c.json({ uploaded: path });
});

function isPublishablePath(path: string) {
  return (
    path.length > 0 &&
    !path.split("/").some((part) => part === ".." || part === ".") &&
    (path === "search-index.json" ||
      path.startsWith("blogs/") ||
      path.startsWith("works/") ||
      /^assets\/ox-content-/.test(path))
  );
}
