import { defineHandler, defineHead, type InferProps } from "void";
import { listContent } from "@/content-api";
import type { BlogSummary } from "@/types/blog";

export const prerender = true;
export const revalidate = 86400;

export const loader = defineHandler(async (c) => {
  const response = await listContent("blogs");
  if (!response.ok) {
    c.header("x-revalidate", "0");
    return { posts: [] as BlogSummary[], hasError: true };
  }
  return { posts: (await response.json()) as BlogSummary[], hasError: false };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead(() => ({ title: "Blogs" }));
