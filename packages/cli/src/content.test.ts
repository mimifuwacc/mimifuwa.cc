import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vite-plus/test";

import { buildStaticSite } from "./site";
import { loadArticles } from "./content";

const roots: string[] = [];

afterEach(async () => {
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
  delete process.env.MIMIFUWACC_CONTENT_ROOT;
  delete process.env.MIMIFUWACC_OUTPUT_ROOT;
});

describe("content visibility", () => {
  it("keeps drafts available locally but excludes them from production output", async () => {
    const root = await mkdtemp(join(tmpdir(), "mimifuwacc-content-"));
    const output = await mkdtemp(join(tmpdir(), "mimifuwacc-output-"));
    roots.push(root, output);
    await mkdir(join(root, "articles"), { recursive: true });
    await writeFile(
      join(root, "articles", "published.md"),
      "---\ntitle: Published\nstatus: published\n---\n\nPublic body\n",
    );
    await writeFile(
      join(root, "articles", "draft.md"),
      "---\ntitle: Draft\nstatus: draft\n---\n\nPrivate body\n",
    );
    process.env.MIMIFUWACC_CONTENT_ROOT = root;
    process.env.MIMIFUWACC_OUTPUT_ROOT = output;
    await mkdir(join(output, "draft"), { recursive: true });
    await writeFile(join(output, "draft", "index.html"), "stale draft output");

    expect(await loadArticles()).toHaveLength(2);
    expect(await loadArticles({ visibility: "published" })).toHaveLength(1);

    const result = await buildStaticSite();
    expect(result.count).toBe(1);
    expect(await readFile(join(output, "index.html"), "utf8")).toContain("Published");
    await expect(readFile(join(output, "draft", "index.html"), "utf8")).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
});
