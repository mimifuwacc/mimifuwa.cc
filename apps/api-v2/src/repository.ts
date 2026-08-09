import type { BlogPost, BlogPostPage, BlogPostSummary } from "@mimifuwacc/blog-domain";
import { Effect } from "effect";

export interface Env {
  readonly DB: D1Database;
  readonly R2: R2Bucket;
}

interface PostRow {
  readonly id: number;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly date: string;
}

interface CountRow {
  readonly total: number;
}

interface TagRow {
  readonly name: string;
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
  fromPromise(async () => {
    const result = await env.DB.prepare(
      `SELECT tags.name
       FROM tags
       INNER JOIN blog_tags ON blog_tags.tag_id = tags.id
       WHERE blog_tags.blog_post_id = ?
       ORDER BY tags.name`,
    )
      .bind(postId)
      .all<TagRow>();
    return result.results.map(({ name }) => name);
  });

export const listPosts = (env: Env, limit: number): Effect.Effect<BlogPostPage, RepositoryError> =>
  Effect.gen(function* () {
    const [rows, count] = yield* fromPromise(async () =>
      Promise.all([
        env.DB.prepare(
          `SELECT id, slug, title, excerpt, date
           FROM blog_posts
           WHERE draft = 0 AND is_published = 1
           ORDER BY date DESC
           LIMIT ?`,
        )
          .bind(limit)
          .all<PostRow>(),
        env.DB.prepare(
          "SELECT COUNT(*) AS total FROM blog_posts WHERE draft = 0 AND is_published = 1",
        ).first<CountRow>(),
      ]),
    );

    const posts = yield* Effect.forEach(
      rows.results,
      (row) =>
        Effect.map(
          tagsFor(env, row.id),
          (tags): BlogPostSummary => ({
            slug: row.slug,
            title: row.title,
            excerpt: row.excerpt,
            date: row.date,
            tags,
          }),
        ),
      { concurrency: 8 },
    );

    return { posts, totalCount: count?.total ?? 0 };
  });

export const getPost = (env: Env, slug: string): Effect.Effect<BlogPost | null, RepositoryError> =>
  Effect.gen(function* () {
    const row = yield* fromPromise(() =>
      env.DB.prepare(
        `SELECT id, slug, title, excerpt, date
         FROM blog_posts
         WHERE slug = ? AND draft = 0 AND is_published = 1`,
      )
        .bind(slug)
        .first<PostRow>(),
    );
    if (!row) return null;

    const [markdownObject, tags] = yield* Effect.all([
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
      tags,
      markdown,
    };
  });
