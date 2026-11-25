import { defineHandler, defineHead, type InferProps } from "void";
import { siteContent } from "@/server-content";
import { createSiteHead } from "@/site-head";

export const loader = defineHandler(() => ({ tracks: siteContent.tracks }));

export type Props = InferProps<typeof loader>;

export const head = defineHead((c) =>
  createSiteHead(c.req.url, {
    title: "On Repeat",
    description: "最近よく聴いている曲を紹介しています。",
    path: "/onrepeat/",
  }),
);
