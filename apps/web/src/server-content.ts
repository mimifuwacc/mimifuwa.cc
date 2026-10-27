import { getCollection } from "virtual:ox-content/collections";
import { articlePagesFromCollections, createContentData } from "./content-data";

declare const __DEPLOY_ENV__: string;

export const isLocalContent = __DEPLOY_ENV__ === "local";
export const collections = {
  blogs: getCollection("blogs"),
  works: getCollection("works"),
};
export const fixtures = createContentData(articlePagesFromCollections(collections));
