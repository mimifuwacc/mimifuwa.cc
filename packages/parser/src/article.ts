import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

import rehypeCodeBlock from "./plugins/rehype-code-block";
import rehypeCodeFilename from "./plugins/rehype-code-filename";
import rehypeHeadingIds, { type ArticleHeading } from "./plugins/rehype-heading-ids";
import rehypeInfoCard from "./plugins/rehype-info-card";
import rehypeLinkCard from "./plugins/rehype-link-card";
import rehypeLinkCardFallback from "./plugins/rehype-link-card-fallback";
import rehypeSplitTaskLists from "./plugins/rehype-split-task-lists";
import remarkMessage from "./plugins/remark-message";

export type { ArticleHeading } from "./plugins/rehype-heading-ids";

export async function parseArticleToHtml(markdown: string): Promise<{
  html: string;
  headings: ArticleHeading[];
  frontmatter: Record<string, unknown>;
}> {
  const headings: ArticleHeading[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkMessage as any)
    .use(remarkRehype)
    .use(rehypeCodeFilename)
    .use(rehypeHighlight)
    .use(rehypeCodeBlock)
    .use(rehypeHeadingIds, headings)
    .use(rehypeCustom)
    .use(rehypeLinkCardFallback)
    .use(rehypeStringify)
    .process(markdownFile(markdown));

  return {
    html: String(file.value),
    headings,
    frontmatter: (file.data.matter || {}) as Record<string, unknown>,
  };
}

const markdownFile = (markdown: string) => {
  const file = new VFile({ value: markdown });
  matter(file);
  return file;
};

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
