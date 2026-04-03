import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remark from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import rehypeLinkCard from "./rehype-link-card";

describe("rehypeLinkCard", () => {
  const processMarkdown = (markdown: string) => {
    return unified()
      .use(remark)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeLinkCard)
      .use(rehypeStringify)
      .process(markdown);
  };

  it("URLだけの段落をリンクカードに変換できる", async () => {
    const markdown = "https://example.com";
    const result = await processMarkdown(markdown);

    expect(String(result)).toContain('data-component-type="link-card"');
    expect(String(result)).toContain('data-url="https://example.com"');
  });

  it("テキストリンクをリンクカードに変換できる", async () => {
    const markdown = "[https://example.com](https://example.com)";
    const result = await processMarkdown(markdown);

    expect(String(result)).toContain('data-component-type="link-card"');
    expect(String(result)).toContain('data-url="https://example.com"');
  });

  it("httpsリンクを処理できる", async () => {
    const markdown = "https://github.com";
    const result = await processMarkdown(markdown);

    expect(String(result)).toContain('data-component-type="link-card"');
    expect(String(result)).toContain('data-url="https://github.com"');
  });

  it("httpリンクを処理できる", async () => {
    const markdown = "http://example.com";
    const result = await processMarkdown(markdown);

    expect(String(result)).toContain('data-component-type="link-card"');
    expect(String(result)).toContain('data-url="http://example.com"');
  });

  it("複数のURLを別々の段落で処理できる", async () => {
    const markdown = `
https://example.com

https://github.com
`;
    const result = await processMarkdown(markdown);

    const html = String(result);
    expect(html).toContain('data-component-type="link-card"');
    expect(html).toContain('data-url="https://example.com"');
    expect(html).toContain('data-url="https://github.com"');
  });

  it("URLを含む通常のテキストは変換しない", async () => {
    const markdown = "このサイトは https://example.com です";
    const result = await processMarkdown(markdown);

    const html = String(result);
    expect(html).toContain("<p>");
    expect(html).not.toContain('data-component-type="link-card"');
  });

  it("URLとテキストが混在する段落は変換しない", async () => {
    const markdown = "チェックしてね: https://example.com";
    const result = await processMarkdown(markdown);

    const html = String(result);
    expect(html).toContain("<p>");
    expect(html).not.toContain('data-component-type="link-card"');
  });

  it("異なるテキストのリンクは変換しない", async () => {
    const markdown = "[Example](https://example.com)";
    const result = await processMarkdown(markdown);

    const html = String(result);
    expect(html).toContain("<a");
    expect(html).not.toContain('data-component-type="link-card"');
  });

  it("空の段落は変換しない", async () => {
    const markdown = "";
    const result = await processMarkdown(markdown);

    expect(String(result)).not.toContain('data-component-type="link-card"');
  });

  it("無効なURLは変換しない", async () => {
    const markdown = "not-a-url";
    const result = await processMarkdown(markdown);

    const html = String(result);
    expect(html).toContain("<p>");
    expect(html).not.toContain('data-component-type="link-card"');
  });

  it("複数行のコンテンツには影響を与えない", async () => {
    const markdown = `
最初の段落

https://example.com

最後の段落
`;
    const result = await processMarkdown(markdown);

    const html = String(result);
    expect(html).toContain('data-component-type="link-card"');
    expect(html).toContain('data-url="https://example.com"');
    expect(html).toContain("最初の段落");
    expect(html).toContain("最後の段落");
  });

  it("URLにクエリパラメータが含まれていても処理できる", async () => {
    const markdown = "https://example.com/path?param=value&other=123";
    const result = await processMarkdown(markdown);

    expect(String(result)).toContain('data-component-type="link-card"');
    expect(String(result)).toContain(
      'data-url="https://example.com/path?param=value&#x26;other=123"',
    );
  });

  it("URLにフラグメントが含まれていても処理できる", async () => {
    const markdown = "https://example.com/path#section";
    const result = await processMarkdown(markdown);

    expect(String(result)).toContain('data-component-type="link-card"');
    expect(String(result)).toContain(
      'data-url="https://example.com/path#section"',
    );
  });
});
