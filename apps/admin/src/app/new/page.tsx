'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8787/graphql'

export default function NewPostPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const tags = formData.get('tags') as string
    const date = formData.get('date') as string
    const draft = formData.get('draft') === 'true'

    if (!title || !slug || !excerpt || !content || !date) {
      setError('Required fields are missing')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreatePost($input: CreateBlogPostInput!) {
              createBlogPost(input: $input) {
                success
                message
                blogPost {
                  id
                  slug
                  title
                }
              }
            }
          `,
          variables: {
            input: {
              slug,
              title,
              excerpt,
              content,
              date: new Date(date).toISOString(),
              tags: tags ? tags.split(',').map((t) => t.trim()) : [],
              draft,
            },
          },
        }),
      })

      const data = await response.json()

      if (data.errors) {
        setError(data.errors[0].message)
        setIsSubmitting(false)
        return
      }

      if (data.data.createBlogPost.success) {
        router.push('/')
      } else {
        setError(data.data.createBlogPost.message)
        setIsSubmitting(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">New Post</h2>

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
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">
            Slug
          </label>
          <input
            type="text"
            name="slug"
            id="slug"
            required
            pattern="[a-z0-9-]+"
            disabled={isSubmitting}
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
            required
            disabled={isSubmitting}
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
            rows={15}
            required
            disabled={isSubmitting}
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
            placeholder="tech, javascript, web"
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="draft"
            id="draft"
            value="true"
            disabled={isSubmitting}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:bg-slate-100"
          />
          <label htmlFor="draft" className="ml-2 text-sm text-slate-700">
            Save as draft
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
          <a
            href="/"
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
