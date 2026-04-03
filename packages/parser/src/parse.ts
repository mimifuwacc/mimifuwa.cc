import type { ReactElement } from "react";
import production from "react/jsx-runtime";
import rehypeHighlight from "rehype-highlight";
import rehypeReact from "rehype-react";
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
  content: ReactElement;
  frontmatter: Record<string, unknown>;
}

export interface ComponentData {
  "data-component-type"?: string;
  "data-url"?: string;
  "data-info-type"?: string;
}

export type ComponentProps = Record<string, unknown> & ComponentData;

/**
 * MarkdownをReactコンポーネントにパースする
 */
export async function parseToReact(markdown: string): Promise<ParsedResult> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeCustom)
    .use(rehypeReact, {
      ...production,
      components: {
        div: (props: ComponentProps) => {
          const componentType = props["data-component-type"];
          const { "data-component-type": _, "data-url": __, "data-info-type": ___, ...restProps } = props;

          switch (componentType) {
            case "link-card":
            case "twitter-card":
              // プレースホルダーdivを返す（後でHTMLに変換）
              return <div {...props} />;
            case "info-card":
              // プレースホルダーdivを返す（後でHTMLに変換）
              return <div {...props} />;
            default:
              return <div {...restProps}>{(props as any).children}</div>;
          }
        },
      },
    })
    .process(markdown);

  matter(file);
  const frontmatter = file.data.matter || {};

  return {
    content: file.result as ReactElement,
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
