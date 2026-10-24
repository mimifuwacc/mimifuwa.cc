import { raw, usePageProps, useSiteConfig } from "@ox-content/vite-plugin";
import type { NavGroup, NavItem, ThemeComponent, ThemeProps } from "@ox-content/vite-plugin";

const siteUrl = "https://mimifuwa.cc";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalizePath = (path: string) => path.replace(/\/index(?:\.html)?$/, "/");

const renderNavItem = (item: NavItem, currentPath: string) => {
  const href = normalizePath(item.href || item.path);
  const isActive = normalizePath(href) === normalizePath(currentPath);

  return `<a class="sidebar-link${isActive ? " is-active" : ""}" href="${escapeHtml(href)}"${isActive ? ' aria-current="page"' : ""}>${escapeHtml(item.title)}</a>`;
};

const renderNavGroup = (group: NavGroup, currentPath: string) =>
  `<section class="sidebar-group"><h2>${escapeHtml(group.title)}</h2><nav aria-label="${escapeHtml(group.title)}">${group.items
    .map((item) => renderNavItem(item, currentPath))
    .join("")}</nav></section>`;

export const createMimifuwaTheme = (styles: string): ThemeComponent => {
  const Theme = ({ children }: ThemeProps) => {
    const page = usePageProps();
    const site = useSiteConfig();
    const pageTitle = escapeHtml(page.title);
    const title = `${pageTitle} | mimifuwa.cc`;
    const description = page.description
      ? `<meta name="description" content="${escapeHtml(page.description)}">`
      : "";
    const canonical = new URL(normalizePath(page.url), siteUrl).toString();
    const image = new URL(`${normalizePath(page.url)}og-image.png`, siteUrl).toString();
    const nav = site.nav.map((group) => renderNavGroup(group, page.url)).join("");
    const content = children.__html;
    const script = `
      const root = document.documentElement;
      const storedTheme = localStorage.getItem("theme");
      const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
      root.dataset.theme = storedTheme || (prefersDark ? "dark" : "light");

      const dialog = document.querySelector("#search-dialog");
      const input = document.querySelector("#search-input");
      const results = document.querySelector("#search-results");
      const openSearch = () => {
        dialog.showModal();
        input.focus();
      };
      document.querySelector("#search-open").addEventListener("click", openSearch);
      document.querySelector("#search-close").addEventListener("click", () => dialog.close());
      document.querySelector("#theme-toggle").addEventListener("click", () => {
        root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
        localStorage.setItem("theme", root.dataset.theme);
      });
      document.querySelector("#menu-toggle").addEventListener("click", () => {
        document.querySelector("#site-sidebar").classList.toggle("is-open");
      });
      document.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          openSearch();
        }
      });

      let documents = [];
      fetch("/search-index.json")
        .then((response) => response.json())
        .then((index) => { documents = index.documents || []; })
        .catch(() => {});
      input.addEventListener("input", () => {
        const query = input.value.trim().toLocaleLowerCase();
        const matches = query
          ? documents.filter((document) =>
              (document.title + " " + document.body).toLocaleLowerCase().includes(query),
            ).slice(0, 20)
          : [];
        results.replaceChildren(...matches.map((entry) => {
          const link = document.createElement("a");
          const title = document.createElement("strong");
          const excerpt = document.createElement("span");
          link.className = "search-result";
          link.href = entry.url.replace(/index$/, "");
          title.textContent = entry.title;
          excerpt.textContent = entry.body.slice(0, 160);
          link.append(title, excerpt);
          return link;
        }));
      });
    `;

    return raw(`<!doctype html>
<html lang="ja" data-theme="light">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    ${description}
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="mimifuwa.cc">
    <meta property="og:title" content="${title}">
    <meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${escapeHtml(image)}">
    <title>${title}</title>
    <style>${styles}</style>
  </head>
  <body>
    <header class="site-header">
      <button class="icon-button menu-toggle" id="menu-toggle" type="button" aria-label="Toggle navigation">☰</button>
      <a class="brand" href="/">mimifuwa.cc</a>
      <nav class="main-nav" aria-label="Main navigation"><a href="/">Home</a><a href="/blogs/">Blog</a><a href="https://github.com/mimifuwacc">GitHub</a></nav>
      <div class="header-actions">
        <button class="search-button" id="search-open" type="button">Search <kbd>⌘K</kbd></button>
        <button class="icon-button" id="theme-toggle" type="button" aria-label="Toggle theme">◐</button>
      </div>
    </header>
    <aside class="site-sidebar" id="site-sidebar"><a class="sidebar-home" href="/blogs/">Blogs</a>${nav}</aside>
    <main class="reading-layout">
      <article class="article">
        <header class="article-header"><p class="eyebrow">Blog</p><h1>${pageTitle}</h1></header>
        <div class="article-content">${content}</div>
      </article>
    </main>
    <dialog class="search-dialog" id="search-dialog" aria-label="Search articles">
      <div class="search-dialog-header"><input id="search-input" type="search" placeholder="Search articles"><button id="search-close" type="button">Close</button></div>
      <div class="search-results" id="search-results"></div>
    </dialog>
    <footer class="site-footer">© mimifuwa.cc</footer>
    <script>${script}</script>
  </body>
</html>`);
  };

  return Theme;
};
