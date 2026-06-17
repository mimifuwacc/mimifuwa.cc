import type { ComponentType, ReactNode } from "react";
import { isValidElement } from "react";
import { cn } from "../../lib/utils";
import LinkCard from "../link-card";
import { Separator } from "../ui/separator";
import { CodeBlock } from "./code-block";
import { InfoCard, type InfoType } from "./info-card";
import { TwitterCard } from "./twitter-card";
import type { El } from "./types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s぀-ヿ一-鿿]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function childrenToText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join("");
  if (isValidElement(children))
    return childrenToText((children.props as { children?: ReactNode }).children);
  return "";
}

const mark = (s: string) => (
  <span className="text-muted-foreground/40 mr-2 font-normal select-none">{s}</span>
);

// Markdown の各要素を対応する React コンポーネントへ変換するマップを生成する
export function makeBlogComponents(theme: "light" | "dark"): Record<string, ComponentType<any>> {
  return {
    h1: ({ children, ...p }: El) => (
      <h1 className="text-3xl font-bold mt-12 mb-4 text-foreground/70" {...p}>
        {mark("#")}
        {children}
      </h1>
    ),
    h2: ({ children, ...p }: El) => {
      const id = slugify(childrenToText(children as ReactNode));
      return (
        <h2
          {...p}
          id={id}
          className="scroll-mt-20 text-2xl font-bold mt-12 mb-4 pb-3 text-foreground/70 border-b border-border"
        >
          {mark("##")}
          {children}
        </h2>
      );
    },
    h3: ({ children, ...p }: El) => {
      const id = slugify(childrenToText(children as ReactNode));
      return (
        <h3
          {...p}
          id={id}
          className="scroll-mt-20 text-xl font-semibold mt-8 mb-3 text-foreground/70"
        >
          {mark("###")}
          {children}
        </h3>
      );
    },
    h4: ({ children, ...p }: El) => (
      <h4 className="text-base font-semibold mt-6 mb-2 text-foreground/70" {...p}>
        {mark("####")}
        {children}
      </h4>
    ),
    p: ({ children, ...p }: El) => (
      <p className="mb-5 leading-8 text-foreground/85" {...p}>
        {children}
      </p>
    ),
    strong: ({ children, ...p }: El) => (
      <strong className="font-bold text-foreground" {...p}>
        {children}
      </strong>
    ),
    em: ({ children, ...p }: El) => (
      <em className="italic text-foreground/80" {...p}>
        {children}
      </em>
    ),
    a: ({ children, href, ...p }: El) => (
      <a
        href={href as string}
        className="text-primary underline decoration-2 underline-offset-2 hover:text-primary/80 transition-colors"
        {...p}
      >
        {children}
      </a>
    ),
    ul: ({ children, ...p }: El) => (
      <ul className="mb-5 space-y-1.5 pl-1" {...p}>
        {children}
      </ul>
    ),
    ol: ({ children, ...p }: El) => (
      <ol className="mb-5 space-y-1.5 list-decimal pl-5" {...p}>
        {children}
      </ol>
    ),
    li: ({ children, className, ...p }: El) => (
      <li
        className={cn(
          "leading-7 text-foreground/90 flex items-start gap-2",
          "[&:not(.task-list-item)]:before:content-['•'] [&:not(.task-list-item)]:before:text-primary [&:not(.task-list-item)]:before:text-xs [&:not(.task-list-item)]:before:mt-[0.4rem] [&:not(.task-list-item)]:before:shrink-0",
          className as string,
        )}
        {...p}
      >
        {children}
      </li>
    ),
    blockquote: ({ children, ...p }: El) => (
      <blockquote
        className="border-l-4 border-primary/40 pl-5 py-0.5 my-6 text-muted-foreground bg-muted/30 rounded-r-md [&_p:last-child]:mb-0"
        {...p}
      >
        {children}
      </blockquote>
    ),
    code: ({ children, className, ...p }: El) => {
      if (className)
        return (
          <code
            className={cn("text-sm font-mono", className as string)}
            style={{ background: "transparent" }}
            {...p}
          >
            {children}
          </code>
        );
      return (
        <code
          className="bg-muted/80 text-foreground px-1.5 py-0.5 rounded text-[0.85em] font-mono"
          {...p}
        >
          {children}
        </code>
      );
    },
    pre: (p: El) => <CodeBlock {...p} />,
    img: ({ src, alt, ...p }: El) => (
      // biome-ignore lint/performance/noImgElement: markdown content
      <img
        src={src as string}
        alt={alt as string}
        className="rounded-xl shadow-sm my-6 max-w-full mx-auto border border-border"
        {...p}
      />
    ),
    hr: () => <Separator className="my-10" />,
    table: ({ children, ...p }: El) => (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse text-sm" {...p}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...p }: El) => (
      <th
        className="border border-border bg-muted px-4 py-2 text-left font-semibold text-xs uppercase tracking-wide"
        {...p}
      >
        {children}
      </th>
    ),
    td: ({ children, ...p }: El) => (
      <td className="border border-border px-4 py-2.5" {...p}>
        {children}
      </td>
    ),
    div: ({
      "data-component-type": type,
      "data-url": url,
      "data-info-type": infoType,
      children,
      ...p
    }: El) => {
      if (type === "link-card" && url) return <LinkCard url={url as string} />;
      if (type === "twitter-card" && url) return <TwitterCard url={url as string} theme={theme} />;
      if (type === "info-card")
        return <InfoCard type={(infoType as InfoType) ?? "info"}>{children}</InfoCard>;
      return <div {...p}>{children}</div>;
    },
  };
}
