import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { matter } from "vfile-matter";

import rehypeLinkCard from "./plugins/rehype-link-card";
import rehypeInfoCard from "./plugins/rehype-info-card";
import rehypeSplitTaskLists from "./plugins/rehype-split-task-lists";

export interface ParsedResult {
  frontmatter: Record<string, unknown>;
}

/**
 * MarkdownをHTMLにパースする（Workers対応）
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
    .use(rehypeStringify)
    .process(markdown);

  matter(file);
  const frontmatter = file.data.matter || {};

  return {
    html: String(file.value),
    frontmatter,
  };
}

/**
 * HTMLをReactコンポーネントにパースする（カスタムコンポーネント対応）
 */
export async function parseHtmlToReact(
  html: string,
  components?: Record<string, React.ComponentType<any>>,
): Promise<{ content: any }> {
  const rehypeParse = (await import("rehype-parse")).default;
  const rehypeReact = (await import("rehype-react")).default;
  const { jsx, jsxs, Fragment } = await import("react/jsx-runtime");

  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeHighlight)
    .use(rehypeReact, {
      jsx,
      jsxs,
      Fragment,
      ...(components ? { components } : {}),
    } as any)
    .process(html);

  return { content: file.result };
}

// React用（Webアプリなど）
export async function parseToReact(markdown: string): Promise<{
  content: any;
  frontmatter: Record<string, unknown>;
}> {
  const rehypeReact = (await import("rehype-react")).default;
  const { jsx, jsxs, Fragment } = await import("react/jsx-runtime");

  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeCustom)
    .use(rehypeReact, { jsx, jsxs, Fragment } as any)
    .process(markdown);

  matter(file);
  const frontmatter = file.data.matter || {};

  return {
    content: file.value,
    frontmatter,
  };
}

/**
 * React用（カスタムコンポーネント対応）
 */
export async function parseToReactWithComponents(
  markdown: string,
  components: Record<string, React.ComponentType<any>>,
): Promise<{
  content: any;
  frontmatter: Record<string, unknown>;
}> {
  const rehypeReact = (await import("rehype-react")).default;
  const { jsx, jsxs, Fragment } = await import("react/jsx-runtime");

  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeCustom)
    .use(rehypeReact, { jsx, jsxs, Fragment, components } as any)
    .process(markdown);

  matter(file);
  const frontmatter = file.data.matter || {};

  return {
    content: file.value,
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
