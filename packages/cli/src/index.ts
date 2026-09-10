#!/usr/bin/env node
import { assertProductionArticle, contentRoot, loadArticles } from "./content";

const args = process.argv.slice(2);
const command = args[0] ?? "help";
const printHelp = () => {
  console.log(`mimifuwacc

Usage:
  mimifuwacc preview
  mimifuwacc check
  mimifuwacc list

Environment:
  MIMIFUWACC_CONTENT_ROOT   Content repository root (default: ./contents)
  MIMIFUWACC_ARTICLES_ROOT  Override article directory
`);
};

const main = async () => {
  if (command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command !== "check" && command !== "list" && command !== "preview") {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const articles = await loadArticles();
  console.log(`content root: ${contentRoot()}`);

  for (const article of articles) {
    if (command === "check") {
      if (article.frontmatter.status !== "draft" && article.frontmatter.status !== "published") {
        assertProductionArticle(article);
      }
    }

    const status = article.frontmatter.status ?? "missing-status";
    console.log(`${status}\t${article.relativePath}`);
  }
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
