import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

const text = (value: string) => ({ type: "text" as const, value });

const element = (
  tagName: string,
  properties: Element["properties"],
  children: Element["children"],
): Element => ({ type: "element", tagName, properties, children });

const externalLinkIcon = () =>
  element(
    "svg",
    {
      ariaHidden: "true",
      className: ["icon", "embedded-link-icon"],
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      viewBox: "0 0 24 24",
    },
    [
      element(
        "path",
        {
          d: "M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
        },
        [],
      ),
    ],
  );

const renderTwitter = (node: Element, url: URL) => {
  const match = url.pathname.match(/^\/(?:[^/]+)\/status\/(\d+)/i);
  if (!match) return;

  node.tagName = "div";
  node.properties = { className: ["twitter-embed-placeholder"], dataTwitterId: match[1] };
  node.children = [];
};

const renderLink = (node: Element, url: URL) => {
  node.tagName = "a";
  node.properties = {
    className: ["embedded-link-card"],
    dataOgpUrl: url.toString(),
    href: url.toString(),
    rel: ["noopener", "noreferrer"],
    target: "_blank",
  };
  node.children = [
    element("span", { className: ["embedded-link-content"] }, [
      element("strong", { className: ["embedded-link-title"] }, [text(url.hostname)]),
      element("small", { className: ["embedded-link-description"], hidden: true }, []),
      element("span", { className: ["embedded-link-site"] }, [
        element(
          "img",
          {
            alt: "",
            className: ["embedded-link-favicon"],
            height: 12,
            loading: "lazy",
            src: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url.hostname)}&sz=32`,
            width: 12,
          },
          [],
        ),
        element("small", {}, [text(url.hostname)]),
        externalLinkIcon(),
      ]),
    ]),
    element("span", { className: ["embedded-link-image"], hidden: true }, [
      element("img", { alt: "", loading: "lazy" }, []),
    ]),
  ];
};

const rehypeLinkCardFallback = () => (tree: Root) => {
  visit(tree, "element", (node: Element) => {
    if (node.tagName !== "div") return;
    const type = node.properties?.["data-component-type"] ?? node.properties?.dataComponentType;
    if (type !== "link-card" && type !== "twitter-card") return;

    const source = node.properties?.["data-url"] ?? node.properties?.dataUrl;
    if (typeof source !== "string") return;

    let url: URL;
    try {
      url = new URL(source);
    } catch {
      return;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return;

    if (type === "twitter-card") renderTwitter(node, url);
    else renderLink(node, url);
  });
};

export default rehypeLinkCardFallback;
