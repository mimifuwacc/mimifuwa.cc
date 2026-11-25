import { oxContent, transformAllPlugins } from "@ox-content/vite-plugin";
import type { Plugin, PluginOption, ViteDevServer } from "vite";
import { defineMimifuwaccContentConfig, mimifuwaccContentOptions } from "./config.js";
import { createArticleOgHtml, screenshotArticleOgHtml } from "./og-image.js";

type OxContentOptions = NonNullable<Parameters<typeof oxContent>[0]>;
type TransformOptions = NonNullable<Parameters<typeof transformAllPlugins>[1]>;
type TweetOptions = NonNullable<TransformOptions["twitter"]>;

const defaultTweetOptions = { fetch: true, appearance: "full" } satisfies TweetOptions;

export interface MimifuwaccContentOptions {
  /** Public URL of the site that serves the published content. */
  target: { url: string };
  /** The Ox Content source directory, relative to the Vite root. */
  srcDir: string;
  /** Directory containing site-content.json, relative to the Vite root. */
  dataDir?: string;
  /** Ox Content collection definitions. Include `html` for publishable article bodies. */
  collections: NonNullable<OxContentOptions["collections"]>;
}

export type MimifuwaccContentPlugin = Plugin & {
  [mimifuwaccContentOptions]: MimifuwaccContentOptions;
};

function cardifyLinkedUrls(html: string) {
  return html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (link, attributes, label) => {
    const href = attributes.match(/\bhref=["'](https?:\/\/[^"']+)["']/i)?.[1];
    const text = label
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .trim();
    if (!href || !/^https?:\/\//i.test(text)) return link;

    try {
      const target = new URL(href.replace(/&amp;/g, "&"));
      const visible = new URL(text);
      const normalize = (url: URL) =>
        `${url.origin}${url.pathname.replace(/\/$/, "")}${url.search}${url.hash}`;
      if (normalize(target) !== normalize(visible)) return link;
      const url = target.href.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
      const tag =
        /^(?:www\.)?(?:x\.com|twitter\.com)$/i.test(target.hostname) &&
        /\/status\/\d+/i.test(target.pathname)
          ? "Tweet"
          : "OgCard";
      return `<${tag} url="${url}" />`;
    } catch {
      return link;
    }
  });
}

/** Ox Content's native collection HTML omits its built-in embed transform. */
export function mimifuwaccContentEmbeds(
  options: Pick<TransformOptions, "twitter"> & { articleOgImages?: boolean } = {},
): Plugin {
  const twitter = options.twitter ?? defaultTweetOptions;
  const articleOgImages = options.articleOgImages !== false;
  const generatedImages = new Map<string, Buffer>();
  const articleOgData = new Map<
    string,
    {
      title: string;
      description?: string;
      date?: string;
      tags?: string[];
      section: "posts" | "works";
    }
  >();
  return {
    name: "mimifuwacc-content-embeds",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? "/", "http://localhost").pathname.slice(1);
        const previewPath = pathname.replace(/^__og\//, "og/").replace(/\.html$/, ".png");
        const data = pathname.startsWith("__og/") ? articleOgData.get(previewPath) : undefined;
        if (!data) return next();
        response.statusCode = 200;
        response.setHeader("content-type", "text/html; charset=utf-8");
        response.setHeader("cache-control", "no-store");
        response.end(createArticleOgHtml(data));
      });
    },
    async transform(code, id) {
      if (!id.includes("virtual:ox-content/collections")) return null;

      const assignment = "const collections = ";
      const start = code.indexOf(assignment);
      if (start < 0) return null;
      const jsonStart = start + assignment.length;
      const end = code.indexOf(";\n", jsonStart);
      if (end < 0) return null;

      const collections = JSON.parse(code.slice(jsonStart, end)) as Record<
        string,
        {
          path: string;
          title: string;
          description?: string;
          html?: string;
          frontmatter?: Record<string, unknown>;
        }[]
      >;
      if (articleOgImages) {
        articleOgData.clear();
        generatedImages.clear();
      }
      await Promise.all(
        Object.entries(collections).flatMap(([section, entries]) =>
          entries.map(async (entry) => {
            if (entry.html) {
              const html = cardifyLinkedUrls(entry.html);
              entry.html = await transformAllPlugins(html, { openGraph: true, twitter });
            }
            if (articleOgImages && (section === "posts" || section === "works")) {
              const contentPath = entry.path.replace(/^\/+|\/+$/g, "");
              if (contentPath.startsWith(`${section}/`)) {
                articleOgData.set(`og/${contentPath}.png`, {
                  title: entry.title,
                  date:
                    typeof entry.frontmatter?.date === "string"
                      ? entry.frontmatter.date
                      : entry.frontmatter?.date instanceof Date
                        ? entry.frontmatter.date.toISOString()
                        : undefined,
                  tags: (section === "posts"
                    ? entry.frontmatter?.tags
                    : (entry.frontmatter?.technologies ?? entry.frontmatter?.tags)) as
                    | string[]
                    | undefined,
                  section,
                });
              }
            }
          }),
        ),
      );

      return `${code.slice(0, jsonStart)}${JSON.stringify(collections)}${code.slice(end)}`;
    },
    async generateBundle() {
      if (!articleOgImages) return;
      let missingCredentials = 0;
      const entries = [...articleOgData];
      for (let offset = 0; offset < entries.length; offset += 4) {
        const chunk = entries.slice(offset, offset + 4);
        const results = await Promise.all(
          chunk.map(
            async ([fileName, data]) =>
              [fileName, await screenshotArticleOgHtml(createArticleOgHtml(data))] as const,
          ),
        );
        for (const [fileName, image] of results) {
          if (image) generatedImages.set(fileName, image);
          else missingCredentials += 1;
        }
      }
      if (missingCredentials) {
        this.warn(
          `Skipped ${missingCredentials} article OG screenshots because CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are not set. Preview HTML is available at /__og/<article-path>.html during development.`,
        );
      }
      for (const [fileName, source] of generatedImages) {
        this.emitFile({ type: "asset", fileName, source });
      }
    },
  };
}

/** Configure Ox Content for `mimifuwacc deploy`. */
export function mimifuwaccContent(options: MimifuwaccContentOptions): PluginOption[] {
  const plugin: MimifuwaccContentPlugin = {
    ...defineMimifuwaccContentConfig(options),
    configResolved(config) {
      if (!config.root) throw new Error("Vite root could not be resolved");
    },
  };
  return [
    oxContent({
      srcDir: options.srcDir,
      ssg: false,
      search: false,
      docs: false,
      ogViewer: false,
      highlight: true,
      gfm: true,
      cards: true,
      containers: { types: { message: { title: "Info" } } },
      embeds: {
        github: true,
        openGraph: true,
        twitter: {
          ...defaultTweetOptions,
          mediaOutputDir: "public/ox-content/twitter",
          mediaPublicPath: "/ox-content/twitter",
        },
      },
      collections: options.collections,
    }),
    mimifuwaccContentEmbeds(),
    plugin,
  ];
}
