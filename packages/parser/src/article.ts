import { transform } from "@ox-content/napi";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";

import rehypeCodeBlock from "./plugins/rehype-code-block";
import rehypeCodeFilename from "./plugins/rehype-code-filename";
import rehypeInfoCard from "./plugins/rehype-info-card";
import rehypeLinkCard from "./plugins/rehype-link-card";
import rehypeLinkCardFallback from "./plugins/rehype-link-card-fallback";
import rehypeSplitTaskLists from "./plugins/rehype-split-task-lists";

export interface ArticleHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export async function parseArticleToHtml(markdown: string): Promise<{
  html: string;
  headings: ArticleHeading[];
  frontmatter: Record<string, unknown>;
}> {
  const result = transform(markdown, { gfm: true });
  if (result.errors.length > 0) {
    throw new Error(result.errors.join("\n"));
  }

  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeCodeFilename)
    .use(rehypeCodeBlock)
    .use(rehypeCustom)
    .use(rehypeLinkCardFallback)
    .use(rehypeStringify)
    .process(result.html);

  return {
    html: String(file),
    headings: result.toc
      .filter((heading) => heading.depth === 2 || heading.depth === 3)
      .map((heading) => ({
        id: heading.slug,
        text: heading.text,
        level: heading.depth as 2 | 3,
      })),
    frontmatter: JSON.parse(result.frontmatter) as Record<string, unknown>,
  };
}

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
