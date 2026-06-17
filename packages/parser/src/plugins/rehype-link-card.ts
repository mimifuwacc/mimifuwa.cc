import type { Element, Parent, Root, Text } from "hast";
import { visit } from "unist-util-visit";

type LinkType = "link" | "twitter";

const isTextUrlLink = (node: Element): boolean => {
  return (
    node.tagName === "a" &&
    typeof node.properties.href === "string" &&
    node.children.length === 1 &&
    node.children[0].type === "text" &&
    (node.children[0] as Text).value === node.properties.href
  );
};

const isTarget = (node: Element): boolean => {
  return (
    node.tagName === "p" &&
    node.children.length === 1 &&
    node.children[0].type === "element" &&
    isTextUrlLink(node.children[0] as Element)
  );
};

const getLinkType = (node: Element): LinkType => {
  if (
    typeof node.properties.href === "string" &&
    node.properties.href.match(/^https?:\/\/(www\.)?(twitter|x)\.com\/.+/i)
  ) {
    return "twitter";
  }
  return "link";
};

const rehypeLinkCard = () => {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent: Parent | undefined) => {
      if (isTarget(node) && parent && typeof index === "number") {
        const linkNode = node.children[0] as Element;
        const cardNode: Element = {
          type: "element",
          tagName: "div",
          properties: {
            "data-component-type": `${getLinkType(linkNode)}-card`,
            "data-url": linkNode.properties.href as string,
          },
          children: [],
        };

        parent.children[index] = cardNode;
      }
    });
  };
};

export default rehypeLinkCard;
