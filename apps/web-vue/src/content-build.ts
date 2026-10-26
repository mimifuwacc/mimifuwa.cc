import { readdir, readFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import { createMarkdownProcessor } from "@ox-content/vite-plugin";
import { createContentData, getLocalContentResponse } from "./content-data";
import type { ArticlePage } from "./content-theme";

interface ContentBuildOptions {
  contentDir: string;
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

const fixturesModuleId = "virtual:mimifuwa-content-fixtures";
const resolvedFixturesModuleId = `\0${fixturesModuleId}`;

export const createContentBuild = ({ contentDir }: ContentBuildOptions) => {
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

  return {
    name: "mimifuwa-content-pages",
    resolveId(id: string) {
      return id === fixturesModuleId ? resolvedFixturesModuleId : undefined;
    },
    async load(id: string) {
      if (id !== resolvedFixturesModuleId) return undefined;
      const pages = await loadArticles();
      return `export default ${JSON.stringify(createContentData(pages))};`;
    },
    configureServer(server: DevServer) {
      const refresh = () => {
        articlesPromise = undefined;
        return loadArticles();
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
          if (request.method !== "GET") return next();
          const result = getLocalContentResponse(pathname, await loadArticles());
          if (!result) return next();
          response.statusCode = result.status ?? 200;
          response.setHeader("content-type", "application/json; charset=utf-8");
          response.end(JSON.stringify(result.body));
        } catch (error) {
          next(error instanceof Error ? error : new Error(String(error)));
        }
      });
    },
  };
};
