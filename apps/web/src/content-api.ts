import { readActiveContentJson } from "@/content-store";
import { fixtures, isLocalContent, siteContent as localSiteContent } from "@/server-content";
import { emptySiteContent, type SiteContent } from "@/types/site-content";

type Section = "blogs" | "works";
type ContentRecord = { url: string; html?: unknown };

const cacheControl = "public, max-age=60, stale-while-revalidate=300";
const rewriteContentAssetUrls = (html: string) =>
  html.replace(/(["'(])\/assets\/(ox-content-[^"')\s]+)/g, "$1/api/content/assets/assets/$2");
const json = (value: unknown, status = 200, cache?: string) =>
  Response.json(value, {
    status,
    headers: cache ? { "cache-control": cache } : undefined,
  });

export async function listContent(section: Section) {
  if (isLocalContent) return json(fixtures[section]);

  const result = await readActiveContentJson(`${section}/index.json`);
  if (result.status === "unpublished") return json([], 200, "no-store");
  if (result.status === "missing") return json({ error: "content_unavailable" }, 503);
  return json(result.value, 200, cacheControl);
}

export async function getContent(section: Section, slug: string) {
  const articleUrl = `/${section}/${slug.replace(/^\/+|\/+$/g, "")}/`;
  if (isLocalContent) {
    const pages = section === "blogs" ? fixtures.blogContent : fixtures.workContent;
    const page = pages.find((item) => item.url === articleUrl);
    return page ? json(page) : json({ error: "not_found" }, 404);
  }

  const result = await readActiveContentJson<ContentRecord[]>(`${section}/content.json`);
  if (result.status === "unpublished") return json({ error: "not_found" }, 404);
  if (result.status === "missing") return json({ error: "content_unavailable" }, 503);

  const page = result.value.find((item) => item.url === articleUrl);
  if (!page) return json({ error: "not_found" }, 404);
  return json(
    typeof page.html === "string" ? { ...page, html: rewriteContentAssetUrls(page.html) } : page,
    200,
    cacheControl,
  );
}

export async function getSearchIndex() {
  if (isLocalContent) return json(fixtures.searchIndex);

  const result = await readActiveContentJson("search-index.json");
  return result.status === "ready"
    ? json(result.value, 200, cacheControl)
    : json({ documents: [] });
}

export async function getSiteContent() {
  if (isLocalContent) return { value: localSiteContent, available: true };

  const result = await readActiveContentJson<SiteContent>("site-content.json");
  return result.status === "ready"
    ? { value: result.value, available: true }
    : { value: emptySiteContent, available: false };
}
