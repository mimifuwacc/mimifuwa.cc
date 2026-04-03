import { createYoga, createSchema } from 'graphql-yoga'
import { TimeScalar, CursorScalar } from './scalars'
import { Context } from '../types'
import { BlogPostService } from '../services/blog-post'
import { R2Service } from '../services/r2'
import { createDB } from '../db'
import { parseToHtml } from '@mimifuwacc/parser'
import type { Env } from '../types'

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
    draft: Boolean = false
  }

  input UpdateBlogPostInput {
    slug: String!
    title: String
    excerpt: String
    content: String
    date: Time
    tags: [String!]
    draft: Boolean
  }

  type MutationResponse {
    success: Boolean!
    message: String!
    blogPost: BlogPost
  }

  type Query {
    blogPost(slug: String!): BlogPost
    blogPosts(filter: BlogPostFilter, page: PageInput): BlogPostConnection!
    tags: [Tag!]!
  }

  type Mutation {
    createBlogPost(input: CreateBlogPostInput!): MutationResponse!
    updateBlogPost(input: UpdateBlogPostInput!): MutationResponse!
    deleteBlogPost(slug: String!): MutationResponse!
    archiveBlogPost(slug: String!): MutationResponse!
  }
`

const resolvers = {
  Time: TimeScalar,
  Cursor: CursorScalar,

  Query: {
    blogPost: async (_: unknown, { slug }: { slug: string }, context: Context) => {
      const db = createDB(context.env)
      const blogService = new BlogPostService(db)
      const r2Service = new R2Service(context.env.R2 as any)

      const post = await blogService.findBySlug(slug)
      if (!post) return null

      // Load HTML content from R2, fallback to Markdown
      let content = await r2Service.downloadHtml(slug)
      if (!content) {
        // HTMLが存在しない場合はMarkdownを取得してパース（既存記事の移行用）
        const markdown = await r2Service.downloadMarkdown(slug)
        if (markdown) {
          const { html } = await parseToHtml(markdown)
          content = html
        }
      }

      // Load Markdown from R2 for editing
      const markdown = await r2Service.downloadMarkdown(slug) || ''

      // Ensure content is always a string (never undefined)
      return {
        ...post,
        content: content || '',
        markdown,
      }
    },

    blogPosts: async (
      _: unknown,
      args: {
        filter?: { draft?: boolean | null; tag?: string | null; search?: string | null; dateAfter?: Date | null; dateBefore?: Date | null } | null
        page?: { first?: number | null; after?: string | null } | null
      },
      context: Context
    ) => {
      const db = createDB(context.env)
      const blogService = new BlogPostService(db)

      const first = args.page?.first || 20
      let offset = 0

      if (args.page?.after) {
        const cursor = blogService.decodeCursor(args.page.after)
        if (cursor) {
          // For cursor-based pagination, would implement proper cursor seeking
        }
      }

      return blogService.findWithPagination(args.filter || {}, { first, offset, limit: first })
    },

    tags: async (_: unknown, __: unknown, context: Context) => {
      const db = createDB(context.env)
      const blogService = new BlogPostService(db)
      return blogService.getAllTags()
    },
  },

  Mutation: {
    createBlogPost: async (
      _: unknown,
      { input }: { input: { slug: string; title: string; excerpt: string; content: string; date: Date; tags: string[]; draft?: boolean | null } },
      context: Context
    ) => {
      const db = createDB(context.env)
      const blogService = new BlogPostService(db)
      const r2Service = new R2Service(context.env.R2 as any)

      try {
        const contentHash = await r2Service.generateContentHash(input.content)
        const r2Key = `posts/${input.slug}.md`

        // Parse Markdown to HTML
        const { html } = await parseToHtml(input.content)

        // Upload both Markdown and HTML to R2
        await r2Service.uploadPostContent(input.slug, input.content, html)

        const postId = await blogService.upsert({
          slug: input.slug,
          r2Key,
          title: input.title,
          excerpt: input.excerpt,
          date: input.date,
          draft: input.draft || false,
          contentHash,
        })

        await blogService.deleteTags(postId)
        for (const tagName of input.tags) {
          const tag = await blogService.findOrCreateTag(tagName)
          await blogService.linkTagToPost(postId, tag.id)
        }

        const post = await blogService.findBySlug(input.slug)

        return {
          success: true,
          message: 'Blog post created successfully',
          blogPost: post || undefined,
        }
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to create blog post',
          blogPost: null,
        }
      }
    },

    updateBlogPost: async (
      _: unknown,
      { input }: { input: { slug: string; title?: string | null; excerpt?: string | null; content?: string | null; date?: Date | null; tags?: string[] | null; draft?: boolean | null } },
      context: Context
    ) => {
      const db = createDB(context.env)
      const blogService = new BlogPostService(db)
      const r2Service = new R2Service(context.env.R2 as any)

      try {
        const existing = await blogService.findBySlug(input.slug)
        if (!existing) {
          return {
            success: false,
            message: 'Blog post not found',
            blogPost: null,
          }
        }

        const contentHash = input.content ? await r2Service.generateContentHash(input.content) : existing.contentHash

        if (input.content) {
          // Parse Markdown to HTML
          const { html } = await parseToHtml(input.content)
          // Upload both Markdown and HTML to R2
          await r2Service.uploadPostContent(input.slug, input.content, html)
        }

        const postId = await blogService.upsert({
          slug: input.slug,
          r2Key: existing.r2Key,
          title: input.title ?? existing.title,
          excerpt: input.excerpt ?? existing.excerpt,
          date: input.date ?? new Date(existing.date),
          draft: input.draft ?? existing.draft,
          contentHash,
        })

        if (input.tags) {
          await blogService.deleteTags(postId)
          for (const tagName of input.tags) {
            const tag = await blogService.findOrCreateTag(tagName)
            await blogService.linkTagToPost(postId, tag.id)
          }
        }

        const post = await blogService.findBySlug(input.slug)

        return {
          success: true,
          message: 'Blog post updated successfully',
          blogPost: post || undefined,
        }
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to update blog post',
          blogPost: null,
        }
      }
    },

    deleteBlogPost: async (_: unknown, { slug }: { slug: string }, context: Context) => {
      const db = createDB(context.env)
      const blogService = new BlogPostService(db)
      const r2Service = new R2Service(context.env.R2 as any)

      try {
        const post = await blogService.findBySlug(slug)
        if (!post) {
          return {
            success: false,
            message: 'Blog post not found',
            blogPost: null,
          }
        }

        // Delete both Markdown and HTML from R2
        await r2Service.deletePostContent(slug)
        await blogService.delete(slug)

        return {
          success: true,
          message: 'Blog post deleted successfully',
          blogPost: null,
        }
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to delete blog post',
          blogPost: null,
        }
      }
    },

    archiveBlogPost: async (_: unknown, { slug }: { slug: string }, context: Context) => {
      const db = createDB(context.env)
      const blogService = new BlogPostService(db)

      try {
        await blogService.updateDraftStatus(slug, true)

        const post = await blogService.findBySlug(slug)

        return {
          success: true,
          message: 'Blog post archived successfully',
          blogPost: post || undefined,
        }
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to archive blog post',
          blogPost: null,
        }
      }
    },
  },
}

export function createYogaServer() {
  return createYoga({
    schema: createSchema({ typeDefs, resolvers }),
    graphqlEndpoint: '/graphql',
    landingPage: false,
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['POST', 'GET', 'OPTIONS'],
    },
  })
}
