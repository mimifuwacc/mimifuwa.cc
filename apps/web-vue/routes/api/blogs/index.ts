import { defineHandler } from "void";
import { storage } from "void/storage";
import { fixtures, isDevContent } from "../../../src/server-content";

export const GET = defineHandler(async (c) => {
  if (isDevContent) return c.json(fixtures.blogs);

  const revision = await getActiveRevision();
  if (!revision) return c.json([], 200, { "cache-control": "no-store" });

  const object = await storage.get(`content/revisions/${revision}/blogs/index.json`);
  if (!object) return c.json({ error: "content_unavailable" }, 503);

  return new Response(object.body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
});

async function getActiveRevision() {
  const object = await storage.get("content/active-revision.json");
  if (!object) return null;
  const value: unknown = await object.json();
  if (
    !value ||
    typeof value !== "object" ||
    !("revision" in value) ||
    typeof value.revision !== "string" ||
    !/^[a-f0-9]{7,64}$/.test(value.revision)
  ) {
    return null;
  }
  return value.revision;
}
