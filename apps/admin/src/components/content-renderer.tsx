"use client";

import { parseHtmlToReact } from "@mimifuwacc/parser";
import { useQuery } from "@tanstack/react-query";
import { makeBlogComponents } from "./content/blog-components";

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
