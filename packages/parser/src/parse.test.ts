import { describe, expect, it } from "vite-plus/test";
import { parseArticleToHtml, parseToHtml } from "./parse";

describe("parseArticleToHtml", () => {
  it("generates heading ids and TOC entries from the same AST", async () => {
    const result = await parseArticleToHtml(
      "## Hello *world*\n\n## Hello world\n\n### 日本語 見出し",
    );

    expect(result.headings).toEqual([
      { id: "hello-world", text: "Hello world", level: 2 },
      { id: "hello-world-2", text: "Hello world", level: 2 },
      { id: "日本語-見出し", text: "日本語 見出し", level: 3 },
    ]);
    expect(result.html).toContain('<h2 id="hello-world">Hello <em>world</em></h2>');
    expect(result.html).toContain('<h2 id="hello-world-2">Hello world</h2>');
  });

  it("renders standalone links as safe fallback cards", async () => {
    const result = await parseArticleToHtml("https://example.com/path?a=1&b=2");

    expect(result.html).toContain('class="embedded-link-card"');
    expect(result.html).toContain('data-ogp-url="https://example.com/path?a=1&#x26;b=2"');
    expect(result.html).toContain('rel="noopener noreferrer"');
    expect(result.html).toContain("example.com");
    expect(result.html).toContain("a=1&#x26;b=2");
  });

  it("emits a Twitter widget target instead of a generic link card", async () => {
    const result = await parseArticleToHtml("https://x.com/example/status/123?ref=source");

    expect(result.html).toContain('class="twitter-embed-placeholder"');
    expect(result.html).toContain('data-twitter-id="123"');
    expect(result.html).not.toContain("widgets.js");
  });

  it("wraps code blocks once with copy controls and an optional filename", async () => {
    const result = await parseArticleToHtml("```ts:index.ts\nconst value = 1;\n```");

    expect(result.html.match(/class="code-block"/g)).toHaveLength(1);
    expect(result.html).toContain('class="code-block-header"');
    expect(result.html).toContain('class="code-filename">index.ts</span>');
    expect(result.html).toContain('class="code-copy"');
    expect(result.html).toContain('<pre><code class="hljs language-ts">');
  });

  it("handles ordinary and info blockquotes without relying on child indexes", async () => {
    const result = await parseArticleToHtml("> ordinary\n\n> [!WARNING] Be careful");

    expect(result.html).toContain("<blockquote>");
    expect(result.html).toContain('data-component-type="info-card"');
    expect(result.html).toContain('data-info-type="warning"');
  });
});

describe("parseToHtml", () => {
  it("preserves parsed frontmatter", async () => {
    const result = await parseToHtml("---\ntitle: Example\n---\n\nBody");
    expect(result.frontmatter).toMatchObject({ title: "Example" });
  });
});
