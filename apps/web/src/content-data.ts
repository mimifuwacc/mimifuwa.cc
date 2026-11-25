import type { ArticlePage } from "./content-theme";

interface OxContentEntry {
  path: string;
  title: string;
  description?: string;
  frontmatter: Record<string, unknown>;
  html?: string;
}

interface OxContentCollections {
  posts: OxContentEntry[];
  works: OxContentEntry[];
}

const asString = (value: unknown) => (typeof value === "string" ? value : undefined);
const asStringList = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
const getDateTimestamp = (value: unknown) => {
  const timestamp =
    value instanceof Date ? value.getTime() : typeof value === "string" ? Date.parse(value) : NaN;
  return Number.isFinite(timestamp) ? timestamp : undefined;
};
const sortByDate = (entries: OxContentEntry[]) =>
  entries
    .map((entry, index) => ({
      entry,
      index,
      pinned: entry.frontmatter.pinned === true,
      timestamp: getDateTimestamp(entry.frontmatter.date),
    }))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.timestamp === undefined) return b.timestamp === undefined ? a.index - b.index : 1;
      if (b.timestamp === undefined) return -1;
      return b.timestamp - a.timestamp || a.index - b.index;
    })
    .map(({ entry }) => entry);
export const rewriteContentAssetUrls = (html: string) => {
  const withLocalAssets = html.replace(
    /(["'(])\/assets\/(ox-content-[^"')\s]+)/g,
    "$1/api/content/assets/assets/$2",
  );

  // The image proxy's allowlist is published with deploy content. During local
  // development, use the original remote image URL so cards remain previewable.
  if (import.meta.env.DEV) return withLocalAssets;

  return withLocalAssets.replace(
    /(<img\b(?=[^>]*\bclass=["'][^"']*\box-ogp-image\b[^"']*["'])[^>]*\bsrc=["'])(https:\/\/[^"']+)(["'])/gi,
    (_image, prefix: string, source: string, quote: string) =>
      `${prefix}/api/og-image?url=${encodeURIComponent(source.replace(/&amp;/g, "&"))}${quote}`,
  );
};
const toArticlePage = (section: ArticlePage["section"], entry: OxContentEntry): ArticlePage => {
  const frontmatter = entry.frontmatter ?? {};
  const date = frontmatter.date;
  return {
    title: entry.title,
    navTitle: asString(frontmatter.navTitle) ?? entry.title,
    description: entry.description ?? asString(frontmatter.excerpt),
    date: date instanceof Date ? date.toISOString().slice(0, 10) : asString(date),
    pinned: frontmatter.pinned === true,
    tags: asStringList(frontmatter.tags),
    html: entry.html ?? "",
    url: `${entry.path.replace(/\/+$/, "") || `/${section}`}/`,
    section,
    externalUrl: asString(frontmatter.url),
    technologies: asStringList(frontmatter.technologies),
  };
};

export const articlePagesFromCollections = (collections: OxContentCollections): ArticlePage[] => [
  ...sortByDate(collections.posts).map((entry) => toArticlePage("posts", entry)),
  ...sortByDate(collections.works).map((entry) => toArticlePage("works", entry)),
];

export function createContentData(pages: ArticlePage[]) {
  const posts = pages.filter((page) => page.section === "posts" && page.url !== "/posts/");
  const works = pages.filter((page) => page.section === "works");

  return {
    posts: posts.map(({ title, description, date, tags, url }) => ({
      title,
      description,
      date,
      tags,
      url,
    })),
    postContent: posts.map(({ title, description, date, tags, url, html }) => ({
      title,
      description,
      date,
      tags,
      url,
      html,
    })),
    works: works
      .map(({ title, description, date, pinned, technologies, tags, externalUrl, url }) => ({
        title,
        description,
        date,
        pinned,
        technologies: technologies ?? tags ?? [],
        externalUrl,
        url,
      }))
      .filter((work) => typeof work.url === "string" && typeof work.externalUrl === "string"),
    workContent: works
      .map(({ title, description, date, pinned, technologies, tags, externalUrl, url, html }) => ({
        title,
        description,
        date,
        pinned,
        technologies: technologies ?? tags ?? [],
        externalUrl,
        url,
        html,
      }))
      .filter((work) => typeof work.externalUrl === "string"),
  };
}

export function getLocalContentResponse(
  pathname: string,
  data: ReturnType<typeof createContentData>,
) {
  if (pathname === "/api/posts") return { body: data.posts };
  if (pathname === "/api/works") return { body: data.works };

  const match = pathname.match(/^\/api\/(posts|works)\/(.+)$/);
  if (!match) return null;

  const [, section, slug] = match;
  const url = `/${section}/${decodeURIComponent(slug).replace(/\/+$/, "")}/`;
  const content = section === "posts" ? data.postContent : data.workContent;
  const item = content.find((entry) => entry.url === url);
  return item ? { body: item } : { status: 404, body: { error: "not_found" } };
}
