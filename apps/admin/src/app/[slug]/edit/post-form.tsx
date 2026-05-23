"use client";

import { useRouter } from "next/navigation";
import { PostEditor } from "@/components/post-editor";
import { deletePost, updatePost } from "@/lib/graphql/actions";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  markdown: string;
  date: string;
  draft: boolean;
  isPublished: boolean;
  tags: Array<{ id: string; name: string }>;
}

export function PostForm({ post }: { post: Post }) {
  const router = useRouter();

  return (
    <PostEditor
      mode="edit"
      slug={post.slug}
      initialSlug={post.slug}
      initialTitle={post.title}
      initialExcerpt={post.excerpt}
      initialContent={post.markdown || post.content}
      initialTags={post.tags.map((t) => t.name).join(", ")}
      initialDraft={post.draft}
      initialIsPublished={post.isPublished}
      onSave={async (data) => {
        const fd = new FormData();
        fd.append("title", data.title);
        if (data.slug) fd.append("newSlug", data.slug);
        fd.append("excerpt", data.excerpt);
        fd.append("content", data.content);
        fd.append("tags", data.tags);
        fd.append("draft", data.draft ? "true" : "false");
        fd.append("isPublished", data.isPublished ? "true" : "false");
        return updatePost(post.slug, fd);
      }}
      onDelete={async () => {
        const result = await deletePost(post.slug);
        if (result.success) router.push("/");
        return result;
      }}
    />
  );
}
