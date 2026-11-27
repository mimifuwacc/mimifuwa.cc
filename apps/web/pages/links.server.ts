import { defineHandler, defineHead, type InferProps } from "void";
import { siteContent } from "@/server-content";
import { createSiteHead } from "@/site-head";

export const loader = defineHandler(() => ({ links: siteContent.links }));

export type Props = InferProps<typeof loader>;

export const head = defineHead((c) =>
  createSiteHead(c.req.url, {
    title: "Links",
    description: "Websites by friends and collaborators",
    path: "/links/",
  }),
);
