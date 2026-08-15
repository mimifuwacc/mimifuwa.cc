import { and, count, desc, eq } from "drizzle-orm";
import { createDb } from "./db";
import { blogPosts, blogTags, tags } from "./db/schema";
import type { Env } from "./repository";

export interface AdminPostInput {
  slug: string;
  title: string;
  excerpt: string;
  markdown: string;
  date: string;
  tags: string[];
  draft: boolean;
  isPublished: boolean;
}

export interface AdminPost extends AdminPostInput {
  id: number;
  createdAt: string;
  updatedAt: string;
}

const getTags = async (env: Env, postId: number) =>
  createDb(env.DB)
    .select({ name: tags.name })
    .from(tags)
    .innerJoin(blogTags, eq(blogTags.tagId, tags.id))
    .where(eq(blogTags.blogPostId, postId))
    .orderBy(tags.name)
    .then((rows) => rows.map(({ name }) => name));

const replaceTags = async (env: Env, postId: number, names: string[]) => {
  const db = createDb(env.DB);
  await db.delete(blogTags).where(eq(blogTags.blogPostId, postId));
  for (const name of new Set(names.map((tag) => tag.trim()).filter(Boolean))) {
    await db.insert(tags).values({ name }).onConflictDoNothing();
    const [tag] = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
    if (tag) await db.insert(blogTags).values({ blogPostId: postId, tagId: tag.id });
  }
};

const toAdminPost = async (env: Env, row: typeof blogPosts.$inferSelect): Promise<AdminPost> => {
  const object = await env.R2.get(`posts/${row.slug}.md`);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    markdown: object ? await object.text() : "",
    date: row.date,
    tags: await getTags(env, row.id),
    draft: row.draft,
    isPublished: row.isPublished,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
};

export const listAdminPosts = async (env: Env) => {
  const db = createDb(env.DB);
  const [rows, [{ totalCount }]] = await Promise.all([
    db.select().from(blogPosts).orderBy(desc(blogPosts.date)).limit(100),
    db.select({ totalCount: count() }).from(blogPosts),
  ]);
  const posts = await Promise.all(rows.map((row) => toAdminPost(env, row)));
  return { posts, totalCount };
};

export const getAdminPost = async (env: Env, slug: string) => {
  const [row] = await createDb(env.DB)
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  return row ? toAdminPost(env, row) : null;
};

export const createAdminPost = async (env: Env, input: AdminPostInput) => {
  const db = createDb(env.DB);
  const [existing] = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(eq(blogPosts.slug, input.slug))
    .limit(1);
  if (existing) throw new Error("Slug already exists");

  const r2Key = `posts/${input.slug}.md`;
  const [row] = await db
    .insert(blogPosts)
    .values({
      slug: input.slug,
      r2Key,
      title: input.title,
      excerpt: input.excerpt,
      date: input.date,
      draft: input.draft,
      isPublished: input.isPublished,
      contentHash: await contentHash(input.markdown),
    })
    .returning();
  await Promise.all([
    env.R2.put(r2Key, input.markdown, {
      httpMetadata: { contentType: "text/markdown; charset=UTF-8" },
    }),
    replaceTags(env, row.id, input.tags),
  ]);
  return toAdminPost(env, row);
};

export const updateAdminPost = async (env: Env, currentSlug: string, input: AdminPostInput) => {
  const db = createDb(env.DB);
  const [existing] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, currentSlug))
    .limit(1);
  if (!existing) return null;

  if (input.slug !== currentSlug) {
    const [collision] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, input.slug)))
      .limit(1);
    if (collision) throw new Error("Slug already exists");
  }

  const r2Key = `posts/${input.slug}.md`;
  const [row] = await db
    .update(blogPosts)
    .set({
      slug: input.slug,
      r2Key,
      title: input.title,
      excerpt: input.excerpt,
      date: input.date,
      draft: input.draft,
      isPublished: input.isPublished,
      contentHash: await contentHash(input.markdown),
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, existing.id))
    .returning();
  await Promise.all([
    env.R2.put(r2Key, input.markdown, {
      httpMetadata: { contentType: "text/markdown; charset=UTF-8" },
    }),
    replaceTags(env, row.id, input.tags),
    env.R2.delete([
      `og/${currentSlug}.png`,
      `og/${input.slug}.png`,
      `og/v2/${currentSlug}.png`,
      `og/v2/${input.slug}.png`,
    ]),
  ]);
  if (existing.r2Key !== r2Key) await env.R2.delete(existing.r2Key);
  return toAdminPost(env, row);
};

export const deleteAdminPost = async (env: Env, slug: string) => {
  const db = createDb(env.DB);
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  if (!row) return false;
  await Promise.all([
    db.delete(blogPosts).where(eq(blogPosts.id, row.id)),
    env.R2.delete([row.r2Key, `posts/${slug}.html`, `og/${slug}.png`, `og/v2/${slug}.png`]),
  ]);
  return true;
};

export const archiveAdminPost = async (env: Env, slug: string) => {
  const [row] = await createDb(env.DB)
    .update(blogPosts)
    .set({ isPublished: false, updatedAt: new Date() })
    .where(eq(blogPosts.slug, slug))
    .returning();
  if (row) await env.R2.delete([`og/${slug}.png`, `og/v2/${slug}.png`]);
  return row !== undefined;
};

const contentHash = async (content: string) => {
  const bytes = new TextEncoder().encode(content);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};
