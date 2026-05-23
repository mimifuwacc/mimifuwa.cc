"use client";

import { useRouter } from "next/navigation";
import { PostEditor } from "@/components/post-editor";
import { createPost } from "@/lib/graphql/actions";

export default function NewPostPage() {
  const router = useRouter();

  return (
    <PostEditor
      mode="new"
      initialDate={new Date().toISOString().split("T")[0]}
      initialDraft={true}
      initialIsPublished={false}
      onSave={async (data) => {
        const fd = new FormData();
        fd.append("title", data.title);
        fd.append("slug", data.slug ?? "");
        fd.append("excerpt", data.excerpt);
        fd.append("content", data.content);
        fd.append("tags", data.tags);
        fd.append("date", data.date ?? "");
        fd.append("draft", data.draft ? "true" : "false");
        fd.append("isPublished", data.isPublished ? "true" : "false");
        const result = await createPost(fd);
        if (result.success) router.push("/");
        return result;
      }}
    />
  );
}
