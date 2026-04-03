"use client";

import type { ReactElement } from "react";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

interface ComponentMap {
  [key: string]: React.ComponentType<any>;
}

/**
 * data-component-type 属性を持つ要素を検索し、
 * 対応するReactコンポーネントに置換するHook
 */
export function useHydrateComponents(componentMap: ComponentMap) {
  useEffect(() => {
    // data-component-type 属性を持つ要素を検索
    const elements = document.querySelectorAll("[data-component-type]");

    elements.forEach((element) => {
      const componentType = element.getAttribute("data-component-type");
      if (!componentType || !componentMap[componentType]) return;

      const Component = componentMap[componentType];

      // data属性からpropsを抽出
      const props: Record<string, any> = {};
      for (const attr of element.attributes) {
        if (
          attr.name.startsWith("data-") &&
          attr.name !== "data-component-type"
        ) {
          // kebab-case to camelCase
          const propName = attr.name
            .replace("data-", "")
            .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          props[propName] = attr.value;
        }
      }

      // 子要素のテキストコンテンツを取得（info-card用）
      const childNodes = Array.from(element.childNodes);
      const childContent = childNodes
        .map((node) => node.textContent || "")
        .join("")
        .trim();
      if (
        childContent &&
        childNodes.every((n) => n.nodeType === Node.TEXT_NODE)
      ) {
        props.children = childContent;
      }

      // Reactコンポーネントで置換
      const container = document.createElement("div");
      container.className = element.className;
      element.replaceWith(container);

      const root = createRoot(container);
      root.render(<Component {...props} />);
    });
  }, [componentMap]);
}
