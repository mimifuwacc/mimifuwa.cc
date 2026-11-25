export interface TableOfContentsItem {
  id: string;
  label: string;
  level: 2 | 3;
}

const decodeHtml = (value: string) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );

const headingLabel = (html: string) =>
  decodeHtml(
    html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );

const headingId = (label: string) =>
  label
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "") || "section";

export function addTableOfContents(html: string) {
  const items: TableOfContentsItem[] = [];
  const usedIds = new Set<string>();
  const content = html.replace(
    /<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (heading, level, attrs, inner) => {
      const label = headingLabel(inner);
      if (!label) return heading;

      const match = attrs.match(/\bid\s*=\s*(["'])(.*?)\1/i);
      const baseId = match?.[2] ?? headingId(label);
      let id = baseId;
      let duplicate = 2;
      while (usedIds.has(id)) id = `${baseId}-${duplicate++}`;
      usedIds.add(id);

      const updatedAttrs = match ? attrs.replace(match[0], `id="${id}"`) : `${attrs} id="${id}"`;
      items.push({ id, label, level: Number(level) as 2 | 3 });
      return `<h${level}${updatedAttrs}>${inner}</h${level}>`;
    },
  );

  return { html: content, items };
}
