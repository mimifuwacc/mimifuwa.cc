import { redirect } from 'next/navigation'

export default function EditPostPage({ params }: { params: { slug: string } }) {
  async function updatePost(formData: FormData) {
    'use server'

    const title = formData.get('title') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const tags = formData.get('tags') as string
    const draft = formData.get('draft') === 'true'

    // TODO: Implement GraphQL mutation
    console.log('Update post:', params.slug, { title, excerpt, content, tags, draft })

    redirect('/')
  }

  async function deletePost() {
    'use server'

    // TODO: Implement GraphQL mutation
    console.log('Delete post:', params.slug)

    redirect('/')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edit Post: {params.slug}</h2>

      <form action={updatePost} className="max-w-2xl space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
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
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="draft"
            id="draft"
            value="true"
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="draft" className="ml-2 text-sm text-slate-700">
            Save as draft
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Update Post
          </button>
          <a
            href="/"
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </a>
          <button
            type="button"
            onClick={deletePost}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-auto"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  )
}
