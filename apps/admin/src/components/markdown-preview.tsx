"use client";

import { parseToHtml } from "@mimifuwacc/parser";
import { useEffect, useState } from "react";
import InfoCard, { type InfoCardProps } from "./preview/info-card";
import LinkCard from "./preview/link-card";
import TwitterCard from "./preview/twitter-card";

interface MarkdownPreviewProps {
  markdown: string;
  className?: string;
}

export function MarkdownPreview({ markdown, className = "" }: MarkdownPreviewProps) {
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function parseMarkdown() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await parseToHtml(markdown);

        if (!cancelled) {
          console.log("Parsed HTML:", result.html);
          setHtml(result.html);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Parse error:", err);
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    parseMarkdown();

    return () => {
      cancelled = true;
    };
  }, [markdown]);

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="font-bold">Preview Error</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-slate-500 text-center py-8">Loading preview...</div>;
  }

  return (
    <div
      className={`prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

type ComponentData = {
  [key: string]: string | undefined;
};

function extractComponentProps(
  props: Record<string, any>,
): [ComponentData, Record<string, any>, any] {
  const { children, ...restProps } = props;

  const componentData = Object.keys(restProps).reduce((acc, key) => {
    if (key.startsWith("data-")) {
      acc[key] = restProps[key];
    }
    return acc;
  }, {} as ComponentData);

  const cleanProps = Object.keys(restProps).reduce(
    (acc, key) => {
      if (!key.startsWith("data-")) {
        acc[key] = restProps[key];
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  return [componentData, cleanProps, children];
}
