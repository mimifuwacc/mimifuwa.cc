#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { delimiter, dirname, resolve } from "node:path";

type Action = "preview" | "build";

const [requestedAction = "preview", ...args] = process.argv.slice(2);
if (requestedAction !== "preview" && requestedAction !== "build") {
  console.error("Usage: mimifuwa <preview|build> [--content <directory>] [--site <directory>]");
  process.exit(2);
}
const action: Action = requestedAction;

const readOption = (name: string): string | undefined => {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a directory path`);
  return value;
};

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
      PATH: pathEntries.join(delimiter),
    },
  },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
