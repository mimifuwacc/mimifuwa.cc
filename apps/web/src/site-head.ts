const siteName = "mimifuwa.cc";
const defaultDescription = "個人の活動と記事をまとめています。";

export function createSiteHead(
  requestUrl: string,
  {
    title,
    description = defaultDescription,
    path,
  }: { title: string; description?: string; path: string },
) {
  const origin = import.meta.env.DEV ? new URL(requestUrl).origin : __SITE_ORIGIN__;
  const absoluteUrl = (value: string) => (origin ? new URL(value, origin).href : value);
  const url = absoluteUrl(path);
  const image = absoluteUrl("/og/default.png");

  return {
    title: title === siteName ? title : `${title} - ${siteName}`,
    meta: [
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: siteName },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    link: [{ rel: "canonical", href: url }],
  };
}
