import type { Element, Root, RootContent } from "hast";
import { visit } from "unist-util-visit";

export interface ArticleHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

const textContent = (node: RootContent): string => {
  if (node.type === "text") return node.value;
  if ("children" in node) return node.children.map(textContent).join("");
  return "";
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\w\s぀-ヿ一-鿿]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const rehypeHeadingIds = (headings: ArticleHeading[]) => (tree: Root) => {
  const ids = new Map<string, number>();

  visit(tree, "element", (node: Element) => {
    if (node.tagName !== "h2" && node.tagName !== "h3") return;

    const text = node.children.map(textContent).join("");
    const base = slugify(text) || "section";
    const count = ids.get(base) ?? 0;
    ids.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;

    node.properties = { ...node.properties, id };
    headings.push({ id, text, level: node.tagName === "h2" ? 2 : 3 });
  });
};

export default rehypeHeadingIds;
