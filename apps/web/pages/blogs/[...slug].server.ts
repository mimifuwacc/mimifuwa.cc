import { defineHandler, defineHead, type InferProps } from "void";
import { getContent } from "@/content-api";
import type { BlogArticle } from "@/types/blog";

export const loader = defineHandler(async (c) => {
  const response = await getContent("blogs", c.req.param("slug") ?? "");
  if (response.status === 404) {
    c.header("x-revalidate", "0");
    return { article: null, hasError: false };
  }
  if (!response.ok) {
    c.header("x-revalidate", "0");
    return { article: null, hasError: true };
  }
  return { article: (await response.json()) as BlogArticle, hasError: false };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead<Props>((_c, { article }) =>
  article ? { title: article.title } : undefined,
);
