#!/usr/bin/env node
import { assertArticleStatus, contentRoot, loadArticles } from "./content";
import { buildStaticSite, startPreview } from "./site";

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

  if (command === "preview") {
    await startPreview();
    return;
  }

  if (command === "build") {
    const result = await buildStaticSite();
    console.info(`Built ${result.count} articles in ${result.root}`);
    return;
  }

  if (command !== "check" && command !== "list") {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const articles = await loadArticles();
  console.log(`content root: ${contentRoot()}`);

  for (const article of articles) {
    if (command === "check") {
      assertArticleStatus(article);
    }

    const status = article.frontmatter.status ?? "missing-status";
    console.log(`${status}\t${article.relativePath}`);
  }
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
