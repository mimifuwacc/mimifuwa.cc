import { and, count, desc, eq } from "drizzle-orm";
import { Effect } from "effect";
import type { BlogPost, BlogPostPage, BlogPostSummary } from "./contracts";
import { createDb } from "./db";
import { blogPosts, blogTags, tags } from "./db/schema";

export interface Env {
  readonly DB: D1Database;
  readonly R2: R2Bucket;
  readonly API_ADMIN_SECRET: string;
  readonly API_BASE_URL?: string;
  readonly API_ORIGIN?: string;
  readonly BLOG_ORIGIN?: string;
  readonly CACHE_PURGE_API_TOKEN?: string;
  readonly CLOUDFLARE_ZONE_ID?: string;
}

export class RepositoryError extends Error {
  readonly _tag = "RepositoryError";
}

const fromPromise = <A>(run: () => Promise<A>) =>
  Effect.tryPromise({
    try: run,
    catch: (cause) => new RepositoryError("The content repository is unavailable", { cause }),
  });

const tagsFor = (env: Env, postId: number) =>
  fromPromise(() =>
    createDb(env.DB)
      .select({ name: tags.name })
      .from(tags)
      .innerJoin(blogTags, eq(blogTags.tagId, tags.id))
      .where(eq(blogTags.blogPostId, postId))
      .orderBy(tags.name),
  ).pipe(Effect.map((rows) => rows.map(({ name }) => name)));

export const listPosts = (env: Env, limit: number): Effect.Effect<BlogPostPage, RepositoryError> =>
  Effect.gen(function* () {
    const db = createDb(env.DB);
    const published = and(eq(blogPosts.draft, false), eq(blogPosts.isPublished, true));
    const [rows, [{ totalCount }]] = yield* fromPromise(() =>
      Promise.all([
        db
          .select({
            id: blogPosts.id,
            slug: blogPosts.slug,
            title: blogPosts.title,
            excerpt: blogPosts.excerpt,
            date: blogPosts.date,
          })
          .from(blogPosts)
          .where(published)
          .orderBy(desc(blogPosts.date))
          .limit(limit),
        db.select({ totalCount: count() }).from(blogPosts).where(published),
      ]),
    );

    const posts = yield* Effect.forEach(
      rows,
      (row) =>
        tagsFor(env, row.id).pipe(
          Effect.map(
            (postTags): BlogPostSummary => ({
              slug: row.slug,
              title: row.title,
              excerpt: row.excerpt,
              date: row.date,
              tags: postTags,
            }),
          ),
        ),
      { concurrency: 8 },
    );
    return { posts, totalCount };
  });

export const getPost = (env: Env, slug: string): Effect.Effect<BlogPost | null, RepositoryError> =>
  Effect.gen(function* () {
    const [row] = yield* fromPromise(() =>
      createDb(env.DB)
        .select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          excerpt: blogPosts.excerpt,
          date: blogPosts.date,
        })
        .from(blogPosts)
        .where(
          and(
            eq(blogPosts.slug, slug),
            eq(blogPosts.draft, false),
            eq(blogPosts.isPublished, true),
          ),
        )
        .limit(1),
    );
    if (!row) return null;

    const [markdownObject, postTags] = yield* Effect.all([
      fromPromise(() => env.R2.get(`posts/${slug}.md`)),
      tagsFor(env, row.id),
    ]);
    if (!markdownObject) return null;

    const markdown = yield* fromPromise(() => markdownObject.text());
    return {
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      date: row.date,
      tags: postTags,
      markdown,
    };
  });
