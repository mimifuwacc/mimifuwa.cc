import { defineHandler, defineHead, type InferProps } from "void";
import { getSiteContent } from "@/content-api";

export const loader = defineHandler(async (c) => {
  const content = await getSiteContent();
  if (!content.available) c.header("x-revalidate", "0");
  return { links: content.value.mutuals };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead(() => ({ title: "Mutuals" }));
