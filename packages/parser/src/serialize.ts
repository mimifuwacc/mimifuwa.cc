import type { HastNode } from "./types";

/**
 * HastノードをHTML文字列に変換する（rehype-stringify使用）
 */
export async function hastToHtml(hastNode: HastNode): Promise<string> {
  const { unified } = await import("unified");
  const rehypeStringify = (await import("rehype-stringify")).default;

  const processor = unified().use(rehypeStringify);
  const file = await processor.process(hastNode);
  return String(file.result);
}

// React用（Cloudflare Workers以外）
export async function serializeReactToHtml(reactNode: any): Promise<string> {
  const { renderToString } = await import("react-dom/server");
  return renderToString(reactNode);
}
