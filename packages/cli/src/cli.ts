#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { delimiter, dirname, resolve } from "node:path";

type Action = "preview" | "build";

const [requestedAction = "preview", ...args] = process.argv.slice(2);
const usage = "Usage: mimifuwacc <preview|build> [--content <directory>] [--site <directory>]";

if (requestedAction === "--help" || requestedAction === "-h") {
  console.info(usage);
  process.exit(0);
}
if (requestedAction !== "preview" && requestedAction !== "build") {
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

const contentDir = resolve(readOption("--content") ?? "articles");
const siteDir = resolve(
  readOption("--site") ?? process.env.MIMIFUWA_SITE_DIR ?? "../mimifuwa.cc/apps/web-vue",
);
const workspaceDir = resolve(siteDir, "../..");
const vpBin = resolve(workspaceDir, "node_modules/.bin/vp");

if (!existsSync(vpBin)) {
  console.error(
    `Cannot find Vite+ in ${workspaceDir}. Install dependencies in the mimifuwa.cc repo first.`,
  );
  process.exit(1);
}
if (!existsSync(contentDir)) {
  console.error(`Content directory does not exist: ${contentDir}`);
  process.exit(1);
}

const pathEntries = [dirname(process.execPath), process.env.PATH].filter((entry): entry is string =>
  Boolean(entry),
);
const result = spawnSync(
  vpBin,
  ["run", "--filter", "@mimifuwacc/web-vue", action === "build" ? "build" : "dev"],
  {
    cwd: workspaceDir,
    stdio: "inherit",
    env: {
      ...process.env,
      CONTENT_DIR: contentDir,
      // Preview and build the selected Markdown through Ox Content without
      // reading from or publishing to the production R2 bucket.
      MIMIFUWA_CC_DEPLOY_ENV: "dev",
      PATH: pathEntries.join(delimiter),
    },
  },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
