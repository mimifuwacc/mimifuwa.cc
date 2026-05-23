"use client";

import { parseHtmlToReact } from "@mimifuwacc/parser";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { isValidElement, useEffect, useRef, useState } from "react";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";
import LinkCard from "./link-card";

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

// ── InfoCard ────────────────────────────────────────────────────────────

type InfoType = "info" | "success" | "warning" | "dangerous";

const infoThemes: Record<
  InfoType,
  {
    icon: React.ElementType;
    bg: string;
    titleColor: string;
    label: string;
  }
> = {
  info: {
    icon: FaCircleInfo,
    bg: "bg-primary/10 border-primary/30 [&>svg]:text-primary",
    titleColor: "text-primary",
    label: "INFO",
  },
  success: {
    icon: FaCircleCheck,
    bg: "bg-green-500/10 border-green-500/30 [&>svg]:text-green-600",
    titleColor: "text-green-600",
    label: "SUCCESS",
  },
  warning: {
    icon: FaTriangleExclamation,
    bg: "bg-amber-500/10 border-amber-500/30 [&>svg]:text-amber-600",
    titleColor: "text-amber-600",
    label: "WARNING",
  },
  dangerous: {
    icon: FaCircleExclamation,
    bg: "bg-destructive/10 border-destructive/30 [&>svg]:text-destructive",
    titleColor: "text-destructive",
    label: "DANGER",
  },
};

function InfoCard({ type, children }: { type: InfoType; children?: React.ReactNode }) {
  const t = infoThemes[type] ?? infoThemes.info;
  const Icon = t.icon;
  return (
    <Alert className={cn("my-4 px-4 py-3.5", t.bg)}>
      <Icon className="size-4 mt-0.5" />
      <AlertTitle className={cn("text-sm font-semibold", t.titleColor)}>{t.label}</AlertTitle>
      <AlertDescription className="text-sm leading-relaxed">{children}</AlertDescription>
    </Alert>
  );
}

// ── TwitterCard ──────────────────────────────────────────────────────────

function TwitterCard({ url, theme }: { url: string; theme: "light" | "dark" }) {
  const cleanUrl = url.replace(/^https:\/\/x\.com/, "https://twitter.com").split("?")[0];
  const containerRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: theme triggers widget reload with updated data-theme attribute
  useEffect(() => {
    const w = window as Window & {
      twttr?: { widgets?: { load: (el?: HTMLElement | null) => void } };
    };
    const load = () => w.twttr?.widgets?.load(containerRef.current);
    if (w.twttr?.widgets) {
      load();
      return;
    }
    if (document.getElementById("twitter-wjs")) {
      const interval = setInterval(() => {
        if ((window as typeof w).twttr?.widgets) {
          clearInterval(interval);
          load();
        }
      }, 100);
      return () => clearInterval(interval);
    }
    const js = document.createElement("script");
    js.id = "twitter-wjs";
    js.src = "https://platform.twitter.com/widgets.js";
    js.onload = load;
    document.body.appendChild(js);
  }, [theme]);

  return (
    <div ref={containerRef} className="flex justify-center my-6">
      <blockquote className="twitter-tweet" data-lang="ja" data-theme={theme}>
        <a href={`${cleanUrl}?ref_src=twsrc%5Etfw`} className="invisible">
          {cleanUrl}
        </a>
      </blockquote>
    </div>
  );
}

// ── CodeBlock ────────────────────────────────────────────────────────────

type El = {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
};

function CodeBlock(props: El) {
  const { children, ...rest } = props;
  const filename = rest["data-filename"] as string | undefined;
  const { "data-filename": _f, ...preProps } = rest;
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const text = preRef.current?.innerText ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyBtn = (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1 text-xs transition-colors cursor-pointer"
      style={{ color: "var(--code-copy-color)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--code-copy-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--code-copy-color)";
      }}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      <span>{copied ? "Copied!" : "Copy"}</span>
    </button>
  );

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-border">
      {filename ? (
        <>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60"
            style={{ backgroundColor: "var(--code-bg)" }}
          >
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "color-mix(in srgb, var(--code-copy-color) 15%, transparent)",
                color: "var(--code-copy-color)",
              }}
            >
              {filename}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {copyBtn}
            </div>
          </div>
          <pre
            ref={preRef}
            className="overflow-x-auto p-5 text-sm leading-relaxed"
            // biome-ignore lint/suspicious/noExplicitAny: csstype version mismatch workaround
            style={{ backgroundColor: "var(--code-bg)" } as any}
            {...(preProps as React.HTMLAttributes<HTMLPreElement>)}
          >
            {children}
          </pre>
        </>
      ) : (
        <>
          <div className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {copyBtn}
          </div>
          <pre
            ref={preRef}
            className="overflow-x-auto p-4 text-sm leading-relaxed"
            // biome-ignore lint/suspicious/noExplicitAny: csstype version mismatch workaround
            style={{ backgroundColor: "var(--code-bg)" } as any}
            {...(preProps as React.HTMLAttributes<HTMLPreElement>)}
          >
            {children}
          </pre>
        </>
      )}
    </div>
  );
}

// ── Component map ────────────────────────────────────────────────────────

const mark = (s: string) => (
  <span className="text-muted-foreground/40 mr-2 font-normal select-none">{s}</span>
);

function makeBlogComponents(theme: "light" | "dark"): Record<string, ComponentType<any>> {
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

// ── ContentRenderer ──────────────────────────────────────────────────────

export default function ContentRenderer({
  html,
  theme = "light",
}: {
  html: string;
  theme?: "light" | "dark";
}) {
  const blogComponents = makeBlogComponents(theme);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["parsed-html", html],
    queryFn: () => parseHtmlToReact(html, blogComponents),
    staleTime: Number.POSITIVE_INFINITY,
  });

  if (isLoading) return null;
  if (isError || !data)
    return (
      // biome-ignore lint/security/noDangerouslySetInnerHtml: フォールバック
      <div dangerouslySetInnerHTML={{ __html: html }} />
    );

  return <div className="max-w-none">{data.content as React.ReactNode}</div>;
}
