export { parseToReact, type ParsedResult, type ComponentData, type ComponentProps } from "./parse";
export { serializeToHtml, hastToHtml } from "./serialize";

/**
 * MarkdownをHTMLに変換する（一括処理）
 */
export async function parseToHtml(markdown: string): Promise<{
  html: string;
  frontmatter: Record<string, unknown>;
}> {
  const { parseToReact } = await import("./parse");
  const { serializeToHtml } = await import("./serialize");

  const parsed = await parseToReact(markdown);
  const html = serializeToHtml(parsed.content);

  return {
    html,
    frontmatter: parsed.frontmatter,
  };
}
