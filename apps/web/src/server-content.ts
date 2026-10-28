import { getCollection } from "virtual:ox-content/collections";
import localSiteContent from "@content-data/site-content.json";
import { articlePagesFromCollections, createContentData } from "./content-data";
import type { SiteContent } from "@/types/site-content";

declare const __DEPLOY_ENV__: string;

export const isLocalContent = __DEPLOY_ENV__ === "local";
export const collections = {
  blogs: getCollection("blogs"),
  works: getCollection("works"),
};
export const fixtures = createContentData(articlePagesFromCollections(collections));
export const siteContent = localSiteContent satisfies SiteContent;
