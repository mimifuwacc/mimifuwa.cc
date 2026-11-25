import { defineHandler, defineHead, type InferProps } from "void";
import { fixtures } from "@/server-content";
import { createSiteHead } from "@/site-head";

export const loader = defineHandler(() => ({ posts: fixtures.posts, hasError: false }));

export type Props = InferProps<typeof loader>;

export const head = defineHead((c) =>
  createSiteHead(c.req.url, {
    title: "Posts",
    description: "技術や日々のことを書いた記事をまとめています。",
    path: "/posts/",
  }),
);
