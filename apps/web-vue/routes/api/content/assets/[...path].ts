import { defineHandler } from "void";
import { storage } from "void/storage";
import { isDevContent } from "../../../../src/server-content";

export const GET = defineHandler(async (c) => {
  if (isDevContent) return c.notFound();

  const revisionObject = await storage.get("content/active-revision.json");
  if (!revisionObject) return c.notFound();
  const value: unknown = await revisionObject.json();
  const revision =
    value && typeof value === "object" && "revision" in value && typeof value.revision === "string"
      ? value.revision
      : "";
  if (!/^[a-f0-9]{7,64}$/.test(revision)) return c.notFound();

  const path = (c.req.param("path") ?? "").replace(/^\/+/, "");
  if (!/^assets\/ox-content-[a-zA-Z0-9._/-]+$/.test(path) || path.includes("..")) {
    return c.notFound();
  }
  const object = await storage.get(`content/revisions/${revision}/${path}`);
  if (!object) return c.notFound();
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
});
