import { defineHandler, defineHead, type InferProps } from "void";
import { listContent } from "@/content-api";
import type { WorkItem } from "@/types/work";

export const loader = defineHandler(async (c) => {
  const response = await listContent("works");
  if (!response.ok) {
    c.header("x-revalidate", "0");
    return { works: [] as WorkItem[], hasError: true };
  }
  return { works: (await response.json()) as WorkItem[], hasError: false };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead(() => ({ title: "Works" }));
