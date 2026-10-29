import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import process from "node:process";

function git(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
  }

  return result.stdout.trim();
}

function usage() {
  process.stdout.write("Usage: vp run release -- v<version> [--dry-run]\n");
  process.stdout.write("Example: vp run release -- v5.0.1\n");
}

// `vp run release -- ...` forwards the separator to the script as an argument.
const args = process.argv.slice(2).filter((arg) => arg !== "--");

if (args.includes("--help")) {
  usage();
  process.exit(0);
}

const dryRun = args.includes("--dry-run");
const versions = args.filter((arg) => arg !== "--dry-run");
const [tag] = versions;

if (
  versions.length !== 1 ||
  !/^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?$/.test(tag ?? "")
) {
  usage();
  throw new Error("Pass one v-prefixed semantic version tag, such as v5.0.1");
}

git(["fetch", "--quiet", "origin", "main", "--tags"]);
const commit = git(["rev-parse", "refs/remotes/origin/main"]);

if (git(["tag", "--list", tag])) {
  throw new Error(`Tag ${tag} already exists locally or on origin`);
}

const prerelease = tag.includes("-");

process.stdout.write(`Tag: ${tag}\n`);
process.stdout.write(`Commit: ${commit}\n`);
process.stdout.write(
  `Release effects: ${prerelease ? "dev Worker, npm prerelease dist-tag, and sample content" : "production, npm latest, and mimifuwa.cc-content main"}\n`,
);

if (dryRun) {
  process.stdout.write("Dry run: no tag was created or pushed.\n");
  process.exit(0);
}

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  throw new Error("A terminal is required to confirm a release tag");
}

const prompt = createInterface({ input: process.stdin, output: process.stdout });
let answer;

try {
  answer = await prompt.question("Create a signed tag and push it to origin? [y/N] ");
} finally {
  prompt.close();
}

if (!/^(y|yes)$/i.test(answer.trim())) {
  process.stdout.write("Release cancelled. No tag was created.\n");
  process.exit(0);
}

git(["tag", "--sign", "--annotate", tag, "--message", `Release ${tag}`, commit]);
git(["push", "origin", `refs/tags/${tag}`]);

process.stdout.write(`Pushed ${tag}. GitHub Actions will publish and deploy the release.\n`);
