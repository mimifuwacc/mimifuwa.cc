import { eq, desc, count, like, sql, and } from 'drizzle-orm'
import { blogPosts, tags, blogTags, type BlogPost, type Tag } from '../db/schema'
import { DB } from '../db'
import type { BlogPostFilter, Pagination, BlogPostConnection, PageInfo, BlogPostEdge } from '../types'

export class BlogPostService {
  constructor(private db: DB) {}

  // Find a blog post by slug
  async findBySlug(slug: string): Promise<(BlogPost & { tags: string[]; content: string }) | null> {
    const result = await this.db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        r2Key: blogPosts.r2Key,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        date: blogPosts.date,
        draft: blogPosts.draft,
        contentHash: blogPosts.contentHash,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1)

    if (!result[0]) return null

    const post = result[0]
    const tagNames = await this.getTagsByPostId(post.id)

    return {
      ...post,
      content: '', // Loaded from R2 separately
      tags: tagNames,
    }
  }

  // Find posts with pagination and filtering
  async findWithPagination(filter: BlogPostFilter, pagination: Pagination): Promise<BlogPostConnection> {
    const limit = pagination.first || pagination.limit || 20
    const offset = pagination.offset || 0

    // Build conditions
    const conditions = this.buildConditions(filter)

    // Get total count
    const [{ totalCount }] = await this.db
      .select({ totalCount: count() })
      .from(blogPosts)
      .where(conditions)

    // Get posts
    const results = await this.db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        r2Key: blogPosts.r2Key,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        date: blogPosts.date,
        draft: blogPosts.draft,
        contentHash: blogPosts.contentHash,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
      })
      .from(blogPosts)
      .where(conditions)
      .orderBy(desc(blogPosts.date))
      .limit(limit)
      .offset(offset)

    // Load tags for each post
    const posts = await Promise.all(
      results.map(async (post) => {
        const tagNames = await this.getTagsByPostId(post.id)
        return {
          ...post,
          content: '',
          tags: tagNames,
        }
      })
    )

    // Build edges with cursors
    const edges: BlogPostEdge[] = posts.map((post) => ({
      node: post,
      cursor: this.encodeCursor(post.id, post.createdAt),
    }))

    // Build page info
    const pageInfo: PageInfo = {
      hasNextPage: offset + limit < totalCount,
      hasPreviousPage: offset > 0,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      totalCount,
    }

    return { edges, pageInfo }
  }

  // Count posts matching filter
  async count(filter: BlogPostFilter): Promise<number> {
    const conditions = this.buildConditions(filter)
    const [result] = await this.db.select({ count: count() }).from(blogPosts).where(conditions)
    return result.count
  }

  // Create or update a blog post
  async upsert(data: {
    slug: string
    r2Key: string
    title: string
    excerpt: string
    date: Date
    draft: boolean
    contentHash: string | null
  }): Promise<number> {
    const existing = await this.db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, data.slug))
      .limit(1)

    if (existing[0]) {
      // Update
      const [result] = await this.db
        .update(blogPosts)
        .set({
          r2Key: data.r2Key,
          title: data.title,
          excerpt: data.excerpt,
          date: data.date,
          draft: data.draft,
          contentHash: data.contentHash,
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.slug, data.slug))
        .returning({ id: blogPosts.id })
      return result.id
    } else {
      // Insert
      const [result] = await this.db
        .insert(blogPosts)
        .values({
          slug: data.slug,
          r2Key: data.r2Key,
          title: data.title,
          excerpt: data.excerpt,
          date: data.date,
          draft: data.draft,
          contentHash: data.contentHash,
        })
        .returning({ id: blogPosts.id })
      return result.id
    }
  }

  // Delete a blog post by slug
  async delete(slug: string): Promise<boolean> {
    const result = await this.db.delete(blogPosts).where(eq(blogPosts.slug, slug))
    return result.meta.changes > 0
  }

  // Update draft status
  async updateDraftStatus(slug: string, draft: boolean): Promise<boolean> {
    const result = await this.db
      .update(blogPosts)
      .set({ draft, updatedAt: new Date() })
      .where(eq(blogPosts.slug, slug))
    return result.meta.changes > 0
  }

  // Get post ID by slug
  async getIdBySlug(slug: string): Promise<number | null> {
    const result = await this.db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1)
    return result[0]?.id || null
  }

  // Delete all tags for a post
  async deleteTags(postId: number): Promise<void> {
    await this.db.delete(blogTags).where(eq(blogTags.blogPostId, postId))
  }

  // Find or create a tag by name
  async findOrCreateTag(name: string): Promise<Tag> {
    const existing = await this.db.select().from(tags).where(eq(tags.name, name)).limit(1)
    if (existing[0]) return existing[0]

    const [result] = await this.db.insert(tags).values({ name }).returning()
    return result
  }

  // Link tag to post
  async linkTagToPost(postId: number, tagId: number): Promise<void> {
    await this.db
      .insert(blogTags)
      .values({ blogPostId: postId, tagId })
      .onConflictDoNothing()
  }

  // Get all tags
  async getAllTags(limit = 1000): Promise<Tag[]> {
    return this.db.select().from(tags).orderBy(tags.name).limit(limit)
  }

  // Get tags for a post
  async getTagsByPostId(postId: number): Promise<string[]> {
    const result = await this.db
      .select({ name: tags.name })
      .from(tags)
      .innerJoin(blogTags, eq(blogTags.tagId, tags.id))
      .where(eq(blogTags.blogPostId, postId))
      .orderBy(tags.name)
    return result.map((r) => r.name)
  }

  // Build conditions from filter
  private buildConditions(filter: BlogPostFilter) {
    const conditions: ReturnType<typeof and>[] = []

    if (filter.draft !== null && filter.draft !== undefined) {
      conditions.push(eq(blogPosts.draft, filter.draft))
    }

    if (filter.dateAfter) {
      conditions.push(sql`${blogPosts.date} >= ${filter.dateAfter.toISOString()}`)
    }

    if (filter.dateBefore) {
      conditions.push(sql`${blogPosts.date} <= ${filter.dateBefore.toISOString()}`)
    }

    if (filter.search) {
      const pattern = `%${filter.search}%`
      conditions.push(sql`(${like(blogPosts.title, pattern)} OR ${like(blogPosts.excerpt, pattern)})`)
    }

    if (filter.tag) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${blogTags}
          WHERE ${blogTags.blogPostId} = ${blogPosts.id}
          AND ${blogTags.tagId} IN (SELECT ${tags.id} FROM ${tags} WHERE ${tags.name} = ${filter.tag})
        )`
      )
    }

    return conditions.length > 0 ? and(...conditions) : undefined
  }

  // Encode cursor for pagination
  private encodeCursor(id: number, date: Date): string {
    const data = { id, timestamp: date.getTime() }
    return Buffer.from(JSON.stringify(data)).toString('base64')
  }

  // Decode cursor
  decodeCursor(cursor: string): { id: number; timestamp: number } | null {
    try {
      const data = JSON.parse(Buffer.from(cursor, 'base64').toString())
      return { id: Number(data.id), timestamp: Number(data.timestamp) }
    } catch {
      return null
    }
  }
}
