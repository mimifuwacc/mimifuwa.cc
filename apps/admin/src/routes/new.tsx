import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PostEditor, type PostEditorData } from "../components/post-editor";
import { createPost } from "../lib/server-functions";
import type { PostInput } from "../lib/api/types";

export const Route = createFileRoute("/new")({ component: NewPostPage });

function NewPostPage() {
  const navigate = useNavigate();
  return (
    <PostEditor
      mode="new"
      initialDate={new Date().toISOString().split("T")[0]}
      initialDraft
      initialIsPublished={false}
      onSave={async (data) => {
        const result = await createPost({ data: toInput(data) });
        await navigate({ to: "/" });
        return { success: true, message: "Post created", blogPost: result };
      }}
    />
  );
}

function toInput(data: PostEditorData): PostInput {
  return {
    slug: data.slug?.trim() ?? "",
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
