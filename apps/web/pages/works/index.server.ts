import { defineHandler, defineHead, type InferProps } from "void";
import { fixtures } from "@/server-content";
import { createSiteHead } from "@/site-head";

export const loader = defineHandler(() => ({ works: fixtures.works, hasError: false }));

export type Props = InferProps<typeof loader>;

export const head = defineHead((c) =>
  createSiteHead(c.req.url, {
    title: "Works",
    description: "制作したものや関わったプロジェクトを紹介しています。",
    path: "/works/",
  }),
);
