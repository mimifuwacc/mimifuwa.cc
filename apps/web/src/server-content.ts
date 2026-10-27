import { getCollection } from "virtual:ox-content/collections";
import { articlePagesFromCollections, createContentData } from "./content-data";

declare const __MIMIFUWA_CC_DEPLOY_ENV__: string;

export const isLocalContent = __MIMIFUWA_CC_DEPLOY_ENV__ === "local";
export const collections = {
  blogs: getCollection("blogs"),
  works: getCollection("works"),
};
export const fixtures = createContentData(articlePagesFromCollections(collections));
