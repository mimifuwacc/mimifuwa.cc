import { defineHandler, defineHead, type InferProps } from "void";
import { fixtures, siteContent } from "@/server-content";

export const loader = defineHandler(() => {
  return {
    blogs: fixtures.blogs.slice(0, 6),
    works: fixtures.works.slice(0, 6),
    about: siteContent.about,
    tracks: siteContent.tracks,
  };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead(() => ({ title: "Home" }));
