import { defineHandler } from "void";
import { storage } from "void/storage";
import { fixtures, isDevContent } from "../../../src/server-content";

interface WorkRecord {
  url: string;
  [key: string]: unknown;
}

export const GET = defineHandler(async (c) => {
  if (isDevContent) {
    const slug = (c.req.param("slug") ?? "").replace(/^\/+|\/+$/g, "");
    const work = fixtures.workContent.find((item) => item.url === `/works/${slug}/`);
    return work ? c.json(work) : c.json({ error: "not_found" }, 404);
  }

  const revisionObject = await storage.get("content/active-revision.json");
  if (!revisionObject) return c.json({ error: "not_found" }, 404);
  const value: unknown = await revisionObject.json();
  const revision =
    value && typeof value === "object" && "revision" in value && typeof value.revision === "string"
      ? value.revision
      : "";
  if (!/^[a-f0-9]{7,64}$/.test(revision)) return c.json({ error: "not_found" }, 404);

  const object = await storage.get(`content/revisions/${revision}/works/content.json`);
  if (!object) return c.json({ error: "content_unavailable" }, 503);
  const works = (await object.json()) as WorkRecord[];
  const slug = (c.req.param("slug") ?? "").replace(/^\/+|\/+$/g, "");
  const workUrl = `/works/${slug}/`;
  const work = works.find((item) => item.url === workUrl);
  if (!work) return c.json({ error: "not_found" }, 404);

  if (typeof work.html === "string") {
    work.html = work.html.replace(
      /(["'(])\/assets\/(ox-content-[^"')\s]+)/g,
      "$1/api/content/assets/assets/$2",
    );
  }

  return c.json(work, 200, {
    "cache-control": "public, max-age=60, stale-while-revalidate=300",
  });
});
