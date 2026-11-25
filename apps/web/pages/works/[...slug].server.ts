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

export const head = defineHead<Props>((c, { work }) => {
  if (!work) return undefined;

  const slug = (c.req.param("slug") ?? "").replace(/^\/+|\/+$/g, "");
  const path = `/works/${slug.split("/").map(encodeURIComponent).join("/")}/`;
  const origin = import.meta.env.DEV ? new URL(c.req.url).origin : "https://mimifuwa.cc";
  const imagePath = import.meta.env.DEV
    ? `/__og/works/${slug.split("/").map(encodeURIComponent).join("/")}.html`
    : `/og${path.slice(0, -1)}.png`;
  const image = new URL(imagePath, origin).href;
  const description = work.description ?? "mimifuwa.cc の制作物";

  return {
    title: `${work.title} | mimifuwa.cc`,
    meta: [
      { name: "description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: "mimifuwa.cc" },
      { property: "og:title", content: work.title },
      { property: "og:description", content: description },
      { property: "og:url", content: new URL(path, origin).href },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: work.title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    link: [{ rel: "canonical", href: new URL(path, origin).href }],
  };
});
