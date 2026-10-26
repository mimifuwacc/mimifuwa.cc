import { defineHandler } from "void";
import { storage } from "void/storage";
import { fixtures, isDevContent } from "../../src/server-content";

export const GET = defineHandler(async () => {
  if (isDevContent) return Response.json(fixtures.searchIndex);

  const revisionObject = await storage.get("content/active-revision.json");
  if (!revisionObject) return Response.json({ documents: [] });
  const value: unknown = await revisionObject.json();
  const revision =
    value && typeof value === "object" && "revision" in value && typeof value.revision === "string"
      ? value.revision
      : "";
  if (!/^[a-f0-9]{7,64}$/.test(revision)) return Response.json({ documents: [] });

  const object = await storage.get(`content/revisions/${revision}/search-index.json`);
  if (!object) return Response.json({ documents: [] });
  return new Response(object.body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
});
