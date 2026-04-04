'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TabSwitcher } from '@/components/tab-switcher'
import { MarkdownPreview } from '@/components/markdown-preview'
import { useDebounce } from '@/components/use-debounce'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8787/graphql'

export default function NewPostPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    tags: '',
    date: new Date().toISOString().split('T')[0],
    draft: false,
  })

  // Preview state
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [isSplitView, setIsSplitView] = useState(false)
  const debouncedContent = useDebounce(formData.content, 500)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const { title, slug, excerpt, content: contentValue, tags, date, draft } = formData

    if (!title || !slug || !excerpt || !contentValue || !date) {
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
              content: contentValue,
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

  const updateField = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">New Post</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <TabSwitcher
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isSplitView={isSplitView}
        onSplitViewToggle={() => setIsSplitView(!isSplitView)}
      />

      <form onSubmit={handleSubmit}>
        {/* Metadata fields - always at top */}
        <div className="max-w-2xl space-y-4 mb-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
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
              id="slug"
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value)}
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
              id="excerpt"
              rows={2}
              value={formData.excerpt}
              onChange={(e) => updateField('excerpt', e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => updateField('tags', e.target.value)}
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
              id="date"
              value={formData.date}
              onChange={(e) => updateField('date', e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="draft"
              checked={formData.draft}
              onChange={(e) => updateField('draft', e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:bg-slate-100"
            />
            <label htmlFor="draft" className="ml-2 text-sm text-slate-700">
              Save as draft
            </label>
          </div>
        </div>

        {/* Content and Preview - split or single view */}
        {isSplitView ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Content textarea */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
                Content (Markdown)
              </label>
              <textarea
                id="content"
                rows={30}
                value={formData.content}
                onChange={(e) => updateField('content', e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm disabled:bg-slate-100"
              />
            </div>

            {/* Preview */}
            <div className="border border-slate-300 rounded-lg p-4 overflow-y-auto">
              <MarkdownPreview markdown={debouncedContent} />
            </div>
          </div>
        ) : (
          <>
            {/* Single view mode */}
            {activeTab === 'edit' && (
              <div className="max-w-2xl">
                <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
                  Content (Markdown)
                </label>
                <textarea
                  id="content"
                  rows={15}
                  value={formData.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm disabled:bg-slate-100"
                />
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="border border-slate-300 rounded-lg p-4 overflow-y-auto">
                <MarkdownPreview markdown={debouncedContent} />
              </div>
            )}
          </>
        )}

        {/* Submit buttons */}
        <div className="max-w-2xl flex gap-3 pt-4">
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
