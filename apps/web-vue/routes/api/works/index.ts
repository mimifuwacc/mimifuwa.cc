import { defineHandler } from "void";
import { storage } from "void/storage";
import { fixtures, isDevContent } from "../../../src/server-content";

export const GET = defineHandler(async (c) => {
  if (isDevContent) return c.json(fixtures.works);

  const revisionObject = await storage.get("content/active-revision.json");
  if (!revisionObject) return c.json([], 200, { "cache-control": "no-store" });
  const value: unknown = await revisionObject.json();
  const revision =
    value && typeof value === "object" && "revision" in value && typeof value.revision === "string"
      ? value.revision
      : "";
  if (!/^[a-f0-9]{7,64}$/.test(revision)) return c.json([], 200, { "cache-control": "no-store" });

  const object = await storage.get(`content/revisions/${revision}/works/index.json`);
  if (!object) return c.json({ error: "content_unavailable" }, 503);

  return new Response(object.body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
});
