'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deletePost } from '@/lib/graphql/actions'

interface DeleteButtonProps {
  slug: string
}

export function DeleteButton({ slug }: DeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    setIsDeleting(true)

    const result = await deletePost(slug)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.message)
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 disabled:text-slate-400"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
