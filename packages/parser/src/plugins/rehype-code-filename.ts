import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

const rehypeCodeFilename = () => {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "pre") return;
      const code = node.children[0] as Element | undefined;
      if (!code || code.tagName !== "code") return;

      const classes = (code.properties?.className as string[]) ?? [];
      const langClass = classes.find(
        (c) => typeof c === "string" && c.startsWith("language-"),
      );
      if (!langClass) return;

      const colonIdx = langClass.indexOf(":");
      if (colonIdx === -1) return;

      const filename = langClass.slice(colonIdx + 1);
      const lang = langClass.slice(0, colonIdx);

      code.properties = {
        ...code.properties,
        className: classes.map((c) => (c === langClass ? lang : c)),
      };

      node.properties = {
        ...node.properties,
        "data-filename": filename,
      };
    });
  };
};

export default rehypeCodeFilename;
