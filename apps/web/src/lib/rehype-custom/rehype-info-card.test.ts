import rehypeStringify from "rehype-stringify";
import remark from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import rehypeInfoCard from "./rehype-info-card";

describe("rehypeInfoCard", () => {
  const processMarkdown = (markdown: string) => {
    return unified()
      .use(remark)
      .use(remarkRehype)
      .use(rehypeInfoCard)
      .use(rehypeStringify)
      .process(markdown);
  };

  it("[!INFO]ブロッククォートを情報カードに変換できる", async () => {
    const markdown = `
> [!INFO] This is an info message
> Additional content
`;
    const result = await processMarkdown(markdown);

    expect(String(result)).toContain('data-component-type="info-card"');
    expect(String(result)).toContain('data-info-type="info"');
    expect(String(result)).toContain("This is an info message");
  });

  it("[!SUCCESS]ブロッククォートを成功カードに変換できる", async () => {
    const markdown = `
> [!SUCCESS] This is a success message
`;
    const result = await processMarkdown(markdown);

    expect(String(result)).toContain('data-component-type="info-card"');
    expect(String(result)).toContain('data-info-type="success"');
    expect(String(result)).toContain("This is a success message");
  });

  it("[!WARNING]ブロッククォートを警告カードに変換できる", async () => {
    const markdown = `
> [!WARNING] This is a warning message
`;
    const result = await processMarkdown(markdown);

    expect(String(result)).toContain('data-component-type="info-card"');
    expect(String(result)).toContain('data-info-type="warning"');
    expect(String(result)).toContain("This is a warning message");
  });

  it("[!DANGER]ブロッククォートを危険カードに変換できる", async () => {
    const markdown = `
> [!DANGER] This is a danger message
`;
    const result = await processMarkdown(markdown);

    expect(String(result)).toContain('data-component-type="info-card"');
    expect(String(result)).toContain('data-info-type="danger"');
    expect(String(result)).toContain("This is a danger message");
  });

  it("[!TYPE]プレフィックスをテキストから除去できる", async () => {
    const markdown = `
> [!INFO] Important information here
`;
    const result = await processMarkdown(markdown);

    const html = String(result);
    expect(html).toContain("Important information here");
    expect(html).not.toContain("[!INFO]");
  });

  it("複数行のコンテンツを情報カード内で処理できる", async () => {
    const markdown = `
> [!INFO] This is the first line
> This is the second line
> This is the third line
`;
    const result = await processMarkdown(markdown);

    const html = String(result);
    expect(html).toContain("This is the first line");
    expect(html).toContain("This is the second line");
    expect(html).toContain("This is the third line");
  });

  it("通常のブロッククォートには影響を与えない", async () => {
    const markdown = `
> This is a regular blockquote
> Without any info prefix
`;
    const result = await processMarkdown(markdown);

    const html = String(result);
    expect(html).toContain("<blockquote>");
    expect(html).not.toContain('data-component-type="info-card"');
  });

  it("情報カード内のHTML要素を保持できる", async () => {
    const markdown = `
> [!INFO] This has **bold** and *italic* text
`;
    const result = await processMarkdown(markdown);

    const html = String(result);
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
    expect(html).toContain("This has");
    expect(html).toContain("bold");
    expect(html).toContain("italic");
    expect(html).toContain("text");
  });

  it("プレフィックス後の空コンテンツを処理できる", async () => {
    const markdown = `
> [!INFO] 
> Some content after empty line
`;
    const result = await processMarkdown(markdown);

    expect(String(result)).toContain('data-component-type="info-card"');
    expect(String(result)).toContain("Some content after empty line");
  });

  it("無効な情報タイプは変換しない", async () => {
    const markdown = `
> [!INVALID] This should not be converted
`;
    const result = await processMarkdown(markdown);

    const html = String(result);
    expect(html).toContain("<blockquote>");
    expect(html).not.toContain('data-component-type="info-card"');
  });
});
