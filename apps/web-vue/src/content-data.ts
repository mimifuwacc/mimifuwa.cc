import type { ArticlePage } from "./content-theme";
import { markdownToText } from "./content-theme";

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

export function getLocalContentResponse(pathname: string, pages: ArticlePage[]) {
  const data = createContentData(pages);
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
