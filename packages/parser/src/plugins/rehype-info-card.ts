import type { Element, Parent, Root, Text } from "hast";
import { visit } from "unist-util-visit";

const infoType = ["INFO", "SUCCESS", "WARNING", "DANGER"] as const;
const infoReg = new RegExp(`^\\[!(${infoType.join("|")})\\]\\S?`);

const getParagraph = (node: Element): Element | undefined =>
  node.tagName === "blockquote"
    ? (node.children.find(
        (child): child is Element => child.type === "element" && child.tagName === "p",
      ) as Element | undefined)
    : undefined;

const getMarker = (paragraph: Element): Text | undefined => {
  const first = paragraph.children[0];
  return first?.type === "text" && infoReg.test(first.value) ? first : undefined;
};

const rehypeInfoCard = () => {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent: Parent | undefined) => {
      const paragraph = getParagraph(node);
      const marker = paragraph ? getMarker(paragraph) : undefined;
      if (paragraph && marker && parent && typeof index === "number") {
        const infoType = marker.value.match(infoReg)?.[1].toLowerCase();

        const cardNode: Element = {
          type: "element",
          tagName: "div",
          properties: {
            "data-component-type": "info-card",
            "data-info-type": infoType,
          },
          children: paragraph.children.map((child, index) => {
            if (index === 0 && child.type === "text") {
              return {
                type: "text",
                value: child.value.replace(infoReg, ""),
              };
            }
            return child;
          }),
        };

        parent.children[index] = cardNode;
      }
    });
  };
};

export default rehypeInfoCard;
