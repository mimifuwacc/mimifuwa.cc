import { defineHandler, defineHead, type InferProps } from "void";
import { rewriteContentAssetUrls } from "@/content-data";
import { fixtures, getArticlePrerenderPaths } from "@/server-content";

export const prerender = true;

export const getPrerenderPaths = () => getArticlePrerenderPaths("posts");

export const loader = defineHandler((c) => {
  const slug = (c.req.param("slug") ?? "").replace(/^\/+|\/+$/g, "");
  const url = `/posts/${slug}/`;
  const source = fixtures.postContent.find((item) => item.url === url);
  const article = source ? { ...source, html: rewriteContentAssetUrls(source.html) } : null;
  return { article, hasError: false };
});

export type Props = InferProps<typeof loader>;

export const head = defineHead<Props>((c, { article }) => {
  if (!article) return undefined;

  const slug = (c.req.param("slug") ?? "").replace(/^\/+|\/+$/g, "");
  const path = `/posts/${slug.split("/").map(encodeURIComponent).join("/")}/`;
  const origin = import.meta.env.DEV ? new URL(c.req.url).origin : __SITE_ORIGIN__;
  const imagePath = import.meta.env.DEV
    ? `/__og/posts/${slug.split("/").map(encodeURIComponent).join("/")}.html`
    : `/og${path.slice(0, -1)}.png`;
  const absoluteUrl = (value: string) => (origin ? new URL(value, origin).href : value);
  const image = absoluteUrl(imagePath);
  const pageUrl = absoluteUrl(path);
  const description = article.description ?? "mimifuwa.cc の記事";

  return {
    title: `${article.title} | mimifuwa.cc`,
    meta: [
      { name: "description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: "mimifuwa.cc" },
      { property: "og:title", content: article.title },
      { property: "og:description", content: description },
      { property: "og:url", content: pageUrl },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: article.title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    link: [{ rel: "canonical", href: pageUrl }],
  };
});
