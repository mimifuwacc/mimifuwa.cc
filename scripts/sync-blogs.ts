import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { glob } from "glob";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  draft?: boolean;
}

interface BlogPostWithContent extends BlogPost {
  content: string;
  r2Key: string;
}

const blogsDir = path.resolve(process.cwd(), "src/contents/blogs");
const imagesDir = path.resolve(process.cwd(), "public/images");
const isRemote = process.argv.includes("--remote");
const syncAll = process.argv.includes("--all");

// Git差分から変更されたファイルを取得
function getChangedFiles(): Set<string> {
  try {
    const isCI = process.env.CI === "true";
    const baseBranch = process.env.GITHUB_REF_NAME || "main";

    if (isCI) {
      // CIでは origin/main...HEAD で差分を取得
      execSync("git fetch origin main --depth=1", {
        encoding: "utf-8",
        stdio: "ignore",
      });
      const result = execSync("git diff --name-only origin/main...HEAD", {
        encoding: "utf-8",
      });
      const files = result
        .trim()
        .split("\n")
        .filter((f) => f);
      return new Set(files);
    } else {
      // ローカルでは HEAD~1...HEAD
      const result = execSync("git diff --name-only HEAD~1...HEAD", {
        encoding: "utf-8",
      });
      const files = result
        .trim()
        .split("\n")
        .filter((f) => f);
      return new Set(files);
    }
  } catch {
    // エラー（初回など）は全ファイル同期
    return new Set();
  }
}

async function extractFrontmatter(markdown: string): Promise<BlogPost> {
  const file = new VFile({ value: markdown });
  matter(file);
  const frontmatter = file.data.matter || {};
  return frontmatter as BlogPost;
}

async function loadLocalMarkdowns(
  changedFiles: Set<string>,
): Promise<BlogPostWithContent[]> {
  const files = await glob("**/*.md", { cwd: blogsDir });
  const posts: BlogPostWithContent[] = [];

  for (const relativePath of files) {
    // 変更ファイルのみチェック
    const gitPath = `src/contents/blogs/${relativePath}`;
    if (!syncAll && changedFiles.size > 0 && !changedFiles.has(gitPath)) {
      continue;
    }

    const fullPath = path.join(blogsDir, relativePath);
    const content = await fs.promises.readFile(fullPath, "utf-8");
    const frontmatter = await extractFrontmatter(content);

    // Validate frontmatter
    if (
      typeof frontmatter.title === "string" &&
      typeof frontmatter.date === "string" &&
      typeof frontmatter.excerpt === "string" &&
      Array.isArray(frontmatter.tags) &&
      frontmatter.tags.every((tag: unknown) => typeof tag === "string")
    ) {
      posts.push({
        ...frontmatter,
        content,
        slug: relativePath.replace(/\.md$/, "").replace(/\\/g, "/"),
        r2Key: `blogs/${relativePath}`,
      });
    } else {
      console.warn(`Skipping invalid frontmatter in: ${relativePath}`);
    }
  }

  return posts;
}

async function uploadToR2(key: string, content: string): Promise<void> {
  const localFlag = isRemote ? "--remote" : "--local";

  // 一時ファイルを作成
  const tmpFile = path.join(os.tmpdir(), `blog-upload-${Date.now()}.md`);
  try {
    await fs.promises.writeFile(tmpFile, content, "utf-8");

    const command = `wrangler r2 object put mimifuwacc-blogs/${key} ${localFlag} --file="${tmpFile}"`;
    execSync(command, { encoding: "utf-8" });
    console.log(`Uploaded: ${key}`);
  } catch (error) {
    console.error(`Failed to upload ${key}:`, error);
    throw error;
  } finally {
    // 一時ファイルを削除
    await fs.promises.unlink(tmpFile).catch(() => {
      // 削除に失敗しても無視
    });
  }
}

// 画像ファイルをR2にアップロード
async function uploadImageToR2(
  relativePath: string,
  fullPath: string,
): Promise<void> {
  const localFlag = isRemote ? "--remote" : "--local";
  const r2Key = `images/${relativePath}`;

  try {
    const command = `wrangler r2 object put mimifuwacc-blogs/${r2Key} ${localFlag} --file="${fullPath}"`;
    execSync(command, { encoding: "utf-8" });
    console.log(`Uploaded image: ${r2Key}`);
  } catch (error) {
    console.error(`Failed to upload image ${r2Key}:`, error);
    throw error;
  }
}

// public/images/以下の画像をR2にアップロード（変更ファイルのみ）
async function syncImages(changedFiles: Set<string>): Promise<void> {
  console.log(`Syncing images from ${imagesDir}...`);

  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".avif",
  ];
  const files: Array<{ relativePath: string; fullPath: string }> = [];

  // 再帰的に画像ファイルを検索
  async function findImageFiles(dir: string, baseRelativePath: string = "") {
    const items = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.join(baseRelativePath, item.name);

      if (item.isDirectory()) {
        await findImageFiles(fullPath, relativePath);
      } else if (item.isFile()) {
        const ext = item.name.toLowerCase();
        if (imageExtensions.some((e) => ext.endsWith(e))) {
          // 変更ファイルのみチェック
          const gitPath = `public/images/${relativePath}`;
          if (!syncAll && changedFiles.size > 0 && !changedFiles.has(gitPath)) {
            continue;
          }
          files.push({ relativePath, fullPath });
        }
      }
    }
  }

  await findImageFiles(imagesDir);

  console.log(`Found ${files.length} changed image files`);

  for (const { relativePath, fullPath } of files) {
    // WindowsパスをUnix形式に変換
    const normalizedPath = relativePath.replace(/\\/g, "/");
    await uploadImageToR2(normalizedPath, fullPath);
  }

  console.log("Image sync complete!");
}

async function insertOrUpdateD1(post: BlogPostWithContent): Promise<void> {
  const db = isRemote ? "--remote" : "--local";
  const escapedTitle = post.title.replace(/'/g, "''");
  const escapedExcerpt = post.excerpt.replace(/'/g, "''");

  // Insert or update blog post
  const upsertPost = `
    INSERT INTO blog_posts (slug, r2_key, title, excerpt, date, draft)
    VALUES ('${post.slug}', '${post.r2Key}', '${escapedTitle}', '${escapedExcerpt}', '${post.date}', ${post.draft ? 1 : 0})
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      excerpt = excluded.excerpt,
      date = excluded.date,
      draft = excluded.draft,
      updated_at = strftime('%s', 'now');
  `;

  execSync(
    `wrangler d1 execute mimifuwacc-blogs ${db} --command="${upsertPost}"`,
    {
      encoding: "utf-8",
    },
  );

  // Get the post ID using JSON output
  const postIdQuery = `SELECT id FROM blog_posts WHERE slug = '${post.slug}'`;
  const postIdResult = execSync(
    `wrangler d1 execute mimifuwacc-blogs ${db} --command="${postIdQuery}" --json`,
    { encoding: "utf-8" },
  );

  const postIdJson = JSON.parse(postIdResult);
  if (!postIdJson[0]?.results?.[0]?.id) {
    throw new Error(`Failed to get post ID for ${post.slug}: ${postIdResult}`);
  }
  const postId = postIdJson[0].results[0].id;

  // Delete existing tags for this post
  const deleteTags = `DELETE FROM blog_tags WHERE blog_post_id = ${postId}`;
  execSync(
    `wrangler d1 execute mimifuwacc-blogs ${db} --command="${deleteTags}"`,
    {
      encoding: "utf-8",
    },
  );

  // Insert tags
  for (const tag of post.tags) {
    const escapedTag = tag.replace(/'/g, "''");

    // Insert tag (ignore if exists)
    const insertTag = `INSERT OR IGNORE INTO tags (name) VALUES ('${escapedTag}')`;
    execSync(
      `wrangler d1 execute mimifuwacc-blogs ${db} --command="${insertTag}"`,
      {
        encoding: "utf-8",
      },
    );

    // Get tag ID using JSON output
    const tagIdQuery = `SELECT id FROM tags WHERE name = '${escapedTag}'`;
    const tagIdResult = execSync(
      `wrangler d1 execute mimifuwacc-blogs ${db} --command="${tagIdQuery}" --json`,
      { encoding: "utf-8" },
    );

    const tagIdJson = JSON.parse(tagIdResult);
    if (!tagIdJson[0]?.results?.[0]?.id) {
      console.warn(`Failed to get tag ID for ${tag}: ${tagIdResult}`);
      continue;
    }
    const tagId = tagIdJson[0].results[0].id;

    // Link post and tag
    const linkTag = `INSERT OR IGNORE INTO blog_tags (blog_post_id, tag_id) VALUES (${postId}, ${tagId})`;
    execSync(
      `wrangler d1 execute mimifuwacc-blogs ${db} --command="${linkTag}"`,
      {
        encoding: "utf-8",
      },
    );
  }

  console.log(`Synced to D1: ${post.slug}`);
}

async function main() {
  // 変更ファイルを取得
  const changedFiles = getChangedFiles();
  if (changedFiles.size > 0) {
    console.log(`Changed files: ${Array.from(changedFiles).join(", ")}`);
  } else if (!syncAll) {
    console.log("No changed files detected. Use --all to sync all files.");
    return;
  }

  // 画像を同期
  await syncImages(changedFiles);

  console.log(`Loading markdown files from ${blogsDir}...`);
  const posts = await loadLocalMarkdowns(changedFiles);
  console.log(`Found ${posts.length} posts to sync`);

  for (const post of posts) {
    // Upload to R2
    await uploadToR2(post.r2Key, post.content);

    // Insert/Update in D1
    await insertOrUpdateD1(post);
  }

  console.log("\nSync complete!");
}

main().catch((error) => {
  console.error("Error during sync:", error);
  process.exit(1);
});
