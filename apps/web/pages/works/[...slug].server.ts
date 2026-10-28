import { defineHandler, defineHead, type InferProps } from "void";
import { getContent } from "../../src/content-api";
import type { WorkItem } from "../../src/types/work";

export const loader = defineHandler(async (c) => {
  const response = await getContent("works", c.req.param("slug") ?? "");
  if (response.status === 404) {
    c.header("x-revalidate", "0");
    return { work: null, hasError: false };
  }
  if (!response.ok) {
    c.header("x-revalidate", "0");
    return { work: null, hasError: true };
  }
  return { work: (await response.json()) as WorkItem, hasError: false };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead<Props>((_c, { work }) => (work ? { title: work.title } : undefined));
