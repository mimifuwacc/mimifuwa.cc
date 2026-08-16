import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

import rehypeCodeFilename from "./plugins/rehype-code-filename";
import rehypeCodeBlock from "./plugins/rehype-code-block";
import rehypeInfoCard from "./plugins/rehype-info-card";
import rehypeHeadingIds, { type ArticleHeading } from "./plugins/rehype-heading-ids";
import rehypeLinkCard from "./plugins/rehype-link-card";
import rehypeLinkCardFallback from "./plugins/rehype-link-card-fallback";
import rehypeSplitTaskLists from "./plugins/rehype-split-task-lists";
import remarkMessage from "./plugins/remark-message";

export interface ParsedResult {
  frontmatter: Record<string, unknown>;
}

const markdownProcessor = () =>
  unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkMessage)
    .use(remarkRehype)
    .use(rehypeCodeFilename)
    .use(rehypeHighlight)
    .use(rehypeCustom);

const markdownFile = (markdown: string) => {
  const file = new VFile({ value: markdown });
  matter(file);
  return file;
};

/**
 * MarkdownをHTMLにパースする（Workers対応）
 */
export async function parseToHtml(markdown: string): Promise<{
  html: string;
  frontmatter: Record<string, unknown>;
}> {
  const file = await markdownProcessor().use(rehypeStringify).process(markdownFile(markdown));
  const frontmatter = file.data.matter || {};

  return {
    html: String(file.value),
    frontmatter,
  };
}

/**
 * 記事表示用HTMLと目次情報を、同じHASTから生成する。
 */
export async function parseArticleToHtml(markdown: string): Promise<{
  html: string;
  headings: ArticleHeading[];
  frontmatter: Record<string, unknown>;
}> {
  const headings: ArticleHeading[] = [];
  const file = await markdownProcessor()
    .use(rehypeCodeBlock)
    .use(rehypeHeadingIds, headings)
    .use(rehypeLinkCardFallback)
    .use(rehypeStringify)
    .process(markdownFile(markdown));

  return {
    html: String(file.value),
    headings,
    frontmatter: file.data.matter || {},
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
    .use(rehypeCodeFilename)
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
    .use(remarkMessage)
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
    .use(remarkMessage)
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
