import { copyFile, readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { createMarkdownProcessor } from "@ox-content/vite-plugin";
import type { ArticlePage } from "./content-theme";
import { markdownToText } from "./content-theme";

interface ContentBuildOptions {
  contentDir: string;
  outDir: string;
}

interface DevServer {
  watcher: {
    add(path: string): void;
    on(event: "add" | "change" | "unlink", callback: (path: string) => void): void;
  };
  middlewares: {
    use(
      handler: (
        request: { url?: string; method?: string },
        response: {
          statusCode?: number;
          setHeader(name: string, value: string): void;
          end(value?: string | Uint8Array): void;
        },
        next: (error?: Error) => void,
      ) => void,
    ): void;
  };
}

const asString = (value: unknown) => (typeof value === "string" ? value : undefined);

const titleize = (value: string) =>
  value
    .split(/[-_\s]+/)
    .map(
      (word, index) =>
        `${index > 0 && /^\d/.test(word) ? "-" : index > 0 ? " " : ""}${word.slice(0, 1).toUpperCase()}${word.slice(1)}`,
    )
    .join("");

const listMarkdownFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return listMarkdownFiles(path);
      return [".md", ".markdown", ".mdx"].includes(extname(entry.name).toLowerCase()) ? [path] : [];
    }),
  );
  return files.flat();
};

const articleUrl = (contentDir: string, filePath: string) => {
  const path = relative(contentDir, filePath)
    .split(sep)
    .join("/")
    .replace(/\.(md|markdown|mdx)$/i, "")
    .replace(/\/index$/i, "");
  const section = path.startsWith("works") ? "works" : "blogs";
  const contentPath = path.replace(/^(blogs|works)\/?/, "");
  const route = contentPath ? `/${section}/${contentPath}` : `/${section}`;
  return `${route.replace(/\/$/, "")}/`;
};

const blogListFromPages = (pages: ArticlePage[]) =>
  pages
    .filter((page) => page.section === "blogs" && page.url !== "/blogs/")
    .map(({ title, description, date, tags, url }) => ({ title, description, date, tags, url }));

const workListFromPages = (pages: ArticlePage[]) =>
  pages
    .filter((page) => page.section === "works")
    .map(({ title, description, technologies, tags, externalUrl, url }) => ({
      title,
      description,
      technologies: technologies ?? tags ?? [],
      externalUrl,
      url,
    }))
    .filter((work) => typeof work.url === "string" && typeof work.externalUrl === "string");

const workContentFromPages = (pages: ArticlePage[]) =>
  pages
    .filter((page) => page.section === "works")
    .map(({ title, description, technologies, tags, externalUrl, url, html }) => ({
      title,
      description,
      technologies: technologies ?? tags ?? [],
      externalUrl,
      url,
      html,
    }))
    .filter((work) => typeof work.externalUrl === "string");

const fixturesModuleId = "virtual:mimifuwa-content-fixtures";
const resolvedFixturesModuleId = `\0${fixturesModuleId}`;

export const createContentBuild = ({ contentDir, outDir }: ContentBuildOptions) => {
  const processor = createMarkdownProcessor({
    srcDir: contentDir,
    highlight: true,
    gfm: true,
    search: false,
    ssg: false,
    ogImage: false,
  });
  let articlesPromise: Promise<ArticlePage[]> | undefined;

  const loadArticles = (): Promise<ArticlePage[]> => {
    if (!articlesPromise)
      articlesPromise = (async () => {
        const files = await listMarkdownFiles(contentDir);
        const rendered = await Promise.all(
          files.map(async (filePath) => {
            const source = await readFile(filePath, "utf8");
            const result = await processor.render(source, filePath);
            const frontmatter = result.frontmatter;
            const relativePath = relative(contentDir, filePath).split(sep).join("/");
            const section: ArticlePage["section"] = relativePath.startsWith("works/")
              ? "works"
              : "blogs";
            const fileName =
              relativePath
                .replace(/\.(md|markdown|mdx)$/i, "")
                .replace(/\/index$/i, "")
                .split("/")
                .at(-1) ?? "Article";
            return {
              title: asString(frontmatter.title) ?? titleize(fileName),
              navTitle: asString(frontmatter.navTitle) ?? titleize(fileName),
              description: asString(frontmatter.description) ?? asString(frontmatter.excerpt),
              date:
                frontmatter.date instanceof Date
                  ? frontmatter.date.toISOString().slice(0, 10)
                  : asString(frontmatter.date),
              tags: Array.isArray(frontmatter.tags)
                ? frontmatter.tags.filter((tag): tag is string => typeof tag === "string")
                : [],
              html: result.html,
              url: articleUrl(contentDir, filePath),
              section,
              externalUrl: asString(frontmatter.url),
              technologies: Array.isArray(frontmatter.technologies)
                ? frontmatter.technologies.filter((tag): tag is string => typeof tag === "string")
                : [],
              sortDate:
                frontmatter.date instanceof Date
                  ? frontmatter.date.getTime()
                  : Date.parse(String(frontmatter.date ?? "")),
            };
          }),
        );
        return rendered
          .sort(
            (left, right) =>
              right.sortDate - left.sortDate || left.title.localeCompare(right.title, "ja"),
          )
          .map(({ sortDate: _sortDate, ...article }) => article);
      })();
    return articlesPromise;
  };

  const generate = async (directory: string) => {
    const pages = await loadArticles();
    const articles = pages.filter((page) => page.section === "blogs" && page.url !== "/blogs/");
    const searchIndex = {
      documents: articles.map((article) => ({
        title: article.title,
        url: article.url,
        body: markdownToText(article.html),
      })),
    };
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, "search-index.json"), JSON.stringify(searchIndex));
    const blogList = blogListFromPages(pages);
    await mkdir(resolve(directory, "blogs"), { recursive: true });
    await writeFile(resolve(directory, "blogs", "index.json"), JSON.stringify(blogList));
    const blogContent = articles.map(({ title, description, date, tags, url, html }) => ({
      title,
      description,
      date,
      tags,
      url,
      html,
    }));
    await writeFile(resolve(directory, "blogs", "content.json"), JSON.stringify(blogContent));
    await mkdir(resolve(directory, "works"), { recursive: true });
    await writeFile(
      resolve(directory, "works", "index.json"),
      JSON.stringify(workListFromPages(pages)),
    );
    await writeFile(
      resolve(directory, "works", "content.json"),
      JSON.stringify(workContentFromPages(pages)),
    );
    return pages;
  };

  return {
    name: "mimifuwa-content-pages",
    resolveId(id: string) {
      return id === fixturesModuleId ? resolvedFixturesModuleId : undefined;
    },
    async load(id: string) {
      if (id !== resolvedFixturesModuleId) return undefined;
      const pages = await loadArticles();
      const articles = pages.filter((page) => page.section === "blogs" && page.url !== "/blogs/");
      const searchIndex = {
        documents: articles.map((article) => ({
          title: article.title,
          url: article.url,
          body: markdownToText(article.html),
        })),
      };
      const fixtures = {
        blogs: blogListFromPages(pages),
        blogContent: articles.map(({ title, description, date, tags, url, html }) => ({
          title,
          description,
          date,
          tags,
          url,
          html,
        })),
        works: workListFromPages(pages),
        workContent: workContentFromPages(pages),
        searchIndex,
      };
      return `export default ${JSON.stringify(fixtures)};`;
    },
    configureServer(server: DevServer) {
      const refresh = () => {
        articlesPromise = undefined;
        return generate(resolve(outDir, ".preview-content"));
      };
      let refreshPromise = refresh();
      server.watcher.add(contentDir);
      server.watcher.on("add", (path) => {
        if (path.startsWith(contentDir)) refreshPromise = refresh();
      });
      server.watcher.on("change", (path) => {
        if (path.startsWith(contentDir)) refreshPromise = refresh();
      });
      server.watcher.on("unlink", (path) => {
        if (path.startsWith(contentDir)) refreshPromise = refresh();
      });
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
        try {
          await refreshPromise;
          if (request.method === "GET" && pathname === "/api/search-index") {
            const pages = await loadArticles();
            const articles = pages.filter(
              (article) => article.section === "blogs" && article.url !== "/blogs/",
            );
            response.setHeader("content-type", "application/json; charset=utf-8");
            response.end(
              JSON.stringify({
                documents: articles.map((article) => ({
                  title: article.title,
                  url: article.url,
                  body: markdownToText(article.html),
                })),
              }),
            );
            return;
          }
          if (request.method === "GET" && pathname === "/api/blogs") {
            const pages = await loadArticles();
            response.setHeader("content-type", "application/json; charset=utf-8");
            response.end(JSON.stringify(blogListFromPages(pages)));
            return;
          }
          if (request.method === "GET" && pathname === "/api/works") {
            const pages = await loadArticles();
            response.setHeader("content-type", "application/json; charset=utf-8");
            response.end(JSON.stringify(workListFromPages(pages)));
            return;
          }
          if (request.method === "GET" && pathname.startsWith("/api/works/")) {
            const pages = await loadArticles();
            const requestedUrl = `${decodeURIComponent(pathname.slice("/api".length)).replace(/\/+$/, "")}/`;
            const work = workContentFromPages(pages).find((item) => item.url === requestedUrl);
            if (!work) {
              response.statusCode = 404;
              response.setHeader("content-type", "application/json; charset=utf-8");
              response.end(JSON.stringify({ error: "not_found" }));
              return;
            }
            response.setHeader("content-type", "application/json; charset=utf-8");
            response.end(JSON.stringify(work));
            return;
          }
          if (request.method === "GET" && pathname.startsWith("/api/blogs/")) {
            const pages = await loadArticles();
            const articles = pages.filter(
              (article) => article.section === "blogs" && article.url !== "/blogs/",
            );
            const requestedUrl = `${decodeURIComponent(pathname.slice("/api".length)).replace(/\/+$/, "")}/`;
            const article = articles.find((item) => item.url === requestedUrl);
            if (!article) {
              response.statusCode = 404;
              response.setHeader("content-type", "application/json; charset=utf-8");
              response.end(JSON.stringify({ error: "not_found" }));
              return;
            }
            response.setHeader("content-type", "application/json; charset=utf-8");
            response.end(JSON.stringify(article));
            return;
          }
          return next();
        } catch (error) {
          next(error instanceof Error ? error : new Error(String(error)));
        }
      });
    },
    async closeBundle() {
      articlesPromise = undefined;
      await generate(outDir);
      const pages = await loadArticles();
      const routes = [
        "/blogs/",
        "/works/",
        ...pages
          .filter((page) => page.section === "blogs" || page.section === "works")
          .map((page) => page.url)
          .filter((url) => url !== "/blogs/" && url !== "/works/"),
      ];
      const appShell = resolve(outDir, "index.html");
      await Promise.all(
        routes.map(async (url) => {
          const routeShell = resolve(outDir, `.${url}`, "index.html");
          await mkdir(dirname(routeShell), { recursive: true });
          await copyFile(appShell, routeShell);
        }),
      );
    },
  };
};
