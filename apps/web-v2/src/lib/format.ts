export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const postHref = (slug: string) => `/blogs/${slug}`;

export const postOgImage = (slug: string) =>
  `https://api.mimifuwa.cc/og/${slug.split("/").map(encodeURIComponent).join("/")}`;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s぀-ヿ一-鿿]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export const addHeadingIds = (html: string): { html: string; headings: Heading[] } => {
  const headings: Heading[] = [];
  const ids = new Map<string, number>();
  const rendered = html.replace(
    /<h([2-3])([^>]*)>(.*?)<\/h\1>/gis,
    (_, level, attributes, content) => {
      const text = content.replace(/<[^>]*>/g, "");
      const base = slugify(text) || "section";
      const count = ids.get(base) ?? 0;
      ids.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count + 1}`;
      headings.push({ id, text, level: Number(level) });
      return `<h${level}${attributes} id="${id}">${content}</h${level}>`;
    },
  );
  return { html: rendered, headings };
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export const renderLinkFallbacks = (html: string) =>
  html.replace(
    /<div data-component-type="(?:link|twitter)-card" data-url="([^"]+)"><\/div>/g,
    (source, encodedUrl: string) => {
      const url = encodedUrl.replaceAll("&amp;", "&");
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return source;
        const safeUrl = escapeHtml(parsed.toString());
        return `<a class="embedded-link-card" href="${safeUrl}" target="_blank" rel="noopener noreferrer"><span><strong>${escapeHtml(parsed.hostname)}</strong><small>${safeUrl}</small></span><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg></a>`;
      } catch {
        return source;
      }
    },
  );
