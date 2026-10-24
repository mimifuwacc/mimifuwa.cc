export interface ArticlePage {
  title: string;
  navTitle: string;
  description?: string;
  date?: string;
  tags?: string[];
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
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      button.textContent = root.dataset.theme === "dark" ? "Light" : "Dark";
    });
    const dialog = document.querySelector("#search-dialog");
    const input = document.querySelector("#search-input");
    const results = document.querySelector("#search-results");
    const openSearch = () => { dialog.showModal(); input.focus(); };
    document.querySelectorAll(".search-open").forEach((button) => {
      button.addEventListener("click", openSearch);
    });
    document.querySelector("#search-close").addEventListener("click", () => dialog.close());
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
        localStorage.setItem("theme", root.dataset.theme);
        document.querySelectorAll(".theme-toggle").forEach((toggle) => {
          toggle.textContent = root.dataset.theme === "dark" ? "Light" : "Dark";
        });
      });
    });
    document.querySelector("#menu-toggle").addEventListener("click", (event) => {
      const button = event.currentTarget;
      const nav = document.querySelector("#mobile-nav");
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      nav.hidden = !open;
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
    document.querySelector("#uuid-copy").addEventListener("click", async (event) => {
      await navigator.clipboard.writeText("fa6c2a8f-27b1-4611-a0f5-19b0d6c20612");
      event.currentTarget.querySelector("span:last-child").textContent = "Copied";
      setTimeout(() => { event.currentTarget.querySelector("span:last-child").textContent = "Copy"; }, 2000);
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
      <div class="header-inner container-wide">
        <a class="brand" href="/">mimifuwa.cc</a>
        <nav class="desktop-nav" aria-label="Main navigation">
          <a href="/">Home</a><a href="/blogs/" aria-current="page">Blog</a><a href="/links">Links</a>
          <button class="square-button search-open" type="button">Search <kbd>⌘K</kbd></button>
          <button class="square-button theme-toggle" type="button" aria-label="Toggle color theme">Dark</button>
        </nav>
        <div class="mobile-actions">
          <button class="square-button search-open" type="button">Search</button>
          <button class="square-button theme-toggle" type="button" aria-label="Toggle color theme">Dark</button>
          <button class="square-button menu-toggle" id="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">Menu</button>
        </div>
      </div>
      <nav class="mobile-nav container-wide" id="mobile-nav" aria-label="Mobile navigation" hidden>
        <a href="/">Home</a><a href="/blogs/" aria-current="page">Blog</a><a href="/links">Links</a>
      </nav>
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
    <footer class="site-footer article-footer">
      <div class="container-wide footer-inner">
        <div class="footer-identity"><a class="footer-brand" href="/">mimifuwa.cc</a><button class="uuid-copy" id="uuid-copy" type="button"><span>fa6c2a8f-27b1-4611-a0f5-19b0d6c20612</span><span>Copy</span></button></div>
        <div class="footer-links"><nav aria-label="Footer navigation"><a href="/">Home</a><a href="/blogs/">Blog</a><a href="/links">Links</a></nav><nav class="social-links" aria-label="Social links"><a href="https://github.com/mimifuwacc">GitHub</a><a href="https://twitter.com/mimifuwacc">Twitter</a><a href="mailto:mail@mimifuwa.cc">Email</a></nav></div>
      </div>
      <p class="container-wide copyright">© mimifuwa.cc</p>
    </footer>
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
