import type { Element, Parent, Root } from "hast";
import { visit } from "unist-util-visit";

const text = (value: string) => ({ type: "text" as const, value });
const element = (
  tagName: string,
  properties: Element["properties"],
  children: Element["children"],
): Element => ({ type: "element", tagName, properties, children });

const copyIcon = () =>
  element(
    "svg",
    {
      ariaHidden: "true",
      className: ["icon", "code-copy-icon"],
      fill: "none",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      viewBox: "0 0 24 24",
    },
    [
      element("rect", { width: 14, height: 14, x: 8, y: 8, rx: 2 }, []),
      element("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }, []),
    ],
  );

const copyButton = () =>
  element("button", { ariaLabel: "コードをコピー", className: ["code-copy"], type: "button" }, [
    copyIcon(),
    element("span", {}, [text("Copy")]),
  ]);

const rehypeCodeBlock = () => (tree: Root) => {
  visit(tree, "element", (node: Element, index, parent: Parent | undefined) => {
    if (node.tagName !== "pre" || typeof index !== "number" || !parent) return;
    const parentElement = parent.type === "element" ? (parent as Element) : undefined;
    if (
      Array.isArray(parentElement?.properties?.className) &&
      parentElement.properties.className.includes("code-block")
    ) {
      return;
    }
    const filename = node.properties?.dataFilename ?? node.properties?.["data-filename"];
    const children: Element["children"] = [];

    if (typeof filename === "string" && filename) {
      children.push(
        element("div", { className: ["code-block-header"] }, [
          element("span", { className: ["code-filename"] }, [text(filename)]),
          copyButton(),
        ]),
      );
    } else {
      children.push(copyButton());
    }
    children.push(node);

    delete node.properties?.dataFilename;
    delete node.properties?.["data-filename"];
    parent.children[index] = element("div", { className: ["code-block"] }, children);
  });
};

export default rehypeCodeBlock;
