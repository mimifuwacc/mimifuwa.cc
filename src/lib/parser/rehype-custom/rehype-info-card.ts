import type { Element, Parent, Root, Text } from "hast";
import { visit } from "unist-util-visit";

const infoType = ["NOTE", "WARN", "ERROR"] as const;
const infoReg = new RegExp(`^\\[!(${infoType.join("|")})\\]\\S?`);

const isTarget = (node: Element): boolean => {
  return (
    node.tagName === "blockquote" &&
    (node.children[1] as Element).tagName === "p" &&
    ((node.children[1] as Element).children[0] as Text).value.match(infoReg) !==
      null
  );
};

const rehypeInfoCard = () => {
  return (tree: Root) => {
    visit(
      tree,
      "element",
      (node: Element, index, parent: Parent | undefined) => {
        if (isTarget(node) && parent && typeof index === "number") {
          const infoType = (
            (node.children[1] as Element).children[0] as Text
          ).value
            .match(infoReg)?.[1]
            .toLowerCase();

          const cardNode: Element = {
            type: "element",
            tagName: "div",
            properties: {
              "data-component-type": "info-card",
              "data-info-type": infoType,
            },
            children: (node.children[1] as Element).children.map(
              (child, index) => {
                if (index === 0 && child.type === "text") {
                  return {
                    type: "text",
                    value: child.value.replace(infoReg, ""),
                  };
                }
                return child;
              },
            ),
          };

          parent.children[index] = cardNode;
        }
      },
    );
  };
};

export default rehypeInfoCard;
