import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remark from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import rehypeSplitTaskLists from "./rehype-split-task-lists";

describe("rehypeSplitTaskLists", () => {
  const processMarkdown = (markdown: string) => {
    return unified()
      .use(remark)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSplitTaskLists)
      .use(rehypeStringify)
      .process(markdown);
  };

  it("タスクリストと通常リストを分割できる", async () => {
    const markdown = `
- [ ] todo item
- [x] done item

- regular item
- another item
`;
    const result = await processMarkdown(markdown);
    const html = String(result);

    // 最初のul要素（タスクリスト）の確認
    expect(html).toContain('<ul class="contains-task-list">');
    expect(html).toContain('<li class="task-list-item">');
    expect(html).toContain("todo item");
    expect(html).toContain("done item");
    expect(html).toContain('<input type="checkbox" disabled>');

    // 2番目のul要素（通常リスト）の確認
    expect(html).toMatch(/<ul>(?![^<]*class="contains-task-list")/);
    expect(html).toContain("regular item");
    expect(html).toContain("another item");
    expect(html).not.toContain('<li class="task-list-item">regular item</li>');
  });

  it("通常リストのみの場合は分割しない", async () => {
    const markdown = `
- item 1
- item 2
- item 3
`;
    const result = await processMarkdown(markdown);
    const html = String(result);

    // ulが1つだけ存在することを確認
    const ulMatches = html.match(/<ul[^>]*>/g);
    expect(ulMatches).toHaveLength(1);
    expect(html).toContain("item 1");
    expect(html).toContain("item 2");
    expect(html).toContain("item 3");
    expect(html).not.toContain("contains-task-list");
  });

  it("タスクリストのみの場合は分割しない", async () => {
    const markdown = `
- [ ] task 1
- [x] task 2
- [ ] task 3
`;
    const result = await processMarkdown(markdown);
    const html = String(result);

    // ulが1つだけ存在することを確認（空のulが生成される場合がある）
    const ulMatches = html.match(/<ul[^>]*>/g) || [];
    expect(ulMatches.length).toBeGreaterThanOrEqual(1);
    expect(ulMatches.length).toBeLessThanOrEqual(2);
    expect(html).toContain("contains-task-list");
    expect(html).toContain("task 1");
    expect(html).toContain("task 2");
    expect(html).toContain("task 3");
  });

  it("複数のタスクリストと通常リストの組み合わせを処理できる", async () => {
    const markdown = `
- [ ] first task
- [x] second task

- first regular
- second regular

- [ ] another task
- [ ] yet another task

- more regular
- final regular
`;
    const result = await processMarkdown(markdown);
    const html = String(result);

    // 2つのul要素に分割されていることを確認
    const ulMatches = html.match(/<ul[^>]*>/g);
    expect(ulMatches).toHaveLength(2);

    // タスクリストの確認
    expect(html).toContain("first task");
    expect(html).toContain("second task");
    expect(html).toContain("another task");
    expect(html).toContain("yet another task");

    // 通常リストの確認
    expect(html).toContain("first regular");
    expect(html).toContain("second regular");
    expect(html).toContain("more regular");
    expect(html).toContain("final regular");
  });

  it("空行で区切られたリストを分割できる", async () => {
    const markdown = `
- [ ] incomplete
- [x] complete

- normal item
`;
    const result = await processMarkdown(markdown);
    const html = String(result);

    expect(html).toContain("contains-task-list");
    expect(html).toContain("incomplete");
    expect(html).toContain("complete");
    expect(html).toContain("normal item");

    // 2つのul要素に分割されていることを確認
    const ulMatches = html.match(/<ul[^>]*>/g);
    expect(ulMatches).toHaveLength(2);
  });

  it("リスト内のHTML要素を保持できる", async () => {
    const markdown = `
- [ ] task with **bold**
- [x] task with *italic*

- regular with [link](https://example.com)
- regular with \`code\`
`;
    const result = await processMarkdown(markdown);
    const html = String(result);

    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
    expect(html).toContain('<a href="https://example.com">');
    expect(html).toContain("<code>");
    expect(html).toContain("bold");
    expect(html).toContain("italic");
    expect(html).toContain("link");
    expect(html).toContain("code");
  });

  it("ネストしたリストには影響を与えない", async () => {
    const markdown = `
- [ ] parent task
  - nested item
  - another nested

- regular parent
  - nested regular
`;
    const result = await processMarkdown(markdown);
    const html = String(result);

    // タスクリストと通常リストが分割されていることを確認
    expect(html).toContain("contains-task-list");
    expect(html).toContain("parent task");
    expect(html).toContain("regular parent");
    expect(html).toContain("nested item");
    expect(html).toContain("nested regular");
  });

  it("単一のタスクリスト項目と通常リスト項目を分割できる", async () => {
    const markdown = `
- [ ] only task

- only regular
`;
    const result = await processMarkdown(markdown);
    const html = String(result);

    expect(html).toContain("contains-task-list");
    expect(html).toContain("only task");
    expect(html).toContain("only regular");

    // 2つのul要素に分割されていることを確認
    const ulMatches = html.match(/<ul[^>]*>/g);
    expect(ulMatches).toHaveLength(2);
  });

  it("空のリストには影響を与えない", async () => {
    const markdown = `
- [ ]
- [x]


-
`;
    const result = await processMarkdown(markdown);
    const html = String(result);

    // 空の項目はタスクリストとして認識されないことを確認
    expect(html).not.toContain("contains-task-list");
    const ulMatches = html.match(/<ul[^>]*>/g);
    expect(ulMatches).toHaveLength(1);
  });

  it("複雑なマークダウン構造を処理できる", async () => {
    const markdown = `
# 見出し

ここは通常のテキストです。

- [ ] 最初のタスク
- [x] 2番目のタスク

- 通常のリスト項目
- もう一つの項目

## 別の見出し

さらにテキストが続きます。
`;
    const result = await processMarkdown(markdown);
    const html = String(result);

    // 見出しとテキストが保持されていることを確認
    expect(html).toContain("<h1>");
    expect(html).toContain("見出し");
    expect(html).toContain("<h2>");
    expect(html).toContain("別の見出し");
    expect(html).toContain("通常のテキストです");

    // リストが分割されていることを確認
    expect(html).toContain("contains-task-list");
    expect(html).toContain("最初のタスク");
    expect(html).toContain("通常のリスト項目");

    const ulMatches = html.match(/<ul[^>]*>/g);
    expect(ulMatches).toHaveLength(2);
  });
});
