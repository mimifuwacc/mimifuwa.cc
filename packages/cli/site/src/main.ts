import "@fontsource-variable/noto-sans-jp/wght.css";
import "@fontsource-variable/noto-sans-mono/wght.css";

interface Entry {
  title: string;
  description?: string;
  date?: string;
  tags: string[];
  technologies: string[];
  url: string;
  ogImage: string;
  ogPreview: string;
  html: string;
}

interface SiteContent {
  posts: Entry[];
  works: Entry[];
}

const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("Missing #app mount element");

const escapeHtml = (value: unknown = ""): string =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );

const dateLabel = (date?: string): string => {
  if (!date) return "";
  const value = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(value.getTime())
    ? date
    : new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(value);
};

const tags = (items: string[] = []): string[] =>
  items.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`);

const setMeta = (name: string, value?: string): void => {
  if (!value) return;
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[property="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", name);
    document.head.append(meta);
  }
  meta.setAttribute("content", value);
};

const linkCard = (entry: Entry, section: "posts" | "works"): string => `
  <a class="entry-card" href="${escapeHtml(entry.url)}">
    <div class="entry-meta"><time>${escapeHtml(dateLabel(entry.date))}</time><span aria-hidden="true">→</span></div>
    <h2>${escapeHtml(entry.title)}</h2>
    ${entry.description ? `<p>${escapeHtml(entry.description)}</p>` : ""}
    <div class="tags">${tags(section === "works" ? entry.technologies : entry.tags).join("")}</div>
  </a>`;

try {
  const response = await fetch("/__mimifuwacc/content.json");
  if (!response.ok) throw new Error("Content could not be loaded");
  const content = (await response.json()) as SiteContent;
  const path = decodeURIComponent(location.pathname.replace(/\/+$/, "") || "/");
  const match = path.match(/^\/(posts|works)\/(.+)$/);
  if (match) {
    const [, section, slug] = match as [string, "posts" | "works", string];
    const entry = content[section].find(
      (item) => item.url.replace(/\/+$/, "") === `/${section}/${slug}`,
    );
    if (!entry) throw new Error("Page not found");
    document.title = `${entry.title} - mimifuwa.cc`;
    setMeta("og:title", entry.title);
    setMeta("og:description", entry.description);
    setMeta("og:image", new URL(entry.ogImage, location.origin).href);
    app.innerHTML = `
      <header class="article-header">
        <a class="section-label" href="/${section}/">${section.toUpperCase()}</a>
        <time class="article-date">${escapeHtml(dateLabel(entry.date))}</time>
        <h1>${escapeHtml(entry.title)}</h1>
        ${entry.description ? `<p class="article-description">${escapeHtml(entry.description)}</p>` : ""}
        <div class="tags">${tags(section === "works" ? entry.technologies : entry.tags).join("")}</div>
        <a class="og-preview-link" href="${escapeHtml(entry.ogPreview)}">OG image preview</a>
      </header>
      <article class="article-content">${entry.html || ""}</article>`;
  } else {
    const section = path.startsWith("/works") ? "works" : "posts";
    const entries = content[section];
    const title = section === "posts" ? "Posts" : "Works";
    document.title = `${title} - mimifuwa.cc`;
    app.innerHTML = `
      <p class="section-label">${section === "posts" ? "NOTES & THOUGHTS" : "THINGS I’VE MADE"}</p>
      <h1 class="page-title">${title}</h1>
      <nav class="site-nav"><a href="/posts/" ${section === "posts" ? 'aria-current="page"' : ""}>Posts</a><a href="/works/" ${section === "works" ? 'aria-current="page"' : ""}>Works</a></nav>
      <div class="entry-list">${entries.map((entry) => linkCard(entry, section)).join("")}</div>`;
  }
} catch (error) {
  app.innerHTML = `<section class="error"><h1>コンテンツを読み込めませんでした</h1><p>${escapeHtml(error instanceof Error ? error.message : error)}</p><p>articles/ と data/site-content.json を確認してください。</p></section>`;
}
