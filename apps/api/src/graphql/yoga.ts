import { parseToHtml } from "@mimifuwacc/parser";
import { createSchema, createYoga } from "graphql-yoga";
import { createDB } from "../db";
import { BlogPostService } from "../services/blog-post";
import { R2Service } from "../services/r2";
import { purgeOgCache } from "../routes/og-cache";
import type { Context, Env } from "../types";
import { CursorScalar, TimeScalar } from "./scalars";

const typeDefs = /* GraphQL */ `
  scalar Time
  scalar Cursor

  input PageInput {
    first: Int = 20
    after: Cursor
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: Cursor
    endCursor: Cursor
    totalCount: Int!
  }

  type BlogPost {
    id: ID!
    slug: String!
    r2Key: String!
    title: String!
    excerpt: String!
    content: String!
    markdown: String
    date: Time!
    tags: [Tag!]!
    draft: Boolean!
    isPublished: Boolean!
    contentHash: String
    createdAt: Time!
    updatedAt: Time!
  }

  type BlogPostEdge {
    node: BlogPost!
    cursor: Cursor!
  }

  type BlogPostConnection {
    edges: [BlogPostEdge!]!
    pageInfo: PageInfo!
  }

  type Tag {
    id: ID!
    name: String!
  }

  input BlogPostFilter {
    draft: Boolean
    tag: String
    search: String
    dateAfter: Time
    dateBefore: Time
  }

  input CreateBlogPostInput {
    slug: String!
    title: String!
    excerpt: String!
    content: String!
    date: Time!
    tags: [String!]!
    draft: Boolean = true
    isPublished: Boolean = false
  }

  input UpdateBlogPostInput {
    slug: String!
    newSlug: String
    title: String
    excerpt: String
    content: String
    date: Time
    tags: [String!]
    draft: Boolean
    isPublished: Boolean
  }

  type MutationResponse {
    success: Boolean!
    message: String!
    blogPost: BlogPost
  }

  type Query {
    blogPost(slug: String!): BlogPost
    adminPost(slug: String!): BlogPost
    blogPosts(filter: BlogPostFilter, page: PageInput): BlogPostConnection!
    adminBlogPosts(filter: BlogPostFilter, page: PageInput): BlogPostConnection!
    tags: [Tag!]!
  }

  type Mutation {
    createBlogPost(input: CreateBlogPostInput!): MutationResponse!
    updateBlogPost(input: UpdateBlogPostInput!): MutationResponse!
    deleteBlogPost(slug: String!): MutationResponse!
    archiveBlogPost(slug: String!): MutationResponse!
  }
`;

const resolvers = {
  Time: TimeScalar,
  Cursor: CursorScalar,

  Query: {
    blogPost: async (_: unknown, { slug }: { slug: string }, context: Context) => {
      const db = createDB(context.env);
      const blogService = new BlogPostService(db);
      const r2Service = new R2Service(context.env.R2 as any);

      const post = await blogService.findBySlug(slug);
      if (!post || !post.isPublished) return null;

      const [content, markdown] = await Promise.all([
        r2Service.downloadHtml(slug),
        r2Service.downloadMarkdown(slug),
      ]);

      return {
        ...post,
        content: content || "",
        markdown: markdown || "",
      };
    },

    adminPost: async (_: unknown, { slug }: { slug: string }, context: Context) => {
      const secret = context.request.headers.get("x-admin-secret");
      if (!secret || secret !== context.env.ADMIN_SECRET) {
        throw new Error("Unauthorized");
      }

      const db = createDB(context.env);
      const blogService = new BlogPostService(db);
      const r2Service = new R2Service(context.env.R2 as any);

      const post = await blogService.findBySlug(slug);
      if (!post) return null;

      const [content, markdown] = await Promise.all([
        r2Service.downloadHtml(slug),
        r2Service.downloadMarkdown(slug),
      ]);

      return {
        ...post,
        content: content || "",
        markdown: markdown || "",
      };
    },

    blogPosts: async (
      _: unknown,
      args: {
        filter?: {
          draft?: boolean | null;
          tag?: string | null;
          search?: string | null;
          dateAfter?: Date | null;
          dateBefore?: Date | null;
        } | null;
        page?: { first?: number | null; after?: string | null } | null;
      },
      context: Context,
    ) => {
      const db = createDB(context.env);
      const blogService = new BlogPostService(db);

      const first = args.page?.first || 20;
      const offset = 0;

      if (args.page?.after) {
        const cursor = blogService.decodeCursor(args.page.after);
        if (cursor) {
          // For cursor-based pagination, would implement proper cursor seeking
        }
      }

      return blogService.findWithPagination(
        { ...(args.filter || {}), isPublished: true },
        {
          first,
          offset,
          limit: first,
        },
      );
    },

    adminBlogPosts: async (
      _: unknown,
      args: {
        filter?: {
          draft?: boolean | null;
          tag?: string | null;
          search?: string | null;
          dateAfter?: Date | null;
          dateBefore?: Date | null;
        } | null;
        page?: { first?: number | null; after?: string | null } | null;
      },
      context: Context,
    ) => {
      const secret = context.request.headers.get("x-admin-secret");
      if (!secret || secret !== context.env.ADMIN_SECRET) {
        throw new Error("Unauthorized");
      }

      const db = createDB(context.env);
      const blogService = new BlogPostService(db);

      const first = args.page?.first || 50;
      const offset = 0;

      return blogService.findWithPagination(args.filter || {}, {
        first,
        offset,
        limit: first,
      });
    },

    tags: async (_: unknown, __: unknown, context: Context) => {
      const db = createDB(context.env);
      const blogService = new BlogPostService(db);
      return blogService.getAllTags();
    },
  },

  Mutation: {
    createBlogPost: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          slug: string;
          title: string;
          excerpt: string;
          content: string;
          date: Date;
          tags: string[];
          draft?: boolean | null;
          isPublished?: boolean | null;
        };
      },
      context: Context,
    ) => {
      const db = createDB(context.env);
      const blogService = new BlogPostService(db);
      const r2Service = new R2Service(context.env.R2 as any);

      try {
        const contentHash = await r2Service.generateContentHash(input.content);
        const r2Key = `posts/${input.slug}.md`;
        const draft = input.draft ?? true;
        const isPublished = input.isPublished ?? false;

        if (draft) {
          // draft=true：Markdown のみ保存
          await r2Service.uploadMarkdown(r2Key, input.content);
        } else {
          // draft=false：Markdown + HTML を保存
          const { html } = await parseToHtml(input.content);
          await r2Service.uploadPostContent(input.slug, input.content, html);
        }

        const postId = await blogService.upsert({
          slug: input.slug,
          r2Key,
          title: input.title,
          excerpt: input.excerpt,
          date: input.date,
          draft,
          isPublished,
          contentHash,
        });

        await blogService.deleteTags(postId);
        for (const tagName of input.tags) {
          const tag = await blogService.findOrCreateTag(tagName);
          await blogService.linkTagToPost(postId, tag.id);
        }

        const post = await blogService.findBySlug(input.slug);

        return {
          success: true,
          message: "Blog post created successfully",
          blogPost: post || undefined,
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to create blog post",
          blogPost: null,
        };
      }
    },

    updateBlogPost: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          slug: string;
          newSlug?: string | null;
          title?: string | null;
          excerpt?: string | null;
          content?: string | null;
          date?: Date | null;
          tags?: string[] | null;
          draft?: boolean | null;
          isPublished?: boolean | null;
        };
      },
      context: Context,
    ) => {
      const db = createDB(context.env);
      const blogService = new BlogPostService(db);
      const r2Service = new R2Service(context.env.R2 as any);

      try {
        const existing = await blogService.findBySlug(input.slug);
        if (!existing) {
          return {
            success: false,
            message: "Blog post not found",
            blogPost: null,
          };
        }

        // slug リネーム処理
        const targetSlug =
          input.newSlug && input.newSlug !== input.slug ? input.newSlug : input.slug;

        if (targetSlug !== input.slug) {
          const conflict = await blogService.findBySlug(targetSlug);
          if (conflict) {
            return {
              success: false,
              message: `slug "${targetSlug}" は既に使用されています`,
              blogPost: null,
            };
          }
          // slug リネーム：MD と HTML（あれば）を新 slug へ移動
          const mdContent = input.content || (await r2Service.downloadMarkdown(input.slug)) || "";
          await r2Service.uploadMarkdown(`posts/${targetSlug}.md`, mdContent);
          const existingHtml = await r2Service.downloadHtml(input.slug);
          if (existingHtml) {
            await r2Service.uploadHtml(`posts/${targetSlug}.html`, existingHtml);
          }
          await r2Service.deletePostContent(input.slug);
          await blogService.updateSlug(input.slug, targetSlug);
        }

        const draft = input.draft ?? existing.draft;
        const isPublished = input.isPublished ?? existing.isPublished;
        const contentHash = input.content
          ? await r2Service.generateContentHash(input.content)
          : existing.contentHash;

        if (input.content) {
          if (draft) {
            // draft=true：Markdown のみ更新（HTML は保持）
            await r2Service.uploadMarkdown(`posts/${targetSlug}.md`, input.content);
          } else {
            // draft=false：Markdown を保存し HTML を生成・上書き
            const { html } = await parseToHtml(input.content);
            await r2Service.uploadPostContent(targetSlug, input.content, html);
          }
        } else if (!draft && existing.draft) {
          // content 変更なしで draft=false になった場合（公開操作）：MD から HTML を生成
          const markdown = (await r2Service.downloadMarkdown(targetSlug)) || "";
          if (markdown) {
            const { html } = await parseToHtml(markdown);
            await r2Service.uploadHtml(`posts/${targetSlug}.html`, html);
          }
        }
        // draft=true に戻す場合は HTML を保持し続ける

        const postId = await blogService.upsert({
          slug: targetSlug,
          r2Key: existing.r2Key,
          title: input.title ?? existing.title,
          excerpt: input.excerpt ?? existing.excerpt,
          date: input.date ?? new Date(existing.date),
          draft,
          isPublished,
          contentHash,
        });

        if (input.tags) {
          await blogService.deleteTags(postId);
          for (const tagName of input.tags) {
            const tag = await blogService.findOrCreateTag(tagName);
            await blogService.linkTagToPost(postId, tag.id);
          }
        }

        const post = await blogService.findBySlug(targetSlug);

        const origin = new URL(context.request.url).origin;
        await purgeOgCache(origin, targetSlug);
        if (targetSlug !== input.slug) {
          await purgeOgCache(origin, input.slug);
        }

        return {
          success: true,
          message: "Blog post updated successfully",
          blogPost: post || undefined,
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to update blog post",
          blogPost: null,
        };
      }
    },

    deleteBlogPost: async (_: unknown, { slug }: { slug: string }, context: Context) => {
      const db = createDB(context.env);
      const blogService = new BlogPostService(db);
      const r2Service = new R2Service(context.env.R2 as any);

      try {
        const post = await blogService.findBySlug(slug);
        if (!post) {
          return {
            success: false,
            message: "Blog post not found",
            blogPost: null,
          };
        }

        // Delete both Markdown and HTML from R2
        await r2Service.deletePostContent(slug);
        await blogService.delete(slug);

        return {
          success: true,
          message: "Blog post deleted successfully",
          blogPost: null,
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to delete blog post",
          blogPost: null,
        };
      }
    },

    archiveBlogPost: async (_: unknown, { slug }: { slug: string }, context: Context) => {
      const db = createDB(context.env);
      const blogService = new BlogPostService(db);

      try {
        await blogService.updateDraftStatus(slug, true);

        const post = await blogService.findBySlug(slug);

        return {
          success: true,
          message: "Blog post archived successfully",
          blogPost: post || undefined,
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Failed to archive blog post",
          blogPost: null,
        };
      }
    },
  },
};

export function createYogaServer() {
  return createYoga({
    schema: createSchema({ typeDefs, resolvers }),
    graphqlEndpoint: "/graphql",
    landingPage: false,
    cors: false, // Disable CORS in Yoga, let Hono handle it
  });
}
