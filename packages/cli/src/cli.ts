#!/usr/bin/env node
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { delimiter, dirname, join, relative, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { createServer, loadConfigFromFile, type PluginOption } from "vite";
import { mimifuwaccContentOptions, type MimifuwaccContentOptions } from "./config.js";

type Action = "preview" | "build" | "deploy";
const [requestedAction = "preview", ...args] = process.argv.slice(2);
const usage = "Usage: mimifuwacc <preview|build|deploy> [--content directory] [--site directory]";

if (requestedAction === "--help" || requestedAction === "-h") {
  console.info(usage);
  process.exit(0);
}
if (requestedAction !== "preview" && requestedAction !== "build" && requestedAction !== "deploy") {
  console.error(usage);
  process.exit(2);
}
const action: Action = requestedAction;

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
  if (arg.startsWith("--") && arg !== "--content" && arg !== "--site") {
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
      "Add mimifuwaccContent({ srcDir, collections }) to vite.config.ts before deploying",
    );
  }

  const options = (plugin as { [mimifuwaccContentOptions]: MimifuwaccContentOptions })[
    mimifuwaccContentOptions
  ];
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
        collections: options.collections,
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
    console.info(`Published content revision ${revision}`);
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
        [
          "blogs/index.json",
          "blogs/content.json",
          "works/index.json",
          "works/content.json",
          "search-index.json",
        ].includes(path) ||
        (/^assets\/ox-content-[a-zA-Z0-9._/-]+$/.test(path) && !path.split("/").includes("..")),
    );

  const required = [
    "blogs/index.json",
    "blogs/content.json",
    "works/index.json",
    "works/content.json",
  ];
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
  path: string;
  title: string;
  description?: string;
  frontmatter?: Record<string, unknown>;
  html?: string;
}

async function writeContentPayload(outDir: string, collections: Record<string, ContentEntry[]>) {
  const pages = Object.entries(collections).flatMap(([section, entries]) =>
    entries.map((entry) => {
      const frontmatter = entry.frontmatter ?? {};
      const date = frontmatter.date;
      const url = `${entry.path.replace(/\/+$/, "") || `/${section}`}/`;
      return {
        title: entry.title,
        description:
          entry.description ??
          (typeof frontmatter.excerpt === "string" ? frontmatter.excerpt : undefined),
        date:
          date instanceof Date
            ? date.toISOString().slice(0, 10)
            : typeof date === "string"
              ? date
              : undefined,
        tags: Array.isArray(frontmatter.tags)
          ? frontmatter.tags.filter((tag): tag is string => typeof tag === "string")
          : [],
        url,
        section,
        html: entry.html ?? "",
        externalUrl: typeof frontmatter.url === "string" ? frontmatter.url : undefined,
        technologies: Array.isArray(frontmatter.technologies)
          ? frontmatter.technologies.filter((tag): tag is string => typeof tag === "string")
          : [],
      };
    }),
  );
  const blogs = pages.filter((page) => page.section === "blogs" && page.url !== "/blogs/");
  const works = pages.filter((page) => page.section === "works");
  const jsonFiles: Record<string, unknown> = {
    "blogs/index.json": blogs.map(({ title, description, date, tags, url }) => ({
      title,
      description,
      date,
      tags,
      url,
    })),
    "blogs/content.json": blogs.map(({ title, description, date, tags, url, html }) => ({
      title,
      description,
      date,
      tags,
      url,
      html,
    })),
    "works/index.json": works
      .map(({ title, description, technologies, tags, externalUrl, url }) => ({
        title,
        description,
        technologies: technologies.length ? technologies : tags,
        externalUrl,
        url,
      }))
      .filter((work) => typeof work.externalUrl === "string"),
    "works/content.json": works
      .map(({ title, description, technologies, tags, externalUrl, url, html }) => ({
        title,
        description,
        technologies: technologies.length ? technologies : tags,
        externalUrl,
        url,
        html,
      }))
      .filter((work) => typeof work.externalUrl === "string"),
    "search-index.json": {
      documents: blogs.map((article) => ({
        title: article.title,
        url: article.url,
        body: article.html
          .replace(/<[^>]*>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\s+/g, " ")
          .trim(),
      })),
    },
  };

  for (const [path, data] of Object.entries(jsonFiles)) {
    const file = resolve(outDir, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, `${JSON.stringify(data)}\n`);
  }
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
  const siteDir = resolve(
    readOption("--site") ?? process.env.MIMIFUWA_SITE_DIR ?? "../mimifuwa.cc/apps/web",
  );
  const workspaceDir = resolve(siteDir, "../..");
  const vpBin = resolve(workspaceDir, "node_modules/.bin/vp");

  const pathEntries = [dirname(process.execPath), process.env.PATH].filter(
    (entry): entry is string => Boolean(entry),
  );
  const { spawnSync } = await import("node:child_process");
  const result = spawnSync(
    vpBin,
    ["run", "--filter", "@mimifuwacc/web", action === "build" ? "build" : "dev"],
    {
      cwd: workspaceDir,
      stdio: "inherit",
      env: {
        ...process.env,
        CONTENT_DIR: contentDir,
        DEPLOY_ENV: "local",
        PATH: pathEntries.join(delimiter),
      },
    },
  );
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}
