#!/usr/bin/env node
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  build as viteBuild,
  createServer,
  loadConfigFromFile,
  type Plugin,
  type PluginOption,
} from "vite";
import { mimifuwaccContentOptions, type MimifuwaccContentOptions } from "./config.js";
import { createArticleOgHtml, screenshotArticleOgHtml } from "./og-image.js";
import { mimifuwaccContentEmbeds } from "./vite.js";

type Action = "dev" | "build" | "deploy";
const [requestedAction = "dev", ...args] = process.argv.slice(2);
const action: Action | "help" =
  requestedAction === "preview"
    ? "dev"
    : requestedAction === "--help" || requestedAction === "-h"
      ? "help"
      : (requestedAction as Action);
const usage =
  "Usage: mimifuwacc <dev|build|deploy> [--content directory] [--output directory] [--port number]";

if (action === "help") {
  console.info(usage);
  process.exit(0);
}
if (action !== "dev" && action !== "build" && action !== "deploy") {
  console.error(usage);
  process.exit(2);
}
const readOption = (name: string): string | undefined => {
  const values = args.flatMap((arg, index) => (arg === name ? [args[index + 1]] : []));
  if (values.length > 1) {
    console.error(`${name} can only be specified once`);
    process.exit(2);
  }
  const value = values[0];
  if (values.length === 0) return undefined;
  if (!value || value.startsWith("--")) {
    console.error(`${name} requires a directory path`);
    process.exit(2);
  }
  return value;
};

for (const arg of args) {
  if (arg.startsWith("--") && arg !== "--content" && arg !== "--output" && arg !== "--port") {
    console.error(`Unknown option: ${arg}\n${usage}`);
    process.exit(2);
  }
}

async function deploy() {
  const root = process.cwd();
  const configFile = await findConfigFile(root);
  const loaded = await loadConfigFromFile(
    { command: "build", mode: "production" },
    configFile,
    dirname(configFile),
  );
  if (!loaded) throw new Error(`Could not find vite.config.ts in ${root}`);

  const plugin = flattenPlugins((loaded.config as { plugins?: unknown }).plugins).find(
    (entry) => entry && typeof entry === "object" && mimifuwaccContentOptions in entry,
  );
  if (!plugin || typeof plugin !== "object") {
    throw new Error(
      "Add mimifuwaccContent({ target, srcDir, collections }) to vite.config.ts before deploying",
    );
  }

  const options = (plugin as { [mimifuwaccContentOptions]: MimifuwaccContentOptions })[
    mimifuwaccContentOptions
  ];
  let targetUrl: URL;
  try {
    targetUrl = new URL(options.target.url);
  } catch {
    throw new Error("Set target.url in vite.config.ts to the public site URL");
  }
  if (targetUrl.protocol !== "https:") {
    throw new Error("target.url must use HTTPS");
  }

  console.info("Building content");
  const config = loaded.config;
  const appRoot = resolve(config.root ?? dirname(configFile));
  const outDir = await mkdtemp(join(tmpdir(), "mimifuwacc-content-"));
  const requireFromApp = createRequire(join(appRoot, "package.json"));
  const oxContentPath = requireFromApp.resolve("@ox-content/vite-plugin");
  const { oxContent } = (await import(pathToFileURL(oxContentPath).href)) as {
    oxContent: (options: Record<string, unknown>) => PluginOption;
  };
  const server = await createServer({
    configFile: false,
    root: appRoot,
    logLevel: "error",
    plugins: [
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
            fetch: true,
            appearance: "full",
            mediaOutputDir: join(outDir, "assets/ox-content-twitter"),
            mediaPublicPath: "/assets/ox-content-twitter",
          },
        },
        collections: options.collections,
      }),
      mimifuwaccContentEmbeds({
        articleOgImages: false,
        twitter: {
          fetch: true,
          appearance: "full",
          mediaOutputDir: join(outDir, "assets/ox-content-twitter"),
          mediaPublicPath: "/assets/ox-content-twitter",
        },
      }),
    ],
  });
  try {
    const collectionModule = await server.ssrLoadModule("virtual:ox-content/collections");
    if (typeof collectionModule.getCollection !== "function") {
      throw new Error("Ox Content collections virtual module does not export getCollection");
    }
    const collections = Object.fromEntries(
      Object.keys(options.collections).map((name) => [name, collectionModule.getCollection(name)]),
    );
    await writeContentPayload(outDir, collections);
  } finally {
    await server.close();
  }

  try {
    const payload = await collectPayload(outDir);
    const revision = getRevision();
    const { bucket, accountId } = await getStorageTarget(appRoot);
    const env = {
      ...process.env,
      ...(accountId ? { CLOUDFLARE_ACCOUNT_ID: accountId } : {}),
    };

    for (const file of payload) {
      uploadObject(appRoot, env, bucket, `content/revisions/${revision}/${file.path}`, file);
      console.info(`Uploaded ${file.path}`);
    }

    const manifest = join(outDir, "active-revision.json");
    await writeFile(manifest, `${JSON.stringify({ revision })}\n`);
    uploadObject(appRoot, env, bucket, "content/active-revision.json", {
      path: "content/active-revision.json",
      file: manifest,
      contentType: "application/json; charset=utf-8",
    });
    console.info(`Published content revision ${revision} for ${targetUrl.origin}`);
  } finally {
    await rm(outDir, { recursive: true, force: true });
  }
}

async function getStorageTarget(appRoot: string) {
  const configPath = join(appRoot, ".void-wrangler.jsonc");
  let config: { account_id?: string; r2_buckets?: { binding?: string; bucket_name?: string }[] } =
    {};
  try {
    config = JSON.parse(await readFile(configPath, "utf8")) as typeof config;
  } catch {
    if (!process.env.CONTENT_BUCKET) {
      throw new Error(`Could not read ${configPath}; deploy the site before publishing content`);
    }
  }
  const bucket =
    process.env.CONTENT_BUCKET ??
    config.r2_buckets?.find((binding) => binding.binding === "STORAGE")?.bucket_name;
  if (!bucket) throw new Error(`No STORAGE R2 bucket found in ${configPath}`);
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    throw new Error("Set CLOUDFLARE_API_TOKEN to publish content to R2");
  }
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? config.account_id;
  if (!accountId) throw new Error("Set CLOUDFLARE_ACCOUNT_ID to publish content to R2");
  return { bucket, accountId };
}

function uploadObject(
  cwd: string,
  env: NodeJS.ProcessEnv,
  bucket: string,
  key: string,
  file: PayloadFile,
) {
  execFileSync(
    process.env.CF_BIN ?? "cf",
    [
      "r2",
      "objects",
      "put",
      key,
      "--bucket-name",
      bucket,
      "--file",
      file.file,
      "--content-type",
      file.contentType,
    ],
    { cwd, env, stdio: "inherit" },
  );
}

async function findConfigFile(root: string) {
  const { access } = await import("node:fs/promises");
  let directory = resolve(root);
  while (true) {
    for (const candidate of [
      join(directory, "apps/web/vite.config.ts"),
      join(directory, "vite.config.ts"),
    ]) {
      try {
        await access(candidate);
        return candidate;
      } catch {
        // Try the next conventional location.
      }
    }
    const parent = dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  throw new Error(`Could not find vite.config.ts from ${root}`);
}

function flattenPlugins(plugins: unknown): unknown[] {
  if (!Array.isArray(plugins)) return plugins === undefined ? [] : [plugins];
  return plugins.flatMap(flattenPlugins);
}

interface PayloadFile {
  path: string;
  file: string;
  contentType: string;
}

async function collectPayload(outDir: string): Promise<PayloadFile[]> {
  const files: string[] = [];
  async function walk(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile()) files.push(path);
    }
  }
  await walk(outDir);

  const publishable = files
    .map((file) => ({ file, path: relative(outDir, file).split(sep).join("/") }))
    .filter(
      ({ path }) =>
        path === "og-image-urls.json" ||
        (/^assets\/ox-content-[a-zA-Z0-9._/-]+$/.test(path) && !path.split("/").includes("..")),
    );

  const required = ["og-image-urls.json"];
  const found = new Set(publishable.map(({ path }) => path));
  const missing = required.filter((path) => !found.has(path));
  if (missing.length) {
    throw new Error(`Build output is missing publish files: ${missing.join(", ")}`);
  }

  return publishable.map(({ file, path }) => ({
    path,
    file,
    contentType: path.endsWith(".json")
      ? "application/json; charset=utf-8"
      : "application/octet-stream",
  }));
}

interface ContentEntry {
  html?: string;
}

function getOgImageUrls(collections: Record<string, ContentEntry[]>) {
  const urls = new Set<string>();
  for (const entry of Object.values(collections).flat()) {
    const html = entry.html ?? "";
    for (const match of html.matchAll(
      /<img\b(?=[^>]*\bclass=["'][^"']*\box-ogp-image\b[^"']*["'])(?=[^>]*\bsrc=["'](https?:\/\/[^"']+)["'])[^>]*>/gi,
    )) {
      try {
        const url = new URL(match[1].replace(/&amp;/g, "&"));
        if (url.protocol === "https:" && !url.username && !url.password) urls.add(url.href);
      } catch {
        // Skip malformed image URLs; they cannot be fetched by the Worker proxy.
      }
    }
  }
  return [...urls];
}

async function writeContentPayload(outDir: string, collections: Record<string, ContentEntry[]>) {
  await writeFile(
    join(outDir, "og-image-urls.json"),
    `${JSON.stringify(getOgImageUrls(collections))}\n`,
  );
}

function getRevision() {
  const fromEnvironment = process.env.CONTENT_REVISION ?? process.env.GITHUB_SHA;
  if (fromEnvironment && /^[a-f0-9]{7,64}$/i.test(fromEnvironment)) return fromEnvironment;
  try {
    const revision = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    if (/^[a-f0-9]{7,64}$/i.test(revision)) return revision;
  } catch {
    // Local source archives may not have a Git checkout; use a unique revision for that deploy.
  }
  return Date.now().toString(16).padStart(7, "0");
}

if (action === "deploy") {
  if (args.length) {
    console.error(`deploy reads its content and target from vite.config.ts\n${usage}`);
    process.exit(2);
  }
  await deploy();
} else {
  const contentDir = resolve(readOption("--content") ?? "articles");
  const outputDir = resolve(readOption("--output") ?? "dist");
  const portValue = readOption("--port");
  const port = portValue === undefined ? 5173 : Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("--port must be an integer between 1 and 65535");
  }
  await runContentSite({ action, contentDir, outputDir, port });
}

interface SiteEntry {
  path: string;
  title: string;
  description?: string;
  html?: string;
  frontmatter?: Record<string, unknown>;
}

interface SitePage {
  title: string;
  description?: string;
  date?: string;
  tags: string[];
  technologies: string[];
  url: string;
  ogImage: string;
  ogPreview: string;
  html: string;
}

async function runContentSite({
  action,
  contentDir,
  outputDir,
  port,
}: {
  action: "dev" | "build";
  contentDir: string;
  outputDir: string;
  port: number;
}) {
  const root = process.cwd();
  const templateRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../site");
  const requireFromCli = createRequire(import.meta.url);
  const oxContentPath = requireFromCli.resolve("@ox-content/vite-plugin");
  const { oxContent } = (await import(pathToFileURL(oxContentPath).href)) as {
    oxContent: (options: Record<string, unknown>) => PluginOption;
  };
  const contentPlugin = oxContent({
    srcDir: contentDir,
    ssg: false,
    search: false,
    docs: false,
    ogViewer: false,
    highlight: true,
    gfm: true,
    cards: true,
    containers: { types: { message: { title: "Info" } } },
    embeds: { github: true, openGraph: true, twitter: { fetch: false, appearance: "full" } },
    collections: {
      posts: { source: "posts/**/*", include: ["html"] },
      works: { source: "works/**/*", include: ["html"] },
    },
  });
  const contentTransform = mimifuwaccContentEmbeds({
    articleOgImages: false,
    twitter: { fetch: false, appearance: "full" },
  });
  const contentServer = await createServer({
    configFile: false,
    root,
    logLevel: "error",
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    plugins: [contentPlugin, contentTransform],
  });
  contentServer.watcher.add(contentDir);
  let pages: Record<"posts" | "works", SitePage[]> = { posts: [], works: [] };
  const loadPages = async () => {
    const module = (await contentServer.ssrLoadModule("virtual:ox-content/collections")) as {
      getCollection(name: string): SiteEntry[];
    };
    pages = {
      posts: mapSiteEntries(module.getCollection("posts"), "posts"),
      works: mapSiteEntries(module.getCollection("works"), "works"),
    };
  };
  await loadPages();

  const ogData = (pathname: string) => {
    const page = [...pages.posts, ...pages.works].find((entry) => entry.ogImage === `/${pathname}`);
    if (!page) return undefined;
    const section: "posts" | "works" = page.url.startsWith("/works/") ? "works" : "posts";
    return {
      title: page.title,
      date: page.date,
      tags: section === "works" && page.technologies.length ? page.technologies : page.tags,
      section,
    };
  };
  const content = () => JSON.stringify(pages);
  const images = new Map<string, Buffer>();
  const sitePlugin: Plugin = {
    name: "@mimifuwa.cc/cli:content-site",
    configureServer(server) {
      server.watcher.add(contentDir);
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? "/", "http://localhost").pathname.slice(1);
        if (pathname === "__mimifuwacc/content.json") {
          response.statusCode = 200;
          response.setHeader("content-type", "application/json; charset=utf-8");
          response.setHeader("cache-control", "no-store");
          response.end(content());
          return;
        }
        const previewMatch = pathname.match(/^__og\/(posts|works)\/(.+)\.html$/);
        if (previewMatch) {
          const data = ogData(`og/${previewMatch[1]}/${previewMatch[2]}.png`);
          if (!data) return next();
          response.statusCode = 200;
          response.setHeader("content-type", "text/html; charset=utf-8");
          response.setHeader("cache-control", "no-store");
          response.end(createArticleOgHtml(data));
          return;
        }
        next();
      });
    },
    async handleHotUpdate({ file, server }) {
      if (!file.startsWith(`${contentDir}${sep}`) || !/\.mdx?$/.test(file)) return;
      contentServer.moduleGraph.invalidateAll();
      await loadPages();
      images.clear();
      server.ws.send({ type: "full-reload" });
      return [];
    },
    async generateBundle() {
      this.emitFile({ type: "asset", fileName: "__mimifuwacc/content.json", source: content() });
      const entries = [...pages.posts, ...pages.works];
      let missingCredentials = 0;
      for (let offset = 0; offset < entries.length; offset += 4) {
        const chunk = entries.slice(offset, offset + 4);
        const results = await Promise.all(
          chunk.map(
            async (page) =>
              [
                page.ogImage.slice(1),
                await screenshotArticleOgHtml(createArticleOgHtml(ogData(page.ogImage.slice(1))!)),
              ] as const,
          ),
        );
        for (const [fileName, image] of results) {
          if (image) images.set(fileName, image);
          else missingCredentials += 1;
        }
      }
      if (missingCredentials) {
        this.warn(
          `Skipped ${missingCredentials} article OG screenshots because CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are not set. Preview HTML is available at /__og/<article-path>.html during development.`,
        );
      }
      for (const [fileName, source] of images) {
        this.emitFile({ type: "asset", fileName, source });
      }
    },
  };

  if (action === "dev") {
    const server = await createServer({
      configFile: false,
      root: templateRoot,
      plugins: [sitePlugin],
      server: { host: "127.0.0.1", port, strictPort: true },
    });
    try {
      await server.listen();
      server.printUrls();
      const close = async () => {
        await Promise.all([server.close(), contentServer.close()]);
        process.exit(0);
      };
      process.once("SIGINT", close);
      process.once("SIGTERM", close);
    } catch (error) {
      await Promise.all([server.close(), contentServer.close()]);
      throw error;
    }
    return;
  }

  try {
    await rm(outputDir, { recursive: true, force: true });
    await viteBuild({
      configFile: false,
      root: templateRoot,
      base: "/",
      publicDir: false,
      plugins: [sitePlugin],
      build: { outDir: outputDir, emptyOutDir: true },
    });
    const indexHtml = await readFile(join(outputDir, "index.html"));
    for (const section of ["posts", "works"] as const) {
      const routes = new Set([`/${section}/`]);
      for (const page of pages[section]) routes.add(page.url);
      for (const route of routes) {
        const directory = resolve(outputDir, route.replace(/^\/+/, ""));
        if (!directory.startsWith(`${outputDir}${sep}`)) continue;
        await mkdir(directory, { recursive: true });
        await writeFile(join(directory, "index.html"), indexHtml);
      }
    }
  } finally {
    await contentServer.close();
  }
}

function mapSiteEntries(entries: SiteEntry[], section: "posts" | "works"): SitePage[] {
  return entries.flatMap((entry) => {
    const path = entry.path.replace(/\/+$/, "") || `/${section}`;
    if (path === `/${section}` || path === section) return [];
    const frontmatter = entry.frontmatter ?? {};
    const dateValue = frontmatter.date;
    const tags = Array.isArray(frontmatter.tags)
      ? frontmatter.tags.filter((tag): tag is string => typeof tag === "string")
      : [];
    const technologies = Array.isArray(frontmatter.technologies)
      ? frontmatter.technologies.filter((tag): tag is string => typeof tag === "string")
      : [];
    return [
      {
        title: entry.title,
        description:
          entry.description ??
          (typeof frontmatter.excerpt === "string" ? frontmatter.excerpt : undefined),
        date:
          dateValue instanceof Date
            ? dateValue.toISOString().slice(0, 10)
            : typeof dateValue === "string"
              ? dateValue
              : undefined,
        tags,
        technologies,
        url: `/${path.replace(/^\/+/, "")}/`,
        ogImage: `/og/${path.replace(/^\/+|\/+$/g, "")}.png`,
        ogPreview: `/__og/${path.replace(/^\/+|\/+$/g, "")}.html`,
        html: entry.html ?? "",
      },
    ];
  });
}
