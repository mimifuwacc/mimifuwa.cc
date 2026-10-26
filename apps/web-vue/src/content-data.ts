import type { ArticlePage } from "./content-theme";
import { markdownToText } from "./content-theme";

interface OxContentEntry {
  path: string;
  title: string;
  description?: string;
  frontmatter: Record<string, unknown>;
  html?: string;
}

interface OxContentCollections {
  blogs: OxContentEntry[];
  works: OxContentEntry[];
}

const asString = (value: unknown) => (typeof value === "string" ? value : undefined);
const asStringList = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const toArticlePage = (section: ArticlePage["section"], entry: OxContentEntry): ArticlePage => {
  const frontmatter = entry.frontmatter ?? {};
  const date = frontmatter.date;
  return {
    title: entry.title,
    navTitle: asString(frontmatter.navTitle) ?? entry.title,
    description: entry.description ?? asString(frontmatter.excerpt),
    date: date instanceof Date ? date.toISOString().slice(0, 10) : asString(date),
    tags: asStringList(frontmatter.tags),
    html: entry.html ?? "",
    url: `${entry.path.replace(/\/+$/, "") || `/${section}`}/`,
    section,
    externalUrl: asString(frontmatter.url),
    technologies: asStringList(frontmatter.technologies),
  };
};

export const articlePagesFromCollections = (collections: OxContentCollections): ArticlePage[] => [
  ...collections.blogs.map((entry) => toArticlePage("blogs", entry)),
  ...collections.works.map((entry) => toArticlePage("works", entry)),
];

export function createContentData(pages: ArticlePage[]) {
  const blogs = pages.filter((page) => page.section === "blogs" && page.url !== "/blogs/");
  const works = pages.filter((page) => page.section === "works");

  return {
    blogs: blogs.map(({ title, description, date, tags, url }) => ({
      title,
      description,
      date,
      tags,
      url,
    })),
    blogContent: blogs.map(({ title, description, date, tags, url, html }) => ({
      title,
      description,
      date,
      tags,
      url,
      html,
    })),
    works: works
      .map(({ title, description, technologies, tags, externalUrl, url }) => ({
        title,
        description,
        technologies: technologies ?? tags ?? [],
        externalUrl,
        url,
      }))
      .filter((work) => typeof work.url === "string" && typeof work.externalUrl === "string"),
    workContent: works
      .map(({ title, description, technologies, tags, externalUrl, url, html }) => ({
        title,
        description,
        technologies: technologies ?? tags ?? [],
        externalUrl,
        url,
        html,
      }))
      .filter((work) => typeof work.externalUrl === "string"),
    searchIndex: {
      documents: blogs.map((article) => ({
        title: article.title,
        url: article.url,
        body: markdownToText(article.html),
      })),
    },
  };
}

export function getLocalContentResponse(
  pathname: string,
  data: ReturnType<typeof createContentData>,
) {
  if (pathname === "/api/search-index") return { body: data.searchIndex };
  if (pathname === "/api/blogs") return { body: data.blogs };
  if (pathname === "/api/works") return { body: data.works };

  const match = pathname.match(/^\/api\/(blogs|works)\/(.+)$/);
  if (!match) return null;

  const [, section, slug] = match;
  const url = `/${section}/${decodeURIComponent(slug).replace(/\/+$/, "")}/`;
  const content = section === "blogs" ? data.blogContent : data.workContent;
  const item = content.find((entry) => entry.url === url);
  return item ? { body: item } : { status: 404, body: { error: "not_found" } };
}
