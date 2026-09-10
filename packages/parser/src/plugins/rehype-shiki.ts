import type { Element, Root, Text } from "hast";
import rehypeParse from "rehype-parse";
import { createHighlighter, type BundledLanguage } from "shiki";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const highlighter = createHighlighter({ langs: [], themes: ["github-light"] });
const loadedLanguages = new Map<string, Promise<void>>();

const ensureLanguage = async (language: string) => {
  if (language === "text") return;

  const existing = loadedLanguages.get(language);
  if (existing) return existing;

  const loading = highlighter.then((instance) =>
    instance.loadLanguage(language as BundledLanguage),
  );
  loadedLanguages.set(language, loading);
  try {
    await loading;
  } catch (error) {
    loadedLanguages.delete(language);
    throw error;
  }
};

const textContent = (node: Element | Text): string => {
  if (node.type === "text") return node.value;
  return node.children
    .map((child) => (child.type === "text" ? child.value : textContent(child as Element)))
    .join("");
};

const languageOf = (code: Element) => {
  const classes = Array.isArray(code.properties?.className) ? code.properties.className : [];
  const language = classes.find(
    (value): value is string => typeof value === "string" && value.startsWith("language-"),
  );
  return language?.slice("language-".length) || "text";
};

const rehypeShiki = () => async (tree: Root) => {
  const codeBlocks: Array<{ code: Element; pre: Element }> = [];

  visit(tree, "element", (node: Element) => {
    if (node.tagName !== "pre") return;
    const code = node.children[0];
    if (code?.type === "element" && code.tagName === "code") {
      codeBlocks.push({ code, pre: node });
    }
  });

  for (const { code, pre } of codeBlocks) {
    const lang = languageOf(code);
    const source = textContent(code);
    const filename = pre.properties?.["data-filename"];

    try {
      await ensureLanguage(lang);
      const highlighted = (await highlighter).codeToHtml(source, {
        lang,
        theme: "github-light",
      });
      const parsed = unified().use(rehypeParse, { fragment: true }).parse(highlighted);
      const result = parsed.children.find(
        (child): child is Element => child.type === "element" && child.tagName === "pre",
      );

      if (result) {
        pre.properties = {
          ...result.properties,
          ...(filename ? { "data-filename": filename } : {}),
        };
        const highlightedCode = result.children.find(
          (child): child is Element => child.type === "element" && child.tagName === "code",
        );
        if (highlightedCode) {
          highlightedCode.properties = {
            ...highlightedCode.properties,
            className: [`language-${lang}`],
          };
          pre.children = [highlightedCode];
        }
      }
    } catch {
      // Keep the unhighlighted code when Shiki does not recognize a language.
    }
  }
};

export default rehypeShiki;
