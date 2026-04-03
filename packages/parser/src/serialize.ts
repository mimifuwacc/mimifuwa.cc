import { renderToString } from "react-dom/server";
import type { ReactElement } from "react";

/**
 * ReactコンポーネントをHTML文字列にシリアライズする
 */
export function serializeToHtml(reactNode: ReactElement): string {
  return renderToString(reactNode);
}

/**
 * HastノードをHTML文字列に変換する（rehype-stringifyの代替）
 */
export async function hastToHtml(hastNode: any): Promise<string> {
  const { unified } = await import("unified");
  const rehypeStringify = (await import("rehype-stringify")).default;

  const processor = unified().use(rehypeStringify);
  const file = await processor.process(hastNode);
  return String(file.result);
}
