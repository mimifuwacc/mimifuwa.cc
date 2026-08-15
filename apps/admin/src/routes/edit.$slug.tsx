import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PostEditor, type PostEditorData } from "../components/post-editor";
import { deletePost, getPost, updatePost } from "../lib/server-functions";
import type { PostInput } from "../lib/api/types";

export const Route = createFileRoute("/edit/$slug")({
  loader: ({ params }) => getPost({ data: params.slug }),
  component: EditPostPage,
});

function EditPostPage() {
  const post = Route.useLoaderData();
  const navigate = useNavigate();
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
        const result = await updatePost({
          data: { slug: post.slug, input: toInput(data, post.slug) },
        });
        return { success: true, message: "Post updated", blogPost: result };
      }}
      onDelete={async () => {
        await deletePost({ data: post.slug });
        await navigate({ to: "/" });
        return { success: true, message: "Post deleted" };
      }}
    />
  );
}

function toInput(data: PostEditorData, fallbackSlug: string): PostInput {
  return {
    slug: data.slug || fallbackSlug,
    title: data.title,
    excerpt: data.excerpt,
    markdown: data.content,
    date: new Date(data.date ?? Date.now()).toISOString(),
    tags: data.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    draft: data.draft,
    isPublished: data.isPublished,
  };
}
