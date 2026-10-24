export interface ArticlePage {
  title: string;
  navTitle: string;
  description?: string;
  html: string;
  url: string;
}

const siteUrl = "https://mimifuwa.cc";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalizePath = (path: string) => path.replace(/\/index(?:\.html)?$/, "/");

const renderNavigation = (articles: ArticlePage[], currentUrl: string) =>
  `<section class="sidebar-group"><h2>Blogs</h2><nav aria-label="Blogs">${articles
    .map((article) => {
      const active = article.url === currentUrl;
      return `<a class="sidebar-link${active ? " is-active" : ""}" href="${escapeHtml(article.url)}"${active ? ' aria-current="page"' : ""}>${escapeHtml(article.navTitle)}</a>`;
    })
    .join("")}</nav></section>`;

export const renderMimifuwaPage = (page: ArticlePage, articles: ArticlePage[], styles: string) => {
  const title = `${escapeHtml(page.title)} | mimifuwa.cc`;
  const canonical = new URL(normalizePath(page.url), siteUrl).toString();
  const description = page.description
    ? `<meta name="description" content="${escapeHtml(page.description)}">`
    : "";
  const script = `
    const root = document.documentElement;
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = storedTheme || (prefersDark ? "dark" : "light");
    const dialog = document.querySelector("#search-dialog");
    const input = document.querySelector("#search-input");
    const results = document.querySelector("#search-results");
    const openSearch = () => { dialog.showModal(); input.focus(); };
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
        event.preventDefault(); openSearch();
      }
    });
    let documents = [];
    fetch("/search-index.json").then((response) => response.json())
      .then((index) => { documents = index.documents || []; }).catch(() => {});
    input.addEventListener("input", () => {
      const query = input.value.trim().toLocaleLowerCase();
      const matches = query ? documents.filter((item) =>
        (item.title + " " + item.body).toLocaleLowerCase().includes(query),
      ).slice(0, 20) : [];
      results.replaceChildren(...matches.map((entry) => {
        const link = document.createElement("a");
        const resultTitle = document.createElement("strong");
        const excerpt = document.createElement("span");
        link.className = "search-result"; link.href = entry.url;
        resultTitle.textContent = entry.title; excerpt.textContent = entry.body.slice(0, 160);
        link.append(resultTitle, excerpt); return link;
      }));
    });
  `;

  return `<!doctype html>
<html lang="ja" data-theme="light">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    ${description}
    <link rel="canonical" href="${escapeHtml(canonical)}">
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
    <aside class="site-sidebar" id="site-sidebar"><a class="sidebar-home" href="/blogs/">Blogs</a>${renderNavigation(articles, page.url)}</aside>
    <main class="reading-layout">
      <article class="article">
        <div class="article-content">${page.html}</div>
      </article>
    </main>
    <dialog class="search-dialog" id="search-dialog" aria-label="Search articles">
      <div class="search-dialog-header"><input id="search-input" type="search" placeholder="Search articles"><button id="search-close" type="button">Close</button></div>
      <div class="search-results" id="search-results"></div>
    </dialog>
    <footer class="site-footer">© mimifuwa.cc</footer>
    <script>${script}</script>
  </body>
</html>`;
};

export const renderBlogIndex = (articles: ArticlePage[]) =>
  `<p>Articles about technology and personal projects.</p><ul>${articles
    .map(
      (article) => `<li><a href="${escapeHtml(article.url)}">${escapeHtml(article.title)}</a></li>`,
    )
    .join("")}</ul>`;

export const markdownToText = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
