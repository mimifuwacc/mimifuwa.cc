import type { Element, ElementContent, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * タスクリストと通常リストを分割するrehypeプラグイン
 * contains-task-listクラスを持つul要素内の通常リスト項目を
 * 別のul要素として分割する
 */
const rehypeSplitTaskLists = () => {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (!parent || typeof index !== "number" || node.tagName !== "ul") {
        return;
      }

      // contains-task-listクラスを持つul要素を処理
      const classes = getClasses(node);
      if (!classes.includes("contains-task-list")) {
        return;
      }

      // task-list-itemと通常のliを分離
      const taskItems: ElementContent[] = [];
      const regularItems: ElementContent[] = [];

      node.children.forEach((child) => {
        if (
          child.type === "element" &&
          child.tagName === "li" &&
          getClasses(child).includes("task-list-item")
        ) {
          taskItems.push(child);
        } else {
          regularItems.push(child);
        }
      });

      // 通常リスト項目がある場合、分割処理を行う
      if (regularItems.length > 0 && taskItems.length > 0) {
        // 元のul要素はタスクリストのみに
        node.children = taskItems;

        // 新しいul要素を作成して通常リスト項目を追加
        const newUl: Element = {
          type: "element",
          tagName: "ul",
          properties: {},
          children: regularItems,
        };

        // 新しいul要素を現在のulの後に挿入
        parent.children.splice(index + 1, 0, newUl);
      }
    });
  };
};

/**
 * 要素のクラスリストを取得する
 */
const getClasses = (element: Element): string[] => {
  const className = element.properties?.className;
  if (!className) return [];

  if (typeof className === "string") {
    return className.split(/\s+/).filter(Boolean);
  }

  if (Array.isArray(className)) {
    return className
      .flat()
      .map((cls) => String(cls))
      .filter(Boolean);
  }

  return [];
};

export default rehypeSplitTaskLists;
