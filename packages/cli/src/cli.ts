#!/usr/bin/env node
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { delimiter, dirname, join, relative, resolve, sep } from "node:path";
import { build, createServer, loadConfigFromFile } from "vite";
import { mimifuwaccContentOptions, type MimifuwaccContentOptions } from "./vite.js";

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
      "Add mimifuwaccContent({ target: { url, token } }) to vite.config.ts before deploying",
    );
  }

  const options = (plugin as { [mimifuwaccContentOptions]: MimifuwaccContentOptions })[
    mimifuwaccContentOptions
  ];
  const token = options.target.token;
  if (!token) throw new Error("Content publish token is missing from mimifuwaccContent target");

  console.info(`Building content for ${new URL(options.target.url).host}`);
  const config = loaded.config;
  await build(config);

  const outDir = resolve(
    config.root ?? dirname(configFile),
    options.outDir ?? config.build?.outDir ?? "dist",
  );
  const server = await createServer(config);
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

  const payload = await collectPayload(outDir);
  const revision = getRevision();
  const baseUrl = new URL(options.target.url);

  for (const file of payload) {
    const endpoint = new URL(`/api/content/publish/${file.path}`, baseUrl);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.contentType,
        "X-Content-Revision": revision,
      },
      body: file.body as BodyInit,
    });
    if (!response.ok) {
      throw new Error(`Upload failed for ${file.path} (${response.status})`);
    }
    console.info(`Uploaded ${file.path}`);
  }

  const response = await fetch(new URL("/api/content/publish", baseUrl), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ revision }),
  });
  if (!response.ok) throw new Error(`Content activation failed (${response.status})`);
  console.info(`Published content revision ${revision}`);
}

async function findConfigFile(root: string) {
  const { access } = await import("node:fs/promises");
  const candidates = [join(root, "vite.config.ts"), join(root, "apps/web/vite.config.ts")];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next conventional location.
    }
  }
  throw new Error(`Could not find vite.config.ts in ${root} or ${join(root, "apps/web")}`);
}

function flattenPlugins(plugins: unknown): unknown[] {
  if (!Array.isArray(plugins)) return plugins === undefined ? [] : [plugins];
  return plugins.flatMap(flattenPlugins);
}

interface PayloadFile {
  path: string;
  body: Buffer;
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

  return Promise.all(
    publishable.map(async ({ file, path }) => ({
      path,
      body: await readFile(file),
      contentType: path.endsWith(".json")
        ? "application/json; charset=utf-8"
        : "application/octet-stream",
    })),
  );
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
