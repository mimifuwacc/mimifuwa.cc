import { defineHandler, defineHead, type InferProps } from "void";
import { fixtures, siteContent } from "@/server-content";
import { createSiteHead } from "@/site-head";

export const loader = defineHandler(() => {
  return {
    posts: fixtures.posts.slice(0, 6),
    works: fixtures.works.slice(0, 6),
    about: siteContent.about,
  };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead((c) =>
  createSiteHead(c.req.url, {
    title: "mimifuwa.cc",
    description: "個人の活動や制作物、記事をまとめています。",
    path: "/",
  }),
);
