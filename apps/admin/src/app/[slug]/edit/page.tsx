import { client } from '@/lib/graphql/client'
import { GET_POST } from '@/lib/graphql/queries'
import { notFound } from 'next/navigation'
import { PostForm } from './post-form'

export default async function EditPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return <PostForm post={post} />
}

async function getPost(slug: string) {
  try {
    const data = await client.request(GET_POST, { slug })
    return data.blogPost
  } catch {
    return null
  }
}
