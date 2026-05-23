"use client";

import ContentRenderer from "@mimifuwacc/ui/components/content-renderer";
import { parseToHtml } from "@mimifuwacc/parser";
import { useEffect, useState } from "react";

export function MarkdownPreview({ markdown }: { markdown: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!markdown) {
      setHtml("");
      return;
    }
    let cancelled = false;
    parseToHtml(markdown).then(({ html: result }) => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [markdown]);

  return <ContentRenderer html={html} />;
}
