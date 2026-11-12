import { defineHandler, defineHead, type InferProps } from "void";
import { rewriteContentAssetUrls } from "@/content-data";
import { fixtures, getArticlePrerenderPaths } from "@/server-content";

export const prerender = true;

export const getPrerenderPaths = () => getArticlePrerenderPaths("blogs");

export const loader = defineHandler((c) => {
  const slug = (c.req.param("slug") ?? "").replace(/^\/+|\/+$/g, "");
  const url = `/blogs/${slug}/`;
  const source = fixtures.blogContent.find((item) => item.url === url);
  const article = source ? { ...source, html: rewriteContentAssetUrls(source.html) } : null;
  return { article, hasError: false };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead<Props>((_c, { article }) =>
  article ? { title: article.title } : undefined,
);
