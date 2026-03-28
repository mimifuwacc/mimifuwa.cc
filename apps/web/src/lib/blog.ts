import fs from "node:fs";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";
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

export interface BlogPostWithContent extends BlogPost {
  content: string;
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

// Cloudflare環境かどうかを判定
async function isCloudflareEnv(): Promise<boolean> {
  try {
    await getCloudflareContext({ async: true });
    return true;
  } catch {
    return false;
  }
}

// ========== ローカルファイルシステム（開発環境） ==========

const postsDir = path.resolve(process.cwd(), "src/contents/blogs");

function findMarkdownFiles(dir: string, basePath: string = ""): string[] {
  const items = fs.readdirSync(dir);
  const files: string[] = [];

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, path.join(basePath, item)));
    } else if (item.endsWith(".md")) {
      files.push(path.join(basePath, item));
    }
  }

  return files;
}

async function loadLocalPosts(): Promise<BlogPost[]> {
  const files = findMarkdownFiles(postsDir);
  const posts: BlogPost[] = [];

  for (const relativePath of files) {
    const fullPath = path.join(postsDir, relativePath);
    const content = await fs.promises.readFile(fullPath, "utf-8");
    const frontmatter = await getFrontmatter(content);

    if (
      typeof frontmatter.title === "string" &&
      typeof frontmatter.date === "string" &&
      typeof frontmatter.excerpt === "string" &&
      Array.isArray(frontmatter.tags) &&
      frontmatter.tags.every((tag: unknown) => typeof tag === "string")
    ) {
      const slug = relativePath.replace(/\.md$/, "").replace(/\\/g, "/");
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

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function getLocalPostBySlug(
  slug: string,
): Promise<BlogPostWithContent | null> {
  // slugからファイルパスを構築
  const filePath = path.join(postsDir, `${slug}.md`);

  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    const frontmatter = await getFrontmatter(content);

    if (
      typeof frontmatter.title !== "string" ||
      typeof frontmatter.date !== "string" ||
      typeof frontmatter.excerpt !== "string" ||
      !Array.isArray(frontmatter.tags)
    ) {
      return null;
    }

    return {
      slug,
      title: frontmatter.title,
      date: frontmatter.date,
      excerpt: frontmatter.excerpt,
      tags: frontmatter.tags,
      draft: frontmatter.draft,
      content,
    };
  } catch {
    return null;
  }
}

async function getLocalAllSlugs(): Promise<string[]> {
  const files = findMarkdownFiles(postsDir);
  const slugs: string[] = [];

  for (const relativePath of files) {
    const fullPath = path.join(postsDir, relativePath);
    const content = await fs.promises.readFile(fullPath, "utf-8");
    const frontmatter = await getFrontmatter(content);

    // 下書きでないもののみ
    if (
      typeof frontmatter.title === "string" &&
      typeof frontmatter.date === "string" &&
      !frontmatter.draft
    ) {
      slugs.push(relativePath.replace(/\.md$/, "").replace(/\\/g, "/"));
    }
  }

  return slugs;
}

// ========== Cloudflare R2/D1（本番環境） ==========

interface D1BlogPost {
  id: number;
  slug: string;
  r2_key: string;
  title: string;
  excerpt: string;
  date: string;
  draft: number;
  tags: string | null;
}

function parseD1Post(row: D1BlogPost): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    date: row.date,
    excerpt: row.excerpt,
    tags: row.tags ? row.tags.split(",") : [],
    draft: row.draft === 1,
  };
}

async function getEnv(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env as CloudflareEnv;
}

async function fetchPostsFromD1(): Promise<D1BlogPost[]> {
  const env = await getEnv();
  const db = env.DB as D1Database;

  const result = await db
    .prepare(`
      SELECT
        bp.id,
        bp.slug,
        bp.r2_key,
        bp.title,
        bp.excerpt,
        bp.date,
        bp.draft,
        GROUP_CONCAT(t.name) as tags
      FROM blog_posts bp
      LEFT JOIN blog_tags bt ON bp.id = bt.blog_post_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      GROUP BY bp.id
      ORDER BY bp.date DESC
    `)
    .all<D1BlogPost>();

  return result.results || [];
}

async function getCloudflarePostBySlug(
  slug: string,
): Promise<BlogPostWithContent | null> {
  const env = await getEnv();
  const db = env.DB as D1Database;

  const result = await db
    .prepare(`
      SELECT
        bp.id,
        bp.slug,
        bp.r2_key,
        bp.title,
        bp.excerpt,
        bp.date,
        bp.draft,
        GROUP_CONCAT(t.name) as tags
      FROM blog_posts bp
      LEFT JOIN blog_tags bt ON bp.id = bt.blog_post_id
      LEFT JOIN tags t ON bt.tag_id = t.id
      WHERE bp.slug = ?
      GROUP BY bp.id
    `)
    .bind(slug)
    .first<D1BlogPost>();

  if (!result) {
    return null;
  }

  // 非開発環境で下書き記事は非表示
  if (!isDevelopment && result.draft === 1) {
    return null;
  }

  // R2からコンテンツを取得
  const object = await env.BLOGS.get(result.r2_key);
  if (!object) {
    return null;
  }

  const content = await object.text();

  return {
    ...parseD1Post(result),
    content,
  };
}

async function getCloudflareAllSlugs(): Promise<string[]> {
  const env = await getEnv();
  const db = env.DB as D1Database;

  const result = await db
    .prepare("SELECT slug FROM blog_posts WHERE draft = 0")
    .all<{ slug: string }>();

  return result.results?.map((row) => row.slug) || [];
}

// ========== 公開API ==========

export async function getAllPosts(): Promise<BlogPost[]> {
  const isCloudflare = await isCloudflareEnv();

  if (isCloudflare) {
    const rows = await fetchPostsFromD1();
    return rows
      .filter((row) => isDevelopment || row.draft === 0)
      .map(parseD1Post);
  }

  // ローカル開発環境
  const posts = await loadLocalPosts();
  return posts.filter((post) => isDevelopment || !post.draft);
}

export async function getRecentPosts(count: number): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.slice(0, count);
}

export async function getPostBySlug(
  slug: string,
): Promise<BlogPostWithContent | null> {
  const isCloudflare = await isCloudflareEnv();

  if (isCloudflare) {
    return getCloudflarePostBySlug(slug);
  }

  // ローカル開発環境
  const post = await getLocalPostBySlug(slug);
  if (!post) {
    return null;
  }

  // 非開発環境で下書き記事は非表示
  if (!isDevelopment && post.draft) {
    return null;
  }

  return post;
}

export async function getAllSlugs(): Promise<string[]> {
  const isCloudflare = await isCloudflareEnv();

  if (isCloudflare) {
    return getCloudflareAllSlugs();
  }

  // ローカル開発環境
  return getLocalAllSlugs();
}
