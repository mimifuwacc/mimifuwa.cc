import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

const input = process.argv[2];
const version = input?.replace(/^v/, "");

if (!version) {
  throw new Error("Pass a version or Git tag, for example: v5.0.0");
}

for (const path of ["apps/web/package.json", "packages/cli/package.json"]) {
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  manifest.version = version;
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
}
