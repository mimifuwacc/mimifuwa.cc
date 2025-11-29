import fs from "node:fs";
import path from "node:path";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

// 開発環境かどうかを判定
const isDevelopment = process.env.NODE_ENV === "development";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  draft?: boolean;
}

export default async function getFrontmatter(
  markdown: string,
): Promise<BlogPost> {
  const file = new VFile({
    value: markdown,
  });

  matter(file);
  const frontmatter = file.data.matter || {};

  return frontmatter as BlogPost;
}

export async function getRecentPosts(count: number) {
  const postsDir = path.resolve(process.cwd(), "src/contents/blogs");
  const files: Record<string, () => Promise<string>> = {};

  for (const filename of fs.readdirSync(postsDir)) {
    if (filename.endsWith(".md")) {
      const filePath = path.join(postsDir, filename);
      files[filePath] = async () => fs.promises.readFile(filePath, "utf-8");
    }
  }
  const posts: {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    draft?: boolean;
  }[] = [];
  // use getFrontmatter to extract frontmatter from each file
  for (const path in files) {
    const slug = path.split("/").pop()?.replace(/\.md$/, "") || "";
    const markdown = await files[path]();
    const frontmatter = await getFrontmatter(markdown);
    if (
      typeof frontmatter.title === "string" &&
      typeof frontmatter.date === "string" &&
      typeof frontmatter.excerpt === "string" &&
      Array.isArray(frontmatter.tags) &&
      frontmatter.tags.every((tag: unknown) => typeof tag === "string") &&
      (isDevelopment || !frontmatter.draft) // 開発環境以外は下書き記事を除外
    ) {
      posts.push({
        slug,
        title: frontmatter.title,
        date: frontmatter.date,
        excerpt: frontmatter.excerpt,
        tags: frontmatter.tags,
        draft: frontmatter.draft,
      });
    }
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  return posts.slice(0, count);
}

export async function getAllPosts() {
  const postsDir = path.resolve(process.cwd(), "src/contents/blogs");
  const files: Record<string, () => Promise<string>> = {};

  for (const filename of fs.readdirSync(postsDir)) {
    if (filename.endsWith(".md")) {
      const filePath = path.join(postsDir, filename);
      files[filePath] = async () => fs.promises.readFile(filePath, "utf-8");
    }
  }

  const posts: {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    tags: string[];
    draft?: boolean;
  }[] = [];

  // use getFrontmatter to extract frontmatter from each file
  for (const path in files) {
    const slug = path.split("/").pop()?.replace(/\.md$/, "") || "";
    const markdown = await files[path]();
    const frontmatter = await getFrontmatter(markdown);
    if (
      typeof frontmatter.title === "string" &&
      typeof frontmatter.date === "string" &&
      typeof frontmatter.excerpt === "string" &&
      Array.isArray(frontmatter.tags) &&
      frontmatter.tags.every((tag: unknown) => typeof tag === "string") &&
      (isDevelopment || !frontmatter.draft) // 開発環境以外は下書き記事を除外
    ) {
      posts.push({
        slug,
        title: frontmatter.title,
        date: frontmatter.date,
        excerpt: frontmatter.excerpt,
        tags: frontmatter.tags,
        draft: frontmatter.draft,
      });
    }
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  return posts;
}
