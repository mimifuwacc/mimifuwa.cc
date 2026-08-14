"use client";

import { useRouter } from "next/navigation";
import { PostEditor } from "@/components/post-editor";
import { deletePost, updatePost } from "@/lib/api/actions";

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  markdown: string;
  date: string;
  draft: boolean;
  isPublished: boolean;
  tags: string[];
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
      initialContent={post.markdown}
      initialTags={post.tags.join(", ")}
      initialDate={post.date ? new Date(post.date).toISOString().split("T")[0] : ""}
      initialDraft={post.draft}
      initialIsPublished={post.isPublished}
      onSave={async (data) => {
        const fd = new FormData();
        fd.append("title", data.title);
        if (data.slug) fd.append("newSlug", data.slug);
        fd.append("excerpt", data.excerpt);
        fd.append("content", data.content);
        fd.append("tags", data.tags);
        if (data.date) fd.append("date", data.date);
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
