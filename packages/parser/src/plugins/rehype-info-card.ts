import type { Element, Parent, Root, Text } from "hast";
import { visit } from "unist-util-visit";

const infoType = ["INFO", "SUCCESS", "WARNING", "DANGER"] as const;
const infoReg = new RegExp(`^\\[!(${infoType.join("|")})\\]\\S?`);

const getParagraphs = (node: Element): Element[] =>
  node.tagName === "blockquote"
    ? node.children.filter(
        (child): child is Element => child.type === "element" && child.tagName === "p",
      )
    : [];

const getMarker = (paragraph: Element): Text | undefined => {
  const first = paragraph.children[0];
  return first?.type === "text" && infoReg.test(first.value) ? first : undefined;
};

const infoCardIcon = (type: string | undefined): Element => {
  const iconPaths: Record<string, Element[]> = {
    info: [
      { type: "element", tagName: "path", properties: { d: "M12 16v-4m0-4h.01" }, children: [] },
      {
        type: "element",
        tagName: "circle",
        properties: { cx: "12", cy: "12", r: "9" },
        children: [],
      },
    ],
    success: [
      { type: "element", tagName: "path", properties: { d: "m9 12 2 2 4-4" }, children: [] },
      {
        type: "element",
        tagName: "circle",
        properties: { cx: "12", cy: "12", r: "9" },
        children: [],
      },
    ],
    warning: [
      { type: "element", tagName: "path", properties: { d: "M12 9v4m0 4h.01" }, children: [] },
      {
        type: "element",
        tagName: "path",
        properties: {
          d: "m10.3 3.3-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.7-2.7l-8-14a2 2 0 0 0-3.4 0Z",
        },
        children: [],
      },
    ],
    danger: [
      { type: "element", tagName: "path", properties: { d: "M12 8v4m0 4h.01" }, children: [] },
      {
        type: "element",
        tagName: "path",
        properties: {
          d: "M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2Z",
        },
        children: [],
      },
    ],
  };

  return {
    type: "element",
    tagName: "svg",
    properties: {
      className: ["info-card-icon"],
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
    },
    children: iconPaths[type ?? "info"] ?? iconPaths.info,
  };
};

const rehypeInfoCard = () => {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent: Parent | undefined) => {
      const paragraphs = getParagraphs(node);
      const paragraph = paragraphs[0];
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
          children: [
            infoCardIcon(infoType),
            {
              type: "element",
              tagName: "div",
              properties: { className: ["info-card-content"] },
              children: node.children.map((child) => {
                if (child !== paragraph) return child;
                let markerRemoved = false;
                return {
                  ...paragraph,
                  children: paragraph.children.map((child, index) => {
                    if (index === 0 && child.type === "text") {
                      markerRemoved = true;
                      return {
                        ...child,
                        value: child.value.replace(infoReg, ""),
                      };
                    }
                    if (markerRemoved && child.type === "text") {
                      markerRemoved = false;
                      return { ...child, value: child.value.replace(/^\s*/, "") };
                    }
                    return child;
                  }),
                };
              }),
            },
          ],
        };

        parent.children[index] = cardNode;
      }
    });
  };
};

export default rehypeInfoCard;
