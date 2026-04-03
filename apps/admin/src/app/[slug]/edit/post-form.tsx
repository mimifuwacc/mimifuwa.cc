'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePost, deletePost } from '@/lib/graphql/actions'

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  draft: boolean
  tags: Array<{ id: string; name: string }>
}

interface PostFormProps {
  post: Post
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    const result = await updatePost(post.slug, formData)

    if (result.success) {
      router.push('/')
    } else {
      setError(result.message)
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    setIsDeleting(true)
    setError(null)

    const result = await deletePost(post.slug)

    if (result.success) {
      router.push('/')
    } else {
      setError(result.message)
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edit Post: {post.slug}</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            defaultValue={post.title}
            required
            disabled={isSubmitting || isDeleting}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700 mb-1">
            Excerpt
          </label>
          <textarea
            name="excerpt"
            id="excerpt"
            rows={2}
            defaultValue={post.excerpt}
            required
            disabled={isSubmitting || isDeleting}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
            Content (Markdown)
          </label>
          <textarea
            name="content"
            id="content"
            defaultValue={post.content}
            rows={15}
            required
            disabled={isSubmitting || isDeleting}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm disabled:bg-slate-100"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            id="tags"
            defaultValue={post.tags.map((t) => t.name).join(', ')}
            placeholder="tech, javascript, web"
            disabled={isSubmitting || isDeleting}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="draft"
            id="draft"
            value="true"
            defaultChecked={post.draft}
            disabled={isSubmitting || isDeleting}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:bg-slate-100"
          />
          <label htmlFor="draft" className="ml-2 text-sm text-slate-700">
            Save as draft
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isSubmitting ? 'Updating...' : 'Update Post'}
          </button>
          <a
            href="/"
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </a>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-400 ml-auto"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </form>
    </div>
  )
}
