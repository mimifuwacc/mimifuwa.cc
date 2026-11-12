import { defineHandler, defineHead, type InferProps } from "void";
import { rewriteContentAssetUrls } from "@/content-data";
import { fixtures, getArticlePrerenderPaths } from "@/server-content";

export const prerender = true;

export const getPrerenderPaths = () => getArticlePrerenderPaths("works");

export const loader = defineHandler((c) => {
  const slug = (c.req.param("slug") ?? "").replace(/^\/+|\/+$/g, "");
  const url = `/works/${slug}/`;
  const source = fixtures.workContent.find((item) => item.url === url);
  const work = source ? { ...source, html: rewriteContentAssetUrls(source.html ?? "") } : null;
  return { work, hasError: false };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead<Props>((_c, { work }) => (work ? { title: work.title } : undefined));
