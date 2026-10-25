import { defineHandler } from "void";
import { storage } from "void/storage";

interface BlogArticle {
  url: string;
  [key: string]: unknown;
}

export const GET = defineHandler(async (c) => {
  const revisionObject = await storage.get("content/active-revision.json");
  if (!revisionObject) return c.json({ error: "not_found" }, 404);
  const value: unknown = await revisionObject.json();
  const revision =
    value && typeof value === "object" && "revision" in value && typeof value.revision === "string"
      ? value.revision
      : "";
  if (!/^[a-f0-9]{7,64}$/.test(revision)) return c.json({ error: "not_found" }, 404);

  const object = await storage.get(`content/revisions/${revision}/blogs/content.json`);
  if (!object) return c.json({ error: "content_unavailable" }, 503);
  const articles = (await object.json()) as BlogArticle[];
  const slug = c.req.param("slug") ?? "";
  const url = `/blogs/${slug.replace(/^\/+|\/+$/g, "")}/`;
  const article = articles.find((item) => item.url === url);
  if (!article) return c.json({ error: "not_found" }, 404);

  if (typeof article.html === "string") {
    article.html = article.html.replace(
      /(["'(])\/assets\/(ox-content-[^"')\s]+)/g,
      "$1/api/content/assets/assets/$2",
    );
  }

  return c.json(article, 200, {
    "cache-control": "public, max-age=60, stale-while-revalidate=300",
  });
});
