import { describe, expect, it } from "vite-plus/test";

import { parseArticleToHtml } from "./article";

describe("ox-content article renderer", () => {
  it("uses ox-content output and project-owned embed transforms", async () => {
    const result = await parseArticleToHtml(
      "---\ntitle: Example\n---\n\n## Heading\n\nhttps://x.com/example/status/123\n",
    );

    expect(result.frontmatter).toMatchObject({ title: "Example" });
    expect(result.headings).toEqual([{ id: "heading", text: "Heading", level: 2 }]);
    expect(result.html).toContain('<h2 id="heading">Heading</h2>');
    expect(result.html).toContain('data-embed="twitter"');
    expect(result.html).toContain('data-twitter-id="123"');
    expect(result.html).toContain('style="aspect-ratio: 1 / 1"');
  });
});
