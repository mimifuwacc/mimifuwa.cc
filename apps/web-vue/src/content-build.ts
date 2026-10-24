import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { createMarkdownProcessor } from "@ox-content/vite-plugin";
import type { ArticlePage } from "./content-theme";
import { markdownToText, renderBlogIndex, renderMimifuwaPage } from "./content-theme";

interface ContentBuildOptions {
  contentDir: string;
  outDir: string;
  styles: string;
}

interface DevServer {
  watcher: {
    add(path: string): void;
    on(event: "add" | "change" | "unlink", callback: (path: string) => void): void;
  };
  middlewares: {
    use(
      handler: (
        request: { url?: string },
        response: {
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
  const route =
    path === "blogs" ? "/blogs/" : path.startsWith("blogs/") ? `/${path}` : `/blogs/${path}`;
  return `${route.replace(/\/$/, "")}/`;
};

const writePage = async (outDir: string, url: string, html: string) => {
  const outputPath = resolve(outDir, `.${url}`, "index.html");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
};

export const createContentBuild = ({ contentDir, outDir, styles }: ContentBuildOptions) => {
  const processor = createMarkdownProcessor({
    srcDir: contentDir,
    highlight: true,
    gfm: true,
    search: false,
    ssg: false,
    ogImage: false,
  });
  let articlesPromise: Promise<ArticlePage[]> | undefined;

  const loadArticles = () => {
    articlesPromise ??= (async () => {
      const files = await listMarkdownFiles(contentDir);
      const rendered = await Promise.all(
        files.map(async (filePath) => {
          const source = await readFile(filePath, "utf8");
          const result = await processor.render(source, filePath);
          const frontmatter = result.frontmatter;
          const relativePath = relative(contentDir, filePath).split(sep).join("/");
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
    const sourcePages = await loadArticles();
    const blogPage = sourcePages.find((page) => page.url === "/blogs/") ?? {
      title: "Blog",
      navTitle: "Blogs",
      description: "Articles about technology and personal projects.",
      html: renderBlogIndex(sourcePages.filter((page) => page.url !== "/blogs/")),
      url: "/blogs/",
    };
    const articles = sourcePages.filter((page) => page.url !== "/blogs/");
    const navigation = [...articles].sort((left, right) =>
      left.navTitle.localeCompare(right.navTitle, "en", { numeric: true }),
    );
    const pages = [blogPage, ...articles];
    await Promise.all(
      pages.map((page) =>
        writePage(directory, page.url, renderMimifuwaPage(page, navigation, styles)),
      ),
    );
    const searchIndex = {
      documents: articles.map((article) => ({
        title: article.title,
        url: article.url,
        body: markdownToText(article.html),
      })),
    };
    await writeFile(resolve(directory, "search-index.json"), JSON.stringify(searchIndex));
    const blogList = articles.map(({ title, description, date, tags, url }) => ({
      title,
      description,
      date,
      tags,
      url,
    }));
    await writeFile(resolve(directory, "blog-list.json"), JSON.stringify(blogList));
    return pages;
  };

  return {
    name: "mimifuwa-content-pages",
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
          if (pathname === "/search-index.json") {
            response.setHeader("content-type", "application/json; charset=utf-8");
            response.end(await readFile(resolve(outDir, ".preview-content/search-index.json")));
            return;
          }
          if (pathname === "/blog-list.json") {
            response.setHeader("content-type", "application/json; charset=utf-8");
            response.end(await readFile(resolve(outDir, ".preview-content/blog-list.json")));
            return;
          }
          const pages = await loadArticles();
          const articles = pages.filter((article) => article.url !== "/blogs/");
          const navigation = [...articles].sort((left, right) =>
            left.navTitle.localeCompare(right.navTitle, "en", { numeric: true }),
          );
          const page =
            pathname === "/blogs/"
              ? (pages.find((article) => article.url === "/blogs/") ?? {
                  title: "Blog",
                  navTitle: "Blogs",
                  description: "Articles about technology and personal projects.",
                  html: renderBlogIndex(articles),
                  url: "/blogs/",
                })
              : articles.find(
                  (article) =>
                    article.url === pathname || article.url === `${pathname.replace(/\/$/, "")}/`,
                );
          if (!page) return next();
          response.setHeader("content-type", "text/html; charset=utf-8");
          response.end(renderMimifuwaPage(page, navigation, styles));
        } catch (error) {
          next(error instanceof Error ? error : new Error(String(error)));
        }
      });
    },
    async closeBundle() {
      articlesPromise = undefined;
      await generate(outDir);
    },
  };
};
