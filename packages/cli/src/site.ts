import { createServer, type Server } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import {
  articleSlug,
  assertArticleStatus,
  loadArticles,
  renderArticle,
  type ArticleSource,
} from "./content";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const titleOf = (article: ArticleSource) =>
  typeof article.frontmatter.title === "string" ? article.frontmatter.title : articleSlug(article);

const document = (title: string, body: string) => `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} | mimifuwa.cc</title>
    <style>
      :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
      body { max-width: 760px; margin: 0 auto; padding: 2rem 1rem 5rem; line-height: 1.8; }
      a { color: #5d5bd6; }
      img, video { max-width: 100%; height: auto; }
      pre { overflow-x: auto; padding: 1rem; border-radius: .5rem; }
      code { font-family: ui-monospace, monospace; }
      .article-list { display: grid; gap: .75rem; padding: 0; list-style: none; }
      .article-list a { display: block; padding: .75rem 1rem; border: 1px solid #8886; border-radius: .5rem; }
      .article-meta { color: #888; }
      [data-embed] { width: 100%; aspect-ratio: 1 / 1; overflow: hidden; }
    </style>
  </head>
  <body>${body}</body>
</html>`;

const articleDocument = async (article: ArticleSource) => {
  const rendered = await renderArticle(article);
  const title = titleOf(article);
  return document(
    title,
    `<p><a href="/">← Articles</a></p><article><h1>${escapeHtml(title)}</h1><div class="article-meta">${escapeHtml(articleSlug(article))}</div><div>${rendered.html}</div></article>`,
  );
};

const indexDocument = (articles: ArticleSource[]) =>
  document(
    "Articles",
    `<h1>Articles</h1><ul class="article-list">${articles
      .map(
        (article) =>
          `<li><a href="/${articleSlug(article)}"><strong>${escapeHtml(titleOf(article))}</strong><br><span class="article-meta">${escapeHtml(article.frontmatter.status ?? "unknown")}</span></a></li>`,
      )
      .join("")}</ul>`,
  );

const outputRoot = () => resolve(process.env.MIMIFUWACC_OUTPUT_ROOT ?? ".mimifuwacc-build");

export const buildStaticSite = async () => {
  const articles = await loadArticles({ visibility: "published" });
  const allArticles = await loadArticles();
  for (const article of allArticles) assertArticleStatus(article);

  const root = outputRoot();
  await mkdir(root, { recursive: true });
  await writeFile(join(root, "index.html"), indexDocument(articles));

  for (const article of articles) {
    const path = join(root, articleSlug(article), "index.html");
    await mkdir(resolve(path, ".."), { recursive: true });
    await writeFile(path, await articleDocument(article));
  }

  return { root, count: articles.length };
};

export const startPreview = async (port = Number(process.env.PORT ?? 4321)): Promise<Server> => {
  const articles = await loadArticles();
  const rendered = new Map(
    await Promise.all(
      articles.map(
        async (article) => [articleSlug(article), await articleDocument(article)] as const,
      ),
    ),
  );

  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`)
      .pathname;
    const body =
      pathname === "/" ? indexDocument(articles) : rendered.get(pathname.replace(/^\/+|\/+$/g, ""));
    if (!body) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(body);
  });

  await new Promise<void>((resolveServer) => server.listen(port, "127.0.0.1", resolveServer));
  console.info(`Preview: http://127.0.0.1:${port}`);
  return server;
};
