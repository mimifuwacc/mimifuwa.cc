import rehypeHighlight from "rehype-highlight";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { matter } from "vfile-matter";

import rehypeLinkCard from "./plugins/rehype-link-card";
import rehypeInfoCard from "./plugins/rehype-info-card";
import rehypeSplitTaskLists from "./plugins/rehype-split-task-lists";
import { hastToHtml } from "./serialize";

export interface ParsedResult {
  frontmatter: Record<string, unknown>;
}

/**
 * MarkdownをHTMLにパースする（Hastノード→HTML）
 */
export async function parseToHtml(markdown: string): Promise<{
  html: string;
  frontmatter: Record<string, unknown>;
}> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeCustom)
    .process(markdown);

  matter(file);
  const frontmatter = file.data.matter || {};

  // HastノードをHTMLに変換
  const html = await hastToHtml(file.result);

  return {
    html,
    frontmatter,
  };
}

// React用（Webアプリなど）
export async function parseToReact(markdown: string): Promise<{
  content: any;
  frontmatter: Record<string, unknown>;
}> {
  const rehypeReact = (await import("rehype-react")).default;
  const production = (await import("react/jsx-runtime")).default;

  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeCustom)
    .use(rehypeReact, {
      ...production,
      createElement: undefined, // Cloudflare Workers対応
    })
    .process(markdown);

  matter(file);
  const frontmatter = file.data.matter || {};

  return {
    content: file.result,
    frontmatter,
  };
}

/**
 * カスタムrehypeプラグインを統合
 */
const rehypeCustom = () => {
  const infoCardPlugin = rehypeInfoCard();
  const linkCardPlugin = rehypeLinkCard();
  const splitTaskListsPlugin = rehypeSplitTaskLists();

  return (tree: any) => {
    infoCardPlugin(tree);
    linkCardPlugin(tree);
    splitTaskListsPlugin(tree);
  };
};
