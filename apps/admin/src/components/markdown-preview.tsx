"use client";

import ContentRenderer from "./content-renderer";
import { parseToHtml } from "@mimifuwacc/parser";
import { useEffect, useState, useTransition } from "react";

export function MarkdownPreview({ markdown }: { markdown: string }) {
  const [html, setHtml] = useState("");
  // パース結果の反映は非緊急更新として扱い、入力の応答性を保つ
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!markdown) {
      setHtml("");
      return;
    }
    let active = true;
    void parseToHtml(markdown).then(({ html: result }) => {
      // 古い（破棄済みの）パース結果は反映しない
      if (active) startTransition(() => setHtml(result));
    });
    return () => {
      active = false;
    };
  }, [markdown]);

  return <ContentRenderer html={html} />;
}
