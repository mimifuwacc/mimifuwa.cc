import type { ReactElement } from "react";
import production from "react/jsx-runtime";
import rehypeReact from "rehype-react";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { matter } from "vfile-matter";

import InfoCard, { type InfoCardProps } from "@/components/info-card";
import LinkCard from "@/components/link-card";

import {
  type ComponentProps,
  extractComponentProps,
  rehypeCustom,
} from "./rehype-custom";

export interface ParsedResult {
  content: ReactElement;
  frontmatter: Record<string, string | number | boolean>;
}

export default async function parser(markdown: string): Promise<ParsedResult> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeCustom)
    .use(rehypeReact, {
      ...production,
      components: {
        div: (props: ComponentProps) => {
          const [componentData, restProps, children] =
            extractComponentProps(props);

          switch (componentData["data-component-type"]) {
            case "link-card":
              return componentData["data-url"] ? (
                <LinkCard url={componentData["data-url"]} />
              ) : null;
            case "info-card":
              return (
                <InfoCard
                  type={
                    componentData["data-info-type"] as InfoCardProps["type"]
                  }
                >
                  {children}
                </InfoCard>
              );
            default:
              return <div {...restProps}>{children}</div>;
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
