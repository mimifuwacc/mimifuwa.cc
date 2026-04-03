import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  r2Key: text('r2_key').notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  date: text('date').notNull(),
  draft: integer('draft', { mode: 'boolean' }).notNull().default(false),
  contentHash: text('content_hash'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
})

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
})

export const blogTags = sqliteTable('blog_tags', {
  blogPostId: integer('blog_post_id')
    .notNull()
    .references(() => blogPosts.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
})

// Types
export type BlogPost = typeof blogPosts.$inferSelect
export type NewBlogPost = typeof blogPosts.$inferInsert
export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert
export type BlogTag = typeof blogTags.$inferSelect
export type NewBlogTag = typeof blogTags.$inferInsert
