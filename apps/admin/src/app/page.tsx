import { client } from '@/lib/graphql/client'
import { GET_POSTS } from '@/lib/graphql/queries'
import { DeleteButton } from './delete-button'

async function getPosts() {
  try {
    const data = await client.request(GET_POSTS, {
      filter: null,
      page: { first: 50 },
    })
    return data
  } catch (error) {
    // Return empty data during build/offline instead of throwing
    return {
      blogPosts: {
        edges: [],
        pageInfo: {
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
      },
    }
  }
}

export default async function HomePage() {
  const data = await getPosts()

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load posts</p>
      </div>
    )
  }

  const { edges, pageInfo } = data.blogPosts

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Posts</h2>
        <a
          href="/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Post
        </a>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Tags</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {edges.map((edge: { node: { id: string; slug: string; title: string; draft: boolean; date: string; tags: Array<{ id: string; name: string }> } }) => (
              <tr key={edge.node.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <a href={`/${edge.node.slug}/edit`} className="font-medium text-blue-600 hover:text-blue-800">
                    {edge.node.title}
                  </a>
                  <p className="text-sm text-slate-500">{edge.node.slug}</p>
                </td>
                <td className="px-4 py-3">
                  {edge.node.draft ? (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Draft</span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Published</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {new Date(edge.node.date).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {edge.node.tags.map((tag) => (
                      <span key={tag.id} className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/${edge.node.slug}/edit`}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Edit
                  </a>
                  <DeleteButton slug={edge.node.slug} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        Total: {pageInfo.totalCount} posts
      </div>
    </div>
  )
}
