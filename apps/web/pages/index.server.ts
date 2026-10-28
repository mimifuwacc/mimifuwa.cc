import { defineHandler, defineHead, type InferProps } from "void";
import { listContent } from "../src/content-api";
import type { BlogSummary } from "../src/types/blog";
import type { WorkItem } from "../src/types/work";

const readJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
  return (await response.json()) as T;
};

export const loader = defineHandler(async (c) => {
  const [blogsResponse, worksResponse] = await Promise.all([
    listContent("blogs"),
    listContent("works"),
  ]);
  if (!blogsResponse.ok || !worksResponse.ok) c.header("x-revalidate", "0");
  const [blogs, works] = await Promise.all([
    readJson<BlogSummary[]>(blogsResponse),
    readJson<WorkItem[]>(worksResponse),
  ]);
  return { blogs: blogs.slice(0, 6), works: works.slice(0, 6) };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead(() => ({ title: "Home" }));
