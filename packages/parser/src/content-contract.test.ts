import { describe, expect, it } from "vite-plus/test";
import { parseArticleToHtml, parseToHtml } from "./parse";

/**
 * ox-content への移行後も維持する、記事本文の最小 HTML contract。
 * ここでは見た目の class 名ではなく、公開ページと renderer が依存する意味的な属性を固定する。
 */
describe("content contract", () => {
  it("preserves the constructs used by the public article renderer", async () => {
    const markdown = `---
title: Contract fixture
tags: [migration]
---

## 見出し

本文と [リンク](https://example.com)。

> [!WARNING] 注意

:::message

補足です。

:::

https://x.com/example/status/123

~~~ts:example.ts
const value = 1;
~~~
`;
    const result = await parseArticleToHtml(markdown);
    const parsed = await parseToHtml(markdown);

    expect(parsed.frontmatter).toMatchObject({
      title: "Contract fixture",
      tags: ["migration"],
    });
    expect(result.headings).toEqual([{ id: "見出し", text: "見出し", level: 2 }]);
    expect(result.html).toContain('<h2 id="見出し">見出し</h2>');
    expect(result.html).toContain('data-component-type="info-card"');
    expect(result.html).toContain('data-info-type="warning"');
    expect(result.html).toContain('class="twitter-embed-placeholder"');
    expect(result.html).toContain('data-embed="twitter"');
    expect(result.html).toContain('data-twitter-id="123"');
    expect(result.html).toContain('style="aspect-ratio: 1 / 1"');
    expect(result.html).toContain('class="code-filename">example.ts</span>');
  });
});
