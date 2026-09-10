import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

import { parseArticleToHtml } from "@mimifuwacc/parser/article";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

export type ContentStatus = "draft" | "published";

export interface ArticleFrontmatter {
  slug?: string;
  title?: string;
  description?: string;
  status?: ContentStatus;
  publishedAt?: string;
  [key: string]: unknown;
}

export interface ArticleSource {
  absolutePath: string;
  relativePath: string;
  source: string;
  frontmatter: ArticleFrontmatter;
}

export interface LoadedArticle extends ArticleSource {
  html: string;
  headings: Awaited<ReturnType<typeof parseArticleToHtml>>["headings"];
}

export const articleSlug = (article: ArticleSource) => {
  if (typeof article.frontmatter.slug === "string" && article.frontmatter.slug.length > 0) {
    return article.frontmatter.slug.replace(/^\/+|\/+$/g, "");
  }

  return article.relativePath
    .replace(/^articles\//, "")
    .replace(/\.md$/, "")
    .replace(/^blogs\//, "blogs/");
};

const contentRootFromEnvironment = () => {
  if (process.env.MIMIFUWACC_CONTENT_ROOT) {
    return resolve(process.env.MIMIFUWACC_CONTENT_ROOT);
  }

  const candidates = [
    resolve("contents"),
    resolve("../mimifuwa.cc-content"),
    resolve("../../mimifuwa.cc-content"),
    resolve("../../contents"),
    resolve("../../../contents"),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
};

const walkMarkdownFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdownFiles(path)));
    } else if (entry.isFile() && path.endsWith(".md")) {
      files.push(path);
    }
  }

  return files;
};

const articleDirectories = (root: string) => {
  if (process.env.MIMIFUWACC_ARTICLES_ROOT) {
    return [resolve(process.env.MIMIFUWACC_ARTICLES_ROOT)];
  }

  const articles = join(root, "articles");
  if (existsSync(articles)) {
    return [articles];
  }

  // Transitional compatibility while articles are moved out of the public repo.
  return [join(root, "blogs")];
};

const readArticle = async (absolutePath: string, root: string): Promise<ArticleSource> => {
  const source = await readFile(absolutePath, "utf8");
  const file = new VFile({ path: absolutePath, value: source });
  matter(file);

  return {
    absolutePath,
    relativePath: relative(root, absolutePath),
    source,
    frontmatter: (file.data.matter ?? {}) as ArticleFrontmatter,
  };
};

export const loadArticles = async (options: { visibility?: "all" | "published" } = {}) => {
  const root = contentRootFromEnvironment();
  const files = (await Promise.all(articleDirectories(root).map(walkMarkdownFiles))).flat();
  const articles = await Promise.all(files.map((file) => readArticle(file, root)));

  return articles
    .filter(
      (article) => options.visibility !== "published" || article.frontmatter.status === "published",
    )
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));
};

export const renderArticle = async (article: ArticleSource): Promise<LoadedArticle> => {
  const rendered = await parseArticleToHtml(article.source);
  return { ...article, html: rendered.html, headings: rendered.headings };
};

export const assertProductionArticle = (article: ArticleSource) => {
  if (article.frontmatter.status !== "published") {
    throw new Error(`${article.relativePath}: production articles must declare status: published`);
  }
};

export const assertArticleStatus = (article: ArticleSource) => {
  if (article.frontmatter.status !== "draft" && article.frontmatter.status !== "published") {
    throw new Error(`${article.relativePath}: status must be draft or published`);
  }
};

export const contentRoot = contentRootFromEnvironment;
